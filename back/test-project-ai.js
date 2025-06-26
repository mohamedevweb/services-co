const testProjectAI = async () => {
    try {
        // D'abord, récupérer les prestataires disponibles
        console.log("🔍 Récupération des prestataires disponibles...");
        const prestatairesResponse = await fetch('http://localhost:3001/project-ai/prestataires', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE', // Remplacez par un vrai token
                'Content-Type': 'application/json'
            }
        });

        if (!prestatairesResponse.ok) {
            console.error("❌ Erreur lors de la récupération des prestataires:", await prestatairesResponse.text());
            return;
        }

        const prestatairesData = await prestatairesResponse.json();
        console.log("✅ Prestataires disponibles:", prestatairesData.data.length);

        // Ensuite, créer un projet avec l'IA
        console.log("\n🚀 Création d'un projet avec l'IA...");
        const createProjectResponse = await fetch('http://localhost:3001/project-ai/create', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE', // Remplacez par un vrai token
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: "Je souhaite créer un site e-commerce qui vend des fruits et légumes bio. Le site doit avoir un système de panier, de paiement en ligne, et une gestion des stocks.",
                organizationId: 1 // Remplacez par l'ID d'une vraie organisation
            })
        });

        if (!createProjectResponse.ok) {
            console.error("❌ Erreur lors de la création du projet:", await createProjectResponse.text());
            return;
        }

        const projectData = await createProjectResponse.json();
        console.log("✅ Projet créé avec succès!");
        console.log("📊 Données du projet:", JSON.stringify(projectData, null, 2));

    } catch (error) {
        console.error("❌ Erreur lors du test:", error);
    }
};

// Instructions d'utilisation
console.log("📋 Instructions pour tester:");
console.log("1. Assurez-vous que le serveur est démarré sur le port 3001");
console.log("2. Remplacez 'YOUR_JWT_TOKEN_HERE' par un vrai token JWT d'une organisation");
console.log("3. Remplacez 'organizationId: 1' par l'ID d'une vraie organisation en base");
console.log("4. Assurez-vous qu'il y a des prestataires en base de données");
console.log("5. Exécutez: node test-project-ai.js\n");

// Décommentez la ligne suivante pour exécuter le test
// testProjectAI(); 