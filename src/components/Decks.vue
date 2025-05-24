<script setup>
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
import { ref } from "vue";

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
    <div>
        <h1>All Decks</h1>

        <div v-if="loading">Loading...</div>
        <div v-else-if="error">{{ error }}</div>
        <div v-else-if="decks.length === 0">No decks found.</div>

        <ul v-else>
            <li v-for="deck in decks" :key="deck.ID">
                <span></span>
                <RouterLink :to="`/deck/${deck.ID}`">{{
                    deck.Name
                }}</RouterLink>
            </li>
        </ul>
    </div>
</template>

<style></style>
