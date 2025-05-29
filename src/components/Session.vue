<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import BackToDeck from "./BackToDeck.vue";

const route = useRoute();
const deckId = route.params.id;
const limit = route.query.limit || 10;

const props = defineProps({
    mode: {
        type: String,
        required: true,
        validator: (v) => ["learning", "review"].includes(v),
    },
});

const apiPrefix = props.mode;

const deck = ref(null);
const cards = ref([]);
const numberOfCardsAtStart = ref(0);
const currentCard = ref(null);
const choices = ref([]);
const awaitingNext = ref(false);
const feedback = ref(null);
const done = ref(false);
const loading = ref(true);
const error = ref("");

async function startSession() {
    loading.value = true;
    error.value = "";
    try {
        const res = await fetch(
            `http://localhost:3030/api/deck/${deckId}/${apiPrefix}?limit=${limit}`,
        );
        if (!res.ok) {
            const errorData = await res
                .json()
                .catch(() => ({ error: "Failed to parse error response" }));
            throw new Error(errorData.error || `HTTP error ${res.status}`);
        }
        const data = await res.json();

        if (data.error) {
            error.value = data.error;
            if (data.details) error.value += ": " + data.details;
            done.value = true;
            loading.value = false;
            return;
        }

        if (data.done || !data.cards || data.cards.length === 0) {
            done.value = true;
            deck.value = data.deck;
            cards.value = [];
            numberOfCardsAtStart.value = 0;
            currentCard.value = null;
            choices.value = [];
        } else {
            deck.value = data.deck;
            cards.value = data.cards;
            numberOfCardsAtStart.value = cards.value.length;
            currentCard.value = data.current;
            choices.value = data.choices;
            done.value = false;
        }
    } catch (e) {
        error.value = "Frontend error during startSession: " + e.message;
        done.value = true;
    } finally {
        loading.value = false;
    }
}

async function submitAnswer(answerFromChoice) {
    if (!currentCard.value) {
        error.value = "No current card to submit an answer for.";
        return;
    }
    const cardBeingAnswered = { ...currentCard.value };

    error.value = "";
    try {
        const res = await fetch(
            `http://localhost:3030/api/deck/${deckId}/${apiPrefix}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    answer: answerFromChoice,
                    cards: cards.value,
                }),
            },
        );
        if (!res.ok) {
            const errorData = await res
                .json()
                .catch(() => ({ error: "Failed to parse error response" }));
            throw new Error(errorData.error || `HTTP error ${res.status}`);
        }
        const data = await res.json();

        if (data.error) {
            error.value = data.error;
            if (data.details) error.value += ": " + data.details;
            return;
        }

        cards.value = data.cards;

        if (data.done) {
            done.value = true;
            if (!data.correct) {
                feedback.value = {
                    question: cardBeingAnswered.Question,
                    userAnswer: answerFromChoice,
                    correctAnswer: cardBeingAnswered.Answer,
                };
                awaitingNext.value = true;
            }
            return;
        }
        currentCard.value = data.current;
        choices.value = data.choices;

        const wasCorrect = data.correct;

        if (!wasCorrect) {
            feedback.value = {
                question: cardBeingAnswered.Question,
                userAnswer: answerFromChoice,
                correctAnswer: cardBeingAnswered.Answer,
            };
            awaitingNext.value = true;
        } else {
            feedback.value = null;
            awaitingNext.value = false;
            if (cards.value.length === 0) {
                done.value = true;
            }
        }
    } catch (e) {
        error.value = "Frontend error during submitAnswer: " + e.message;
    }
}

function continueAfterWrong() {
    if (done.value) {
        awaitingNext.value = false;
        feedback.value = null;
        return;
    }

    awaitingNext.value = false;
    feedback.value = null;

    if (cards.value.length === 0) {
        done.value = true;
    }
}

onMounted(startSession);
</script>

<template>
    <div>
        <h5>Total cards at start: {{ numberOfCardsAtStart }}</h5>
        <h5>Cards left in session: {{ cards.length }}</h5>
    </div>

    <BackToDeck :deck-id="deckId" />

    <div class="p-6 max-w-xl mx-auto">
        <h1 class="text-2xl font-semibold mb-4 capitalize">
            {{ mode }} session
        </h1>

        <div v-if="loading" class="text-gray-500">Loading session…</div>
        <div
            v-else-if="error"
            class="text-red-600 p-3 border border-red-300 bg-red-50 rounded mb-4"
        >
            Error: {{ error }}
        </div>

        <div
            v-if="done && !error"
            class="text-green-600 text-xl p-4 bg-green-50 rounded"
        >
            🎉 Session finished!
        </div>

        <div v-if="!loading && !done && !error">
            <div v-if="!awaitingNext && currentCard">
                <div class="mb-4">
                    <p class="text-lg mb-2">Question:</p>
                    <p class="text-xl font-semibold bg-purple-400 p-5 rounded">
                        {{ currentCard.Question }}
                    </p>
                    <p
                        v-if="currentCard.Extra"
                        class="mt-1 bg-purple-300 p-2 rounded text-sm"
                    >
                        {{ currentCard.Extra }}
                    </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        v-for="choice in choices"
                        :key="choice.ID"
                        @click="submitAnswer(choice.Answer)"
                        class="bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 rounded break-words"
                    >
                        {{ choice.Answer }}
                    </button>
                </div>
            </div>
            <div
                v-else-if="awaitingNext && feedback"
                class="mt-6 border-t pt-4"
            >
                <p class="text-red-600 font-semibold text-lg">Incorrect.</p>
                <div class="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                    <p><strong>Question:</strong> {{ feedback.question }}</p>
                    <p>
                        <strong>Your answer:</strong> {{ feedback.userAnswer }}
                    </p>
                    <p class="text-green-400">
                        <strong>Correct answer:</strong>
                        {{ feedback.correctAnswer }}
                    </p>
                </div>

                <button
                    @click="continueAfterWrong"
                    class="mt-4 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
                >
                    {{
                        cards.length > 0 || !done
                            ? "Next Question"
                            : "Finish Session"
                    }}
                </button>
            </div>
            <div v-else-if="!currentCard && !loading && !done && !error">
                <p class="text-gray-500">Preparing next card...</p>
            </div>
        </div>
    </div>
</template>
