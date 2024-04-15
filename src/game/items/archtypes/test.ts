import Items, { ComponentStack } from "@engine/runtime/items";
import Test from "../components/test";
import { ForceCast } from "@engine/stdlib";

namespace TestArch {
    export interface Type extends ComponentStack {
        test: Test.Type;
    }
    export function New(Item: ComponentStack, msg: string): Type {
        Items.Expand(Item).Attach("test", Test.New(msg));
        return ForceCast<Type>(Item);
    }
}

export default TestArch;