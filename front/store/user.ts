import { jwtDecode } from 'jwt-decode'

export const useUserStore = defineStore('user', {
	state: () => ({
		email: '',
		password: '',
		apiUrl: useRuntimeConfig().public.apiUrl,
		isAuthenticated: false
	}),

	getters: {},

	actions: {
		async register(email: string, password: string) {
			const toast = useToast()
			try {
				const data = (await $fetch(this.apiUrl + '/auth/register', {
					method: 'POST',
					body: {
						email: email,
						password: password
					}
				})) as any

				this.email = data.email
				this.password = data.password
				this.isAuthenticated = true
				toast.add({
					title: 'Registration successful',
					description: 'You have successfully registered.',
					color: 'success'
				})
			} catch (error: any) {
				toast.add({
					title: 'Registration failed',
					description: error.message || 'Failed to register.',
					color: 'error'
				})
				throw new Error('Registration failed')
			}
		},

		async login(email: string, password: string) {
			const toast = useToast()
			try {
				const response = (await $fetch(this.apiUrl + '/auth/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: {
						email: email,
						password: password
					}
				})) as any

				if (response.success) {
					this.email = response.email
					this.password = response.password
					this.isAuthenticated = true

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
						color: 'success'
					})
				} else {
					throw new Error(response.message || 'Login failed')
				}
			} catch (error: any) {
				toast.add({
					title: 'Login failed',
					description: error.message || 'Failed to login.',
					color: 'error'
				})
			}
		},

		async verifyToken(token: string) {
			const toast = useToast()

			try {
				const response = (await $fetch(this.apiUrl + '/auth/verify', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: {
						token: token
					}
				})) as any

				if (response.success) {
					this.isAuthenticated = true
				} else {
					// Nettoyer le cookie en cas d'erreur
					const tokenCookie = useCookie('token')
					tokenCookie.value = null
					this.isAuthenticated = false
					throw new Error(response.message || 'Token verification failed')
				}
			} catch (error: any) {
				toast.add({
					title: 'Verification failed',
					description: error.message || 'Failed to verify token.',
					color: 'error'
				})
				const tokenCookie = useCookie('token')
				tokenCookie.value = null
				this.isAuthenticated = false
			}
		},

		logout() {
			this.email = ''
			this.password = ''
			this.isAuthenticated = false

			// Nettoyer le cookie
			const token = useCookie('token')
			token.value = null
		}
	}
})
