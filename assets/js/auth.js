/* DEPRECATED: Authentication system currently not in use
class Auth {
    constructor() {
        this.isLoggedIn = false;
        this.user = null;
        this.initializeAuth();
    }

    initializeAuth() {
        // Check for existing session
        const session = localStorage.getItem('user_session');
        if (session) {
            try {
                this.user = JSON.parse(session);
                this.isLoggedIn = true;
                this.updateUI();
            } catch (e) {
                console.error('Error parsing session:', e);
                localStorage.removeItem('user_session');
            }
        }

        // Initialize login form
        const loginForm = document.getElementById('login-form');
        loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
    }

    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        try {
            // Here you would typically make an API call to your backend
            // This is a mock authentication
            await this.mockAuthentication(email, password);
            
            this.isLoggedIn = true;
            this.user = { email, name: email.split('@')[0] };
            
            // Store session
            localStorage.setItem('user_session', JSON.stringify(this.user));
            
            // Update UI
            this.updateUI();
            
            // Close modal
            document.querySelector('.modal-overlay').click();
            
        } catch (error) {
            alert(error.message);
        }
    }

    mockAuthentication(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password.length >= 6) {
                    resolve();
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1000);
        });
    }

    updateUI() {
        const loginBtn = document.querySelector('.login-btn');
        if (this.isLoggedIn && loginBtn) {
            loginBtn.textContent = this.user.name;
        }
    }

    logout() {
        this.isLoggedIn = false;
        this.user = null;
        localStorage.removeItem('user_session');
        this.updateUI();
    }
}
*/ 