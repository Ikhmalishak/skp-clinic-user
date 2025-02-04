import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TVQueueDisplay.css";

const TVQueueDisplay = () => {
  const [currentServing, setCurrentServing] = useState(null);
  const [upcomingPatients, setUpcomingPatients] = useState([]);
  const [completedPatients, setCompletedPatients] = useState([]);
  const [currentTime, setCurrentTime] = useState("");

  // Announce the queue number
  const announceQueueNumber = (queueNumber) => {
    if ("speechSynthesis" in window) {
      const formattedQueueNumber = queueNumber
        .toString()
        .split("")
        .map((digit) => (digit === "0" ? "zero" : digit))
        .join(" ");

      const audio = new Audio("/sounds/minimalist-ding-dong.wav");
      audio.play();

      audio.onended = () => {
        const englishUtterance = new SpeechSynthesisUtterance(
          `${formattedQueueNumber}`
        );
        englishUtterance.lang = "en-US";
        englishUtterance.rate = 0.1;

        const malayUtterance = new SpeechSynthesisUtterance(`${queueNumber}`);
        malayUtterance.lang = "ms-MY";
        malayUtterance.rate = 0.1;

        window.speechSynthesis.speak(englishUtterance);
        window.speechSynthesis.speak(malayUtterance);
      };
    }
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) +
          " " +
          now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch current serving patient
  const fetchServingPatient = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/queues/serving");
      const servingPatient = response.data;

      if (servingPatient && servingPatient.queue_number !== currentServing?.queue_number) {
        announceQueueNumber(servingPatient.queue_number);
      }

      setCurrentServing(servingPatient || null);
    } catch (error) {
      console.error("Failed to fetch serving patient:", error);
    }
  };

  // Fetch waiting patients
  const fetchWaitingPatients = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/queues/waiting");
      setUpcomingPatients(response.data);
    } catch (error) {
      console.error("Failed to fetch waiting patients:", error);
    }
  };

  // Fetch completed patients
  const fetchCompletedPatients = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/queues/completed");
      setCompletedPatients(response.data);
    } catch (error) {
      console.error("Failed to fetch completed patients:", error);
    }
  };

  // Fetch data on component mount and refresh every few seconds
  useEffect(() => {
    fetchServingPatient();
    fetchWaitingPatients();
    fetchCompletedPatients();

    const interval = setInterval(() => {
      fetchServingPatient();
      fetchWaitingPatients();
      fetchCompletedPatients();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [currentServing]);

  return (
    <div className="tv-display">
      <div className="header">
        <div className="date">{currentTime.split(" ")[0]}</div>
        <div className="time">{currentTime.split(" ").slice(1).join(" ")}</div>
      </div>

      <div className="main-container">
        <div className="horizontal-section">
          <div className="now-serving-horizontal">
            <h2>Now Serving (Sekarang Memanggil)</h2>
            <div className="queue-number">
              {currentServing ? currentServing.queue_number : "None"}
            </div>
          </div>
        </div>

        <div className="waiting-completed">
          <div className="waiting-left-side">
            <div className="waiting-section">
              <h2>Waiting (Menunggu)</h2>
              {upcomingPatients.length > 0 ? (
                upcomingPatients.map((patient) => (
                  <div key={patient.id} className="queue-item">
                    {patient.queue_number}
                  </div>
                ))
              ) : (
                <p>No waiting patients</p>
              )}
            </div>
          </div>

          <div className="completed-right-side">
            <div className="completed-section">
              <h2>Completed (Selesai)</h2>
              {completedPatients.length > 0 ? (
                completedPatients.map((patient) => (
                  <div key={patient.id} className="completed-item">
                    {patient.queue_number}
                  </div>
                ))
              ) : (
                <p>No completed patients</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVQueueDisplay;
