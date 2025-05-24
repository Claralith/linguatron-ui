<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const deckId = route.params.id;
const props = defineProps({
    mode: {
        type: String,
        required: true,
        validator: (v) => ["learning", "review"].includes(v),
    },
});

const deck = ref(null);
const currentCard = ref(null);
const choices = ref([]);
const feedback = ref(null);
const isCorrect = ref(null);
const done = ref(false);
const loading = ref(true);
const error = ref("");
const apiPrefix = props.mode === "learning" ? "learning" : "review";
const awaitingNext = ref(false);

async function fetchNextCard() {
    loading.value = true;
    feedback.value = null;

    try {
        const res = await fetch(
            `http://localhost:3030/api/deck/${deckId}/${apiPrefix}`,
        );
        const data = await res.json();

        if (data.done || data.message?.includes("No")) {
            done.value = true;
            return;
        }

        deck.value = data.deck;
        currentCard.value = data.most_due_card || data.next_card;
        choices.value = data.random_cards || data.choices;
    } catch (e) {
        error.value = "Failed to load session: " + e.message;
    } finally {
        loading.value = false;
    }
}

async function submitAnswer(answer) {
    try {
        const res = await fetch(
            `http://localhost:3030/api/card/${currentCard.value.ID}/${apiPrefix}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answer }),
            },
        );

        const data = await res.json();
        isCorrect.value = data.correct;

        if (!data.correct) {
            feedback.value = {
                correct: false,
                userAnswer: answer,
                correctAnswer: currentCard.value.Answer,
                question: currentCard.value.Question,
            };
            awaitingNext.value = true; // pause only on wrong
        }

        if (data.done) {
            done.value = true;
            return;
        }

        // Load next question *immediately* if correct
        if (data.correct) {
            currentCard.value = data.next_card;
            choices.value = data.choices;
        }
    } catch (err) {
        error.value = "Submission failed: " + err.message;
    }
}

function loadNextCard() {
    feedback.value = null;
    isCorrect.value = null;
    awaitingNext.value = false;
}

onMounted(fetchNextCard);
</script>

<template>
    <div class="p-6 max-w-xl mx-auto">
        <h1 class="text-2xl font-semibold mb-4 capitalize">
            {{ mode }} session
        </h1>

        <div v-if="loading" class="text-gray-500">Loading...</div>
        <div v-else-if="done" class="text-green-600 text-xl">
            🎉 You're done! No more {{ mode }} cards for now.
        </div>
        <div v-else-if="error" class="text-red-600">{{ error }}</div>

        <div v-else>
            <div class="mb-4" v-if="!awaitingNext">
                <p class="text-lg font-medium mb-2">Question:</p>
                <p class="text-xl font-semibold bg-purple-400 p-5 rounded">
                    {{ currentCard.Question }}
                </p>
            </div>

            <!-- Choices -->
            <div
                v-if="!awaitingNext"
                class="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
                <button
                    v-for="choice in choices"
                    :key="choice.ID"
                    @click="submitAnswer(choice.Answer)"
                    class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                    {{ choice.Answer }}
                </button>
            </div>

            <!-- Feedback only shows when awaitingNext and incorrect -->
            <div
                v-if="feedback && awaitingNext && !feedback.correct"
                class="mt-6 border-t pt-4"
            >
                <p class="text-red-600 font-semibold">Incorrect answer.</p>
                <p>Question: {{ feedback.question }}</p>
                <p>Your answer: {{ feedback.userAnswer }}</p>
                <p>Correct answer: {{ feedback.correctAnswer }}</p>

                <button
                    @click="loadNextCard"
                    class="mt-3 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                    Next
                </button>
            </div>
        </div>
    </div>
</template>
