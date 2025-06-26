<template>
	<div class="container mx-auto py-8">
		<!-- Si PRESTA -->
		<div v-if="role === 'PRESTA'">
			<UCard class="mb-6">
				<div class="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
					<div class="relative">
						<UAvatar :src="avatarUrl" :alt="`${prestataire?.firstName} ${prestataire?.name}`" size="xl" class="w-32 h-32" />
					</div>
					<div class="flex-1 text-center md:text-left">
						<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ prestataire?.firstName }} {{ prestataire?.name }}</h1>
						<p class="text-lg text-gray-600 dark:text-gray-300 mb-2">{{ prestataire?.job }} à {{ prestataire?.city }}</p>
						<div class="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
							<div class="flex items-center gap-1">
								<UIcon name="i-lucide-map-pin" />
								{{ prestataire?.city }}
							</div>
							<div class="flex items-center gap-1">
								<UIcon name="i-lucide-calendar" />
								Expérience : {{ prestataire?.experienceTime }} ans
							</div>
							<div class="flex items-center gap-1">
								<UIcon name="i-lucide-graduation-cap" />
								Niveau d'étude : {{ prestataire?.studyLevel }}
							</div>
						</div>
						<p class="text-gray-700 dark:text-gray-300 mb-4">
							{{ prestataire?.description }}
						</p>
						<div class="flex justify-center md:justify-start gap-6 mb-4">
							<div class="text-center">
								<div class="text-2xl font-bold text-gray-900 dark:text-white">{{ prestataire?.tjm }}€</div>
								<div class="text-sm text-gray-500 dark:text-gray-400">TJM</div>
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
									<p class="font-medium">{{ user?.email }}</p>
								</div>
							</div>
							<div class="flex items-center gap-3">
								<UIcon name="i-lucide-user" class="w-5 h-5 text-gray-500" />
								<div>
									<p class="text-sm text-gray-500 dark:text-gray-400">Rôle</p>
									<p class="font-medium">{{ user?.role }}</p>
								</div>
							</div>
							<div class="flex items-center gap-3" v-if="user?.siret">
								<UIcon name="i-lucide-building" class="w-5 h-5 text-gray-500" />
								<div>
									<p class="text-sm text-gray-500 dark:text-gray-400">SIRET</p>
									<p class="font-medium">{{ user?.siret }}</p>
								</div>
							</div>
						</div>
					</UCard>
				</div>

				<div class="lg:col-span-2">
					<UCard>
						<template #header>
							<h2 class="text-xl font-semibold">Informations Prestataire</h2>
						</template>
						<div v-if="prestataire">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<p class="text-sm text-gray-600 dark:text-gray-400">Nom</p>
									<p class="font-medium">{{ prestataire.firstName }} {{ prestataire.name }}</p>
								</div>
								<div>
									<p class="text-sm text-gray-600 dark:text-gray-400">Métier</p>
									<p class="font-medium">{{ prestataire.job }}</p>
								</div>
								<div>
									<p class="text-sm text-gray-600 dark:text-gray-400">Ville</p>
									<p class="font-medium">{{ prestataire.city }}</p>
								</div>
								<div>
									<p class="text-sm text-gray-600 dark:text-gray-400">TJM</p>
									<p class="font-medium">{{ prestataire.tjm }}€</p>
								</div>
								<div>
									<p class="text-sm text-gray-600 dark:text-gray-400">Expérience</p>
									<p class="font-medium">{{ prestataire.experienceTime }} ans</p>
								</div>
								<div>
									<p class="text-sm text-gray-600 dark:text-gray-400">Niveau d'étude</p>
									<p class="font-medium">{{ prestataire.studyLevel }}</p>
								</div>
								<div class="md:col-span-2">
									<p class="text-sm text-gray-600 dark:text-gray-400">Description</p>
									<p class="font-medium">{{ prestataire.description }}</p>
								</div>
							</div>
						</div>
						<div v-else>
							<UAlert icon="i-lucide-info" title="Aucun profil prestataire" description="Vous n'avez pas encore créé de profil prestataire." color="blue" />
						</div>
					</UCard>
				</div>
			</div>
		</div>

		<!-- Si ORG -->
		<div v-if="role === 'ORG'">
			<UCard>
				<template #header>
					<h2 class="text-2xl font-bold">Informations Organisation</h2>
				</template>
				<div class="space-y-4">
					<div>
						<p class="text-sm text-gray-500">Nom</p>
						<p class="font-medium">{{ organization?.name }}</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">Adresse</p>
						<p class="font-medium">{{ organization?.adresse }}</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">Téléphone</p>
						<p class="font-medium">{{ organization?.tel }}</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">Solde</p>
						<p class="font-medium">{{ organization?.solde }} €</p>
					</div>
				</div>
			</UCard>
		</div>
	</div>
</template>

<script setup lang="ts">
const tokenRef = useCookie<{ jwt: string; decoded: { role: string } } | undefined>('token')
const url = useRuntimeConfig().public.apiUrl
const role = tokenRef.value?.decoded.role

const avatarUrl = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80'

const prestataireData = ref<any>(null)
const organizationData = ref<any>(null)

if (role === 'PRESTA') {
	const { data } = await useFetch(`${url}/prestataire/me`, {
		headers: { Authorization: `Bearer ${tokenRef.value?.jwt}` }
	})
	prestataireData.value = data.value?.data
}

if (role === 'ORG') {
	const { data } = await useFetch(`${url}/organization/me`, {
		headers: { Authorization: `Bearer ${tokenRef.value?.jwt}` }
	})
	organizationData.value = data.value?.data
}

const prestataire = computed(() => prestataireData.value?.prestataire)
const user = computed(() => prestataireData.value?.users)
const organization = computed(() => organizationData.value)

const editProfile = () => {
	console.log('Édition du profil')
}
</script>
