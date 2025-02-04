import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [id, setId] = useState(""); // Employee ID
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get the current time
    const currentTime = new Date();
    const startTime = new Date(currentTime.setHours(8, 0, 0)); // 8:00 AM
    const endTime = new Date(currentTime.setHours(12, 0, 0)); // 12:00 PM

    // Check if current time is within allowed range
    if (currentTime < startTime || currentTime > endTime) {
      alert("Registration is available only from 8:00 AM to 12:00 PM.");
      return;
    }

    if (!id.match(/^\d{6}$/)) {
      alert("Employee ID must be exactly 6 digits!");
      return;
    }

    try {
      // Check employee existence and get queue number
      const response = await axios.post('http://127.0.0.1:8000/api/register', {
        employee_id: id
      });

      if (response.data.error) {
        alert(response.data.error);
        return;
      }

      const queueNumber = response.data.queue_number;
      
      // Store employeeID in localStorage
      localStorage.setItem("employeeID", id);

      alert(`Your queue number is ${queueNumber}`);
      setId("");
      navigate("/queue-status");
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Error: Unable to register. Please try again.");
    }
  };

  return (
    <div className="register-page">
      <div className="overall">
        <div className="logo-group">
          <header className="register-header">
            <img src="/images/SKP-logo.jpg" alt="SKP Logo" className="logo" />
          </header>
        </div>

        <div className="content">
          <div className="container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="id">Employee ID</label>
                <input
                  type="text"
                  id="id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  required
                />
              </div>

              <button type="submit">Register</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
