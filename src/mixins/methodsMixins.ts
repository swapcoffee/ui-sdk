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
        filterNumber(num) {
            return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
        },
        getLocaleForCountry(countryCode) {
            const locales = {
                // Испанский
                'ES': 'es',
                'AR': 'es',
                'BO': 'es',
                'CL': 'es',
                'CO': 'es',
                'CR': 'es',
                'CU': 'es',
                'DO': 'es',
                'EC': 'es',
                'GT': 'es',
                'HN': 'es',
                'MX': 'es',
                'NI': 'es',
                'PA': 'es',
                'PY': 'es',
                'PE': 'es',
                'PR': 'es',
                'SV': 'es',
                'UY': 'es',
                'VE': 'es',
                'GQ': 'es',

                // Китайский
                'CN': 'zh',
                'HK': 'en',
                'TW': 'en',

                // Украинский
                'UA': 'ua',

                // Русский
                'BY': 'ru',
                'RU': 'ru',

                // Иранский
                'IR': 'fa',

                // Французский
                'FR': 'fr',
                'CD': 'fr',
            };

            return locales[countryCode] || 'en';
        }
    }
}