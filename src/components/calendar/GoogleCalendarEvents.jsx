import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "../../services/api";
import { Modal, Button, Form } from "react-bootstrap";

/**
 * GoogleCalendarEvents Component
 * 
 * A full-featured calendar view integrated with Google Calendar.
 * Allows users to:
 * - View events fetched from Google Calendar.
 * - Create, edit, or delete events via modals.
 * - Interact with a calendar UI for selecting or managing events.
 * 
 * Dependencies:
 * - `react-big-calendar` for the calendar UI.
 * - `axios` (imported via `api`) for backend API communication.
 * - `react-bootstrap` for modals and forms.
 */

// Localization for the calendar using date-fns
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const GoogleCalendarEvents = () => {
  // State to manage calendar events and UI behaviors
  const [events, setEvents] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [globalSuccessMessage, setGlobalSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // Modals and Editing States
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // State for new or edited event data
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "",
    start: "",
    end: "",
  });
  
  /**
   * Fetches events from the backend Google Calendar API.
   * Converts them to the format required by react-big-calendar.
   */
  const fetchEvents = async () => {
    try {
      setEvents([]);
      const { data } = await api.get(`/google-calendar/events?timestamp=${Date.now()}`);
  
      const formattedEvents = data.map((event) => ({
        id: event.id,
        title: event.summary || "No Title",
        start: event.start.dateTime
          ? new Date(event.start.dateTime)
          : new Date(event.start.date), // Handles all-day events
        end: event.end.dateTime
          ? new Date(event.end.dateTime)
          : new Date(event.end.date),
        description: event.description || "No Description",
        location: event.location || "No Location",
        allDay: !!event.start.date, // Flag for all-day events
      }));
      setEvents(formattedEvents);
    } catch (err) {
      console.error("Failed to fetch events:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
    }
  };
  
  // On component mount, fetch events
  useEffect(() => {
    const refreshEvents = async () => {
      setLoading(true);
      await fetchEvents();
      setLoading(false);
    };
  
    refreshEvents();
  }, []);

  /**
   * Handles slot selection to create a new event.
   * @param {Object} slotInfo - Information about the selected time slot.
   */
  const handleSelectSlot = (slotInfo) => {
    setIsEditing(false);
    setNewEvent({
      title: "",
      description: "",
      location: "",
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewEvent({ title: "", description: "", location: "", start: "", end: "" });
    setSelectedEvent(null);
    setErrorMessage("");
  };

  /**
   * Handles event selection to edit an existing event.
   * Populates modal fields with event data.
   * @param {Object} event - The selected event.
   */
  const handleSelectEvent = (event) => {
    setIsEditing(true);
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      location: event.location,
      start: event.start.toISOString().slice(0, 16), // Format for datetime-local
      end: event.end.toISOString().slice(0, 16),
    });
    setShowModal(true);
  };

  /**
   * Saves a new or edited event to the backend and updates state.
   */
  const handleSaveEvent = async () => {
    const { title, description, location, start, end } = newEvent;
  
    // Reset messages
    setErrorMessage("");
  
    // Validate required fields
    if (!title || !start || !end) {
      setErrorMessage("Title Required.");
      return;
    }
  
    // Validate start and end times
    if (new Date(start) >= new Date(end)) {
      setErrorMessage("Start time must be before the end time.");
      return;
    }
  
    setSaving(true);
  
    // Add event locally for immediate feedback
    const tempEvent = {
      id: `temp-${Date.now()}`, // Temporary ID
      title,
      start: new Date(start),
      end: new Date(end),
      description,
      location,
    };
  
    setEvents((prev) => [...prev, tempEvent]);
  
    try {
      if (isEditing && selectedEvent) {
        // Update existing event in the backend
        await api.patch(`/google-calendar/events/${selectedEvent.id}`, {
          summary: title,
          description,
          location,
          start: { dateTime: new Date(start).toISOString() },
          end: { dateTime: new Date(end).toISOString() },
        });
        // Refresh events after updating
        await fetchEvents();
        setGlobalSuccessMessage("Event updated successfully!"); // Show success message
      } else {
        // Save new event to the backend
        const response = await api.post("/google-calendar/events", {
          summary: title,
          description,
          location,
          start: { dateTime: new Date(start).toISOString() },
          end: { dateTime: new Date(end).toISOString() },
        });
        // Replace the temporary event with the saved event
        setEvents((prev) =>
          prev.map((evt) =>
            evt.id === tempEvent.id
              ? {
                  id: response.data.id,
                  title: response.data.summary,
                  start: new Date(response.data.start.dateTime),
                  end: new Date(response.data.end.dateTime),
                  description: response.data.description,
                  location: response.data.location,
                }
              : evt
          )
        );
        setGlobalSuccessMessage("Event added successfully!");
      }
      setTimeout(() => {
        setGlobalSuccessMessage("");
      }, 3000);
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save event:", err.response || err.message);
      setErrorMessage("Failed to save event. Please try again.");
      // Remove the temporary event if saving fails
      setEvents((prev) => prev.filter((evt) => evt.id !== tempEvent.id));
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteEvent = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      console.error("No valid event selected for deletion.");
      alert("No event selected or event ID is missing.");
      return;
    }
    setShowConfirmModal(true); // Show custom confirmation modal
  };

  /**
   * Confirms deletion of the selected event.
   */
  const confirmDeleteEvent = async () => {
    setShowConfirmModal(false);
    setShowModal(false);
    try {
      await api.delete(`/google-calendar/events/${selectedEvent.id}`);

      setEvents((prevEvents) =>
        prevEvents.filter((evt) => evt.id !== selectedEvent.id)
      );

      fetchEvents();
      setGlobalSuccessMessage("Event deleted successfully!");

      setTimeout(() => {
        setGlobalSuccessMessage("");
      }, 3000);

      await fetchEvents();
    } catch (err) {
      console.error("Failed to delete event:", err.response || err.message);
      alert("Failed to delete event. Please try again.");
    } finally {
    }
  };

  if (isLoading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading Calendar...</span>
        </div>
      </div>
    );
  }
  if (!events || events.length === 0) return <div>No upcoming events found.</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Google Calendar</h2>

      {/* Success Message */}
      {globalSuccessMessage && (
        <div className="alert alert-success text-center">
          {globalSuccessMessage}
        </div>
      )}
      {/* Calendar UI */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultDate={new Date()}
        style={{ height: 500 }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />

      {/* Event Management Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Event" : "Create New Event"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter event title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />
            </Form.Group>
            {/* Additional fields for description, location, start, and end */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter description"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter location"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Start Date/Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={newEvent.start}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, start: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date/Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={newEvent.end}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, end: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {isEditing && (
            <Button variant="danger" onClick={handleDeleteEvent}>
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveEvent} disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Event"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this event: <strong>{selectedEvent?.title}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteEvent}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GoogleCalendarEvents;
