import {Address} from "@ton/core";
export function toSafeAddress(rawAddress) {
    try {
        if (rawAddress === 'native') {
            return 'TON'
        }
        const address = Address.parseRaw(rawAddress);
        return address.toString({bounceable: true, urlSafe: true});
    } catch (error) {
        console.log(error);
        return null;
    }
}
