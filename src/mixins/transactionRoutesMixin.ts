import dedustIcon from '@/assets/contributors/dedust-icon.png';
import stonfiIcon from '@/assets/contributors/stonfi-icon.png';
import stonfiV2Icon from '@/assets/contributors/stonfi-v2-icon.png';
import toncoIcon from '@/assets/contributors/tonco.png';
import tonstakersIcon from '@/assets/contributors/tonstakers.svg';
import colossusIcon from '@/assets/contributors/colossus_icon.png';
import torchFinanceIcon from '@/assets/contributors/torch_icon.svg';
import coffeeIcon from '@/assets/contributors/coffee_icon.webp';
import { useDexStore } from "@/stores/dex";

export default {
  computed: {
    dexStore() {
      return useDexStore();
    },
    getRoutes() {
      const paths = this.dexStore.GET_DEAL_CONDITIONS?.paths;
      const routes = [];
      const totalInputAmount = paths.reduce((sum, current) => sum + current.swap.input_amount, 0);

      for (const routeStart of paths) {
        const dexSources = [];
        const tokens = [];
        const dex = routeStart.dex;
        tokens.push(routeStart.input_token.metadata.symbol);

        const traverse = (current) => {
          tokens.push(current.output_token.metadata.symbol);

          const dexData = this.getDexSourceDataByName(current.dex);
          dexSources.push(dexData);

          if (current.next?.length > 0) {
            for (const next of current.next) {
              if (current.dex !== next.dex) {
                tokens.push(next.input_token.metadata.symbol);
              }
              traverse(next);
            }
          }
        };

        traverse(routeStart);

        const uniqueDexSources = dexSources.filter(
            (dex, index, arr) => index === 0 || dex.name !== arr[index - 1].name,
        );

        routes.push({
          dex: uniqueDexSources,
          path: tokens.join(' > '),
          inputPercentage: ((routeStart.swap.input_amount / totalInputAmount) * 100).toFixed(2),
        });
      }
      return routes;
    },
  },
  methods: {
    getDexSourceDataByName(name) {
      switch (name) {
        case 'dedust':
          return {
            name: 'DeDust',
            imageUrl: dedustIcon,
          };
        case 'stonfi':
          return {
            name: 'STONfi',
            imageUrl: stonfiIcon,
          };
        case 'stonfi_v2':
          return {
            name: 'STONfi V2',
            imageUrl: stonfiV2Icon,
          };
        case 'coffee':
          return {
            name: 'Coffee',
            imageUrl: coffeeIcon,
          };
        case 'tonco':
          return {
            name: 'TONCO',
            imageUrl: toncoIcon,
          };
        case 'tonstakers':
          return {
            name: 'Tonstakers',
            imageUrl: tonstakersIcon,
          };
        case 'colossus':
          return {
            name: 'Colossus',
            imageUrl: colossusIcon,
          };
        case 'torch_finance':
          return {
            name: 'Torch Finance',
            imageUrl: torchFinanceIcon,
          };
      }
      throw new Error('Unknown DEX source name');
    },
  },
};
