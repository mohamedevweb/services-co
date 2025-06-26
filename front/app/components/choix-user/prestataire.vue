<script setup lang="ts">
import { useUserStore } from '~~/store/user'

import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const userStore = useUserStore()
const toast = useToast()

// Types pour les sections dynamiques
interface DynamicItem {
  description: string
}

// Schema de validation pour le prestataire
const schema = z.object({
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  job: z.string().min(2, 'Le métier doit contenir au moins 2 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  experience_time: z.number().min(0, 'L\'expérience ne peut pas être négative').max(50, 'L\'expérience ne peut pas dépasser 50 ans'),
  study_level: z.number().min(1, 'Le niveau d\'études est requis').max(10, 'Niveau d\'études invalide'),
  city: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
  tjm: z.number().min(0, 'Le TJM ne peut pas être négatif')
})

type Schema = z.output<typeof schema>

// État du formulaire
const state = reactive({
  first_name: '',
  name: '',
  job: '',
  description: '',
  experience_time: 0,
  study_level: 1,
  city: '',
  tjm: 0
})

// États pour les sections dynamiques
const skills = ref<DynamicItem[]>([{ description: '' }])
const diplomas = ref<DynamicItem[]>([{ description: '' }])
const experiences = ref<DynamicItem[]>([{ description: '' }])
const languages = ref<DynamicItem[]>([{ description: '' }])

const isLoading = ref(false)

// Fonctions pour gérer les sections dynamiques
function addItem(section: 'skills' | 'diplomas' | 'experiences' | 'languages') {
  const sectionRef = section === 'skills' ? skills : 
                    section === 'diplomas' ? diplomas :
                    section === 'experiences' ? experiences : languages
  
  sectionRef.value.push({ description: '' })
}

function removeItem(section: 'skills' | 'diplomas' | 'experiences' | 'languages', index: number) {
  const sectionRef = section === 'skills' ? skills : 
                    section === 'diplomas' ? diplomas :
                    section === 'experiences' ? experiences : languages
  
  if (sectionRef.value.length > 1) {
    sectionRef.value.splice(index, 1)
  }
}

