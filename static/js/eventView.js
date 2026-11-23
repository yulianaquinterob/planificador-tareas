const eventView = {
    initialize(calendarManager) {
        const calendarElement = document.getElementById('calendar');
        if (!calendarElement) return;

        const addEventToolbarButton = () => {
            const title = calendarElement.querySelector('[role="heading"][aria-level="2"]');
            const rightToolbar = title?.parentElement?.parentElement?.lastElementChild;
            if (!rightToolbar || rightToolbar.querySelector('.calendar-add-event')) return;

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-primary btn-sm calendar-add-event';
            button.textContent = 'Agregar evento';
            button.addEventListener('click', openEventForCreate);
            rightToolbar.appendChild(button);
        };

        const calendar = new FullCalendar.Calendar(calendarElement, {
            locale: 'es',
            timeZone: 'local',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: ''
            },
            datesSet: addEventToolbarButton,
            editable: true,
            dayMaxEvents: true,
            events: calendarManager.events.map(event => calendarManager.toCalendarEvent(event)),
            eventClick: (info) => {
                const event = calendarManager.events.find(
                    savedEvent => Number(savedEvent.id) === Number(info.event.id)
                );
                if (event) eventView.showEventCard(event);
            },
            eventDrop: (info) => {
                const event = calendarManager.events.find(
                    savedEvent => Number(savedEvent.id) === Number(info.event.id)
                );
                if (event && info.event.startStr) {
                    event.fecha = info.event.startStr.slice(0, 10);
                    event.hora = info.event.allDay ? '' : info.event.startStr.slice(11, 16);
                    calendarManager.saveToStorage();
                }
            }
        });

        calendarManager.calendar = calendar;
        calendar.render();
    },

    showEventCard(event) {
        const template = document.getElementById('event-card-template');
        const details = document.getElementById('event-details');
        if (!template || !details) return;

        const cardClone = template.content.cloneNode(true);
        const titleElement = cardClone.querySelector('.event-title');
        const hourElement = cardClone.querySelector('.event-hour');
        const placeElement = cardClone.querySelector('.event-place');
        const noteElement = cardClone.querySelector('.event-note');
        const dateElement = cardClone.querySelector('.event-date');

        if (titleElement) titleElement.textContent = event.titulo;
        if (hourElement) hourElement.textContent = event.hora || 'Sin hora';
        if (placeElement) placeElement.textContent = event.lugar || 'Sin lugar';
        if (noteElement) noteElement.textContent = event.nota || 'Sin nota';
        if (dateElement) {
            const date = new Date(`${event.fecha}T00:00:00`);
            dateElement.textContent = Number.isNaN(date.getTime())
                ? event.fecha
                : date.toLocaleDateString('es-ES', { dateStyle: 'long' });
        }

        const deleteButton = cardClone.querySelector('.btn-delete');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                calendarManager.deleteEvent(event.id);
                bootstrap.Modal.getOrCreateInstance(
                    document.getElementById('eventDetailsModal')
                ).hide();
            });
        }

        const updateButton = cardClone.querySelector('.btn-update');
        if (updateButton) {
            updateButton.addEventListener('click', () => {
                openEventForEdit(event);
                bootstrap.Modal.getOrCreateInstance(
                    document.getElementById('eventDetailsModal')
                ).hide();
            });
        }

        details.replaceChildren(cardClone);
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById('eventDetailsModal')
        ).show();
    }
};
