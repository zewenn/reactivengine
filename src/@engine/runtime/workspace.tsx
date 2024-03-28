/**
 *
 * Script({
 *      use: MyContext,
 *      Awake: (res, rej) => {},
 *      Initalise: (res, rej) => {},
 *      Tick: (rej, rej) => {},
 *      Update: (res, rej) => {},
 * }).Bind(Scenes.Main)
 *
 *
 * Context.New()
 *
 */

import { Result, lambda, printf } from "@engine/general";
import { $, GetRoot, IsChildOf, Render } from "@engine/general/dom";
import React, { Context } from "react";
import SystemEvents from "./system";

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

let tick_timer: NodeJS.Timeout;

export function Context(name: string): ContextNode {
    // Render(<div className={`context context-${name}`}></div>);
    const Self = document.createElement("div");
    Self.className = `context context-${name}`;

    GetRoot()!.appendChild(Self);

    return {
        Name: name,
        Self: Self!,
        Render: (tsx: React.ReactNode) => {
            Render(tsx, Self!);
        },
        Query: (selector: string) => {
            const Res = Self!.querySelector<HTMLElement>(selector);
            if (!Res) {
                return [null, new Error("Element does not exist!")];
            }
            return [Res, null];
        },
        Load: async () => {
            return new Promise<void>(async (resolve, reject) => {
                await SystemEvents.Call(`Awake-${name}`);
                await SystemEvents.Call(`Initalise-${name}`);

                if (tick_timer) clearInterval(tick_timer);
                tick_timer = setInterval(async () => {
                    SystemEvents.Call(`Tick-${name}`);
                }, 1);

                resolve();
            });
        },
        Events: {
            Awake: SystemEvents.New(`Awake-${name}`),
            Initalise: SystemEvents.New(`Initalise-${name}`),
            Tick: SystemEvents.New(`Tick-${name}`),
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
