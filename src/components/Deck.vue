<script setup>
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
import { ref } from "vue";

const deck = ref([]);
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
    <div>
        <div v-if="loading">Loading...</div>
        <div v-else-if="error">{{ error }}</div>
        <div v-else-if="!deck">Deck not found</div>

        <ul v-else>
            <h1>{{ deck.Name }}</h1>
            <RouterLink :to="`/deck/${deck.ID}/learning`">Learning</RouterLink>
            <RouterLink :to="`/deck/${deck.ID}/review`">Review</RouterLink>
            <RouterLink :to="`/deck/${deck.ID}/cardbrowser`"
                >Card browser</RouterLink
            >
        </ul>
    </div>
</template>

<style></style>
