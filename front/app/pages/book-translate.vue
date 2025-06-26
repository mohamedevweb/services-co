<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-4">Traduction de Livres PDF</h1>

    <div class="mb-4">
      <label class="block mb-2 font-semibold">Importer votre PDF :</label>
      <input
          type="file"
          accept="application/pdf"
          @change="onFileChange"
          :disabled="loading"
          class="border rounded px-3 py-2 w-full"
      />
      <div v-if="pdfInfo" class="mt-2 text-sm text-green-600">
        {{ pdfInfo.numPages }} page(s) détectée(s)
      </div>
    </div>

    <div class="mb-4">
      <label class="block mb-2 font-semibold">Choisir la langue :</label>
      <select v-model="selectedLang" class="border rounded px-3 py-2 w-full">
        <option disabled value="">Sélectionner une langue</option>
        <option v-for="lang in languages" :key="lang.value" :value="lang.value">
          {{ lang.label }}
        </option>
      </select>
    </div>

    <button
        @click="translateBook"
        :disabled="!pdfText || !selectedLang || loading"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      Traduire
    </button>

    <div v-if="loading" class="mt-4 text-blue-600">Chargement en cours...</div>

    <div v-if="errorMsg" class="mt-4 text-red-500">{{ errorMsg }}</div>

    <div v-if="translatedPages.length" class="mt-6">
      <div class="flex justify-between items-center mb-2">
        <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 border rounded">
          Précédent
        </button>
        <span class="font-semibold">Page {{ currentPage }} / {{ translatedPages.length }}</span>
        <button
            @click="nextPage"
            :disabled="currentPage === translatedPages.length"
            class="px-3 py-1 border rounded"
        >
          Suivant
        </button>
      </div>
      <div class="border rounded bg-gray-100 p-4 whitespace-pre-line">
        {{ translatedPages[currentPage - 1] }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import pdf from 'pdf-parse/lib/pdf-parse.js';

const pdfText = ref('');
const pdfInfo = ref<any>(null);
const loading = ref(false);
const translatedPages = ref<string[]>([]);
const currentPage = ref(1);
const selectedLang = ref('');
const errorMsg = ref('');

const languages = [
  { label: 'Français', value: 'fr' },
  { label: 'Anglais', value: 'en' },
  { label: 'Espagnol', value: 'es' },
  { label: 'Allemand', value: 'de' },
  { label: 'Italien', value: 'it' }
];

let parsedContent: any = null;

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  loading.value = true;
  errorMsg.value = '';
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('http://localhost:3001/translate', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!data.success || !data.content) {
      errorMsg.value = 'Erreur lors du parsing du PDF côté serveur.';
      loading.value = false;
      return;
    }
    parsedContent = data.content;
    pdfInfo.value = { numPages: data.numPages };
    pdfText.value = data.content.pages.map((p: any) => p.textBlocks.map((tb: any) => tb.text).join('\n')).join('\n\n');
  } catch (err: any) {
    console.error('Erreur lors du parsing du PDF (serveur):', err);
    errorMsg.value = 'Erreur lors du parsing du PDF côté serveur.';
  } finally {
    loading.value = false;
  }
}


async function translateBook() {
  if (!parsedContent || !selectedLang.value) {
    errorMsg.value = 'Sélectionnez un PDF et une langue.';
    return;
  }
  loading.value = true;
  errorMsg.value = '';
  translatedPages.value = [];
  try {
    console.log('[translateBook] Envoi au backend:', {
      content: JSON.stringify(parsedContent),
      targetLanguage: selectedLang.value,
      organizationId: 1
    });
    const res = await fetch('http://localhost:3001/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: JSON.stringify(parsedContent),
        targetLanguage: selectedLang.value,
        organizationId: 1
      })
    });
    const data = await res.json();
    console.log('[translateBook] Réponse POST:', data);
    if (!data.success || !data.data?.id) {
      errorMsg.value = 'Erreur lors de la création de la traduction.';
      loading.value = false;
      return;
    }
    // Récupération de la traduction
    const getRes = await fetch(`http://localhost:3001/translate/organization/1`);
    const getData = await getRes.json();
    console.log('[translateBook] Réponse GET:', getData);
    if (!getData.success || !Array.isArray(getData.data)) {
      errorMsg.value = 'Erreur lors de la récupération de la traduction.';
      loading.value = false;
      return;
    }
    const translation = getData.data.find((t: any) => t.id === data.data.id);
    console.log('[translateBook] Traduction trouvée:', translation);
    if (!translation) {
      errorMsg.value = 'Traduction non trouvée.';
      loading.value = false;
      return;
    }
    const translatedContent = JSON.parse(translation.contentTranslate);
    console.log('[translateBook] Contenu traduit:', translatedContent);
    translatedPages.value = Array.isArray(translatedContent.pages)
      ? translatedContent.pages.map((p: any) => p.textBlocks.map((tb: any) => tb.text).join('\n'))
      : [];
    currentPage.value = 1;
    loading.value = false;
  } catch (error) {
    console.error('[translateBook] Erreur lors de la traduction:', error);
    errorMsg.value = 'Erreur lors de la traduction';
    loading.value = false;
  }
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function nextPage() {
  if (currentPage.value < translatedPages.value.length) currentPage.value++;
}
</script>