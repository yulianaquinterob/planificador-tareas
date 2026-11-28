document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('auth-form');
    const nameField = document.getElementById('name-field');
    const nameInput = document.getElementById('name');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const passwordToggle = document.getElementById('password-toggle');
    const status = document.getElementById('form-status');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const title = document.getElementById('form-title');
    const eyebrow = document.getElementById('form-eyebrow');
    const description = document.getElementById('form-description');
    const submitButton = document.getElementById('submit-button');
    let mode = 'login';

    const validateName = () => {
        const onlyWhitespace = mode === 'register'
            && nameInput.value.length > 0
            && nameInput.value.trim().length === 0;
        nameInput.setCustomValidity(onlyWhitespace ? 'Ingresa un nombre válido.' : '');
    };

    const setMode = (nextMode) => {
        mode = nextMode;
        const isRegister = mode === 'register';

        nameField.hidden = !isRegister;
        nameInput.required = isRegister;
        nameInput.disabled = !isRegister;
        validateName();
        passwordInput.autocomplete = isRegister ? 'new-password' : 'current-password';
        title.textContent = isRegister ? 'Crea tu cuenta' : 'Inicia sesión';
        eyebrow.textContent = isRegister ? 'EMPIEZA A ORGANIZARTE' : 'BIENVENIDO DE VUELTA';
        description.textContent = isRegister
            ? 'Crea tu cuenta y dale movimiento a tus proyectos.'
            : 'Accede a tu planner personal y continúa donde lo dejaste.';
        submitButton.textContent = isRegister ? 'Crear mi cuenta' : 'Entrar a mi planner';
        loginTab.classList.toggle('is-active', !isRegister);
        registerTab.classList.toggle('is-active', isRegister);
        loginTab.setAttribute('aria-pressed', String(!isRegister));
        registerTab.setAttribute('aria-pressed', String(isRegister));
        status.textContent = '';
    };

    loginTab.addEventListener('click', () => setMode('login'));
    registerTab.addEventListener('click', () => setMode('register'));
    nameInput.addEventListener('input', validateName);

    form.addEventListener('input', () => {
        status.textContent = '';
    });

    passwordToggle.addEventListener('click', () => {
        const isVisible = passwordInput.type === 'text';
        passwordInput.type = isVisible ? 'password' : 'text';
        passwordToggle.setAttribute('aria-pressed', String(!isVisible));
        passwordToggle.setAttribute('aria-label', isVisible ? 'Mostrar contraseña' : 'Ocultar contraseña');
        passwordToggle.querySelector('i').className = isVisible ? 'bi bi-eye' : 'bi bi-eye-slash';
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        validateName();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        emailInput.value = emailInput.value.trim();
        if (mode === 'register') {
            nameInput.value = nameInput.value.trim();
        }
        status.textContent = 'La autenticación aún no está conectada. Tus datos no se enviaron.';
    });
});
