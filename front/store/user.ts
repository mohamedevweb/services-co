export const useUserStore = defineStore('user', {
    state: () => ({ email: '', password: '', isLoggedIn: false }),
    getters: { 
    },
    actions: {
        async login(email: string, password: string) {

            const response = await fetch('http://localhost:3001/auth', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            })

            if (response.ok) {
                const data = await response.json();
                this.email = data.email;
                this.password = data.password;
                this.isLoggedIn = true;
            }
            else {
                throw new Error('Login failed');
            }
        },
        logout() {
            this.email = '';
            this.password = '';
            this.isLoggedIn = false;
            localStorage.removeItem('token');
        }
    },
  })