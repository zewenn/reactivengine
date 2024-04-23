import { Option, Result, lambda, printf } from "@engine/stdlib";
import { $, $all, GetRoot, IsChildOf, Render } from "@engine/stdlib/dom";
import React, { Context } from "react";
import Events, { EventRegister } from "./events";
import Time from "./time";
import Input from "./input";
import { Application, Assets, Sprite } from "pixi.js";
import Items, { ItemBase, ItemComponent, Item } from "./items";

interface ContextNode {
    Name: string;
    Self: HTMLElement;
    Render: lambda<[tsx: React.ReactNode], void>;
    Query: lambda<[selector: string], Result<HTMLElement, Error>>;
    Load: () => Promise<void>;
    Events: {
        Awake: EventRegister;
        Initalise: EventRegister;
        Tick: EventRegister;
    };
}

interface ScriptProps {
    /**
     * Renders a React element to the Context.
     * @param tsx
     * @param to
     * @returns
     */
    UI: (tsx: React.ReactNode, to?: HTMLElement) => void;
    Awake: EventRegister;
    Initalise: EventRegister;
    Tick: EventRegister;
    Listen: <K extends keyof HTMLElementEventMap>(
        type: K,
        listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ) => void;
    Blit: <T extends ItemComponent>(item: Item<T>) => void;
}

export namespace Reactivengine {
    let tick_timer: NodeJS.Timer;
    export let tick_function: Option<lambda<[], Promise<void>>>;

    /**
     * PixiBridge
     */
    export const App_Instance = new Application();
    const Sprite_Map = new Map<string, [Sprite, ItemBase]>([]);

    export const Sprite_Item_Context_Map = new Map<
        string,
        Map<string, [Sprite, ItemBase]>
    >([]);
    export let current_context: Option<string>;

    export function SetTickFunction(Callback: () => Promise<void>) {
        tick_function = Callback;
    }

    export async function Start() {
        Input.WindowAwake();

        await App_Instance.init({
            resizeTo: window,
        });

        GetRoot().append(App_Instance.canvas);

        App_Instance.ticker.maxFPS = 240;
        App_Instance.ticker.add(async (time) => {
            Time.WindowTick();
            if (!!Reactivengine.tick_function) await Reactivengine.tick_function();
            Input.WindowTick();
            Render();
        });

        // await PixiBridge.Start({ background: '#1099bb', resizeTo: window });
    }

    export async function RegisterItem(Item: ItemBase, Context_Name: string) {
        if (!Sprite_Item_Context_Map.get(Context_Name)) {
            Sprite_Item_Context_Map.set(
                Context_Name,
                new Map<string, [Sprite, ItemBase]>([])
            );
        }

        const Sprt_Map = Sprite_Item_Context_Map.get(Context_Name)!;

        if (!Sprt_Map.get(Item.identity.id)) {
            await Assets.load(Item.display.default_sprite);
            Sprt_Map.set(Item.identity.id, [
                Sprite.from(Item.display.default_sprite),
                Item,
            ]);
        }
        Render_Sprite_Item_Tuple(
            Sprt_Map.get(Item.identity.id)![0],
            Sprt_Map.get(Item.identity.id)![1]
        );
        App_Instance.stage.addChild(Sprt_Map.get(Item.identity.id)![0]);
    }

    function Render_Sprite_Item_Tuple(Item_Sprite: Sprite, Item: ItemBase) {
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

    function Render() {
        if (!current_context) {
            printf("No current context!");
            return;
        }

        if (!Sprite_Item_Context_Map.get(current_context)) {
            Sprite_Item_Context_Map.set(
                current_context,
                new Map<string, [Sprite, ItemBase]>([])
            );
        }

        const Sprt_Map = Sprite_Item_Context_Map.get(current_context)!;

        // printf(Sprt_Map);

        for (const [key, [Item_Sprite, Item]] of Sprt_Map) {
            Render_Sprite_Item_Tuple(Item_Sprite, Item);
        }
    }
}

export function Context(name: string): ContextNode {
    // Render(<div className={`context context-${name}`}></div>);
    const Self = document.createElement("div");
    Self.className = `context context-${name}`;

    GetRoot().appendChild(Self);

    return {
        Name: name,
        Self: Self,
        Render: (tsx: React.ReactNode) => {
            Render(tsx, Self);
        },
        Query: (selector: string) => {
            const Res = Self.querySelector<HTMLElement>(selector);
            if (!Res) {
                return [null, new Error("Element does not exist!")];
            }
            return [Res, null];
        },
        Load: async () => {
            return new Promise<void>(async (resolve, reject) => {
                const Ctxs = $all(".context");
                for (const Ctx of Ctxs) {
                    Ctx.classList.add("render-off");
                }

                Self.classList.remove("render-off");

                Reactivengine.current_context = name;

                // Reactivengine.App_Instance.stage.removeChildren();

                await Events.Call(`Awake-${name}`);
                await Events.Call(`Initalise-${name}`);

                Reactivengine.SetTickFunction(async function () {
                    await Events.Call(`Tick-${name}`);
                });

                Reactivengine.App_Instance.resizeTo = Self;

                resolve();
            });
        },
        Events: {
            Awake: Events.New(`Awake-${name}`),
            Initalise: Events.New(`Initalise-${name}`),
            Tick: Events.New(`Tick-${name}`),
        },
    };
}

export function Script(
    Ctx: ContextNode,
    Callback: lambda<[props: ScriptProps], void>
): void {
    const props: ScriptProps = {
        UI: (tsx: React.ReactNode, to?: HTMLElement) => {
            if (!to) {
                to = Ctx.Self;
            } else if (!IsChildOf(Ctx.Self, to)) {
                printf(
                    "!e",
                    new Error(
                        `Element couldn't be rendered, since it's not a part of '${Ctx.Name}' context.`
                    )
                );
                return;
            }
            Render(tsx, to);
        },
        Awake: Ctx.Events.Awake,
        Initalise: Ctx.Events.Initalise,
        Tick: Ctx.Events.Tick,
        Listen: <K extends keyof HTMLElementEventMap>(
            ty: K,
            listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
            options?: boolean | AddEventListenerOptions
        ): void => {
            Ctx.Self.addEventListener(ty, listener);
        },
        Blit: <T extends ItemComponent>(item: Item<T>) => {
            Items.Register(item, Ctx.Name);
        },
    };
    Callback(props);
}
