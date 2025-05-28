<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import BackToDeck from "./BackToDeck.vue";

const route = useRoute();
const deckId = route.params.id;

const props = defineProps({
    mode: {
        type: String,
        required: true,
        validator: (v) => ["learning", "review"].includes(v),
    },
});

const apiPrefix = props.mode; // "learning" | "review"

const deck = ref(null);
const cards = ref([]);
const numberOfCardsAtStart = ref(0);
const currentCard = ref(null);
const choices = ref([]);
const awaitingNext = ref(false);
const feedback = ref(null); //
const done = ref(false);
const loading = ref(true);
const error = ref("");

async function startSession() {
    loading.value = true;
    try {
        const res = await fetch(
            `http://localhost:3030/api/deck/${deckId}/${apiPrefix}`,
        );
        const data = await res.json();

        if (data.done) {
            done.value = true;
            return;
        }

        deck.value = data.deck;
        cards.value = data.cards;
        numberOfCardsAtStart.value = cards.value.length;
        currentCard.value = data.current;
        choices.value = data.choices;
    } catch (e) {
        error.value = e.message;
    } finally {
        loading.value = false;
    }
}

async function submitAnswer(answer) {
    try {
        const res = await fetch(
            `http://localhost:3030/api/deck/${deckId}/${apiPrefix}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answer, cards: cards.value }),
            },
        );
        const data = await res.json();

        if (data.done) {
            done.value = true;
            return;
        }

        cards.value = data.cards;
        const wasCorrect = data.correct;

        if (!wasCorrect) {
            feedback.value = {
                question: currentCard.value.Question,
                userAnswer: answer,
                correctAnswer: currentCard.value.Answer,
            };
            awaitingNext.value = true;
            return;
        }

        currentCard.value = data.current;
        choices.value = data.choices;
    } catch (e) {
        error.value = e.message;
    }
}

function continueAfterWrong() {
    awaitingNext.value = false;
    feedback.value = null;

    if (cards.value.length === 0) {
        done.value = true;
        return;
    }
}

onMounted(startSession);
</script>

<template>
    <div>
        <h5>Total cards: {{ numberOfCardsAtStart }}</h5>
        <h5>Cards left: {{ cards.length }}</h5>
    </div>

    <BackToDeck :deck-id="deckId" />

    <div class="p-6 max-w-xl mx-auto">
        <h1 class="text-2xl font-semibold mb-4 capitalize">
            {{ mode }} session
        </h1>

        <div v-if="loading" class="text-gray-500">loading…</div>
        <div v-else-if="done" class="text-green-600 text-xl">🎉 finished!</div>
        <div v-else-if="error" class="text-red-600">{{ error }}</div>

        <div v-else>
            <div v-if="!awaitingNext" class="mb-4">
                <p class="text-lg mb-2">Question:</p>
                <p class="text-xl font-semibold bg-purple-400 p-5 rounded">
                    {{ currentCard.Question }}
                </p>
                <p
                    v-if="currentCard.Extra"
                    class="bg-purple-300 p-2 rounded text-sm"
                >
                    {{ currentCard.Extra }}
                </p>
            </div>

            <div
                v-if="!awaitingNext"
                class="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
                <button
                    v-for="choice in choices"
                    :key="choice.ID"
                    @click="submitAnswer(choice.Answer)"
                    class="bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                    {{ choice.Answer }}
                </button>
            </div>

            <div v-if="awaitingNext" class="mt-6 border-t pt-4">
                <p class="text-red-600 font-semibold">Incorrect.</p>
                <p>Question: {{ feedback.question }}</p>
                <p>Your answer: {{ feedback.userAnswer }}</p>
                <p>Correct answer: {{ feedback.correctAnswer }}</p>

                <button
                    @click="continueAfterWrong"
                    class="mt-3 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
                >
                    next
                </button>
            </div>
        </div>
    </div>
</template>
