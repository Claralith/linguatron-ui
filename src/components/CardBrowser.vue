<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import BackToDeck from "./BackToDeck.vue";

const route = useRoute();
const deckId = route.params.id;

const cards = ref([]);
const newCard = ref({ question: "", answer: "" });
const error = ref("");
const loading = ref(true);

async function fetchCards() {
    loading.value = true;
    try {
        const res = await fetch(
            `http://localhost:3030/api/deck/${deckId}/cards`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load cards");
        cards.value = data.cards;
    } catch (err) {
        error.value = err.message;
    } finally {
        loading.value = false;
    }
}

async function createCard() {
    try {
        const res = await fetch(
            `http://localhost:3030/api/deck/${deckId}/createcard`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCard.value),
            },
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create card");

        cards.value.push(data);
        newCard.value.question = "";
        newCard.value.answer = "";
        newCard.value.extra = "";
    } catch (err) {
        error.value = err.message;
    }
}

async function updateCard(card) {
    try {
        const res = await fetch(
            `http://localhost:3030/api/card/${card.ID}/edit`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: card.Question,
                    answer: card.Answer,
                    extra: card.Extra,
                }),
            },
        );

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to update card");
        }
    } catch (err) {
        error.value = err.message;
    }
}

async function deleteCard(cardId) {
    if (!confirm("Are you sure you want to delete this card?")) return;

    try {
        const res = await fetch(
            `http://localhost:3030/api/card/${cardId}/delete`,
            {
                method: "DELETE",
            },
        );

        if (!res.ok) throw new Error("Failed to delete card");

        cards.value = cards.value.filter((c) => c.ID !== cardId);
    } catch (err) {
        error.value = err.message;
    }
}

onMounted(fetchCards);
</script>

<template>
    <BackToDeck :deck-id="deckId" />

    <div class="max-w-4xl mx-auto mt-8">
        <h1 class="text-2xl font-bold mb-4">Card Browser</h1>

        <form
            @submit.prevent="createCard"
            class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
            <input
                type="text"
                v-model="newCard.question"
                placeholder="Question"
                class="border px-3 py-2 rounded"
            />
            <input
                type="text"
                v-model="newCard.answer"
                placeholder="Answer"
                class="border px-3 py-2 rounded"
            />
            <input
                type="text"
                v-model="newCard.extra"
                placeholder="Extra"
                class="border px-3 py-2 rounded"
            />
            <button
                type="submit"
                class="bg-blue-500 text-white px-4 py-2 rounded md:col-span-2"
            >
                Create Card
            </button>
        </form>

        <div v-if="loading">Loading...</div>
        <div v-if="error" class="text-red-500">{{ error }}</div>

        <table
            v-if="!loading && cards.length > 0"
            class="w-full border-collapse table-auto"
        >
            <thead>
                <tr class="bg-gray-200">
                    <th class="border p-2">ID</th>
                    <th class="border p-2">Question</th>
                    <th class="border p-2">Answer</th>
                    <th class="border p-2">Extra</th>
                    <th class="border p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="card in cards" :key="card.ID">
                    <td class="border p-2">{{ card.ID }}</td>
                    <td class="border p-2">
                        <input
                            v-model="card.Question"
                            @change="updateCard(card)"
                            class="border px-2 py-1 w-full"
                        />
                    </td>
                    <td class="border p-2">
                        <input
                            v-model="card.Answer"
                            @change="updateCard(card)"
                            class="border px-2 py-1 w-full"
                        />
                    </td>
                    <td class="border p-2">
                        <input
                            v-model="card.Extra"
                            @change="updateCard(card)"
                            class="border px-2 py-1 w-full"
                        />
                    </td>
                    <td class="border p-2 text-center">
                        <button
                            class="bg-red-500 text-white px-3 py-1 rounded"
                            @click="deleteCard(card.ID)"
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
