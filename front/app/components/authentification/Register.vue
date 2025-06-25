<script setup lang="ts">
import type {FormError, FormSubmitEvent, TabsItem} from '@nuxt/ui'
import {useUserStore} from "~~/store/user";

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

  await userStore.register(event.data.email, event.data.password)

}
</script>

<template>
  <UCard class="flex flex-col justify-center items-center">
    <h1 class="text-2xl font-bold mb-5">Inscription</h1>

    <UForm :validate="validate" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Email" name="email">
        <UInput v-model="state.email" />
      </UFormField>

      <UFormField label="Password" name="password">
        <UInput v-model="state.password" type="password" />
      </UFormField>

      <UButton type="submit">
        S'inscrire
      </UButton>
    </UForm>

  </UCard>
</template>

<style scoped>

</style>