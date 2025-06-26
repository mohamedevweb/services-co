import {useUserStore} from "~~/store/user";

export default defineNuxtRouteMiddleware(async (to, from) => {
    return;
    console.log('🛡️ Middleware executed for:', to.path);
    
    const auth = useUserStore();
    
    // Routes publiques qui ne nécessitent pas d'authentification
    const publicRoutes = ['/', '/login','/about'];
    
    // Si on est sur une route publique, on laisse passer
    if (publicRoutes.includes(to.path)) {
        console.log('✅ Route publique, accès autorisé:', to.path);
        return;
    }

    if(auth.isAuthenticated){
        return;
    }

    // Récupération du token depuis le cookie uniquement (compatible SSR)
    const token = useCookie('token').value;
    console.log('🎫 Token trouvé:', !!token);
    console.log('👤 Utilisateur authentifié:', auth.isAuthenticated);

    // Si pas de token, redirection vers login
    if (!token) {
        return navigateTo('/login');
    }
    

    // Si l'utilisateur n'est pas authentifié, vérifier le token
    if (!auth.isAuthenticated) {
        console.log('🔍 Vérification du token...');
        try {
            await auth.verifyToken(token);
            // Si la vérification échoue, isAuthenticated restera false
            if (!auth.isAuthenticated) {
                console.log('❌ Token invalide, nettoyage et redirection');
                // Nettoyer le cookie invalide
                const tokenCookie = useCookie('token');
                tokenCookie.value = null;
                
                return navigateTo('/login');
            }
            console.log('✅ Token valide, accès autorisé');
        } catch (error) {
            console.log('❌ Erreur lors de la vérification:', error);
            // Nettoyer le cookie en cas d'erreur
            const tokenCookie = useCookie('token');
            tokenCookie.value = null;
            
            return navigateTo('/login');
        }
    } else {
        console.log('✅ Utilisateur déjà authentifié, accès autorisé');
    }
});