import { jwtDecode } from 'jwt-decode'

interface User {
    id: number;
    email: string;
    role: string;
    token?: string;
}

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null as User | null,
        apiUrl: useRuntimeConfig().public.apiUrl,
        isAuthenticated: false,
    }),

    getters: {
        isRecruteur: (state) => state.user?.role === 'ORG',
        isPrestataire: (state) => state.user?.role === 'PRESTA',
        hasRole: (state) => state.user?.role && state.user.role !== 'USER'
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

                this.user = data.data;
                this.isAuthenticated = true;
                toast.add({
                        title: 'Registration successful',
                        description: 'You have successfully registered.',
                        color: 'success',
                    }
                )
            } catch (error: any) {
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
                    body: {
                        email: email,
                        password: password
                    }
                }) as any

                if (response.success) {
                    this.user = response.data;
                    this.isAuthenticated = true;

					// Stocker le token JWT et ses infos décodées dans le cookie
					const token = useCookie('token', {
						secure: false,
						path: '/',
						sameSite: 'lax',
						maxAge: 60 * 60 * 24 * 365
					})

					const jwt = response.data?.token
					let decoded = null
					try {
						decoded = jwt ? jwtDecode(jwt) : null
					} catch (e) {
						decoded = null
					}

					token.value = {
						jwt,
						decoded
					}

                    toast.add({
                            title: 'Login successful',
                            description: 'You have successfully logged in.',
                            color: 'success',
                        }
                    )

                    if(this.user?.role == 'USER'){
                        setTimeout(() => {
                            navigateTo('/choix-user')
                        }, 1000)
                    }
                    else {
                        setTimeout(() => {
                            navigateTo('/')
                        }, 1000)
                    }
                } else {
                    throw new Error(response.message || 'Login failed');
                }
            } catch (error: any) {
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
                    },
                    body: {
                        token: token
                    }
                }) as any

                if (response.success) {
                    this.user = response.data;
                    this.isAuthenticated = true;
                } else {
                    // Nettoyer le cookie en cas d'erreur
                    const tokenCookie = useCookie('token');
                    tokenCookie.value = null;
                    this.isAuthenticated = false;
                    this.user = null;
                    throw new Error(response.message || 'Token verification failed');
                }

            } catch (error: any) {
                toast.add({
                    title: 'Verification failed',
                    description: error.message || 'Failed to verify token.',
                    color: 'error',
                });
                const tokenCookie = useCookie('token');
                tokenCookie.value = null;
                this.isAuthenticated = false;
            }
        },

        logout() {
            this.user = null;
            this.isAuthenticated = false;

            // Nettoyer le cookie
            const token = useCookie('token');
            token.value = null;
        },

        updateUserProfile(newToken: string, newRole: string) {
            if (this.user) {
                this.user.role = newRole;
                this.user.token = newToken;

                // Mettre à jour le cookie
                const tokenCookie = useCookie('token', {
                    secure: false,
                    path: '/',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 365
                });
                tokenCookie.value = newToken;
            }
        }
    }
})