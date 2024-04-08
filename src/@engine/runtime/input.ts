import { NotImplemented } from "@engine/stdlib";

namespace Input {
    const KeyMap = new Map<string, boolean>([]);
    const KeyDownMap = new Map<string, boolean>([]);
    const KeyUpMap = new Map<string, boolean>([]);
    
    export function GetKey(key: string): boolean {
        return !!KeyMap.get(key);
    }

    export function GetKeyDown(key: string): boolean {
        return !!KeyDownMap.get(key);
    }
    
    export function GetKeyUp(key: string): boolean {
        return !!KeyUpMap.get(key);
    }

    export const GetMouse = NotImplemented();

    export const GetMouseDown = NotImplemented();

    export const GetMouseUp = NotImplemented();

    export function WindowAwake() {
        window.addEventListener("keydown", (event) => {
            if (!KeyDownMap.get(event.key) && !KeyMap.get(event.key)) {
                KeyDownMap.set(event.key, true);
            }
            if (!KeyMap.get(event.key)) {
                KeyMap.set(event.key, true);
            }
        });
        window.addEventListener("keyup", (event) => {
            if (KeyMap.get(event.key)) {
                KeyMap.set(event.key, false);
            }
            if (!KeyUpMap.get(event.key)) {
                KeyUpMap.set(event.key, true);
            }
        });
    }

    export function WindowTick() {
        KeyDownMap.clear();
        KeyUpMap.clear();
    }
}

export default Input;