// Options pour les niveaux d'études
const studyLevels = [
  { value: 1, label: 'CAP/BEP' },
  { value: 2, label: 'Baccalauréat' },
  { value: 3, label: 'Bac+2 (BTS/DUT)' },
  { value: 4, label: 'Bac+3 (Licence)' },
  { value: 5, label: 'Bac+5 (Master)' },
  { value: 6, label: 'Bac+8 (Doctorat)' }
]

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true
  
  try {
    const token = useCookie('token').value
    if (!token || !userStore.user) {
      throw new Error('Vous devez être connecté')
    }

    // Filtrer les éléments vides et préparer les données
    const filteredSkills = skills.value.filter(item => item.description.trim() !== '')
    const filteredDiplomas = diplomas.value.filter(item => item.description.trim() !== '')
    const filteredExperiences = experiences.value.filter(item => item.description.trim() !== '')
    const filteredLanguages = languages.value.filter(item => item.description.trim() !== '')

    const prestataireData = {
      ...event.data,
      id_users: userStore.user.id,
      skills: filteredSkills,
      diplomas: filteredDiplomas,
      experiences: filteredExperiences,
      languages: filteredLanguages
    }

    const response = await $fetch(`${userStore.apiUrl}/prestataire`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: prestataireData
    }) as any

    if (response.success) {
      // Mettre à jour le profil utilisateur
      userStore.updateUserProfile(response.data.token, 'PRESTA')

      toast.add({
        title: 'Profil créé !',
        description: 'Votre profil prestataire a été créé avec succès.',
        color: 'success'
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
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const selectJob = [{
  value: 'DEVELOPMENT',
  label: 'Développement'
}, {
  value: 'DESIGN',
  label: 'Design'
}, {
  value: 'MARKETING',
  label: 'Marketing'
}, {
  value: 'HUMAN_RESOURCES',
  label: 'Ressources Humaines'
}, {
  value: 'SALES',
  label: 'Ventes'
}]
</script>

<template>
  <UCard class="max-w-2xl mx-auto">
    <template #header>
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-user" class="w-6 h-6 text-primary" />
        <div>
          <h3 class="text-lg font-semibold">Profil Prestataire</h3>
          <p class="text-sm text-gray-500">Créez votre profil professionnel</p>
        </div>
      </div>
    </template>

    <UForm 
      :schema="schema" 
      :state="state" 
      class="space-y-6" 
      @submit="onSubmit"
    >
      <!-- Informations personnelles -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Prénom" name="first_name" required>
          <UInput 
            v-model="state.first_name" 
            placeholder="Votre prénom"
            icon="i-lucide-user"
          />
        </UFormField>

        <UFormField label="Nom" name="name" required>
          <UInput 
            v-model="state.name" 
            placeholder="Votre nom"
            icon="i-lucide-user"
          />
        </UFormField>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Métier" name="job" required>
          <USelect
            v-model="state.job"
            :items="selectJob"
            icon="i-lucide-briefcase"
            option-attribute="label"
            value-attribute="value"
          />
        </UFormField>

        <UFormField label="Ville" name="city" required>
          <UInput 
            v-model="state.city" 
            placeholder="Votre ville"
            icon="i-lucide-map-pin"
          />
        </UFormField>
      </div>

      <UFormField label="Description" name="description" required>
        <UTextarea 
          v-model="state.description" 
          placeholder="Décrivez votre profil, vos spécialités et votre approche..."
          :rows="4"
        />
      </UFormField>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UFormField label="Expérience (années)" name="experience_time" required>
          <UInput 
            v-model.number="state.experience_time" 
            type="number"
            placeholder="0"
            icon="i-lucide-calendar"
            min="0"
            max="50"
          />
        </UFormField>

        <UFormField label="Niveau d'études" name="study_level" required>
          <USelect
            v-model="state.study_level" 
            :items="studyLevels"
            option-attribute="label"
            value-attribute="value"
          />
        </UFormField>

        <UFormField label="TJM (€)" name="tjm" required>
          <UInput 
            v-model.number="state.tjm" 
            type="number"
            placeholder="0"
            icon="i-lucide-euro"
            min="0"
            step="50"
          />
        </UFormField>
      </div>

      <!-- Compétences -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium text-gray-900">Compétences</h4>
          <UButton 
            @click="addItem('skills')" 
            size="xs" 
            variant="ghost"
            icon="i-lucide-plus"
          >
            Ajouter
          </UButton>
        </div>
        <div class="space-y-2">
          <div 
            v-for="(skill, index) in skills" 
            :key="index" 
            class="flex gap-2"
          >
            <UInput 
              v-model="skill.description" 
              placeholder="Ex: Vue.js, TypeScript, PostgreSQL..."
              class="flex-1"
            />
            <UButton 
              @click="removeItem('skills', index)"
              size="xs" 
              color="error"
              variant="ghost"
              icon="i-lucide-x"
              :disabled="skills.length === 1"
            />
          </div>
        </div>
      </div>

      <!-- Diplômes -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium text-gray-900">Diplômes</h4>
          <UButton 
            @click="addItem('diplomas')" 
            size="xs" 
            variant="ghost"
            icon="i-lucide-plus"
          >
            Ajouter
          </UButton>
        </div>
        <div class="space-y-2">
          <div 
            v-for="(diploma, index) in diplomas" 
            :key="index" 
            class="flex gap-2"
          >
            <UInput 
              v-model="diploma.description" 
              placeholder="Ex: Master Informatique - Université Paris Descartes"
              class="flex-1"
            />
            <UButton 
              @click="removeItem('diplomas', index)"
              size="xs" 
              color="red" 
              variant="ghost"
              icon="i-lucide-x"
              :disabled="diplomas.length === 1"
            />
          </div>
        </div>
      </div>

      <!-- Expériences -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium text-gray-900">Expériences</h4>
          <UButton 
            @click="addItem('experiences')" 
            size="xs" 
            variant="ghost"
            icon="i-lucide-plus"
          >
            Ajouter
          </UButton>
        </div>
        <div class="space-y-2">
          <div 
            v-for="(experience, index) in experiences" 
            :key="index" 
            class="flex gap-2"
          >
            <UInput 
              v-model="experience.description" 
              placeholder="Ex: Lead Developer chez TechCorp (2020-2023)"
              class="flex-1"
            />
            <UButton 
              @click="removeItem('experiences', index)"
              size="xs" 
              color="red" 
              variant="ghost"
              icon="i-lucide-x"
              :disabled="experiences.length === 1"
            />
          </div>
        </div>
      </div>

      <!-- Langues -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium text-gray-900">Langues</h4>
          <UButton 
            @click="addItem('languages')" 
            size="xs" 
            variant="ghost"
            icon="i-lucide-plus"
          >
            Ajouter
          </UButton>
        </div>
        <div class="space-y-2">
          <div 
            v-for="(language, index) in languages" 
            :key="index" 
            class="flex gap-2"
          >
            <UInput 
              v-model="language.description" 
              placeholder="Ex: Français (natif), Anglais (courant)"
              class="flex-1"
            />
            <UButton 
              @click="removeItem('languages', index)"
              size="xs" 
              color="red" 
              variant="ghost"
              icon="i-lucide-x"
              :disabled="languages.length === 1"
            />
          </div>
        </div>
      </div>

      <UButton 
        type="submit" 
        block 
        size="lg"
        :loading="isLoading"
        :disabled="isLoading"
      >
        <UIcon name="i-lucide-check" class="w-4 h-4" />
        Créer mon profil prestataire
      </UButton>
    </UForm>
  </UCard>
</template>

<style scoped>
</style>