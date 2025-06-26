<script setup lang="ts">
import { useUserStore } from '~~/store/user'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const userStore = useUserStore()
const toast = useToast()

// Schema de validation pour l'organisation
const schema = z.object({
  name: z.string().min(2, 'Le nom de l\'entreprise doit contenir au moins 2 caractères'),
  adresse: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  tel: z.string().min(10, 'Le numéro de téléphone doit contenir au moins 10 caractères'),
  solde: z.number().min(0, 'Le solde ne peut pas être négatif').default(0)
})

type Schema = z.output<typeof schema>

// État du formulaire
const state = reactive({
  name: '',
  adresse: '',
  tel: '',
  solde: 0
})

const isLoading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true
  
  try {
    const token = useCookie('token').value
    if (!token || !userStore.user) {
      throw new Error('Vous devez être connecté')
    }

    const response = await $fetch(`${userStore.apiUrl}/organization`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: event.data
    }) as any

    if (response.success) {
      // Mettre à jour le profil utilisateur
      userStore.updateUserProfile(response.data.token, 'ORG')

      toast.add({
        title: 'Profil créé !',
        description: 'Votre profil recruteur a été créé avec succès.',
        color: 'green'
      })

      // Redirection vers le dashboard
      setTimeout(() => {
        navigateTo('/dashboard')
      }, 1500)
    }
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error.data?.message || 'Une erreur est survenue lors de la création du profil.',
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UCard class="max-w-md mx-auto">
    <template #header>
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-building" class="w-6 h-6 text-primary" />
        <div>
          <h3 class="text-lg font-semibold">Profil Recruteur</h3>
          <p class="text-sm text-gray-500">Créez votre profil d'organisation</p>
        </div>
      </div>
    </template>

    <UForm 
      :schema="schema" 
      :state="state" 
      class="space-y-4" 
      @submit="onSubmit"
    >
      <UFormField 
        label="Nom de l'entreprise" 
        name="name" 
        required
      >
        <UInput 
          v-model="state.name" 
          placeholder="Ex: TechCorp Solutions"
          icon="i-lucide-building"
        />
      </UFormField>

      <UFormField 
        label="Adresse" 
        name="adresse" 
        required
      >
        <UTextarea 
          v-model="state.adresse" 
          placeholder="Adresse complète de votre entreprise"
          :rows="3"
        />
      </UFormField>

      <UFormField 
        label="Téléphone" 
        name="tel" 
        required
      >
        <UInput 
          v-model="state.tel" 
          placeholder="Ex: 01 23 45 67 89"
          icon="i-lucide-phone"
        />
      </UFormField>

      <UFormField 
        label="Solde initial (€)" 
        name="solde"
        hint="Montant disponible pour vos recrutements"
      >
        <UInput 
          v-model.number="state.solde" 
          type="number"
          placeholder="0"
          icon="i-lucide-euro"
          min="0"
          step="100"
        />
      </UFormField>

      <UButton 
        type="submit" 
        block 
        size="lg"
        :loading="isLoading"
        :disabled="isLoading"
      >
        <UIcon name="i-lucide-check" class="w-4 h-4" />
        Créer mon profil recruteur
      </UButton>
    </UForm>
  </UCard>
</template>

<style scoped>
</style>