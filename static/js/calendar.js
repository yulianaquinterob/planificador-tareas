class CalendarManager {
    constructor() {
        this.events = this.getEvents(); // carga los eventos guardados 
        if (!Array.isArray(this.events)) { // verifica que los datos tengan el formato esperado
            throw new Error('Los datos guardados de eventos no tienen un formato válido.');
        }

        // busca el ID mas alto para continuar la numeracion sin repetir identificadores
        const maxId = this.events.reduce((max, ev) => Math.max(max, Number(ev && ev.id) || 0), 0);
        this.currentId = maxId + 1; // ID que se asignará al próximo evento
        this.calendar = null; // referencia al calendario que se crea al cargar la página
    }

    getEvents() {
        const storedEvents = localStorage.getItem('events'); // lee los eventos guardados como texto
        return storedEvents ? JSON.parse(storedEvents) : []; // convierte el texto a formato json o devuelve una lista vacia
    }

    saveToStorage() {
        localStorage.setItem('events', JSON.stringify(this.events)); // guarda la lista actual en el navegador
    }

    addEvent(eventData) {
        const newEvent = {
            id: this.currentId++, // asigna un id unico y prepara el siguiente
            titulo: (eventData.title || '').trim() || 'Evento', // guarda el titulo sin espacios sobrantes
            fecha: eventData.date || getLocalDate(), // usa la fecha elegida o la actual
            hora: eventData.hour || '', // guarda la hora 
            lugar: eventData.place || '', // guarda el lugar 
            nota: eventData.note || '' // guarda la nota 
        };

        this.events.push(newEvent); // Agrega el evento a la lista
        if (this.calendar) { // si el calendario ya esta creado, lo muestra de inmediato
            this.calendar.addEvent(this.toCalendarEvent(newEvent)); //agrega el evento en el calendario
        }
        this.saveToStorage(); // guarda el evento en local storage
        return newEvent; // Devuelve el evento recien creado
    }

    deleteEvent(eventId) {
        this.events = this.events.filter(ev => Number(ev.id) !== Number(eventId)); // borra el evento de la lista

        if (this.calendar) { // Tambien borra el evento del calendario 
            const calendarEvent = this.calendar.getEventById(String(eventId));
            if (calendarEvent) {
                calendarEvent.remove();
            }
        }

        this.saveToStorage(); // actualiza los datos guardados
    }

    toCalendarEvent(event) {
        const hasValidTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(event.hora || '');// comprueba si el evento de la hora tiene el formato de 24 horas
        return {
            id: String(event.id), // FullCalendar utiliza el ID para identificar cada evento
            title: event.titulo , // titulo del evento
            start: hasValidTime ? `${event.fecha}T${event.hora}:00` : event.fecha, // Usa la hora si se indico si no solo la fecha
            allDay: !hasValidTime // si no se agrga hora el evento ocupa todo el dia
        };
    }

    showEventCard(event) {  
        const template = document.getElementById('event-card-template');// obtiene la plantilla  del evento
        const details = document.getElementById('event-details');// obtiene el contenedor del modal con los detalles
        if (!template || !details) //comprueba que no falta template o details si cualquiera de las dos falta
            return; //termina la funcion sin continuar

        const cardClone = template.content.cloneNode(true); // copia la plantilla para el evento
        const titleEl = cardClone.querySelector('.event-title'); //titulo del evento
        const hourEl = cardClone.querySelector('.event-hour'); // hora del evento
        const placeEl = cardClone.querySelector('.event-place'); // lugar del evento
        const noteEl = cardClone.querySelector('.event-note'); // nota de descripcion
        const dateEl = cardClone.querySelector('.event-date'); //fecha del evento

        // completa la tarjeta con los datos del evento 
        if (titleEl) titleEl.textContent = event.titulo ;
        if (hourEl) hourEl.textContent = event.hora || 'Sin hora';
        if (placeEl) placeEl.textContent = event.lugar || 'Sin lugar';
        if (noteEl) noteEl.textContent = event.nota || 'Sin nota';
        if (dateEl) {
          
            const date = new Date(`${event.fecha}T00:00:00`);  // crea la fecha a medianoche para evitar cambios de dia por la zona horaria
            dateEl.textContent = Number.isNaN(date.getTime()) //verifica si la fecha es valida
                ? event.fecha //
                : date.toLocaleDateString('es-ES', { dateStyle: 'long' });
        }

        const deleteBtn = cardClone.querySelector('.btn-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteEvent(event.id); // elimina el evento al pulsar el evento al pulsar el boton en la tarjeta
                bootstrap.Modal.getOrCreateInstance(document.getElementById('eventDetailsModal')).hide(); // cierra los detalles
            });
        }

        details.replaceChildren(cardClone); // muestra solo la tarjeta del evento seleccionado
        bootstrap.Modal.getOrCreateInstance(document.getElementById('eventDetailsModal')).show(); // abre el modal de detalles
    }
}

const calendarManager = new CalendarManager(); // crea una instancia de la clase de calendarmanager
window.calendarManager = calendarManager; // permite acceder a el desde otras partes de la pagina

