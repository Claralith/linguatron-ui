import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
} from "vue-router";

import CreateDeck from "./components/CreateDeck.vue";
import Decks from "./components/Decks.vue";
import Deck from "./components/Deck.vue";
import CardBrowser from "./components/CardBrowser.vue";
import Session from "./components/Session.vue";

const routes = [
  { path: "/createdeck", component: CreateDeck },
  { path: "/decks", component: Decks },
  { path: "/deck/:id", component: Deck },
  { path: "/deck/:id/cardbrowser", component: CardBrowser },
  {
    path: "/deck/:id/learning",
    component: Session,
    props: { mode: "learning" },
  },
  {
    path: "/deck/:id/review",
    component: Session,
    props: { mode: "review" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
