
import { Result, lambda, printf } from "@engine/stdlib";
import { $, $all, GetRoot, IsChildOf, Render } from "@engine/stdlib/dom";
import React, { Context } from "react";
import Events, { EventRegister, PromiseCallback } from "./system";
import Time from "./time";
import Input from "./input";

type PromiseLambda = lambda<
    [res: () => void | PromiseLike<void>, rej: (reason: any) => void],
    void
>;

interface ContextNode {
    Name: string;
    Self: HTMLElement;
    Render: lambda<[tsx: React.ReactNode], void>;
    Query: lambda<[selector: string], Result<HTMLElement, Error>>;
    Load: () => Promise<void>;
    Events: {
        Awake: (executor: PromiseLambda) => void;
        Initalise: (executor: PromiseLambda) => void;
        Tick: (executor: PromiseLambda) => void;
    };
}

interface ScriptProps {
    Render: (tsx: React.ReactNode, to?: HTMLElement) => void;
    Awake: (executor: PromiseLambda) => void;
    Initalise: (executor: PromiseLambda) => void;
    Tick: (executor: PromiseLambda) => void;
}


export namespace Reactivengine {
    let tick_timer: Timer;
    let tick_function: () => void | undefined;

    export function SetTickFunction(Callback: () => void) {
        tick_function = Callback;
    }

    export function Start() {
        Input.WindowAwake();

        tick_timer = setInterval(async () => {
            Time.WindowTick();
            if (tick_function) tick_function();
            Input.WindowTick();
        }, 1);
    }
}

export function Context(name: string): ContextNode {
    // Render(<div className={`context context-${name}`}></div>);
    const Self = document.createElement("div");
    Self.className = `context context-${name}`;

    GetRoot()!.appendChild(Self);

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

                await Events.Call(`Awake-${name}`);
                await Events.Call(`Initalise-${name}`);

                Reactivengine.SetTickFunction(function () {
                    Events.Call(`Tick-${name}`);
                })

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
        Render: (tsx: React.ReactNode, to?: HTMLElement) => {
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
    };
    Callback(props);
}
