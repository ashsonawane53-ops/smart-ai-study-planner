// Authentication JavaScript
const API_URL = '/api';

// Show alert message
function showAlert(message, type = 'error') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;

    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    alertContainer.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;

    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);
}

// Global auth state
let currentUser = null;

// Check if user is authenticated and handle redirects
async function checkAuthState(isProtectedPage = false) {
    try {
        const response = await fetch(`${API_URL}/auth/check-auth`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.authenticated) {
            currentUser = data.user;
            // If on login/register page and authenticated, redirect to dashboard
            const currentPage = window.location.pathname.split('/').pop();
            if ((currentPage === 'index.html' || currentPage === 'register.html' || currentPage === '') && currentUser) {
                window.location.href = 'app.html';
            }
        } else {
            currentUser = null;
            // Only redirect to index.html if we are on a protected page
            // Protected pages: app.html, dashboard.html, subjects.html, planner.html, tests.html, revisions.html, doubts.html
            const protectedPages = ['app.html', 'dashboard.html', 'subjects.html', 'planner.html', 'tests.html', 'revisions.html', 'doubts.html'];
            const currentPage = window.location.pathname.split('/').pop();

            if (protectedPages.includes(currentPage)) {
                window.location.href = 'index.html';
            }
        }
        return currentUser;
    } catch (error) {
        console.error('Auth check failed:', error);
        if (isProtectedPage) {
            window.location.href = 'index.html';
        }
        return null;
    }
}

// Login form handler
const loginForm = document.getElementById('login-form');
if (loginForm) {
    // Check auth state on load
    checkAuthState(false);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        try {
            if (submitBtn) submitBtn.disabled = true;
            if (submitBtn) submitBtn.textContent = 'Logging in...';

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'app.html';
                }, 1000);
            } else {
                showAlert(data.error || 'Login failed');
                if (submitBtn) submitBtn.disabled = false;
                if (submitBtn) submitBtn.textContent = 'Login';
            }
        } catch (error) {
            showAlert('Network error. Please try again.');
            console.error('Login error:', error);
            if (submitBtn) submitBtn.disabled = false;
            if (submitBtn) submitBtn.textContent = 'Login';
        }
    });
}

// Register form handler
const registerForm = document.getElementById('register-form');
if (registerForm) {
    // Check auth state on load
    checkAuthState(false);

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const academicLevel = document.getElementById('academic-level').value;
        const submitBtn = registerForm.querySelector('button[type="submit"]');

        if (password.length < 6) {
            showAlert('Password must be at least 6 characters long');
            return;
        }

        try {
            if (submitBtn) submitBtn.disabled = true;
            if (submitBtn) submitBtn.textContent = 'Registering...';

            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ name, email, password, academicLevel })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('Registration successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'app.html';
                }, 1000);
            } else {
                showAlert(data.error || 'Registration failed');
                if (submitBtn) submitBtn.disabled = false;
                if (submitBtn) submitBtn.textContent = 'Register';
            }
        } catch (error) {
            showAlert('Network error. Please try again.');
            console.error('Registration error:', error);
            if (submitBtn) submitBtn.disabled = false;
            if (submitBtn) submitBtn.textContent = 'Register';
        }
    });
}

// Logout function
async function logout() {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'index.html';
    }
}

// Protect pages wrapper
async function protectPage() {
    return await checkAuthState(true);
}
