import { TestComponent } from "../components/test";
import { ItemComponent } from "@engine/runtime/items";

export interface TestExpansion extends ItemComponent {
    test: TestComponent
}