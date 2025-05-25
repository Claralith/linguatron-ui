<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import BackToDeck from "./BackToDeck.vue";

const route = useRoute();
const deckId = route.params.id;

const batchInput = ref("");
const successMessage = ref("");
const errorMessage = ref("");

async function submitBatch() {
    successMessage.value = "";
    errorMessage.value = "";

    try {
        const res = await fetch(
            `http://localhost:3030/api/deck/${deckId}/batchadd`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lines: batchInput.value
                        .split("\n")
                        .map((line) => line.trim())
                        .filter((line) => line.length > 0),
                }),
            },
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Unknown error");
        }

        successMessage.value = `✅ Added ${data.cards_added_count} cards successfully.`;
        batchInput.value = "";
    } catch (e) {
        errorMessage.value = e.message;
    }
}
</script>

<template>
    <BackToDeck :deck-id="deckId" />

    <div class="max-w-2xl mx-auto mt-10 px-4">
        <h1 class="text-2xl font-bold mb-4">Batch Add Cards</h1>

        <p class="mb-2 text-sm text-gray-600">
            Enter one card per line, using <code>;</code> to separate the
            question and answer.
        </p>

        <div class="bg-gray-100 p-3 rounded mb-4 text-sm text-gray-700">
            <p class="font-semibold mb-1">Example:</p>
            <pre class="whitespace-pre-wrap">
氷;ice
火;fire
火山;volcano</pre
            >
        </div>

        <textarea
            v-model="batchInput"
            rows="10"
            class="w-full p-2 border rounded mb-4"
            placeholder="question;answer"
        ></textarea>

        <button
            @click="submitBatch"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
            Add Cards
        </button>

        <div v-if="successMessage" class="mt-4 text-green-600 font-medium">
            {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="mt-4 text-red-600 font-medium">
            {{ errorMessage }}
        </div>
    </div>
</template>
