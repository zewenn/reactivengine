
import { Component } from "@engine/runtime/items";

namespace Test {
    export interface Type extends Component {
        message: string;
    }
    export function New(message?: string): Type {
        return {
            message: message ?? "hello world",
        };
    }
}

export default Test;
