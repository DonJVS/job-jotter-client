import React, { useState } from "react";
import axios from "axios";

const AddGoogleCalendarEvent = ({ refreshEvents }) => {
  const [event, setEvent] = useState({
    summary: "",
    location: "",
    description: "",
    start: "",
    end: "",
    timeZone: "America/New_York",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/google-calendar/events", event);
      alert("Event added successfully!");
      if (refreshEvents) {
        refreshEvents(); // Refresh calendar events
      }
    } catch (err) {
      console.error("Failed to add event:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="summary" placeholder="Summary" onChange={handleChange} />
      <input name="location" placeholder="Location" onChange={handleChange} />
      <input name="description" placeholder="Description" onChange={handleChange} />
      <input name="start" type="datetime-local" placeholder="Start DateTime" onChange={handleChange} />
      <input name="end" type="datetime-local" placeholder="End DateTime" onChange={handleChange} />
      <button type="submit">Add Event</button>
    </form>
  );
};

export default AddGoogleCalendarEvent;
