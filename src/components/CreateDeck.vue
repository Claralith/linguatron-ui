<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
import { ref } from "vue";

const deckName = ref("");
const message = ref("");
const error = ref("");

async function createDeck() {
    message.value = "";
    error.value = "";
    try {
        const response = await fetch("http://localhost:3030/api/createdeck", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: deckName.value }),
        });

        const data = await response.json();

        if (!response.ok) {
            error.value = data.error || "Unknown error occurred";
        } else {
            message.value = data.message;
            deckName.value = "";
        }
    } catch (e) {
        error.value = "Failed to reach backend: " + e.message;
    }
}
</script>

<template>
    <div>
        <h1>Create Deck</h1>
        <form @submit.prevent="createDeck">
            <div>
                <label for="deckName">Deck Name</label>
                <input
                    id="deckName"
                    v-model="deckName"
                    type="text"
                    placeholder="Enter deck name"
                />
            </div>
            <button type="submit">Create</button>
        </form>

        <div v-if="message">{{ message }}</div>
        <div v-if="error">{{ error }}</div>
    </div>
</template>

<style></style>
