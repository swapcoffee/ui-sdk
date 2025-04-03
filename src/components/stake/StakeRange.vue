<template>
    <div class="range-container">
        <div class="range-track" @mousedown="startDrag" @touchstart="startDrag">
            <div class="range-filled" :style="{ width: filledWidth + '%' }"></div>
            <div class="range-thumb" :style="{ left: thumbPosition + '%' }">
                <span class="range-thumb-line"></span>
                <span class="range-thumb-line"></span>
                <span class="range-thumb-line"></span>
            </div>
        </div>
    </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
    name: "StakeRange",
    data() {
        return {
            filledWidth: 0,
            thumbPosition: 0,
            isDragging: false,
            thumbWidth: 15,
            isInsideContainer: true,
        };
    },
    computed: {
        ...mapGetters(["GET_STAKE_VALUE", "GET_STAKE_MAX", "GET_DEX_WALLET", 'GET_STAKE_TOKEN']),

        effectiveMax() {
            if (!this.GET_DEX_WALLET || this.GET_STAKE_MAX === 0) {
                return 1000;
            }
            return this.GET_STAKE_MAX;
        }
    },
    mounted() {
        this.initSliderPosition();
    },
    watch: {
        GET_STAKE_VALUE(newValue) {
            this.updateSliderFromValue(newValue);
        },
        GET_STAKE_MAX: {
            handler() {
                this.updateSliderFromValue(this.GET_STAKE_VALUE);
            }
        },
        GET_DEX_WALLET: {
            handler() {
                this.updateSliderFromValue(this.GET_STAKE_VALUE);
            }
        },
        GET_STAKE_TOKEN: {
            handler() {
                this.resetSlider();
            }
        }
    },
    methods: {
        ...mapActions(["STAKE_VALUE"]),

        initSliderPosition() {
            const initialValue = this.GET_STAKE_VALUE || 0;
            this.updateSliderFromValue(initialValue);
        },
        resetSlider() {
            this.filledWidth = 0;
            this.thumbPosition = 0;
            this.STAKE_VALUE(0);
        },
        updateSliderFromValue(value) {
            const max = this.effectiveMax;

            this.filledWidth = Math.min((value / max) * 100, 100);
            this.thumbPosition = this.filledWidth;

            const thumbElement = this.$el.querySelector(".range-thumb");
            if (thumbElement) {
                thumbElement.style.transform = `translateX(${-this.thumbPosition}%)`;
            }

            if (value !== this.GET_STAKE_VALUE) {
                this.STAKE_VALUE(value);
            }
        },

        startDrag(event) {
            event.preventDefault();
            document.body.style.userSelect = "none";
            this.isDragging = true;
            this.updatePosition(event);
            window.addEventListener("mousemove", this.updatePosition);
            window.addEventListener("mouseup", this.stopDrag);
            window.addEventListener("touchmove", this.updatePosition);
            window.addEventListener("touchend", this.stopDrag);
        },

        stopDrag() {
            this.isDragging = false;
            document.body.style.userSelect = "";
            window.removeEventListener("mousemove", this.updatePosition);
            window.removeEventListener("mouseup", this.stopDrag);
            window.removeEventListener("touchmove", this.updatePosition);
            window.removeEventListener("touchend", this.stopDrag);
        },

        updatePosition(event) {
            if (!this.isDragging) return;

            const trackElement = this.$el.querySelector(".range-track");
            if (!trackElement) return;

            let clientX = event.touches ? event.touches[0].clientX : event.clientX;
            const trackRect = trackElement.getBoundingClientRect();
            const padding = this.thumbWidth / 2;
            const usableWidth = trackRect.width - padding * 2;

            let newPosition = ((clientX - (trackRect.left + padding)) / usableWidth) * 100;
            newPosition = Math.max(0, Math.min(100, newPosition));

            const max = this.effectiveMax;
            let newStakeValue = (newPosition / 100) * max;

            if (newPosition >= 98 && this.GET_DEX_WALLET && this.GET_STAKE_MAX !== 0) {
                newStakeValue = this.GET_STAKE_MAX;
            } else {
                if (max <= 0.001) {
                    newStakeValue = newStakeValue.toFixed(8);
                } else if (newStakeValue <= 0.01) {
                    newStakeValue = newStakeValue.toFixed(7);
                } else {
                    newStakeValue = newStakeValue.toFixed(2);
                }
            }

            this.filledWidth = newPosition;
            this.thumbPosition = newPosition;

            const thumbElement = this.$el.querySelector(".range-thumb");
            if (thumbElement) {
                thumbElement.style.transform = `translateX(${-newPosition}%)`;
            }

            this.STAKE_VALUE(newStakeValue);
        }
    },
};
</script>


<style scoped>
.range-container {
    margin-top: 1px;
    margin-bottom: 6px;
    width: 100%;
}

.range-track {
    width: 100%;
    height: 46px;
    background-color: var(--iface-white6);
    border-radius: 0 0 12px 12px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    padding-left: 12px;
}

.range-filled {
    height: 100%;
    background: linear-gradient(90deg, #C5FFC1 0%, #ACFFA8 100%);
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 0 0 0 12px;
}

.range-thumb {
    width: 30px;
    height: 46px;
    background: linear-gradient(90deg, #C5FFC1 0%, #ACFFA8 0%);
    position: absolute;
    top: 0;
    cursor: pointer;
    display: flex;
    justify-content: center;
    gap: 4px;
    align-items: center;
    transition: transform 0.3s ease;
}

.range-thumb-line {
    width: 2px;
    height: 14px;
    background-color: #181413;
    border-radius: 2px;
}

.range-thumb-line:nth-child(1) {
    opacity: 0.2;
}

.range-thumb-line:nth-child(2) {
    opacity: 0.4;
}

.range-thumb-line:nth-child(3) {
    opacity: 0.6;
}

@media screen and (max-width: 576px) {
    .range-container {
        margin-bottom: 0;
    }
}
</style>
