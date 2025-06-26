<script setup lang="ts">
import type {FormError, FormSubmitEvent, TabsItem} from '@nuxt/ui'
import {useUserStore} from "~~/store/user";
import Register from "~/components/authentification/Register.vue";

const state = reactive({
  email: undefined,
  password: undefined
})

const userStore = useUserStore()

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.email) errors.push({ name: 'email', message: 'Required' })
  if (!state.password) errors.push({ name: 'password', message: 'Required' })
  return errors
}

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<typeof state>) {

  if(!event.data.email || !event.data.password) {
    toast.add({ title: 'Error', description: 'Please fill in all fields.', color: 'error' })
    return
  }

  await userStore.login(event.data.email, event.data.password)
}

const items = [
  {
    label: 'Connexion',
    description: 'Connexion sur le site. Si vous n\'avez pas de compte, vous pouvez en créer un dans la section "Inscription".',
    icon: 'i-lucide-user',
    slot: 'account' as const
  },
  {
    label: 'Inscription',
    description: 'Inscription sur le site. Si vous avez déjà un compte, vous pouvez vous connecter dans la section "Connexion".',
    icon: 'i-lucide-lock',
    slot: 'register' as const
  }
] satisfies TabsItem[]

</script>

<template>

  <UTabs :items="items" variant="link" class="mt-10 gap-4 w-full" :ui="{ trigger: 'grow' }">
    <template #account="{ item }">
      <p class="text-muted mb-4">
        {{ item.description }}
      </p>

        <UCard class="flex flex-col justify-center">
          <h1 class="text-2xl font-bold mb-5">Login</h1>

          <UForm :validate="validate" :state="state" class="space-y-4" @submit="onSubmit">
            <UFormField label="Email" name="email">
              <UInput class="w-full" v-model="state.email" />
            </UFormField>

            <UFormField label="Password" name="password">
              <UInput class="w-full" v-model="state.password" type="password" />
            </UFormField>

            <UButton type="submit">
              Connexion
            </UButton>
          </UForm>

        </UCard>
    </template>

    <template #register="{ item }">
      <p class="text-muted mb-4">
        {{ item.description }}
      </p>

      <Register />
    </template>
  </UTabs>

</template>

