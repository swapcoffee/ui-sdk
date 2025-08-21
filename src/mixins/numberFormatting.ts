export default {
    methods: {
        formattedAmountNumber(value) {
            if (value === 0) {
                return '0'
            }
            if (value > 1) {
                return value.toFixed(4)
            }

            if (value > 0 && value < 1) {
                let count = 2
                if (Number(value.toFixed(4)) !== 0) {
                    return value.toFixed(4)
                }

                while (Number(value.toFixed(count)) === 0 && count < 8) {
                    count++
                }

                // if (Number(value.toFixed(count)) === 0 && count === 8) {
                //     return String(BigInt(value))
                // }

                return value.toFixed(count)
            }
        },
    }
};
