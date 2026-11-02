/* ==========================================================
   CAZADOR PATAGÓNICO - LÓGICA DE USUARIOS Y COMUNIDAD
   ========================================================== */

const USERS_STORAGE_KEY = "cp_patagonico_users_v1";
const CURRENT_USER_KEY = "cp_patagonico_current_user_v1";

let registeredUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
let currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null;

document.addEventListener("DOMContentLoaded", () => {
    initAuthUI();
    initAuthEventListeners();
});

function initAuthUI() {
    const accountLabel = document.getElementById("cp-account-label");
    if (currentUser && accountLabel) {
        const firstName = currentUser.name.split(" ")[0];
        accountLabel.textContent = firstName;
    }
}

function initAuthEventListeners() {
    const accountBtn = document.getElementById("cp-account-btn");
    const authCloseBtn = document.getElementById("cp-auth-close-btn");
    const authCloseOverlay = document.getElementById("cp-auth-close-overlay");

    const showRegisterBtn = document.getElementById("cp-show-register-btn");
    const showLoginBtn = document.getElementById("cp-show-login-btn");
    const loginForm = document.getElementById("cp-login-form");
    const registerForm = document.getElementById("cp-register-form");
    const logoutBtn = document.getElementById("cp-logout-btn");

    if (accountBtn) {
        accountBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openAuthModal();
        });
    }

    if (authCloseBtn) authCloseBtn.addEventListener("click", closeAuthModal);
    if (authCloseOverlay) authCloseOverlay.addEventListener("click", closeAuthModal);

    if (showRegisterBtn) {
        showRegisterBtn.addEventListener("click", () => {
            loginForm.style.display = "none";
            registerForm.style.display = "block";
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener("click", () => {
            registerForm.style.display = "none";
            loginForm.style.display = "block";
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("cp-reg-name").value.trim();
            const email = document.getElementById("cp-reg-email").value.trim().toLowerCase();
            const password = document.getElementById("cp-reg-pass").value.trim();
            const phone = document.getElementById("cp-reg-phone").value.trim();
            const address = document.getElementById("cp-reg-address").value.trim();

            const exists = registeredUsers.find(u => u.email === email);
            if (exists) {
                alert("Este correo electrónico ya está registrado en la comunidad.");
                return;
            }

            const newUser = { name, email, password, phone, address };
            registeredUsers.push(newUser);
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(registeredUsers));

            setCurrentUser(newUser);
            alert(`¡Bienvenido a la comunidad, ${name}! Ya sos parte de Cazador Patagónico.`);
            closeAuthModal();
            location.reload();
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("cp-login-email").value.trim().toLowerCase();
            const password = document.getElementById("cp-login-pass").value.trim();

            const user = registeredUsers.find(u => u.email === email && u.password === password);
            if (user) {
                setCurrentUser(user);
                alert(`¡Hola de nuevo, ${user.name}! Sesión iniciada correctamente.`);
                closeAuthModal();
                location.reload();
            } else {
                alert("Correo o contraseña incorrectos. Verificá tus datos.");
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("¿Estás seguro de cerrar sesión?")) {
                localStorage.removeItem(CURRENT_USER_KEY);
                currentUser = null;
                alert("Sesión cerrada.");
                closeAuthModal();
                location.reload();
            }
        });
    }
}

function setCurrentUser(user) {
    currentUser = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function openAuthModal() {
    const authModal = document.getElementById("cp-auth-modal");
    const loginForm = document.getElementById("cp-login-form");
    const registerForm = document.getElementById("cp-register-form");
    const profileView = document.getElementById("cp-user-profile-view");
    const authTitle = document.getElementById("cp-auth-title");

    if (authModal) {
        if (currentUser) {
            loginForm.style.display = "none";
            registerForm.style.display = "none";
            profileView.style.display = "block";
            authTitle.innerHTML = `<i class="fa-solid fa-user-check"></i> MI CUENTA`;

            document.getElementById("cp-profile-name").textContent = currentUser.name;
            document.getElementById("cp-profile-email").textContent = currentUser.email;
            document.getElementById("cp-profile-address").textContent = currentUser.address || "No especificada";
        } else {
            loginForm.style.display = "block";
            registerForm.style.display = "none";
            profileView.style.display = "none";
            authTitle.innerHTML = `<i class="fa-solid fa-user-shield"></i> ACCESO A LA COMUNIDAD`;
        }

        authModal.classList.add("active");
        authModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }
}

function closeAuthModal() {
    const authModal = document.getElementById("cp-auth-modal");
    if (authModal) {
        authModal.classList.remove("active");
        authModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
}