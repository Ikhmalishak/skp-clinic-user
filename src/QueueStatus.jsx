import React, { useEffect, useState } from "react";
import axios from "axios";
import "./QueueStatus.css";

// TODO: Replace with actual API base URL
const API_BASE_URL = "http://127.0.0.1:8000/api";

const QueueStatus = () => {
  const [queueNumber, setQueueNumber] = useState("N/A");
  const [currentServing, setCurrentServing] = useState("None");
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [userQueueNumber, setUserQueueNumber] = useState(null);

  // Alert the user when the component mounts
  useEffect(() => {
    alert(
      "Please screenshot this ticket. \nSila tangkap layar tiket ini. \nकृपया यस टिकटको स्क्रिनसट लिनुहोस्। \nကျေးဇူးပြုပြီး ဒီလက်မှတ်ကို စခရင်ရှော့လုပြပါ"
    );
  }, []);

  const fetchQueueDetails = async () => {
    try {
      const userID = localStorage.getItem("employeeID");
      if (!userID) {
        alert("No employee ID found. Please register first!");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/queue/${userID}`);
      const data = response.data;

      setQueueNumber(data.queueNumber || "N/A");
      console.log("Queue Number:", data.queueNumber); // Debugging log
      setUserQueueNumber(parseInt(data.queueNumber, 10));
      setCurrentServing(data.currentServing ?? "None"); // Handle null or undefined
      setDate(new Date(data.timestamp).toLocaleDateString());
      setTime(
        new Date(data.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (error) {
      console.error("Error fetching queue details:", error);
      setQueueNumber("N/A");
      setCurrentServing("None");
    }
  };

  const fetchPeopleAhead = async (queueNumber) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/queue/ahead/${queueNumber}`
      );
      setPeopleAhead(response.data.count);
    } catch (error) {
      console.error("Error fetching people ahead:", error);
      setPeopleAhead(0);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchQueueDetails();

    // Set up polling for queue details
    const queueInterval = setInterval(fetchQueueDetails, 10000);

    return () => clearInterval(queueInterval);
  }, []);

  // Update people ahead count when userQueueNumber changes
  useEffect(() => {
    let peopleAheadInterval;

    if (userQueueNumber !== null) {
      // Initial fetch
      fetchPeopleAhead(userQueueNumber);

      // Set up polling
      peopleAheadInterval = setInterval(
        () => fetchPeopleAhead(userQueueNumber),
        10000
      );
    } else {
      setPeopleAhead(0);
    }

    return () => {
      if (peopleAheadInterval) {
        clearInterval(peopleAheadInterval);
      }
    };
  }, [userQueueNumber]);

  // Update loading state when all data is fetched
  useEffect(() => {
    if (queueNumber !== "N/A") {
      setLoading(false);
    }
  }, [queueNumber]);

  // Handle component unmount
  useEffect(() => {
    return () => {
      // Clean up any ongoing operations
      setLoading(true);
      setQueueNumber("N/A");
      setCurrentServing("None");
      setPeopleAhead(0);
    };
  }, []);

  return (
    <div className="queue-status-page">
      <div className="queue-status-container">
        <h1>Your Ticket Number is</h1>
        <h2>Nombor Tiket Anda ialah</h2>
        {loading ? (
          <p>Loading your ticket...</p>
        ) : (
          <>
            <div className="ticket-details">
              <div className="current-serving-card">{queueNumber}</div>
            </div>
            <div className="current-serving">
              <p>
                Current Serving: <strong>{currentServing}</strong>
              </p>
              <p>
                There are <strong>{peopleAhead}</strong> people ahead of you
              </p>
            </div>
          </>
        )}
        <br />
        <p>Thank you for visiting our clinic</p>
        <br />
        <p>Stay safe, stay healthy</p>
        <div className="date-time">
          <span className="date" style={{ fontSize: "20px" }}>
            {date}
          </span>
          <span className="time" style={{ fontSize: "20px" }}>
            {time}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QueueStatus;
