import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "../../services/api";
import { Modal, Button, Form } from "react-bootstrap";

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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "",
    start: "",
    end: "",
  });

  const fetchEvents = async () => {
    try {
      setEvents([]);
      const { data } = await api.get(`/google-calendar/events?timestamp=${Date.now()}`);
  
      const formattedEvents = data.map((event) => ({
        id: event.id,
        title: event.summary || "No Title",
        start: event.start.dateTime
          ? new Date(event.start.dateTime)
          : new Date(event.start.date), // Fallback for all-day events
        end: event.end.dateTime
          ? new Date(event.end.dateTime)
          : new Date(event.end.date), // Fallback for all-day events
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
  
  useEffect(() => {
    const refreshEvents = async () => {
      setLoading(true);
      await fetchEvents();
      setLoading(false);
    };
  
    refreshEvents();
  }, []);

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
  };

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

  const handleSaveEvent = async () => {
    const { title, description, location, start, end } = newEvent;
  
    if (!title || !start || !end) {
      alert("Title, start, and end dates are required!");
      return;
    }
  
    if (new Date(start) >= new Date(end)) {
      alert("Start time must be before the end time.");
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
        alert("Event updated successfully!");
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
  
        alert("Event added successfully!");
      }
    } catch (err) {
      console.error("Failed to save event:", err.response || err.message);
      alert("Failed to save event. Please try again.");
  
      // Remove the temporary event if saving fails
      setEvents((prev) => prev.filter((evt) => evt.id !== tempEvent.id));
    } finally {
      setSaving(false);
      handleCloseModal();
    }
  };
  
  

  const handleDeleteEvent = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      console.error("No valid event selected for deletion.");
      alert("No event selected or event ID is missing.");
      return;
    }
  
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        // Make the API call to delete the event from Google Calendar
        const response = await api.delete(`/google-calendar/events/${selectedEvent.id}`);
  
        // Update local state to remove the event
        setEvents((prevEvents) =>
          prevEvents.filter((evt) => evt.id !== selectedEvent.id)
        );
  
        // Optionally refresh events from the server to ensure accuracy
        fetchEvents();
  
        alert("Event deleted successfully!");
      } catch (err) {
        console.error("Failed to delete event:", err.response || err.message);
        alert("Failed to delete event. Please try again.");
      } finally {
        // Close the modal
        setShowModal(false);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!events || events.length === 0) return <div>No upcoming events found.</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Google Calendar Events</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultDate={new Date()}
        style={{ height: 500 }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent} // Add event selection handler
      />

      {/* Modal for Creating or Editing Events */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Event" : "Create New Event"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveEvent} disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Event"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GoogleCalendarEvents;
