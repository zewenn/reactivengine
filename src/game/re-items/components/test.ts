import { Component } from "@engine/runtime/items";
import { Incomplete } from "@engine/stdlib";


export interface TestComponent extends Component {
    message: string
}

export function MakeTestComp(from: Incomplete<TestComponent>): TestComponent {
    return {
        message: from?.message ?? "No message given!"
    };
}