export const useUserStore = defineStore('user', {
    state: () => ({
        email: '',
        password: '',
        apiUrl: useRuntimeConfig().public.apiUrl,
        isAuthenticated: false,
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
                this.isAuthenticated = true;
                toast.add({
                        title: 'Registration successful',
                        description: 'You have successfully registered.',
                            color: 'success',
                        }
                    )
                }
                catch(error: any) {
                    toast.add({
                        title: 'Registration failed',
                        description: error.message || 'Failed to register.',
                        color: 'error',
                    });
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

                this.email = response.email;
                this.password = response.password;
                this.isAuthenticated = true;

                // Stocker le token dans le cookie
                const token = useCookie('token')
                token.value = response.data?.token

                toast.add({
                        title: 'Login successful',
                        description: 'You have successfully logged in.',
                        color: 'success',
                    }
                )
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
                const response = await $fetch(this.apiUrl + '/auth/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }) as any

                if(response.success){
                    this.isAuthenticated = true;
                }
                else {
                    throw new Error(response.message || 'Token verification failed');
                }


            } catch(error: any) {
                toast.add({
                    title: 'Verification failed',
                    description: error.message || 'Failed to verify token.',
                    color: 'error',
                });
                this.isAuthenticated = false;
            }
        },

        logout() {
            this.email = '';
            this.password = '';
            this.isAuthenticated = false;
            
            // Nettoyer le cookie
            const token = useCookie('token');
            token.value = null;
        }
    },
  })