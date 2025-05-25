<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const deck = ref(null);
const loading = ref(true);
const error = ref("");

async function fetchDeck() {
    const id = route.params.id;

    try {
        const res = await fetch(`http://localhost:3030/api/deck/${id}`);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Unknown error");
        }

        deck.value = data.deck;
    } catch (err) {
        error.value = err.message;
    } finally {
        loading.value = false;
    }
}

onMounted(fetchDeck);
</script>

<template>
    <div class="max-w-3xl mx-auto mt-10 text-center">
        <div v-if="loading" class="text-gray-500 text-lg">Loading deck...</div>

        <div v-else-if="error" class="text-red-600 text-lg">{{ error }}</div>

        <div v-else-if="!deck" class="text-gray-600 text-lg">
            Deck not found.
        </div>

        <div v-else>
            <h1 class="text-3xl font-bold mb-6 text-blue-700">
                {{ deck.Name }}
            </h1>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <RouterLink
                    :to="`/deck/${deck.ID}/learning`"
                    class="block bg-green-500 text-white py-3 px-4 rounded hover:bg-green-600 transition"
                >
                    Start Learning
                </RouterLink>

                <RouterLink
                    :to="`/deck/${deck.ID}/review`"
                    class="block bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 transition"
                >
                    Review Cards
                </RouterLink>

                <RouterLink
                    :to="`/deck/${deck.ID}/cardbrowser`"
                    class="block bg-gray-700 text-white py-3 px-4 rounded hover:bg-gray-800 transition"
                >
                    Browse Cards
                </RouterLink>

                <RouterLink
                    :to="`/deck/${deck.ID}/batchadd`"
                    class="block bg-gray-700 text-white py-3 px-4 rounded hover:bg-gray-800 transition"
                >
                    Batch Add Cards
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
