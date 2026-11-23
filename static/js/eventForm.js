const eventForm = {
    editingEventId: null,
    openModalAfterDetails: false,

    initialize() {
        this.form = document.getElementById('event-form');
        this.dateInput = document.getElementById('date');
        this.fields = {
            title: document.getElementById('title'),
            date: this.dateInput,
            hour: document.getElementById('hour')
        };
        this.modalElement = document.getElementById('eventModal');
        this.modalLabel = document.getElementById('eventModalLabel');
        this.subtitle = document.getElementById('event-form-subtitle');
        this.submitButton = document.getElementById('event-submit');
        this.status = document.getElementById('event-form-status');

        if (!this.form) return;

        this.dateInput.value = getLocalDate();

        Object.keys(this.fields).forEach((fieldName) => {
            const field = this.fields[fieldName];
            if (field) {
                field.addEventListener('input', () => this.validateField(fieldName));
                field.addEventListener('change', () => this.validateField(fieldName));
            }
        });

        this.modalElement?.addEventListener('hidden.bs.modal', () => this.reset());

        document.getElementById('eventDetailsModal')?.addEventListener('hidden.bs.modal', () => {
            if (this.openModalAfterDetails) {
                this.openModalAfterDetails = false;
                bootstrap.Modal.getOrCreateInstance(this.modalElement).show();
            }
        });

        this.form.addEventListener('submit', (event) => this.submit(event));
    },

    reset() {
        this.editingEventId = null;
        this.form.reset();
        this.dateInput.value = getLocalDate();
        this.modalLabel.textContent = 'Agregar evento';
        this.subtitle.textContent = 'Nuevo recordatorio';
        this.submitButton.textContent = 'Guardar evento';
        this.status.textContent = '';

        Object.keys(this.fields).forEach((fieldName) => {
            const field = this.fields[fieldName];
            const errorElement = document.getElementById(`${fieldName}-error`);
            field.removeAttribute('aria-invalid');
            errorElement.textContent = '';
        });
    },

    openForCreate() {
        this.reset();
        bootstrap.Modal.getOrCreateInstance(this.modalElement).show();
    },

    openForEdit(event) {
        this.editingEventId = event.id;
        this.fields.title.value = event.titulo;
        this.fields.date.value = event.fecha;
        this.fields.hour.value = event.hora;
        document.getElementById('place').value = event.lugar;
        document.getElementById('note').value = event.nota;
        this.modalLabel.textContent = 'Actualizar evento';
        this.subtitle.textContent = 'Editar recordatorio';
        this.submitButton.textContent = 'Guardar cambios';
        this.status.textContent = '';

        Object.keys(this.fields).forEach((fieldName) => {
            const field = this.fields[fieldName];
            field.removeAttribute('aria-invalid');
            document.getElementById(`${fieldName}-error`).textContent = '';
        });

        this.openModalAfterDetails = true;
    },

    validateField(fieldName) {
        const field = this.fields[fieldName];
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (!field || !errorElement) return true;

        let message = '';
        if (fieldName === 'title' && !field.value.trim()) {
            message = 'Ingresa el título del evento.';
        } else if (fieldName === 'date' && !field.value) {
            message = 'Selecciona la fecha del evento.';
        } else if (
            fieldName === 'hour'
            && field.value
            && !/^([01]\d|2[0-3]):[0-5]\d$/.test(field.value)
        ) {
            message = 'Ingresa una hora válida.';
        }

        errorElement.textContent = message;
        if (message) {
            field.setAttribute('aria-invalid', 'true');
            return false;
        }

        field.removeAttribute('aria-invalid');
        return true;
    },

    submit(event) {
        event.preventDefault();
        this.status.textContent = '';

        const invalidFields = Object.keys(this.fields).filter(
            fieldName => !this.validateField(fieldName)
        );
        if (invalidFields.length) {
            this.fields[invalidFields[0]]?.focus();
            return;
        }

        const formData = {
            title: this.fields.title?.value.trim() || '',
            hour: this.fields.hour?.value || '',
            place: document.getElementById('place')?.value || '',
            note: document.getElementById('note')?.value || '',
            date: this.dateInput?.value || ''
        };

        try {
            const savedEvent = this.editingEventId === null
                ? calendarManager.addEvent(formData)
                : calendarManager.updateEvent(this.editingEventId, formData);

            if (savedEvent) {
                bootstrap.Modal.getOrCreateInstance(this.modalElement).hide();
            } else {
                this.status.textContent = 'No se encontró el evento que intentas actualizar.';
            }
        } catch (error) {
            console.error('No se pudo guardar el evento.', error);
            this.status.textContent = 'No se pudo guardar el evento. Inténtalo de nuevo.';
        }
    }
};

function getLocalDate() {
    const today = new Date();
    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-');
}

function openEventForCreate() {
    eventForm.openForCreate();
}

function openEventForEdit(event) {
    eventForm.openForEdit(event);
}
