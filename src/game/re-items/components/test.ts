import { Component } from "@engine/runtime/items";


export interface TestC extends Component {
    message: string
}

export function MakeTestComp(from: TestC | Partial<TestC> | null): TestC {
    return {
        message: from?.message ?? "No message given!"
    };
}