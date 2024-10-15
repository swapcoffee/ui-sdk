import { useDexStore } from "@/stores/dex";
import dedustIcon from "@/assets/contributors/dedust-icon.png";
import stonfiIcon from "@/assets/contributors/stonfi-icon.png";
import stonfiV2Icon from "@/assets/contributors/stonfi-v2-icon.png"

export default {
	computed: {
		dexStore() {
			return useDexStore();
		},
		getRoutes() {
			const paths = this.dexStore.GET_DEAL_CONDITIONS?.paths
			const routes = []
			const totalInputAmount = paths.reduce((sum, current) => sum + current.swap.input_amount, 0)
			console.log('totalInput', totalInputAmount)
			for (const routeStart of paths) {
				const source = this.getDexSourceDataByName(routeStart.dex)
				const tokens = []
				tokens.push(routeStart.input_token.metadata.symbol)

				function traverse(current) {
					tokens.push(current.output_token.metadata.symbol)
					if (current.next?.length > 0) {
						for (const next of current.next) {
							traverse(next)
						}
					}
				}

				traverse(routeStart)
				routes.push({
					dex: source,
					path: tokens.join(' > '),
					inputPercentage: (routeStart.swap.input_amount / totalInputAmount * 100).toFixed(2)
				})
			}
			return routes
		},
	},
	methods: {
		getDexSourceDataByName(name) {
			switch (name) {
				case "dedust":
					return {
						name: "DeDust",
						imageUrl: dedustIcon,
					}
				case "stonfi":
					return {
						name: "STONfi",
						imageUrl: stonfiIcon
					}
				case "stonfi_v2":
					return {
						name: "STONfi V2",
						imageUrl: stonfiV2Icon
					}
			}
			throw new Error("Unknown DEX source name")
		},
	}
}
