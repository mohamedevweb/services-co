<script setup lang="ts">
import type {TabsItem} from "@nuxt/ui";
import Register from "~/components/authentification/Register.vue";
import Prestataire from "~/components/choix-user/prestataire.vue";
import Recruteur from "~/components/choix-user/recruteur.vue";

const items = [
  {
    label: 'Recruteur',
    icon: 'i-lucide-building',
    slot: 'recruteur' as const
  },
  {
    label: 'Prestataires',
    icon: 'i-lucide-user',
    slot: 'prestataire' as const
  }
] satisfies TabsItem[]
</script>

<template>

  <div class="mt-10">
    <p class="text-muted mb-4">
      Sélectionnez votre rôle pour continuer.
    </p>
  </div>

  <UTabs :items="items" variant="link" class="mt-10 gap-4 w-full" :ui="{ trigger: 'grow' }">
    <template #recruteur="{ item }">
      <Recruteur />
    </template>

    <template #prestataire="{ item }">
      <Prestataire />
    </template>
  </UTabs>

</template>

<style scoped>

</style>