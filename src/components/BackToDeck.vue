<script setup>
const props = defineProps({
    deckId: {
        type: [String, Number],
        required: true,
    },
});
</script>

<template>
    <div class="mt-8 text-center">
        <RouterLink
            :to="`/deck/${props.deckId}`"
            class="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-1 px-3 rounded"
        >
            ← Back to Deck
        </RouterLink>
    </div>
</template>
