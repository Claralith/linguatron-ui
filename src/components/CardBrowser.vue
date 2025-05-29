<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import BackToDeck from "./BackToDeck.vue";

const route = useRoute();
const deckId = route.params.id;

const cards = ref([]);
const newCard = ref({ question: "", answer: "", extra: "" });
const error = ref("");
const loading = ref(true);
const duplicateQuestionError = ref("");

// --- Sorting State ---
const sortKey = ref("ID"); // Default sort key
const sortOrder = ref("asc"); // Default sort order ('asc' or 'desc')

async function fetchCards() {
    loading.value = true;
    error.value = "";
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

function checkDuplicateQuestion() {
    const questionVal = newCard.value.question;
    if (!questionVal || !questionVal.trim()) {
        duplicateQuestionError.value = "";
        return;
    }
    const trimmedQuestion = questionVal.trim().toLowerCase();
    const isDuplicate = cards.value.some(
        (card) =>
            card.Question && card.Question.toLowerCase() === trimmedQuestion,
    );

    if (isDuplicate) {
        duplicateQuestionError.value =
            "This question already exists in the deck.";
    } else {
        duplicateQuestionError.value = "";
    }
}

async function createCard() {
    checkDuplicateQuestion();
    if (duplicateQuestionError.value) return;
    if (!newCard.value.question.trim() || !newCard.value.answer.trim()) {
        error.value = "Question and Answer fields cannot be empty.";
        return;
    }
    error.value = "";

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
        duplicateQuestionError.value = "";
    } catch (err) {
        error.value = err.message;
    }
}

async function updateCard(card) {
    error.value = "";
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
    error.value = "";

    try {
        const res = await fetch(
            `http://localhost:3030/api/card/${cardId}/delete`,
            {
                method: "DELETE",
            },
        );

        if (!res.ok) {
            let errorMsg = "Failed to delete card";
            try {
                const data = await res.json();
                if (data.error) errorMsg = data.error;
            } catch (e) {
                /* ignore */
            }
            throw new Error(errorMsg);
        }

        cards.value = cards.value.filter((c) => c.ID !== cardId);
    } catch (err) {
        error.value = err.message;
    }
}

// --- Computed property for sorted cards ---
const sortedCards = computed(() => {
    if (!cards.value) return [];
    const sorted = [...cards.value];
    const key = sortKey.value;

    sorted.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (key === "ID") {
            return sortOrder.value === "asc" ? valA - valB : valB - valA;
        }

        valA = (valA || "").toString().toLowerCase();
        valB = (valB || "").toString().toLowerCase();

        if (valA < valB) return sortOrder.value === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder.value === "asc" ? 1 : -1;
        return 0;
    });
    return sorted;
});

function sortBy(key) {
    if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    } else {
        sortKey.value = key;
        sortOrder.value = "asc";
    }
}

onMounted(fetchCards);
</script>

<template>
    <BackToDeck :deck-id="deckId" />

    <div class="max-w-4xl mx-auto mt-8">
        <h1 class="text-2xl font-bold mb-4">Card Browser</h1>
        <p class="mb-2">Number of cards: {{ cards.length }}</p>

        <form
            @submit.prevent="createCard"
            class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
            <div>
                <input
                    type="text"
                    v-model="newCard.question"
                    placeholder="Question"
                    class="border px-3 py-2 rounded w-full"
                    @blur="checkDuplicateQuestion"
                    aria-describedby="question-duplicate-error"
                />
                <p
                    v-if="duplicateQuestionError"
                    id="question-duplicate-error"
                    class="text-sm text-red-500 mt-1"
                >
                    {{ duplicateQuestionError }}
                </p>
            </div>

            <input
                type="text"
                v-model="newCard.answer"
                placeholder="Answer"
                class="border px-3 py-2 rounded w-full"
            />

            <input
                type="text"
                v-model="newCard.extra"
                placeholder="Extra"
                class="border px-3 py-2 rounded w-full"
            />

            <button
                type="submit"
                class="bg-blue-500 text-white px-4 py-2 rounded md:col-span-2"
                :disabled="
                    !!duplicateQuestionError ||
                    !newCard.question.trim() ||
                    !newCard.answer.trim()
                "
                :class="{
                    'opacity-50 cursor-not-allowed':
                        !!duplicateQuestionError ||
                        !newCard.question.trim() ||
                        !newCard.answer.trim(),
                }"
            >
                Create Card
            </button>
        </form>

        <div v-if="loading">Loading...</div>
        <div
            v-if="error && !loading"
            class="text-red-500 mb-4 p-3 border border-red-300 bg-red-50 rounded"
        >
            {{ error }}
        </div>

        <table
            v-if="!loading && cards.length > 0"
            class="w-full border-collapse table-auto"
        >
            <thead>
                <tr class="bg-gray-200">
                    <th
                        class="border p-2 cursor-pointer hover:bg-gray-300"
                        @click="sortBy('ID')"
                    >
                        ID
                        <span v-if="sortKey === 'ID'">{{
                            sortOrder === "asc" ? "▲" : "▼"
                        }}</span>
                    </th>
                    <th
                        class="border p-2 cursor-pointer hover:bg-gray-300"
                        @click="sortBy('Question')"
                    >
                        Question
                        <span v-if="sortKey === 'Question'">{{
                            sortOrder === "asc" ? "▲" : "▼"
                        }}</span>
                    </th>
                    <th
                        class="border p-2 cursor-pointer hover:bg-gray-300"
                        @click="sortBy('Answer')"
                    >
                        Answer
                        <span v-if="sortKey === 'Answer'">{{
                            sortOrder === "asc" ? "▲" : "▼"
                        }}</span>
                    </th>
                    <th
                        class="border p-2 cursor-pointer hover:bg-gray-300"
                        @click="sortBy('Extra')"
                    >
                        Extra
                        <span v-if="sortKey === 'Extra'">{{
                            sortOrder === "asc" ? "▲" : "▼"
                        }}</span>
                    </th>
                    <th class="border p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                <!-- Iterate over sortedCards instead of cards -->
                <tr v-for="card in sortedCards" :key="card.ID">
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
        <div
            v-if="!loading && cards.length === 0 && !error"
            class="text-gray-600"
        >
            No cards in this deck yet. You can add one using the form above.
        </div>
    </div>
</template>
