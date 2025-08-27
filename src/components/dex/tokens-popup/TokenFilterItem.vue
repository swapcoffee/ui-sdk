<template>
    <div class="filter" :class="{ active_filter: isActive }" @click="selectFilter">
        <div class="filter__content">
            <component v-if="getIconComponent" :is="getIconComponent" class="filter__icon" />
            <p class="filter__name">
                {{ name }}
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { useDexStore } from "@/stores/dex"
import HotIcon from "@/assets/dex/icons/HotIcon.vue"
import StarIcon from "@/assets/dex/icons/StarIcon.vue"
import NewIcon from "@/assets/dex/icons/NewIcon.vue"
import CommunityIcon from "@/assets/dex/icons/CommunityIcon.vue"
import ContestIcon from "@/assets/dex/icons/ContestIcon.vue"
import CashbackIcon from "@/assets/dex/icons/CashbackIcon.vue"

export default {
    components: {
        HotIcon,
        StarIcon,
        NewIcon,
        CommunityIcon,
        ContestIcon,
        CashbackIcon
    },
    props: {
        name: {
            type: String,
            required: true,
        },
        value: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        dexStore() {
            return useDexStore()
        },
        getIconComponent() {
            const iconMap = {
                hot: "HotIcon",
                star: "StarIcon",
                new: "NewIcon",
                community: "CommunityIcon",
                contest: "ContestIcon",
                cashback: "CashbackIcon",
            }

            return iconMap[this.value] || null
        },
    },
    methods: {
        selectFilter() {
            let newFilter

            if (this.value === "all") {
                newFilter = { name: "all", id: null }
            } else if (this.value === "community") {
                newFilter = { name: "community", id: null }
            } else {
                const filter = this.dexStore.GET_TOKEN_LABELS.find((label) => label.name === this.value)
                newFilter = { name: filter.name, id: filter.id }
            }

            this.$emit("filter-selected", newFilter)
        },
    },
}
</script>

<style scoped>
.filter {
    padding-bottom: 12px;
    opacity: 0.4;
    cursor: pointer;
}

.filter__content {
    display: flex;
    align-items: center;
    gap: 4px;
}

.filter__icon {
    color: white;
    height: 18px;
    width: 18px;
}

.theme-light .filter__icon {
    color: #000;
}

.theme-dark .filter__icon {
    color: #fff;
}

.filter__name {
    font-size: 14px;
    line-height: 17px;
    white-space: nowrap;
    height: 18px;
}

.active_filter {
    opacity: 1;
    border-bottom: 1px solid var(--main-text-color);
}
</style>
