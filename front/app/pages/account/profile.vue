<template>
	<div class="container mx-auto py-8">
		<UCard class="mb-6">
			<div class="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
				<div class="relative">
					<UAvatar :src="user.avatar" :alt="`${user.firstName} ${user.lastName}`" size="xl" class="w-32 h-32" />
				</div>

				<div class="flex-1 text-center md:text-left">
					<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ user.firstName }} {{ user.lastName }}</h1>
					<p class="text-lg text-gray-600 dark:text-gray-300 mb-2">{{ user.position }} chez {{ user.company }}</p>
					<div class="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
						<div class="flex items-center gap-1">
							<UIcon name="i-lucide-map-pin" />
							{{ user.location }}
						</div>
						<div class="flex items-center gap-1">
							<UIcon name="i-lucide-globe" />
							<ULink :to="user.website" target="_blank" class="hover:text-primary">
								{{ user.website }}
							</ULink>
						</div>
						<div class="flex items-center gap-1">
							<UIcon name="i-lucide-calendar" />
							Membre depuis {{ new Date(user.joinDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) }}
						</div>
					</div>
					<p class="text-gray-700 dark:text-gray-300 mb-4">
						{{ user.bio }}
					</p>

					<div class="flex justify-center md:justify-start gap-6 mb-4">
						<div v-for="stat in stats" :key="stat.label" class="text-center">
							<div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stat.value }}</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">{{ stat.label }}</div>
						</div>
					</div>
				</div>

				<UButton icon="i-lucide-edit" label="Éditer le profil" @click="editProfile" />
			</div>
		</UCard>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div class="lg:col-span-1">
				<UCard>
					<template #header>
						<h2 class="text-xl font-semibold">Informations de contact</h2>
					</template>

					<div class="space-y-4">
						<div class="flex items-center gap-3">
							<UIcon name="i-lucide-mail" class="w-5 h-5 text-gray-500" />
							<div>
								<p class="text-sm text-gray-500 dark:text-gray-400">Email</p>
								<p class="font-medium">{{ user.email }}</p>
							</div>
						</div>

						<div class="flex items-center gap-3">
							<UIcon name="i-lucide-phone" class="w-5 h-5 text-gray-500" />
							<div>
								<p class="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
								<p class="font-medium">{{ user.phone }}</p>
							</div>
						</div>

						<div class="flex items-center gap-3">
							<UIcon name="i-lucide-building" class="w-5 h-5 text-gray-500" />
							<div>
								<p class="text-sm text-gray-500 dark:text-gray-400">Entreprise</p>
								<p class="font-medium">{{ user.company }}</p>
							</div>
						</div>
					</div>
				</UCard>

				<UCard class="mt-6">
					<template #header>
						<h2 class="text-xl font-semibold">Compétences</h2>
					</template>

					<div class="flex flex-wrap gap-2">
						<UBadge v-for="skill in skills" :key="skill" :label="skill" variant="soft" color="primary" />
					</div>
				</UCard>
			</div>

			<div class="lg:col-span-2">
				<UCard>
					<template #header>
						<h2 class="text-xl font-semibold">Activité récente</h2>
					</template>

					<div class="space-y-4">
						<div class="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
							<UIcon name="i-lucide-git-commit" class="w-5 h-5 text-green-500 mt-0.5" />
							<div>
								<p class="font-medium">Nouveau commit sur le projet E-commerce</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">Il y a 2 heures</p>
							</div>
						</div>

						<div class="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
							<UIcon name="i-lucide-message-circle" class="w-5 h-5 text-blue-500 mt-0.5" />
							<div>
								<p class="font-medium">Nouveau commentaire sur l'API Documentation</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">Il y a 1 jour</p>
							</div>
						</div>

						<div class="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
							<UIcon name="i-lucide-star" class="w-5 h-5 text-yellow-500 mt-0.5" />
							<div>
								<p class="font-medium">Projet Vue.js Component Library étoilé</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">Il y a 3 jours</p>
							</div>
						</div>

						<div class="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
							<UIcon name="i-lucide-users" class="w-5 h-5 text-purple-500 mt-0.5" />
							<div>
								<p class="font-medium">Rejoint l'équipe Frontend Development</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">Il y a 1 semaine</p>
							</div>
						</div>
					</div>
				</UCard>

				<UCard class="mt-6">
					<template #header>
						<h2 class="text-xl font-semibold">Projets récents</h2>
					</template>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="p-4 border rounded-lg border-gray-200 dark:border-gray-700">
							<h3 class="font-semibold mb-2">E-commerce Platform</h3>
							<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Application de e-commerce moderne avec Vue.js et Node.js</p>
							<div class="flex gap-2 mb-3">
								<UBadge label="Vue.js" size="xs" />
								<UBadge label="TypeScript" size="xs" />
								<UBadge label="Node.js" size="xs" />
							</div>
							<UButton size="xs" variant="outline">Voir le projet</UButton>
						</div>

						<div class="p-4 border rounded-lg border-gray-200 dark:border-gray-700">
							<h3 class="font-semibold mb-2">Task Management App</h3>
							<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Application de gestion de tâches collaborative</p>
							<div class="flex gap-2 mb-3">
								<UBadge label="Nuxt.js" size="xs" />
								<UBadge label="Supabase" size="xs" />
								<UBadge label="Tailwind" size="xs" />
							</div>
							<UButton size="xs" variant="outline">Voir le projet</UButton>
						</div>
					</div>
				</UCard>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
const user = ref({
	id: 1,
	firstName: 'Mateo',
	lastName: 'Ca',
	email: 'mate@example.com',
	phone: '+33 6 12 34 56 78',
	avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
	bio: "Développeuse full-stack passionnée par les nouvelles technologies et l'innovation. J'aime créer des solutions élégantes et efficaces.",
	location: 'Paris, France',
	website: 'https://mateocarciu.github.io',
	company: 'Tech Solutions',
	position: 'Senior Developer',
	joinDate: '2022-03-15'
})

const stats = ref([
	{ label: 'Projets', value: '24' },
	{ label: 'Followers', value: '1.2k' },
	{ label: 'Following', value: '387' }
])

const skills = ref(['Vue.js', 'Nuxt.js', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS'])

const editProfile = () => {
	console.log('Édition du profil')
}
</script>
