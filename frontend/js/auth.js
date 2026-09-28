function syncRewardsAuthUI() {
    const loggedIn = isLoggedIn();
    const navProfile = document.getElementById('nav-profile');
    const userPointsCard = document.getElementById('user-points-card');
    const gamificationGrid = document.getElementById('gamification-grid');

    if (navProfile) navProfile.hidden = !loggedIn;
    if (userPointsCard) {
        userPointsCard.hidden = !loggedIn;
        if (!loggedIn) {
            userPointsCard.setAttribute('hidden', '');
        } else {
            userPointsCard.removeAttribute('hidden');
        }
    }
    if (gamificationGrid) {
        gamificationGrid.classList.toggle('is-guest', !loggedIn);
    }
}

function updateAuthUI() {
    const authBtn = document.getElementById('auth-btn');
    const authPanel = document.getElementById('auth-panel');
    const profilePanel = document.getElementById('profile-panel');

    if (!authBtn) return;

    const loggedIn = isLoggedIn();
    syncRewardsAuthUI();
    syncAuthenticatedMobileFeatures();

    if (loggedIn) {
        authBtn.textContent = 'Cerrar sesión';
        authBtn.href = '#';
        authBtn.dataset.action = 'logout';
        if (authPanel) authPanel.hidden = true;
        if (profilePanel) profilePanel.hidden = false;
        loadProfile();
        loadRewards();
    } else {
        authBtn.textContent = 'Login / Registro';
        authBtn.href = '#registro';
        authBtn.dataset.action = 'login';
        if (authPanel) authPanel.hidden = false;
        if (profilePanel) profilePanel.hidden = true;
    }
}

function syncAuthenticatedMobileFeatures() {
    const isMobile = typeof isMobileDevice === 'function' && isMobileDevice();
    const dashboard = document.getElementById('auth-dashboard');
    const mobilePointSection = document.querySelector('#auth-dashboard .mobile-only-section');
    const evidenceSection = document.getElementById('evidencia');

    if (dashboard) dashboard.hidden = !isLoggedIn();
    if (mobilePointSection) mobilePointSection.hidden = !isLoggedIn() || !isMobile;
    if (evidenceSection) evidenceSection.hidden = !isLoggedIn() || !isMobile;
}

async function loadProfile() {
    const profileInfo = document.getElementById('profile-info');
    if (!profileInfo || !isLoggedIn()) return;

    try {
        const user = await apiRequest('/auth/me');
        profileInfo.innerHTML = `
            <p><strong>Nombre:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Rol:</strong> ${user.roleId === 1 ? 'Administrador' : 'Reciclador'}</p>
        `;
    } catch {
        clearToken();
        updateAuthUI();
    }
}

function initAuthTabs() {
    const tabs = document.querySelectorAll('[data-auth-tab]');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.dataset.authTab;
            if (loginForm) loginForm.hidden = target !== 'login';
            if (registerForm) registerForm.hidden = target !== 'register';
        });
    });
}

function initLoginForm() {
    const form = document.getElementById('login-form');
    const status = document.getElementById('login-status');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        status.textContent = '';
        status.className = 'form-status';

        const email = form.email.value.trim();
        const password = form.password.value;

        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            setToken(data.token);
            status.textContent = 'Inicio de sesión exitoso.';
            status.classList.add('is-success');
            form.reset();
            updateAuthUI();
        } catch (error) {
            status.textContent = error.message;
            status.classList.add('is-error');
        }
    });
}

function isValidRegisterEmail(email) {
    return /^[^\s@]+@[^\s@]+\.com$/i.test(email);
}

function validateRegisterData({ name, email, password, passwordConfirm }) {
    if (name.length < 3) {
        return 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!isValidRegisterEmail(email)) {
        return 'El correo debe incluir @ y terminar en .com (ej. ejemplo@correo.com).';
    }

    if (password.length < 6) {
        return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
        return 'La contraseña debe incluir letras y números.';
    }

    if (password !== passwordConfirm) {
        return 'Las contraseñas no coinciden.';
    }

    return null;
}

function initRegisterForm() {
    const form = document.getElementById('register-form');
    const status = document.getElementById('register-status');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        status.textContent = '';
        status.className = 'form-status';

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;
        const passwordConfirm = form.passwordConfirm.value;

        const validationError = validateRegisterData({
            name,
            email,
            password,
            passwordConfirm,
        });

        if (validationError) {
            status.textContent = validationError;
            status.classList.add('is-error');
            return;
        }

        try {
            await apiRequest('/users', {
                method: 'POST',
                body: JSON.stringify({ name, email, password, status: 1 }),
            });

            status.textContent = 'Cuenta creada. Ahora puedes iniciar sesión.';
            status.classList.add('is-success');
            form.reset();

            document.querySelector('[data-auth-tab="login"]')?.click();
        } catch (error) {
            status.textContent = error.message;
            status.classList.add('is-error');
        }
    });
}

function initAuthButton() {
    const authBtn = document.getElementById('auth-btn');
    if (!authBtn) return;

    authBtn.addEventListener('click', (event) => {
        if (authBtn.dataset.action === 'logout') {
            event.preventDefault();
            clearToken();
            updateAuthUI();
        }
    });
}

function initAuth() {
    initAuthTabs();
    initLoginForm();
    initRegisterForm();
    initAuthButton();
    updateAuthUI();
    window.addEventListener('resize', syncAuthenticatedMobileFeatures);
}
