<template>
	<nav class="border-b border-neutral-200 dark:border-neutral-800">
		<UContainer class="flex h-14 items-center justify-between">
			<div class="flex items-center space-x-4">
				<span class="font-bold text-2xl text-neutral-800 dark:text-neutral-100">Services CO</span>
				<UButton color="neutral" variant="ghost" size="md" label="Accueil" to="/" />
				<UButton color="neutral" variant="ghost" size="md" label="À propos" to="/about" />
			</div>
			<UButton color="neutral" variant="ghost" size="md" label="View on GitHub" icon="i-simple-icons-github" to="https://github.com/mohamedevweb/services-co" target="_blank" />
		</UContainer>
	</nav>
</template>
