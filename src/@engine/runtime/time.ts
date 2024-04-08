namespace Time {
    let current = Date.now();
    let last_frame_at = Date.now();

    export function WindowTick() {
        last_frame_at = current;
        current = Date.now();
    }

    export function Now() {
        return current;
    }

    export function DeltaTime() {
        return (current - last_frame_at) * 0.001;
    }
}

export default Time;