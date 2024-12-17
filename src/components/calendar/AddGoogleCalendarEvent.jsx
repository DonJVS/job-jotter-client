import React, { useState } from "react";
import axios from "axios";

/**
 * AddGoogleCalendarEvent Component
 * 
 * A form component to add events to Google Calendar. 
 * It allows users to input event details and submit them to the server.
 * 
 * Props:
 * - refreshEvents (function, optional): A callback function to refresh the events list after successfully adding a new event.
 */
const AddGoogleCalendarEvent = ({ refreshEvents }) => {
  // State to manage event form data
  const [event, setEvent] = useState({
    summary: "",
    location: "",
    description: "",
    start: "",
    end: "",
    timeZone: "America/New_York", // Default time zone
  });

  /**
   * Handles form submission to add an event to Google Calendar.
   * Sends a POST request with event data to the backend.
   * 
   * On success:
   * - Displays a success alert.
   * - Optionally triggers the `refreshEvents` callback.
   * On failure:
   * - Logs the error to the console.
   * 
   * @param {Object} e - Event object from form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/google-calendar/events", event); // Send event data to backend
      alert("Event added successfully!");
      if (refreshEvents) {
        refreshEvents(); // Refresh the events list if callback is provided
      }
    } catch (err) {
      console.error("Failed to add event:", err); // Log error if request fails
    }
  };

  /**
   * Updates event form fields as the user types.
   * @param {Object} e - Event object from the input field.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({ ...prev, [name]: value }));
  };

  // Rendered form UI for adding an event
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="summary"
        placeholder="Summary"
        onChange={handleChange}
      />
      <input
        name="location"
        placeholder="Location"
        onChange={handleChange}
      />
      <input
        name="description"
        placeholder="Description"
        onChange={handleChange}
      />
      <input
        name="start"
        type="datetime-local"
        placeholder="Start DateTime"
        onChange={handleChange}
      />
      <input
        name="end"
        type="datetime-local"
        placeholder="End DateTime"
        onChange={handleChange}
      />
      <button type="submit">Add Event</button>
    </form>
  );
};

export default AddGoogleCalendarEvent;
