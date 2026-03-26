import React, { useState } from 'react';
import './App.css';
import InterestSelector from './InterestSelector';

export default function Forms({ role }) {
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState('1');
  const [interests, setInterests] = useState(['Career guidance']);
  const [languages, setLanguages] = useState('1');

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = { role, department, year, interests, languages };
    console.log("Form submitted with data:", formData);
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Create Profile</h2>
      <p className="form-subtitle">You're signing up as a <strong>{role}</strong></p>

      <form onSubmit={handleSubmit} className="profile-form">

        {/* --- GENERAL FIELDS --- */}
        <div className="form-row">
          <div className="form-group">
            <label className="label">Department / branch</label>
            <select
              className="form-control"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="CSE"    style={{ backgroundColor: '#f5f3f5', color: '#30034c' }}>CSE</option>
              <option value="ECE"    style={{ backgroundColor: '#f5f3f5', color: '#30034c' }}>ECE</option>
              <option value="ME"     style={{ backgroundColor: '#f5f3f5', color: '#30034c' }}>ME</option>
              <option value="SM"     style={{ backgroundColor: '#f5f3f5', color: '#30034c' }}>SM</option>
              <option value="DESIGN" style={{ backgroundColor: '#f5f3f5', color: '#30034c' }}>Design</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Year of study</label>
            <select
              className="form-control"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="1">1st year</option>
              <option value="2">2nd year</option>
              <option value="3">3rd year</option>
              <option value="4">4th year</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="label">Preferred language(s)</label>
            <select
              className="form-control"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
            >
              <option value="1">English</option>
              <option value="2">Hindi</option>
              <option value="3">Telugu</option>
              <option value="4">Tamil</option>
            </select>
          </div>
          
          <div className="form-group" /> 
        </div>

        <div className="form-group form-group--full">
          <InterestSelector
            selectedInterests={interests}
            onChange={setInterests}
          />
        </div>

        <div className="form-group form-group--full">
          <label className="label">Short bio</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Tell us a bit about yourself..."
          ></textarea>
        </div>

        {/* --- ROLE SPECIFIC CONDITIONAL FIELDS --- */}
        
        {/*Mentee */}
        {role === "mentee" && (
          <div className="form-row">
            <div className="form-group">
              <label className="label">Current challenges</label>
              <input type="text" className="form-control" placeholder="E.g., Learning React" />
            </div>
            <div className="form-group">
              <label className="label">Mentor background preference</label>
              <input type="text" className="form-control" placeholder="E.g., Frontend Developer" />
            </div>
            <div className="form-group">
              <label className="label">Communication preference</label>
              <select className="form-control">
                <option value="1">Chat</option>
                <option value="2">Call</option>
                <option value="3">In-person</option>
              </select>
            </div>
          </div>
        )}

        {/* Peer mentor or Senior peer mentor */}
        {(role === "peer" || role === "senior") && (
          <div className="form-row">
            <div className="form-group">
              <label className="label">Mentoring domains</label>
              <input type="text" className="form-control" placeholder="E.g., Web Dev, Algorithms" />
            </div>
            <div className="form-group">
              <label className="label">Past experience</label>
              <input type="text" className="form-control" placeholder="Previous hackathons, clubs" />
            </div>
            <div className="form-group">
              <label className="label">Max mentees</label>
              <input type="number" className="form-control" placeholder="No. of mentees you can handle" />
            </div>
          </div>
        )}

        {/* Professional mentor */}
        {role === "professional" && (
          <div className="form-row">
            <div className="form-group">
              <label className="label">Qualifications</label>
              <input type="text" className="form-control" placeholder="E.g., B.Tech, AWS Certified" />
            </div>
            <div className="form-group">
              <label className="label">Years of experience</label>
              <input type="number" className="form-control" placeholder="E.g., 3" />
            </div>
            
            <div className="form-group form-group--full">
              <label className="label">Specialization areas</label>
              <input type="text" className="form-control" placeholder="E.g., UI/UX, Cloud Architecture" />
            </div>
          </div>
        )}

        <button type="submit" className="submit-btn">
          Save Profile
        </button>

      </form>
    </div>
  );
}