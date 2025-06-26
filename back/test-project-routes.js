const testProjectRoutes = async () => {
    const BASE_URL = 'http://localhost:3001';
    const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Remplacez par un vrai token

    const headers = {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
    };

    try {
        console.log("🧪 Test des routes de gestion des projets\n");

        // Test 1: Récupérer un projet par ID
        console.log("1️⃣ Test récupération projet par ID...");
        const projectId = 1; // Remplacez par un vrai ID de projet
        const projectResponse = await fetch(`${BASE_URL}/project/${projectId}`, {
            method: 'GET',
            headers
        });

        if (projectResponse.ok) {
            const projectData = await projectResponse.json();
            console.log("✅ Projet récupéré:", projectData.data.project.title);
            console.log("   Paths:", projectData.data.paths.length);
        } else {
            console.log("❌ Erreur:", await projectResponse.text());
        }

        // Test 2: Récupérer tous les projets d'une organisation
        console.log("\n2️⃣ Test récupération projets par organisation...");
        const organizationId = 1; // Remplacez par un vrai ID d'organisation
        const orgProjectsResponse = await fetch(`${BASE_URL}/project/organization/${organizationId}`, {
            method: 'GET',
            headers
        });

        if (orgProjectsResponse.ok) {
            const orgProjectsData = await orgProjectsResponse.json();
            console.log("✅ Projets de l'organisation:", orgProjectsData.data.length);
        } else {
            console.log("❌ Erreur:", await orgProjectsResponse.text());
        }

        // Test 3: Récupérer tous les projets d'un prestataire
        console.log("\n3️⃣ Test récupération projets par prestataire...");
        const prestataireId = 1; // Remplacez par un vrai ID de prestataire
        const prestataireProjectsResponse = await fetch(`${BASE_URL}/project/prestataire/${prestataireId}`, {
            method: 'GET',
            headers
        });

        if (prestataireProjectsResponse.ok) {
            const prestataireProjectsData = await prestataireProjectsResponse.json();
            console.log("✅ Projets du prestataire:", prestataireProjectsData.data.length);
        } else {
            console.log("❌ Erreur:", await prestataireProjectsResponse.text());
        }

        // Test 4: Mettre à jour isChoose d'un path
        console.log("\n4️⃣ Test mise à jour isChoose d'un path...");
        const pathId = 1; // Remplacez par un vrai ID de path
        const choosePathResponse = await fetch(`${BASE_URL}/project/path/${pathId}/choose`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ isChoose: true })
        });

        if (choosePathResponse.ok) {
            const choosePathData = await choosePathResponse.json();
            console.log("✅ Path mis à jour:", choosePathData.message);
        } else {
            console.log("❌ Erreur:", await choosePathResponse.text());
        }

        // Test 5: Mettre à jour isApproved d'une tâche
        console.log("\n5️⃣ Test mise à jour isApproved d'une tâche...");
        const taskPathId = 1; // Remplacez par un vrai ID de path
        const taskPrestataireId = 1; // Remplacez par un vrai ID de prestataire
        const approveTaskResponse = await fetch(`${BASE_URL}/project/path/${taskPathId}/prestataire/${taskPrestataireId}/approve`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ isApproved: true })
        });

        if (approveTaskResponse.ok) {
            const approveTaskData = await approveTaskResponse.json();
            console.log("✅ Tâche approuvée:", approveTaskData.message);
        } else {
            console.log("❌ Erreur:", await approveTaskResponse.text());
        }

        console.log("\n🎉 Tests terminés !");

    } catch (error) {
        console.error("❌ Erreur lors des tests:", error);
    }
};

// Instructions d'utilisation
console.log("📋 Instructions pour tester les routes de projet:");
console.log("1. Assurez-vous que le serveur est démarré sur le port 3001");
console.log("2. Remplacez 'YOUR_JWT_TOKEN_HERE' par un vrai token JWT");
console.log("3. Remplacez les IDs (projectId, organizationId, prestataireId, pathId) par des vrais IDs de votre base");
console.log("4. Exécutez: node test-project-routes.js\n");

// Décommentez la ligne suivante pour exécuter les tests
// testProjectRoutes(); 