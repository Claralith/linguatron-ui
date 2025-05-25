<script setup lang="ts"></script>

<template>
    <div class="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
        <!-- Header -->
        <header class="bg-white shadow p-4">
            <div class="max-w-4xl mx-auto flex justify-between items-center">
                <h1 class="text-2xl font-bold text-blue-600">Linguatron</h1>
                <nav class="space-x-4">
                    <RouterLink
                        to="/decks"
                        class="text-blue-500 hover:text-blue-700 font-medium"
                    >
                        Decks
                    </RouterLink>
                    <RouterLink
                        to="/createdeck"
                        class="text-blue-500 hover:text-blue-700 font-medium"
                    >
                        Create Deck
                    </RouterLink>
                </nav>
            </div>
        </header>
        <main class="flex-grow p-6 max-w-4xl mx-auto">
            <RouterView />
        </main>
    </div>
</template>

<style scoped></style>
