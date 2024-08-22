import {createRouter, createWebHistory} from "vue-router";
import SwapWidget from "@/ui/SwapWidget.vue";

const routes = [
    { path: '', component: SwapWidget, name: 'Dex', },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})