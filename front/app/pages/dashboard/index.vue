<script setup lang="ts">
import { useUserStore } from '~~/store/user'
const userStore = useUserStore()

// Redirection si pas authentifié
if (!userStore.isAuthenticated || !userStore.user) {
  await navigateTo('/login')
}

</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p class="text-gray-600 mt-2">
          Bienvenue {{ userStore.user?.email }}
        </p>
      </div>

      <!-- Cards selon le rôle -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Card Recruteur -->
        <UCard v-if="userStore.isRecruteur">
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-building" class="w-6 h-6 text-blue-500" />
              <h3 class="text-lg font-semibold">Organisation</h3>
            </div>
          </template>
          
          <div class="space-y-4">
            <p class="text-gray-600">
              Votre profil organisation a été créé avec succès !
            </p>
            <UButton block>
              Gérer mon organisation
            </UButton>
          </div>
        </UCard>

        <!-- Card Prestataire -->
        <UCard v-if="userStore.isPrestataire">
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-user" class="w-6 h-6 text-green-500" />
              <h3 class="text-lg font-semibold">Prestataire</h3>
            </div>
          </template>
          
          <div class="space-y-4">
            <p class="text-gray-600">
              Votre profil prestataire a été créé avec succès !
            </p>
            <UButton block>
              Voir mon profil
            </UButton>
          </div>
        </UCard>

        <!-- Card générique -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-activity" class="w-6 h-6 text-purple-500" />
              <h3 class="text-lg font-semibold">Activité</h3>
            </div>
          </template>
          
          <div class="space-y-4">
            <p class="text-gray-600">
              Aucune activité récente
            </p>
            <div class="text-sm text-gray-500">
              Rôle: {{ userStore.user?.role }}
            </div>
          </div>
        </UCard>
      </div>

      <!-- Actions rapides -->
      <div class="mt-8">
        <h2 class="text-xl font-semibold mb-4">Actions rapides</h2>
        <div class="flex flex-wrap gap-4">
          <UButton 
            v-if="userStore.isRecruteur"
            color="blue" 
            variant="outline"
          >
            <UIcon name="i-lucide-plus" class="w-4 h-4" />
            Créer une mission
          </UButton>
          
          <UButton 
            v-if="userStore.isPrestataire"
            color="green" 
            variant="outline"
          >
            <UIcon name="i-lucide-search" class="w-4 h-4" />
            Rechercher des missions
          </UButton>
          
          <UButton 
            color="gray" 
            variant="outline"
            @click="userStore.logout(); navigateTo('/login')"
          >
            <UIcon name="i-lucide-log-out" class="w-4 h-4" />
            Déconnexion
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style> 