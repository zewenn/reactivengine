import { lambda, printf } from "@engine/stdlib";

export type EventRegister = (executor: PromiseCallback, queue_index?: number) => void;
export type PromiseCallback = lambda<[], Promise<void>>;

namespace Events {
    export const Event_Dict = new Map<string, PromiseCallback[]>([]);

    export function New(event_name: string): EventRegister {
        Event_Dict.set(event_name, []);
        return (cb: PromiseCallback, queue_index?: number) => {
            const Element_Array = Event_Dict.get(event_name);

            if (!Element_Array) {
                printf("!e", "Event wasn't registered!");
                return;
            }

            // const Res_Callback = NewEventCallback(cb);

            if (!queue_index) {
                Element_Array.push(cb);
                return;
            }
            Event_Dict.set(event_name, [
                ...Element_Array.slice(0, queue_index),
                cb,
                ...Element_Array.slice(queue_index),
            ]);
        };
    }

    export async function Call(event_name: string): Promise<void> {
        const PromiseCallbacks = Event_Dict.get(event_name);

        if (!PromiseCallbacks) {
            printf("!e", "Event wasn't registered!");
            return;
        }

        for (const func of PromiseCallbacks) {
            await func();
        }

        // const promises = PromiseCallbacks.map(
        //     (promise_callback) => new Promise<void>(promise_callback)
        // );

        // await Promise.allSettled(promises);
    }

    export function Queue(index: number, Register: EventRegister, Callback: PromiseCallback) {
        Register(Callback, index);
    }
}

export default Events;
