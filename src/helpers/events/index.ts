import type { EventAction } from "@/utils/consts.ts";

export const dispatchSdkEvent = (eventName: EventAction, data: unknown) => {
    const event = new CustomEvent(eventName, { detail: data });
    window.dispatchEvent(event);
}
