import type { EventAction } from "@/utils/consts";

export default {
    methods: {
        reduceNum(num) {
            let object = {}
            if (num >= 1e3) {
                let units = ["k", "M", "B", "T", "q", "Q"];
                let order = Math.floor((Number(num).toFixed(0).length - 1) / 3) * 3
                let object = {
                    result: String((num / ('1e'+ order)).toFixed(1)),
                    unit: units[Math.floor(order / 3) - 1]
                }
                return object
            } else {
                return num
            }
        },
        filterBalance(num) {
            let reduce = this.reduceNum(num)
            if (typeof reduce === 'string') {
                return String(reduce).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            } else {
                return reduce
            }
        },
        prettyNumber(num, reduceCount) {
            let numToFixed = 0
            if (Number.isInteger(num)) {
                numToFixed = num
            } else {
                numToFixed = num.toFixed(reduceCount)
            }

            let [integerPart, fractionalPart] = String(numToFixed).split(".");
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

            return fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart;
        },
        formattedInput(value) {
            let [integerPart, fractionalPart] = value.split(".");
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            return fractionalPart !== undefined ? `${integerPart}.${fractionalPart}` : integerPart;
        },
        filterNumber(num) {
            return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
        },
        dispatchSdkEvent(eventName: EventAction, data: unknown) {
            const event = new CustomEvent(eventName, { detail: data });
            window.dispatchEvent(event);
        }
    }
}
