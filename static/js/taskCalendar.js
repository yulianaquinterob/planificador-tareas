class CalendarManager {
    constructor() {
        this.events = this.loadFromStorage();
        if (!Array.isArray(this.events)) {
            throw new Error('Los datos guardados de eventos no tienen un formato válido.');
        }

        const maxId = this.events.reduce(
            (max, event) => Math.max(max, Number(event && event.id) || 0),
            0
        );
        this.currentId = maxId + 1;
        this.calendar = null;
    }

    loadFromStorage() {
        return eventStorage.load();
    }

    saveToStorage(events = this.events) {
        eventStorage.save(events);
    }

    addEvent(eventData) {
        const newEvent = {
            id: this.currentId++,
            titulo: (eventData.title || '').trim() || 'Evento',
            fecha: eventData.date || getLocalDate(),
            hora: eventData.hour || '',
            lugar: eventData.place || '',
            nota: eventData.note || ''
        };

        this.events.push(newEvent);
        if (this.calendar) {
            this.calendar.addEvent(this.toCalendarEvent(newEvent));
        }
        this.saveToStorage();
        return newEvent;
    }

    deleteEvent(eventId) {
        this.events = this.events.filter(
            event => Number(event.id) !== Number(eventId)
        );

        if (this.calendar) {
            const calendarEvent = this.calendar.getEventById(String(eventId));
            if (calendarEvent) calendarEvent.remove();
        }

        this.saveToStorage();
    }

    updateEvent(eventId, eventData) {
        const event = this.events.find(
            savedEvent => Number(savedEvent.id) === Number(eventId)
        );
        if (!event) return null;

        const updatedEvent = {
            ...event,
            titulo: eventData.title.trim(),
            fecha: eventData.date,
            hora: eventData.hour || '',
            lugar: eventData.place || '',
            nota: eventData.note || ''
        };

        const updatedEvents = this.events.map(
            savedEvent => savedEvent === event ? updatedEvent : savedEvent
        );
        this.saveToStorage(updatedEvents);
        this.events = updatedEvents;

        if (this.calendar) {
            this.calendar.getEventById(String(eventId))?.remove();
            this.calendar.addEvent(this.toCalendarEvent(updatedEvent));
        }

        return updatedEvent;
    }

    toCalendarEvent(event) {
        const hasValidTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(event.hora || '');
        return {
            id: String(event.id),
            title: event.titulo,
            start: hasValidTime ? `${event.fecha}T${event.hora}:00` : event.fecha,
            allDay: !hasValidTime
        };
    }
}

const calendarManager = new CalendarManager();
window.calendarManager = calendarManager;
