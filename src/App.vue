<script setup lang="ts"></script>

<template>
    <p><strong>Current route path:</strong> {{ $route.fullPath }}</p>
    <nav>
        <RouterLink to="/decks">Decks</RouterLink>
        <RouterLink to="/createdeck">Create Deck</RouterLink>
    </nav>
    <nav>
        <a href="/createdeck">Create Deck</a>
    </nav>
    <main>
        <RouterView />
    </main>
</template>

<style scoped></style>
