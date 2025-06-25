export const useUserStore = defineStore('user', {
    state: () => ({
        email: '',
        password: '',
        isLoggedIn: false,
        apiUrl: useRuntimeConfig().public.apiUrl,
    }),

    getters: { 
    },

    actions: {
        async register(email: string, password: string) {
            const toast = useToast()
            try {
                const data = await $fetch(this.apiUrl + '/auth/register', {
                    method: 'POST',
                    body: {
                        email: email,
                        password: password
                    }
                }) as any

                this.email = data.email;
                this.password = data.password;
                this.isLoggedIn = true;
                toast.add({
                        title: 'Registration successful',
                        description: 'You have successfully registered.',
                            color: 'success',
                        }
                    )
                }

                catch(error: any) {
                    throw new Error('Registration failed');
                }
        },

        async login(email: string, password: string) {
            const toast = useToast()
            try {
                const response = await $fetch(this.apiUrl + '/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body : {
                        email: email,
                        password: password
                    }
                }) as any

                if (response.ok) {
                    const data = await response.json();
                    this.email = data.email;
                    this.password = data.password;
                    this.isLoggedIn = true;
                    localStorage.setItem('token', data.token);
                    toast.add({
                            title: 'Login successful',
                            description: 'You have successfully login.',
                            color: 'success',
                        }
                    )
                }
            }
        catch(error: any)
            {
                toast.add({
                    title: 'Login failed',
                    description: error.message || 'Failed to login.',
                    color: 'error',
                });
            }
        },

        async verifyToken(token: string) {
            const toast = useToast()

            try {

            const response = await $fetch(this.apiUrl + '/auth//verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: token
            }) as any

            this.email = response.email;
            this.isLoggedIn = true;

            } catch(error: any) {
                toast.add({
                    title: 'Verification failed',
                    description: error.message || 'Failed to verify token.',
                    color: 'error',
                });
                this.isLoggedIn = false;
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