<template>
	<div class="min-h-screen flex flex-col">
		<!-- Header -->
		<header class="sticky top-0 z-10 py-4 bg-white flex items-center justify-between">
			<div class="flex items-center gap-3">
				<Icon name="i-heroicons-sparkles" class="w-7 h-7 text-primary" />
				<div>
					<p class="text-2xl font-semibold text-gray-800">Assistant IA</p>
					<p class="text-sm text-gray-500">Posez vos questions, je suis là pour vous aider</p>
				</div>
			</div>
			<UButton variant="ghost" icon="i-heroicons-trash" :disabled="messages.length <= 1" @click="clearMessages"> Effacer </UButton>
		</header>

		<!-- Zone Messages -->
		<div ref="chatContainer" class="flex-1 overflow-y-auto p-6 space-y-6">
			<div v-for="(msg, index) in messages" :key="index" class="flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
				<div class="flex items-end gap-3 max-w-[85%]" :class="msg.role === 'user' ? 'flex-row-reverse self-end mr-2' : 'flex-row self-start'">
					<!-- Message -->
					<div :class="msg.role === 'user' ? ' ' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md mr-2'" class="px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed break-words whitespace-pre-wrap" style="margin-top: 4px; margin-bottom: 2px">
						{{ msg.content }}
					</div>
				</div>
			</div>

			<!-- Indicateur de frappe -->
			<div v-if="isTyping" class="flex justify-start">
				<div class="flex items-start gap-3 max-w-[85%]">
					<div class="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
						<div class="flex items-center gap-1">
							<span class="text-xs text-gray-500 ml-2">L'IA réfléchit...</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Input Sticky -->
		<div class="sticky bottom-0 bg-white border-gray-200 py-4">
			<div v-if="error" class="mb-3">
				<UAlert icon="i-heroicons-exclamation-triangle" color="red" variant="soft" :title="error" :close-button="{ icon: 'i-heroicons-x-mark', color: 'gray', variant: 'link' }" @close="error = ''" />
			</div>

			<div class="flex items-end gap-3">
				<div class="flex-1">
					<UTextarea v-model="prompt" placeholder="Écrivez votre message... (Ctrl+Entrée pour envoyer)" :rows="2" :maxrows="6" resize class="w-full" @keydown="handleKeydown" />
				</div>
				<UButton :disabled="loading || !prompt.trim()" :loading="loading" icon="i-heroicons-paper-airplane" size="lg" class="mb-1" @click="sendMessage"> Envoyer </UButton>
			</div>

			<div class="flex items-center justify-between mt-2">
				<p class="text-xs text-gray-500">Appuyez sur <kbd class="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl</kbd> + <kbd class="px-1 py-0.5 bg-gray-100 rounded text-xs">Entrée</kbd> pour envoyer</p>
				<p class="text-xs text-gray-400">{{ prompt.length }}/2000 caractères</p>
			</div>
		</div>
	</div>
</template>

<script setup>
const prompt = ref('')
const loading = ref(false)
const isTyping = ref(false)
const error = ref('')

const messages = ref([
	{
		role: 'assistant',
		content: 'Bonjour 👋 Je suis votre assistant IA. Posez-moi vos questions ! Je peux vous aider avec de nombreux sujets.'
	}
])

const chatContainer = ref(null)

const scrollToBottom = () => {
	nextTick(() => {
		if (chatContainer.value) {
			chatContainer.value.scrollTop = chatContainer.value.scrollHeight
		}
	})
}

const clearMessages = () => {
	messages.value = [
		{
			role: 'assistant',
			content: 'Conversation effacée. Posez-moi une nouvelle question !'
		}
	]
}

const handleKeydown = (event) => {
	// Ctrl+Enter pour envoyer
	if (event.ctrlKey && event.key === 'Enter') {
		event.preventDefault()
		sendMessage()
		return
	}

	// Limiter à 2000 caractères
	if (prompt.value.length >= 2000 && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
		event.preventDefault()
	}
}

const sendMessage = async () => {
	if (!prompt.value.trim() || loading.value) return

	// Effacer les erreurs précédentes
	error.value = ''

	// Ajouter le message utilisateur
	messages.value.push({ role: 'user', content: prompt.value.trim() })
	const userPrompt = prompt.value.trim()
	prompt.value = ''

	scrollToBottom()

	try {
		loading.value = true
		isTyping.value = true

		// Simuler un délai de traitement plus réaliste
		await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

		// Simulation de différents types de réponses selon le contenu
		let aiResponse = ''
		const userMessage = userPrompt.toLowerCase()

		if (userMessage.includes('bonjour') || userMessage.includes('salut')) {
			aiResponse = `Bonjour ! 👋 Comment puis-je vous aider aujourd'hui ?`
		} else if (userMessage.includes('code') || userMessage.includes('programmation')) {
			aiResponse = `Je peux vous aider avec la programmation ! Voici quelques suggestions :\n\n• Expliquer des concepts\n• Déboguer du code\n• Proposer des solutions\n• Recommander des bonnes pratiques\n\nQuel langage ou problème vous intéresse ?`
		} else if (userMessage.includes('erreur') || userMessage.includes('bug')) {
			aiResponse = `Je vais vous aider à résoudre ce problème ! 🔧\n\nPour mieux vous assister, pourriez-vous me donner :\n• Le message d'erreur exact\n• Le code qui pose problème\n• Le contexte d'utilisation\n\nAinsi je pourrai vous proposer une solution adaptée.`
		} else if (userMessage.includes('merci')) {
			aiResponse = `Je vous en prie ! 😊 N'hésitez pas si vous avez d'autres questions.`
		} else {
			aiResponse = `Merci pour votre question : "${userPrompt}"\n\nVoici ma réponse détaillée :\n\nJe comprends votre demande et voici quelques éléments de réponse. En tant qu'assistant IA, je peux vous aider sur de nombreux sujets comme la programmation, l'explication de concepts, la résolution de problèmes, etc.\n\nAvez-vous besoin de précisions sur un point particulier ?`
		}

		messages.value.push({
			role: 'assistant',
			content: aiResponse
		})
	} catch (err) {
		error.value = "Une erreur est survenue lors de la communication avec l'IA. Veuillez réessayer."
		console.error('Erreur:', err)
	} finally {
		loading.value = false
		isTyping.value = false
		scrollToBottom()
	}
}

// Auto-scroll quand de nouveaux messages arrivent
watch(
	messages,
	() => {
		scrollToBottom()
	},
	{ deep: true }
)
</script>
