import { useUserStore } from '~~/store/user'


export default defineNuxtRouteMiddleware(async (to) => {
	const auth = useUserStore()
	const tokenRef = useCookie<string | undefined>('token')
	const token = tokenRef.value?.jwt
	const publicRoutes = ['/', '/login', '/about']

	/* 1. ROUTES PUBLIQUES ------------------------------------------------ */
	if (publicRoutes.includes(to.path)) {
		if (!auth.isAuthenticated && token) {
			try {
				console.log(token)
				await auth.verifyToken(token) // silent login
			} catch {
				/* cookie déjà nettoyé dans verifyToken */
			}
		}
		return
	}

	/* 2. ROUTES PROTÉGÉES ------------------------------------------------ */
	if (auth.isAuthenticated) return // déjà loggé
	if (!token) return navigateTo('/login') // no token → login

	try {
		await auth.verifyToken(token) // tentative de vérif
	} catch {
		return navigateTo('/login') // bad token → login
	}
})
