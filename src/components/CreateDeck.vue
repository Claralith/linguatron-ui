<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const deckName = ref("");
const message = ref("");
const error = ref("");
const router = useRouter();

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

            // Redirect after slight delay to show feedback
            setTimeout(() => {
                router.push(`/deck/${data.deck.id}`);
            }, 1000); // 1 second delay
        }
    } catch (e) {
        error.value = "Failed to reach backend: " + e.message;
    }
}
</script>

<template>
    <div class="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
        <h1 class="text-2xl font-semibold mb-6 text-center text-gray-800">
            Create a New Deck
        </h1>

        <form @submit.prevent="createDeck" class="space-y-4">
            <div>
                <label
                    for="deckName"
                    class="block text-gray-700 font-medium mb-1"
                >
                    Deck Name
                </label>
                <input
                    id="deckName"
                    v-model="deckName"
                    type="text"
                    placeholder="e.g. Japanese"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
            </div>

            <button
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150"
            >
                Create Deck
            </button>
        </form>

        <div v-if="message" class="mt-4 text-green-600 font-medium text-center">
            {{ message }}
        </div>

        <div v-if="error" class="mt-4 text-red-600 font-medium text-center">
            {{ error }}
        </div>
    </div>
</template>
