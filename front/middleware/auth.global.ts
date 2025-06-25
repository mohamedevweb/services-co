import {useUserStore} from "~~/store/user";

export default defineNuxtRouteMiddleware(async (to, from) => {
    const auth = useUserStore();
    
    // Routes publiques qui ne nécessitent pas d'authentification
    const publicRoutes = ['/', '/login', '/register'];
    
    // Si on est sur une route publique, on laisse passer
    if (publicRoutes.includes(to.path)) {
        return;
    }
    
    // Récupération du token depuis le cookie ou localStorage pour compatibilité
    let token = useCookie('token').value;
    if (!token && process.client) {
        token = localStorage.getItem('token');
        // Synchroniser le token dans le cookie si trouvé dans localStorage
        if (token) {
            const tokenCookie = useCookie('token');
            tokenCookie.value = token;
        }
    }
    
    // Si pas de token, redirection vers login
    if (!token) {
        return navigateTo('/login');
    }
    
    // Si l'utilisateur n'est pas authentifié, vérifier le token
    if (!auth.isAuthenticated) {
        try {
            await auth.verifyToken(token);
            // Si la vérification échoue, isAuthenticated restera false
            if (!auth.isAuthenticated) {
                // Nettoyer les tokens invalides
                if (process.client) {
                    localStorage.removeItem('token');
                }
                const tokenCookie = useCookie('token');
                tokenCookie.value = null;
                
                return navigateTo('/login');
            }
        } catch (error) {
            // En cas d'erreur de vérification, nettoyer et rediriger
            if (process.client) {
                localStorage.removeItem('token');
            }
            const tokenCookie = useCookie('token');
            tokenCookie.value = null;
            
            return navigateTo('/login');
        }
    }
});