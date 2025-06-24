<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Profil Utilisateur</h1>
      
      <UCard>
        <template #header>
          <div class="flex items-center gap-4">
            <UAvatar 
              src="https://avatars.githubusercontent.com/u/739984?v=4" 
              alt="Sarah Miller"
              size="lg"
            />
            <div>
              <h3 class="font-semibold text-lg text-gray-900">Sarah Miller</h3>
              <p class="text-sm text-gray-500">@sarahmiller</p>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-500 mb-1">Email</p>
            <p class="text-gray-900">sarah.miller@arises.com</p>
          </div>
          
          <div>
            <p class="text-sm text-gray-500 mb-1">Rôle</p>
            <p class="text-gray-900">Senior Frontend Developer</p>
          </div>
          
          <div>
            <p class="text-sm text-gray-500 mb-1">Département</p>
            <p class="text-gray-900">Engineering</p>
          </div>
          
          <div>
            <p class="text-sm text-gray-500 mb-1">Localisation</p>
            <p class="text-gray-900">Paris, France</p>
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UBadge color="green" variant="soft">
                <UIcon name="i-lucide-circle" class="w-2 h-2 mr-1" />
                En ligne
              </UBadge>
              <UBadge color="blue" variant="soft">Pro</UBadge>
            </div>
            
            <div class="flex gap-2">
              <UButton size="sm" variant="ghost">
                <UIcon name="i-lucide-message-circle" />
              </UButton>
              <UButton size="sm" variant="soft">
                Voir profil
              </UButton>
            </div>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
