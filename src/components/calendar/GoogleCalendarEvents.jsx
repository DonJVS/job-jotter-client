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
      const { data } = await api.get("/google-calendar/events");
      const formattedEvents = data.map((event) => ({
        id: event.id,
        title: event.summary || "No Title",
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        description: event.description || "No Description",
        location: event.location || "No Location",
      }));
      setEvents(formattedEvents);
    } catch (err) {
      console.error("Failed to fetch events:", err.response || err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Call this function to refresh events
  const refreshEvents = async () => {
    setLoading(true);
    await fetchEvents();
  };

  useEffect(() => {
    refreshEvents();
    const fetchEvents = async () => {
      try {
        const { data } = await api.get("/google-calendar/events");
        const formattedEvents = data.map((event) => ({
          id: event.id, // Keep the event ID for updates
          title: event.summary || "No Title",
          start: new Date(event.start.dateTime || event.start.date),
          end: new Date(event.end.dateTime || event.end.date),
          description: event.description || "No Description",
          location: event.location || "No Location",
        }));
        setEvents(formattedEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err.response || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
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

    try {
      if (isEditing && selectedEvent) {
        // Update existing event
        await api.put(`/google-calendar/events/${selectedEvent.id}`, {
          summary: title,
          description,
          location,
          start: { dateTime: new Date(start).toISOString() },
          end: { dateTime: new Date(end).toISOString() },
        });

        setEvents((prevEvents) =>
          prevEvents.map((evt) =>
            evt.id === selectedEvent.id
              ? { ...evt, title, description, location, start: new Date(start), end: new Date(end) }
              : evt
          )
        );
        alert("Event updated successfully!");
      } else {
        // Create new event
        const response = await api.post("/google-calendar/events", {
          summary: title,
          description,
          location,
          start: { dateTime: new Date(start).toISOString() },
          end: { dateTime: new Date(end).toISOString() },
        });

        setEvents((prevEvents) => [
          ...prevEvents,
          {
            id: response.data.id,
            title,
            description,
            location,
            start: new Date(start),
            end: new Date(end),
          },
        ]);

        alert("Event added to Google Calendar!");
      }
    } catch (err) {
      console.error("Failed to save event to Google Calendar:", err);
      alert("Failed to save event to Google Calendar.");
    } finally {
      setShowModal(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await api.delete(`/google-calendar/events/${selectedEvent.id}`);
        setEvents((prevEvents) =>
          prevEvents.filter((evt) => evt.id !== selectedEvent.id)
        );
        alert("Event deleted successfully!");
      } catch (err) {
        console.error("Failed to delete event:", err);
        alert("Failed to delete event.");
      } finally {
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
          <Button variant="primary" onClick={handleSaveEvent}>
            {isEditing ? "Save Changes" : "Create Event"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GoogleCalendarEvents;
