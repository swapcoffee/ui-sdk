export const ReadonlySdkEvent = Object.freeze({
    ROUTE_BUILT: "event_route_built",
    TOKEN_CHANGED: "event_token_changed",
    SWAP_SETTINGS_UPDATED: "event_swap_settings_updated",
    TOKEN_IMPORTED: "event_token_imported",
    TRANSACTIONS_BUILT: "event_transactions_built",
    SWAP_RESULT_RECEIVED: "event_swap_result_received",
} as const);

export type EventAction = (typeof ReadonlySdkEvent)[keyof typeof ReadonlySdkEvent];
