<template>
	<div class="min-h-screen flex flex-col">
		<section class="flex flex-col items-center justify-center text-center px-4 py-20">
			<h1 class="text-4xl sm:text-5xl font-bold mb-6 max-w-3xl leading-tight">SMP — Marketplace B2B clé en main pour vos projets</h1>
			<p class="text-lg text-gray-600 max-w-2xl mb-8">Générez, personnalisez et contractualisez vos projets métiers en quelques clics avec l'IA et nos experts.</p>
			<UButton size="xl" icon="i-heroicons-rocket-launch" class="px-8 py-4"> Démarrer mon projet </UButton>
		</section>

		<section class="flex flex-col items-center justify-center px-4 py-16">
			<h2 class="text-3xl font-bold mb-10">Nos services</h2>

			<UInput v-model="search" type="text" size="xl" placeholder="Rechercher un service..." icon="i-heroicons-magnifying-glass" class="w-full max-w-xl mb-10" />

			<div v-if="filteredCategories.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
				<div v-for="category in filteredCategories" :key="category.id" class="bg-white rounded-2xl shadow hover:shadow-xl transition cursor-pointer p-8 flex flex-col items-center text-center hover:scale-105">
					<div class="text-primary mb-4">
						<Icon :name="category.icon" class="w-12 h-12" />
					</div>
					<h3 class="text-xl font-semibold mb-2">{{ category.name }}</h3>
					<p class="text-gray-500">{{ category.description }}</p>
				</div>
			</div>

			<div v-else class="text-gray-500 text-center mt-10">
				<p>Aucun service ne correspond à votre recherche.</p>
			</div>
		</section>
	</div>
</template>

<script setup>
const search = ref('')

const categories = ref([
	{ id: 1, name: 'Développeur Web', description: 'Créez et maintenez vos sites ou apps.', icon: 'i-heroicons-code-bracket-square' },
	{ id: 2, name: 'Traduction AI', description: 'Traduisez vos documents et contenus avec l’IA.', icon: 'i-heroicons-language' },
	{ id: 3, name: 'Designer', description: 'Des visuels et UI/UX impactants.', icon: 'i-heroicons-pencil-square' },
	{ id: 4, name: 'Data Scrapping IA', description: 'Automatisez la collecte de données.', icon: 'i-heroicons-cloud-arrow-down' },
	{ id: 5, name: 'Machine Learning', description: 'Modèles intelligents et sur-mesure.', icon: 'i-heroicons-cpu-chip' },
	{ id: 6, name: 'SEO', description: 'Optimisez votre visibilité sur Google.', icon: 'i-heroicons-chart-bar' },
	{ id: 7, name: 'Rédaction de contenu', description: 'Contenus engageants et optimisés.', icon: 'i-heroicons-document-text' },
	{ id: 8, name: 'Social Media', description: 'Développez votre présence en ligne.', icon: 'i-heroicons-users' }
])

const filteredCategories = computed(() => categories.value.filter((cat) => cat.name.toLowerCase().includes(search.value.toLowerCase())))
</script>
