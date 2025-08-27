import BigNumber from "bignumber.js";
import type { EventAction } from "@/utils/consts";
import defaultImage from '@/assets/dex/default.svg';

export default {
  methods: {
    reduceNum(num: number): number | { result: string; unit: string } {
      if (num >= 1e3) {
        let units = ["k", "M", "B", "T", "q", "Q"];
        let order = Math.floor((Number(num).toFixed(0).length - 1) / 3) * 3;
        let result: { result: string; unit: string } = {
          result: String((num / Number("1e" + order)).toFixed(2)),
          unit: units[Math.floor(order / 3) - 1],
        };
        return result;
      } else {
        return num;
      }
    },

    filterBalance(num: number): string {
      let reduce = this.reduceNum(num);
      if (typeof reduce === "number") {
        return String(reduce).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      } else {
        return reduce.result + reduce.unit;
      }
    },

    formattedDetailsValue(value: string | number, symbol: string): string {
      let text = "";

      if (typeof value === "string") {
        if (symbol === '%') {
          return `${value}${symbol}`;
        }
        if (symbol === '$') {
          if (value === '<0.01') {
            return `<$0.01`;
          }
          return `${symbol}${value}`;
        }
        return `${value} ${symbol}`;
      }

      if (value > 0 && value < 0.01) {
        let shortText = "<0.01";
        if (symbol && symbol.includes("$")) {
          shortText = `<${symbol}0.01`;
        }
        if (symbol && !symbol.includes("$")) {
          shortText = `<0.01${symbol}`;
        }
        return shortText;
      }

      if (value < 1000) {
        if (symbol && symbol.includes("$")) {
          text += symbol;
        }
        text += this.prettyNumber(value, 2);
        if (symbol && !symbol.includes("$")) {
          text += symbol;
        }
      } else {
        const res = this.filterBalance(value);

        if (symbol && symbol.includes("$")) {
          text += symbol;
        }
        text += res;
        if (symbol && !symbol.includes("$")) {
          text += symbol;
        }
      }
      return text;
    },

    formattedPoolValue(value: string | number, symbol: string): string {
      let text = "";

      if (typeof value === "string") {
        return `${value} ${symbol}`;
      }

      if (value > 0 && value < 0.01) {
        let shortText = "";
        if (symbol && symbol.includes("$")) {
          shortText += symbol;
        }
        shortText += "<0.01";
        if (symbol && !symbol.includes("$")) {
          shortText += symbol;
        }
        return shortText;
      }

      if (value < 1000) {
        if (symbol && symbol.includes("$")) {
          text += symbol;
        }

        const formattedValue = this.formatWithoutTrailingZeros(value);
        text += formattedValue;

        if (symbol && !symbol.includes("$")) {
          text += symbol;
        }
      } else {
        const res = this.filterBalance(value);

        if (symbol && symbol.includes("$")) {
          text += symbol;
        }
        text += res;
        if (symbol && !symbol.includes("$")) {
          text += symbol;
        }
      }
      return text;
    },

    formatWithoutTrailingZeros(num: number): string {
      const fixed = num.toFixed(2);
      return parseFloat(fixed).toString();
    },

    // OLD FUNCTION
    prettyNumber(num: number, reduceCount: number, isUsd: boolean = false): string {
      let numToFixed: string | number = 0;
      if (isUsd) {
        numToFixed = num.toFixed(reduceCount);
      } else if (Number.isInteger(num)) {
        numToFixed = num;
      } else {
        numToFixed = num.toFixed(reduceCount);
      }

      let [integerPart, fractionalPart] = String(numToFixed).split(".");
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      return fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart;
    },

    getPricePrecision(price: number, minPrecision: number = 2): number {
      price = Number(price);

      if (isNaN(price)) {
        console.error("Invalid price:", price);
        return 10;
      }

      if (price === 0) return 2;

      const str = price.toExponential(20);
      const match = str.match(/e-(\d+)/);
      if (match) {
        const precision = parseInt(match[1], 10);
        return Math.min(Math.max(precision + 1, minPrecision), 15);
      }

      return minPrecision;
    },

    formatWithoutRounding(value: number, precision: number = 2): string {
      const num = new BigNumber(value);
      if (!num.isFinite()) return "0.00";
      return num.toFixed(precision, BigNumber.ROUND_DOWN);
    },

    formatWithSeparatorsWithoutRounding(value: number, precision: number = 2): string {
      const raw = this.formatWithoutRounding(value, precision);
      const [intPart, decPart] = raw.split(".");
      const intWithSeparators = Number(intPart).toLocaleString();
      return decPart ? `${intWithSeparators}.${decPart}` : intWithSeparators;
    },

    almostIntegerRounding(value: number): string {
      const formattedValue = this.formatWithoutRounding(value, 3);
      if (formattedValue === '0.00') return formattedValue;

      const split = formattedValue.split('.');
      if (split[1] === '999') {
        return value.toFixed(2);
      }
      return this.formatWithSeparatorsWithoutRounding(value, this.getPricePrecision(value));
    },

    formattedInput(value: string): string {
      let [integerPart, fractionalPart] = value.split(".");
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      return fractionalPart !== undefined ? `${integerPart}.${fractionalPart}` : integerPart;
    },

    filterNumber(num: number): string {
      return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },

    clearHistoryStateKey(key: string): void {
      if (history.state && key in history.state) {
        const state = { ...history.state };
        delete state[key];
        history.replaceState(state, '');
      }
    },

    getSmallAmount(value: number): { left: string; subText: number; right: string } {
      const precision = this.getPricePrecision(value);
      const formatted = this.formatWithoutRounding(value, precision);
      const splitValue = this.splitAndTrimSmall(formatted);

      return { left: splitValue[0], subText: precision - 2, right: splitValue[1] };
    },

    splitAndTrimSmall(str: string): [string, string] {
      if (str.startsWith('0.')) {
        const firstPart = '0.0';
        const rest = str.slice(2);
        const restTrimmed = rest.replace(/^0+/, '') || '0';
        return [firstPart, restTrimmed];
      } else {
        return [str, ''];
      }
    },

    imageError(event: Event): void {
      const target = event.target as HTMLImageElement;
      target.src = defaultImage;
    },

    dispatchSdkEvent(eventName: EventAction, data: unknown): void {
      const event = new CustomEvent(eventName, { detail: data });
      window.dispatchEvent(event);
    },
  },
};
