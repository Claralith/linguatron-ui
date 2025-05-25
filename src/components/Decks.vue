<script setup>
import { onMounted, ref } from "vue";

const decks = ref([]);
const loading = ref(true);
const error = ref("");

async function fetchDecks() {
    try {
        const res = await fetch("http://localhost:3030/api/decks");
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Unknown error");
        }

        decks.value = data.decks;
    } catch (err) {
        error.value = err.message;
    } finally {
        loading.value = false;
    }
}

onMounted(fetchDecks);
</script>

<template>
    <div class="max-w-4xl mx-auto mt-10">
        <h1 class="text-3xl font-bold mb-6 text-center text-blue-600">
            Your Decks
        </h1>

        <div v-if="loading" class="text-center text-gray-500">Loading...</div>

        <div v-else-if="error" class="text-center text-red-500">
            {{ error }}
        </div>

        <div v-else-if="decks.length === 0" class="text-center">
            <p class="text-gray-600 mb-4">No decks found.</p>
            <RouterLink
                to="/createdeck"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Create Your First Deck
            </RouterLink>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RouterLink
                v-for="deck in decks"
                :key="deck.ID"
                :to="`/deck/${deck.ID}`"
                class="block border border-gray-200 rounded-lg p-4 shadow-sm bg-white hover:shadow-md hover:border-blue-400 transition"
            >
                <h2 class="text-lg font-semibold text-gray-800">
                    {{ deck.Name }}
                </h2>
                <p class="text-sm text-gray-500 mt-1">Deck ID: {{ deck.ID }}</p>
            </RouterLink>
        </div>
    </div>
</template>

<style scoped></style>
