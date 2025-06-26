<script setup lang="ts">

import {useUserStore} from "~~/store/user";

const auth = useUserStore()

// Fonction pour gérer le logout
const handleLogout = async () => {
  auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <nav class="border-b border-neutral-200 dark:border-neutral-800">
    <UContainer class="flex h-14 items-center justify-between">
      <div class="flex items-center space-x-4">
        <span class="font-bold text-2xl text-neutral-800 dark:text-neutral-100">Services CO</span>
        <UButton color="neutral" variant="ghost" size="sm" label="Accueil" to="/" />
        <UButton color="neutral" variant="ghost" size="sm" label="À propos" to="/about" />
        <UButton color="neutral" variant="ghost" size="sm" label="Prompt" to="/prompt" />
      </div>


      <UButton v-if="!auth.isAuthenticated" color="neutral" class="bg-blue-500 text-white" variant="ghost" size="md" label="Login" to="/login" />
      <UButton v-else color="neutral" class="bg-blue-500 text-white" variant="ghost" size="md" label="Logout" @click="handleLogout" />
    </UContainer>

  </nav>
</template>
