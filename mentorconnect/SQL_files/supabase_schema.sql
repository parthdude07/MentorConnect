-- ============================================================
--  SMART MENTORING PLATFORM — PostgreSQL Schema
--  Covers: Auth, Roles, Profiles, Matching, Issues, Ratings,
--          Audit Logs, Notifications
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SECTION 1: ENUMS
-- ============================================================

CREATE TYPE user_status         AS ENUM ('pending_verification', 'active', 'suspended', 'deactivated');
CREATE TYPE onboarding_status   AS ENUM ('not_started', 'role_selected', 'profile_complete', 'verified', 'matched');
CREATE TYPE academic_background AS ENUM ('PCM', 'PCB', 'Commerce', 'Arts', 'Diploma', 'Other');
CREATE TYPE comm_preference     AS ENUM ('chat', 'call', 'both');
CREATE TYPE visibility_level    AS ENUM ('public', 'private', 'ultra_private');
CREATE TYPE issue_status        AS ENUM ('open', 'in_discussion', 'needs_escalation', 'resolved', 'closed');
CREATE TYPE approval_status     AS ENUM ('pending', 'approved', 'rejected', 'overridden');
CREATE TYPE match_status        AS ENUM ('predicted', 'approved', 'rejected', 'assigned', 'removed');
CREATE TYPE group_member_status AS ENUM ('active', 'removed', 'transferred');
CREATE TYPE language_proficiency AS ENUM ('native', 'fluent', 'intermediate', 'basic');
CREATE TYPE escalation_status   AS ENUM ('open', 'acknowledged', 'resolved');
CREATE TYPE notification_type   AS ENUM (
    'match_proposed', 'match_approved', 'match_rejected',
    'issue_assigned', 'issue_commented', 'issue_resolved', 'issue_escalated',
    'group_added', 'rating_received', 'profile_verified', 'system'
);

-- ============================================================
-- SECTION 2: CORE IDENTITY & AUTH
-- ============================================================

