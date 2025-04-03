export default {
  methods: {
    reduceNum(num: number): string | { result: string; unit: string } {
      if (num >= 1e3) {
        const units = ['k', 'M', 'B', 'T', 'q', 'Q'];
        const order = Math.floor((num.toFixed(0).length - 1) / 3) * 3;
        return {
          result: (num / Number(`1e${order}`)).toFixed(1),
          unit: units[Math.floor(order / 3) - 1] || '',
        };
      }
      return String(num);
    },

    filterBalance(num: number): string {
      const reduced = this.reduceNum(num);
      if (typeof reduced === 'object') {
        return `${reduced.result}${reduced.unit}`;
      }
      return reduced.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    prettyNumber(num: number, reduceCount: number): string {
      const numToFixed = Number.isInteger(num) ? num.toString() : num.toFixed(reduceCount);
      const [integerPart, fractionalPart] = numToFixed.split('.');
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      return fractionalPart ? `${formattedInteger}.${fractionalPart}` : formattedInteger;
    },

    formattedInput(value: string): string {
      const [integerPart, fractionalPart] = value.split('.');
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

      return fractionalPart !== undefined ? `${formattedInteger}.${fractionalPart}` : formattedInteger;
    },

    filterNumber(num: number): string {
      return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    },

    getLocaleForCountry(countryCode: string): string {
      const locales: Record<string, string> = {
        ES: 'es', AR: 'es', BO: 'es', CL: 'es', CO: 'es', CR: 'es', CU: 'es', DO: 'es',
        EC: 'es', GT: 'es', HN: 'es', MX: 'es', NI: 'es', PA: 'es', PY: 'es', PE: 'es',
        PR: 'es', SV: 'es', UY: 'es', VE: 'es', GQ: 'es',

        CN: 'zh', HK: 'en', TW: 'en',

        UA: 'ua',

        BY: 'ru', RU: 'ru',

        IR: 'fa',

        FR: 'fr', CD: 'fr',
      };

      return locales[countryCode] || 'en';
    },
  },
};
