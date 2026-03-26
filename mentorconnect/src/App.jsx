import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import Forms from './Forms.jsx';

function App() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);

  const pageVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };

  // Select role AND advance to step 3 together
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(3);
  };

  return (
    <>
      <section id="center">
        <AnimatePresence mode="wait">

          {/* --- PAGE 1: SIGN UP FORM --- */}
          {step === 1 && (
            <motion.div
              key="page1"
              className="form"
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <h1 className="form-title">Sign up</h1>

              <div className="elements">
                <label className="label">Full Name</label>
                <input id="fullName" type="text" placeholder='Eg. Mumal Swami' required />
              </div>

              <div className="elements">
                <label className="label">College Email</label>
                <input type="email" placeholder='Eg. abc@example.com' required />
              </div>

              <div className="elements">
                <label className='label'>Password</label>
                <input type="password" placeholder='Eg. ********' required />
              </div>

              <div className="elements">
                <label className="label">Confirm Password</label>
                <input type="password" placeholder='Eg. ********' required />
              </div>

              <div className="remember-me">
                <label><input type="checkbox" />Remember me</label>
                <a href="#">Forgot password?</a>
              </div>

              <button className='button' onClick={() => setStep(2)}>
                Continue
              </button>
            </motion.div>
          )}

          {/* --- PAGE 2: ROLE SELECTION --- */}
          {step === 2 && (
            <motion.div
              key="page2"
              className="form"
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div
                onClick={() => setStep(1)}
                style={{ cursor: 'pointer', color: '#aaaaaa', fontSize: '14px', marginBottom: '20px' }}
              >
                &lt; Back
              </div>

              <h1 className="form-title">I am a...</h1>
              <p className="form-subtitle">Choose the role that best describes you. This shapes your profile.</p>

              <div className="roles-grid">

                <div className="role-tile" onClick={() => handleRoleSelect("mentee")}>
                  <div className="tile-title">Mentee</div>
                  <div className="tile-desc">First year student</div>
                </div>

                <div className="role-tile" onClick={() => handleRoleSelect("peer")}>
                  <div className="tile-title">Peer mentor</div>
                  <div className="tile-desc">2nd year UG</div>
                </div>

                <div className="role-tile" onClick={() => handleRoleSelect("senior")}>
                  <div className="tile-title">Senior peer mentor</div>
                  <div className="tile-desc">3rd / 4th year UG</div>
                </div>

                <div className="role-tile" onClick={() => handleRoleSelect("professional")}>
                  <div className="tile-title">Professional mentor</div>
                  <div className="tile-desc">M.Tech / PhD</div>
                </div>

              </div>
            </motion.div>
          )}

          {/* --- PAGE 3: DYNAMIC FORMS --- */}
          {step === 3 && (
            <motion.div
              key="page3"
              className="form"
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div
                onClick={() => setStep(2)}
                style={{ cursor: 'pointer', color: '#aaaaaa', fontSize: '14px', marginBottom: '20px' }}
              >
                &lt; Back to roles
              </div>

              {role && <Forms role={role} />}
            </motion.div>
          )}

        </AnimatePresence>
      </section>
    </>
  );
}

export default App;