CREATE TABLE roles (
    id              SMALLINT PRIMARY KEY,
    internal_name   VARCHAR(50)  NOT NULL UNIQUE,              -- e.g. 'mentor_ug_junior'
    display_title   VARCHAR(100) NOT NULL,                     -- e.g. 'Peer Mentor – 2nd Year Undergraduate'
    permission_level SMALLINT   NOT NULL DEFAULT 1,            -- higher = more access
    can_be_assigned_issues BOOLEAN NOT NULL DEFAULT TRUE,
    requires_verification  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed roles as per spec
INSERT INTO roles (id, internal_name, display_title, permission_level, requires_verification) VALUES
    (1, 'mentee',               'Mentee – First Year Student',                    1, FALSE),
    (2, 'mentor_ug_junior',     'Peer Mentor – 2nd Year Undergraduate',           2, TRUE),
    (3, 'mentor_ug_senior',     'Senior Peer Mentor – 3rd / 4th Year Undergraduate', 3, TRUE),
    (4, 'mentor_pg',            'Postgraduate Mentor – M.Tech / PhD Scholar',     3, TRUE),
    (5, 'mentor_committee',     'Counselling Committee Mentor',                   4, TRUE),
    (6, 'mentor_professional',  'Professional Counsellor',                        5, TRUE),
    (7, 'mentor_head',          'Counselling Head',                               6, TRUE);

-- ---------------------------------------------------------------

CREATE TABLE users (
    id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   TEXT         NOT NULL,
    is_email_verified BOOLEAN    NOT NULL DEFAULT FALSE,
    status          user_status  NOT NULL DEFAULT 'pending_verification',
    onboarding_status onboarding_status NOT NULL DEFAULT 'not_started',
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------

CREATE TABLE user_roles (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id         SMALLINT    NOT NULL REFERENCES roles(id),
    assigned_by     UUID        REFERENCES users(id),          -- NULL = self-selected during onboarding
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    verified_at     TIMESTAMPTZ,
    verified_by     UUID        REFERENCES users(id),
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, role_id)
);

-- ============================================================
-- SECTION 3: LOOKUP TABLES
-- ============================================================

CREATE TABLE interest_tags (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,                  -- e.g. 'Machine Learning', 'Mental Health'
    category    VARCHAR(50),                                   -- grouping: 'academic', 'career', 'personal'
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE languages (
    id          SERIAL      PRIMARY KEY,
    code        VARCHAR(10) NOT NULL UNIQUE,                   -- ISO 639-1: 'en', 'hi', 'mr'
    name        VARCHAR(80) NOT NULL UNIQUE                    -- 'English', 'Hindi', 'Marathi'
);

CREATE TABLE issue_categories (
    id                   SERIAL       PRIMARY KEY,
    name                 VARCHAR(100) NOT NULL UNIQUE,         -- 'Academic', 'Career', 'Mental Health'
    description          TEXT,
    default_visibility   visibility_level NOT NULL DEFAULT 'public',
    requires_escalation  BOOLEAN      NOT NULL DEFAULT FALSE,  -- ultra-private auto-escalate
    is_active            BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE issue_labels (
    id      SERIAL      PRIMARY KEY,
    name    VARCHAR(80) NOT NULL UNIQUE,                       -- 'urgent', 'first-year', 'exam-stress'
    color   CHAR(7)     NOT NULL DEFAULT '#888888'             -- hex color for UI badge
);

-- ============================================================
-- SECTION 4: USER PROFILES
-- ============================================================

-- Common fields for ALL roles
CREATE TABLE user_profiles (
    user_id         UUID         PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name       VARCHAR(200) NOT NULL,
    college_email   VARCHAR(255) NOT NULL UNIQUE,
    department      VARCHAR(150) NOT NULL,
    year_or_designation VARCHAR(100) NOT NULL,                 -- '1st Year B.Tech' or 'Assistant Professor'
    short_bio       TEXT,
    profile_photo_url TEXT,
    is_complete     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------

-- Mentee-specific fields (role_id = 1)
CREATE TABLE mentee_profiles (
    user_id                UUID            PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    academic_background    academic_background NOT NULL,
    current_challenges     TEXT[]          NOT NULL DEFAULT '{}',  -- multi-select stored as array
    preferred_mentor_background academic_background,
    preferred_mentor_domain TEXT[],                                 -- e.g. {'academics', 'career'}
    communication_preference comm_preference NOT NULL DEFAULT 'both',
    created_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------

-- UG / PG / Committee mentor fields (role_id = 2, 3, 4, 5)
CREATE TABLE mentor_ug_pg_profiles (
    user_id                 UUID        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    academic_background     academic_background NOT NULL,
    mentoring_domains       TEXT[]      NOT NULL DEFAULT '{}',   -- {'academics','career','mental_health'}
    past_experience_desc    TEXT,                                -- optional free text
    max_mentees             SMALLINT    NOT NULL DEFAULT 3 CHECK (max_mentees BETWEEN 1 AND 20),
    current_mentees_count   SMALLINT    NOT NULL DEFAULT 0,
    is_accepting_mentees    BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------

-- Professional counsellor / head fields (role_id = 6, 7)
CREATE TABLE professional_profiles (
    user_id                 UUID        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    qualification           VARCHAR(255) NOT NULL,              -- e.g. 'M.Phil Clinical Psychology'
    years_of_experience     SMALLINT    NOT NULL CHECK (years_of_experience >= 0),
    specialization_areas    TEXT[]      NOT NULL DEFAULT '{}',
    is_emergency_available  BOOLEAN     NOT NULL DEFAULT FALSE,
    can_escalate_to_external BOOLEAN    NOT NULL DEFAULT FALSE, -- can refer outside college
    escalation_permissions  TEXT[]      NOT NULL DEFAULT '{}',  -- which actions they can take
    license_number          VARCHAR(100),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------

-- Availability slots (shared by all roles)
CREATE TABLE availability_slots (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week     SMALLINT    NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 6=Sat
    start_time      TIME        NOT NULL,
    end_time        TIME        NOT NULL CHECK (end_time > start_time),
    is_recurring    BOOLEAN     NOT NULL DEFAULT TRUE,
    specific_date   DATE,                                       -- non-null for one-off slots
    timezone        VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------

-- User ↔ interest junction
CREATE TABLE user_interests (
    user_id     UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tag_id      INTEGER NOT NULL REFERENCES interest_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, tag_id)
);

-- User ↔ language junction
CREATE TABLE user_languages (
    user_id     UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language_id INTEGER  NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    proficiency language_proficiency NOT NULL DEFAULT 'fluent',
    PRIMARY KEY (user_id, language_id)
);

-- ============================================================
-- SECTION 5: ML MATCHING & ASSIGNMENTS
-- ============================================================

-- Raw predictions produced by the ML model
CREATE TABLE ml_match_predictions (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentee_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentor_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_score     NUMERIC(5,4) NOT NULL CHECK (match_score BETWEEN 0 AND 1), -- e.g. 0.8742
    score_breakdown JSONB       NOT NULL DEFAULT '{}',          -- {'background':0.9,'domain':0.85,'language':1.0}
    model_version   VARCHAR(50) NOT NULL,
    predicted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    UNIQUE (mentee_id, mentor_id, model_version)
);

-- ---------------------------------------------------------------

-- Review / approval of ML predictions by higher authority
CREATE TABLE match_approvals (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id       UUID            NOT NULL REFERENCES ml_match_predictions(id) ON DELETE CASCADE,
    reviewed_by         UUID            NOT NULL REFERENCES users(id),
    status              approval_status NOT NULL DEFAULT 'pending',
    override_mentor_id  UUID            REFERENCES users(id), -- if reviewer picks a different mentor
    reviewer_notes      TEXT,
    actioned_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------

-- The actual mentor–mentee group
CREATE TABLE mentor_groups (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id       UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    group_name      VARCHAR(200),                               -- optional display name
    max_capacity    SMALLINT    NOT NULL DEFAULT 5,
    current_count   SMALLINT    NOT NULL DEFAULT 0,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_by      UUID        REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------

-- Individual mentee membership in a group
CREATE TABLE mentor_group_members (
    id              UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id        UUID                NOT NULL REFERENCES mentor_groups(id) ON DELETE CASCADE,
    mentee_id       UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    added_by        UUID                REFERENCES users(id),   -- committee member or system
    approval_ref_id UUID                REFERENCES match_approvals(id),
    status          group_member_status NOT NULL DEFAULT 'active',
    match_status    match_status        NOT NULL DEFAULT 'assigned',
    joined_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    left_at         TIMESTAMPTZ,
    notes           TEXT,
    UNIQUE (group_id, mentee_id)
);

-- ============================================================
-- SECTION 6: ISSUE TRACKING SYSTEM
-- ============================================================

CREATE TABLE issues (
    id              UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(300)     NOT NULL,
    description     TEXT             NOT NULL,
    creator_id      UUID             NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category_id     INTEGER          REFERENCES issue_categories(id),
    visibility      visibility_level NOT NULL DEFAULT 'public',
    is_anonymous    BOOLEAN          NOT NULL DEFAULT FALSE,
    status          issue_status     NOT NULL DEFAULT 'open',
    is_locked       BOOLEAN          NOT NULL DEFAULT FALSE,    -- locked after close
    view_count      INTEGER          NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    closed_at       TIMESTAMPTZ
);

-- ---------------------------------------------------------------

-- Issue ↔ label junction
CREATE TABLE issue_tag_map (
    issue_id    UUID    NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    label_id    INTEGER NOT NULL REFERENCES issue_labels(id) ON DELETE CASCADE,
    PRIMARY KEY (issue_id, label_id)
);

-- ---------------------------------------------------------------

-- Threaded comments (supports nesting via parent_comment_id)
CREATE TABLE issue_comments (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id            UUID        NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    author_id           UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    body                TEXT        NOT NULL,
    parent_comment_id   UUID        REFERENCES issue_comments(id) ON DELETE SET NULL,
    is_internal_note    BOOLEAN     NOT NULL DEFAULT FALSE,     -- only visible to mentors/committee
    is_resolution_note  BOOLEAN     NOT NULL DEFAULT FALSE,
    is_edited           BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------

-- Mentor assignment to an issue
CREATE TABLE issue_assignments (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id        UUID        NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    mentor_id       UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_by     UUID        REFERENCES users(id),
    is_primary      BOOLEAN     NOT NULL DEFAULT TRUE,          -- primary vs supporting mentor
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unassigned_at   TIMESTAMPTZ,
    UNIQUE (issue_id, mentor_id)
);

-- ---------------------------------------------------------------

-- Full lifecycle history of an issue
CREATE TABLE issue_status_history (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id    UUID         NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    old_status  issue_status,
    new_status  issue_status NOT NULL,
    changed_by  UUID         NOT NULL REFERENCES users(id),
    note        TEXT,
    changed_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------

-- Resolution record (when issue is closed/solved)
CREATE TABLE issue_resolutions (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id            UUID        NOT NULL UNIQUE REFERENCES issues(id) ON DELETE CASCADE,
    resolved_by         UUID        NOT NULL REFERENCES users(id),
    resolution_summary  TEXT        NOT NULL,
    contributing_mentors UUID[]     NOT NULL DEFAULT '{}',      -- mentor attribution (GitHub-style)
    can_reopen          BOOLEAN     NOT NULL DEFAULT TRUE,
    closed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------

-- Escalation records
CREATE TABLE issue_escalations (
    id              UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id        UUID               NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    escalated_by    UUID               NOT NULL REFERENCES users(id),
    escalated_to_role SMALLINT         REFERENCES roles(id),    -- target role (e.g. mentor_head)
    escalated_to_user UUID             REFERENCES users(id),    -- specific person if known
    reason          TEXT               NOT NULL,
    status          escalation_status  NOT NULL DEFAULT 'open',
    resolved_by     UUID               REFERENCES users(id),
    resolution_note TEXT,
    created_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ
);

-- ============================================================
-- SECTION 7: RATINGS & MENTOR STATS
-- ============================================================

-- Individual rating given to a mentor (after a session or issue resolution)
CREATE TABLE mentor_ratings (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rater_id        UUID        NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    group_id        UUID        REFERENCES mentor_groups(id),
    issue_id        UUID        REFERENCES issues(id),
    score           SMALLINT    NOT NULL CHECK (score BETWEEN 1 AND 5),
    feedback_text   TEXT,
    is_anonymous    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (rater_id, mentor_id, issue_id)               -- one rating per resolved issue
);

-- ---------------------------------------------------------------

-- Aggregated mentor performance stats (updated via trigger or scheduled job)
CREATE TABLE mentor_stats (
    mentor_id               UUID        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_mentees_served    INTEGER     NOT NULL DEFAULT 0,
    active_mentees          SMALLINT    NOT NULL DEFAULT 0,
    avg_rating              NUMERIC(3,2),                       -- e.g. 4.72
    total_ratings_count     INTEGER     NOT NULL DEFAULT 0,
    issues_assigned         INTEGER     NOT NULL DEFAULT 0,
    issues_resolved         INTEGER     NOT NULL DEFAULT 0,
    resolution_rate         NUMERIC(5,4),                       -- resolved / assigned
    total_comments_made     INTEGER     NOT NULL DEFAULT 0,
    last_active_at          TIMESTAMPTZ,
    last_updated            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SECTION 8: AUDIT LOGS
-- ============================================================

-- Append-only audit trail (critical for ultra-private issues)
CREATE TABLE audit_logs (
    id              BIGSERIAL   PRIMARY KEY,
    actor_id        UUID        REFERENCES users(id) ON DELETE SET NULL,
    action_type     VARCHAR(80) NOT NULL,                       -- 'issue.viewed', 'issue.assigned', 'comment.deleted'
    target_table    VARCHAR(80),
    target_id       TEXT,                                       -- UUID or other PK as text
    old_value       JSONB,
    new_value       JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs are append-only — no UPDATE or DELETE allowed
CREATE RULE no_update_audit AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- ============================================================
-- SECTION 9: NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id                  UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id        UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                notification_type NOT NULL,
    title               VARCHAR(200)      NOT NULL,
    body                TEXT,
    related_entity_type VARCHAR(80),                            -- 'issue', 'mentor_group', etc.
    related_entity_id   UUID,
    action_url          TEXT,
    is_read             BOOLEAN           NOT NULL DEFAULT FALSE,
    read_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SECTION 10: INDEXES
-- ============================================================

-- Users
CREATE INDEX idx_users_email           ON users(email);
CREATE INDEX idx_users_status          ON users(status);

-- User roles
CREATE INDEX idx_user_roles_user       ON user_roles(user_id);
CREATE INDEX idx_user_roles_role       ON user_roles(role_id);

-- Profiles
CREATE INDEX idx_user_profiles_dept    ON user_profiles(department);

-- ML predictions
CREATE INDEX idx_ml_mentee            ON ml_match_predictions(mentee_id);
CREATE INDEX idx_ml_mentor            ON ml_match_predictions(mentor_id);
CREATE INDEX idx_ml_score             ON ml_match_predictions(match_score DESC);

-- Groups
CREATE INDEX idx_group_mentor         ON mentor_groups(mentor_id);
CREATE INDEX idx_group_members_mentee ON mentor_group_members(mentee_id);
CREATE INDEX idx_group_members_group  ON mentor_group_members(group_id);

-- Issues
CREATE INDEX idx_issues_creator       ON issues(creator_id);
CREATE INDEX idx_issues_status        ON issues(status);
CREATE INDEX idx_issues_visibility    ON issues(visibility);
CREATE INDEX idx_issues_category      ON issues(category_id);
CREATE INDEX idx_issues_created       ON issues(created_at DESC);

-- Comments
CREATE INDEX idx_comments_issue       ON issue_comments(issue_id);
CREATE INDEX idx_comments_parent      ON issue_comments(parent_comment_id);

-- Assignments
CREATE INDEX idx_assignments_issue    ON issue_assignments(issue_id);
CREATE INDEX idx_assignments_mentor   ON issue_assignments(mentor_id);

-- Ratings
CREATE INDEX idx_ratings_mentor       ON mentor_ratings(mentor_id);
CREATE INDEX idx_ratings_rater        ON mentor_ratings(rater_id);

-- Audit logs
CREATE INDEX idx_audit_actor          ON audit_logs(actor_id);
CREATE INDEX idx_audit_target         ON audit_logs(target_table, target_id);
CREATE INDEX idx_audit_created        ON audit_logs(created_at DESC);

-- Notifications
CREATE INDEX idx_notif_recipient      ON notifications(recipient_id, is_read);
CREATE INDEX idx_notif_created        ON notifications(created_at DESC);

-- ============================================================
-- SECTION 11: AUTO-UPDATE TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated          BEFORE UPDATE ON users           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_user_profiles_updated  BEFORE UPDATE ON user_profiles   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_mentee_profiles_updated BEFORE UPDATE ON mentee_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_mentor_ug_updated      BEFORE UPDATE ON mentor_ug_pg_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_professional_updated   BEFORE UPDATE ON professional_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_issues_updated         BEFORE UPDATE ON issues          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_comments_updated       BEFORE UPDATE ON issue_comments  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_mentor_groups_updated  BEFORE UPDATE ON mentor_groups   FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- SECTION 11A: AUTH -> APP USER SYNC TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        password_hash,
        is_email_verified,
        status,
        onboarding_status,
        last_login_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        'managed_by_supabase_auth',
        NEW.email_confirmed_at IS NOT NULL,
        CASE
            WHEN NEW.email_confirmed_at IS NOT NULL THEN 'active'::user_status
            ELSE 'pending_verification'::user_status
        END,
        'not_started'::onboarding_status,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        is_email_verified = EXCLUDED.is_email_verified,
        status = EXCLUDED.status,
        last_login_at = EXCLUDED.last_login_at,
        updated_at = NOW();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================
-- SECTION 12: MENTOR STATS REFRESH FUNCTION
-- (Call via a scheduled job or after rating/resolution events)
-- ============================================================

CREATE OR REPLACE FUNCTION refresh_mentor_stats(p_mentor_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO mentor_stats (
        mentor_id,
        total_mentees_served,
        active_mentees,
        avg_rating,
        total_ratings_count,
        issues_assigned,
        issues_resolved,
        resolution_rate,
        total_comments_made,
        last_active_at,
        last_updated
    )
    SELECT
        p_mentor_id,
        COALESCE((SELECT COUNT(DISTINCT mentee_id) FROM mentor_group_members mgm
                  JOIN mentor_groups mg ON mg.id = mgm.group_id
                  WHERE mg.mentor_id = p_mentor_id), 0),
        COALESCE((SELECT COUNT(DISTINCT mentee_id) FROM mentor_group_members mgm
                  JOIN mentor_groups mg ON mg.id = mgm.group_id
                  WHERE mg.mentor_id = p_mentor_id AND mgm.status = 'active'), 0),
        (SELECT ROUND(AVG(score)::NUMERIC, 2) FROM mentor_ratings WHERE mentor_id = p_mentor_id),
        (SELECT COUNT(*) FROM mentor_ratings WHERE mentor_id = p_mentor_id),
        (SELECT COUNT(*) FROM issue_assignments WHERE mentor_id = p_mentor_id),
        (SELECT COUNT(*) FROM issue_resolutions ir
         WHERE p_mentor_id = ANY(ir.contributing_mentors)),
        CASE
            WHEN (SELECT COUNT(*) FROM issue_assignments WHERE mentor_id = p_mentor_id) = 0 THEN NULL
            ELSE ROUND(
                (SELECT COUNT(*) FROM issue_resolutions ir WHERE p_mentor_id = ANY(ir.contributing_mentors))::NUMERIC /
                (SELECT COUNT(*) FROM issue_assignments WHERE mentor_id = p_mentor_id),
                4
            )
        END,
        (SELECT COUNT(*) FROM issue_comments WHERE author_id = p_mentor_id),
        (SELECT MAX(created_at) FROM issue_comments WHERE author_id = p_mentor_id),
        NOW()
    ON CONFLICT (mentor_id) DO UPDATE SET
        total_mentees_served = EXCLUDED.total_mentees_served,
        active_mentees       = EXCLUDED.active_mentees,
        avg_rating           = EXCLUDED.avg_rating,
        total_ratings_count  = EXCLUDED.total_ratings_count,
        issues_assigned      = EXCLUDED.issues_assigned,
        issues_resolved      = EXCLUDED.issues_resolved,
        resolution_rate      = EXCLUDED.resolution_rate,
        total_comments_made  = EXCLUDED.total_comments_made,
        last_active_at       = EXCLUDED.last_active_at,
        last_updated         = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- END OF SCHEMA
-- Total: 28 tables, 9 ENUMs, 25+ indexes, 8 update triggers,
--        1 audit-protection rule set, 1 stats refresh function
-- ============================================================