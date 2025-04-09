import dedustIcon from '@/assets/contributors/dedust-icon.png';
import stonfiIcon from '@/assets/contributors/stonfi-icon.png';
import stonfiV2Icon from '@/assets/contributors/stonfi-v2-icon.png';
import toncoIcon from '@/assets/contributors/tonco.png';
import tonstakersIcon from '@/assets/contributors/tonstakers.svg';
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
            imageUrl:
                'https://cdn.swap.coffee/p/LKbSJ2413eBgkVIfIxFQIan7D9qg-L4FADExR_FG8e8/rs:fill:200:200:1/g:no/aHR0cHM6Ly9naXRodWIuY29tL3N3YXAtY29mZmVlL3BpYy9ibG9iL21haW4vc3dhcGNvZmZlZWxvZ28ucG5nP3Jhdz10cnVl.webp',
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
      }
      throw new Error('Unknown DEX source name');
    },
  },
};
