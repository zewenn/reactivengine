import { GetRoot } from "@engine/stdlib/dom";
import { Application, Sprite, Assets, ApplicationOptions } from "pixi.js";
import { ComponentStack } from "./items";
import { CastRef, printf } from "@engine/stdlib";
import Time from "./time";
import Input from "./input";
import { Reactivengine } from ".";

namespace PixiBridge {
    export let app_started = false;
    export const App_Instance = new Application();

    /**
     * Map<ComponentStack.identity.id, Sprite>()
     */
    const Sprite_Map = new Map<string, [Sprite, ComponentStack]>([]);

    export async function Start(config: Partial<ApplicationOptions>) {
        await App_Instance.init(
            config ?? {
                resizeTo: window,
            }
        );

        GetRoot().append(App_Instance.canvas);

        app_started = true;

        
        PixiBridge.App_Instance.ticker.add((time) => {
            Time.WindowTick();
            if (!!Reactivengine.tick_function) Reactivengine.tick_function();
            Input.WindowTick();
            Render();
        });
    }

    export async function Register(Item: ComponentStack) {
        if (!Sprite_Map.get(Item.identity.id)) {
            await Assets.load(Item.display.default_sprite);
            Sprite_Map.set(Item.identity.id, [Sprite.from(Item.display.default_sprite), Item]);
            App_Instance.stage.addChild(Sprite_Map.get(Item.identity.id)![0]);
        }
    }

    function Render_SpriteItem_Tuple(Item_Sprite: Sprite, Item: ComponentStack) {
        /**
         * Setting the position
         */
        Item_Sprite.x = Item.transform.position.x;
        Item_Sprite.y = Item.transform.position.y;

        // Item_Sprite.rot
        Item_Sprite.rotation = Item.transform.rotation.z;

        /**
         * Setting the scale
         */
        Item_Sprite.width = Item.transform.scale.x;
        Item_Sprite.height = Item.transform.scale.y;

        /**
         * Anchor
         */
        Item_Sprite.anchor.set(Item.transform.anchor.x, Item.transform.anchor.y);
    }

    export function Render() {
        for (const [key, [Item_Sprite, Item]] of Sprite_Map) {
            Render_SpriteItem_Tuple(Item_Sprite, Item);
        }
    }
}

export default PixiBridge;