document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById("calendar"); // contenedor donde FullCalendar se vera

  // Añade al toolbar un botón para abrir el formulario de evento
  const addEventToolbarButton = () => {
    const title = calendarEl.querySelector('[role="heading"][aria-level="2"]'); // Encuentra el espacio a la derecha del titulo
    const rightToolbar = title?.parentElement?.parentElement?.lastElementChild;
    if (!rightToolbar || rightToolbar.querySelector('.calendar-add-event')) return;    // evita duplicar el botnn cuando se cambia de mes

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-primary btn-sm calendar-add-event';
    button.textContent = 'Agregar evento';
    button.addEventListener('click', () => {
      bootstrap.Modal.getOrCreateInstance(document.getElementById('eventModal')).show();    // abre el modal de Bootstrap que contiene el formulario
    });
    rightToolbar.appendChild(button);
  };
  
  // configura las opciones y acciones del calendario
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "es", // muestra los nombres y controles en español
    timeZone: "local", // usa la zona horaria local para identificar el dia actual
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "",
    },
    datesSet: addEventToolbarButton, // coloca el boton despues de actualizar la vista del calendario
    editable: true, // permite arrastrar eventos a otra fecha
    dayMaxEvents: true, // agrupa eventos que no caben dentro de un día
    events: calendarManager.events.map(event => calendarManager.toCalendarEvent(event)), // carga los eventos guardados
    eventClick: info => { // al pulsar un evento, busca sus datos completos y abre su tarjeta
        const event = calendarManager.events.find(savedEvent => Number(savedEvent.id) === Number(info.event.id));
        if (event) {
            calendarManager.showEventCard(event);
        }
    },
    eventDrop: info => {  // guarda la nueva fecha despues de mover un evento en el calendario
        const event = calendarManager.events.find(savedEvent => Number(savedEvent.id) === Number(info.event.id));
        if (event && info.event.startStr) {
            event.fecha = info.event.startStr.slice(0, 10);
            event.hora = info.event.allDay ? '' : info.event.startStr.slice(11, 16);
            calendarManager.saveToStorage();
        }
    }
  });

  calendarManager.calendar = calendar; // permite que agregar y eliminar eventos actualice la vista
  calendar.render(); // renderiza el calendario en la pagina
});


const eventForm = document.getElementById('event-form');//obtiene el formulario para validar los campos
const eventDateInput = document.getElementById('date');
const eventFields = {
    title: document.getElementById('title'),
    date: eventDateInput,
    hour: document.getElementById('hour')
};

function getLocalDate() {// construye AAAA-MM-DD usando la fecha local para evitar desfases de zona horaria
    const today = new Date(); 
    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-');
}

function validateEventField(fieldName) {// Busca el espacio donde se mostrara su mensaje de error  
    const field = eventFields[fieldName];
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (!field || !errorElement) return true;

    let message = '';
    // Comprueba que el titulo y la fecha estén completos
    if (fieldName === 'title' && !field.value.trim()) {
        message = 'Ingresa el título del evento.';
    } else if (fieldName === 'date' && !field.value) {
        message = 'Selecciona la fecha del evento.';
    } else if (fieldName === 'hour' && field.value && !/^([01]\d|2[0-3]):[0-5]\d$/.test(field.value)) {//validar la hora en caso de que se indique
        message = 'Ingresa una hora válida.';
    }

    errorElement.textContent = message; // actualiza el mensaje junto al campo
    if (message) {
        field.setAttribute('aria-invalid', 'true'); // marca el campo como invalido para estilos y accesibilidad
        return false;
    }

    field.removeAttribute('aria-invalid'); // quita el estado de error cuando el valor es correcto
    return true;
}

if (eventDateInput) {
    eventDateInput.value = getLocalDate(); // sugiere el dia actual como fecha inicial del evento
}

// valida cada campo mientras el usuario escribe o cambia su valor
Object.keys(eventFields).forEach(fieldName => {
    const field = eventFields[fieldName];
    if (field) {
        field.addEventListener('input', () => validateEventField(fieldName));
        field.addEventListener('change', () => validateEventField(fieldName));
    }
});

// limpia los valores y errores al cerrar el formulario, y vuelve a sugerir la fecha de hoy
document.getElementById('eventModal')?.addEventListener('hidden.bs.modal', () => {
    if (eventForm) {
        eventForm.reset();
        if (eventDateInput) eventDateInput.value = getLocalDate();
        Object.keys(eventFields).forEach(fieldName => {
            const field = eventFields[fieldName];
            const errorElement = document.getElementById(`${fieldName}-error`);
            field?.removeAttribute('aria-invalid');
            if (errorElement) errorElement.textContent = '';
        });
    }
});

if (eventForm) {
    eventForm.addEventListener('submit', (event) => {//cuando se guarda
        event.preventDefault(); // evita que el formulario recargue la página
        // valida todos los campos y enfoca el primero que necesite corregirse
        const invalidFields = Object.keys(eventFields).filter(fieldName => !validateEventField(fieldName));
        if (invalidFields.length) {
            eventFields[invalidFields[0]]?.focus();
            return;
        }

        // recopila los valores para crear el nuevo evento
        const formData = {
            title: eventFields.title?.value.trim() || '',
            hour: eventFields.hour?.value || '',
            place: document.getElementById('place')?.value || '',
            note: document.getElementById('note')?.value || '',
            date: eventDateInput?.value || ''
        };

        const savedEvent = calendarManager.addEvent(formData); // guarda el evento y lo agrega al calendario
        if (savedEvent) {
            bootstrap.Modal.getOrCreateInstance(document.getElementById('eventModal')).hide(); // cierra el formulario al guardar 
        }
    });
}
