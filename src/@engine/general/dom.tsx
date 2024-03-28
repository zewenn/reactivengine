import React, { useEffect } from "react";
import { Option, Result, lambda, printf, Silence } from ".";
import { renderToString } from "react-dom/server";
import { IS_BROWSER_PROCESS, IsBrowser } from ".";

export function Main(Callback: lambda) {
    if (IsBrowser()) {
        window.addEventListener("load", Callback);
        return;
    }
    printf(
        "!e",
        "Using Main without an HTML-DOM is not recommended.",
        "Most functions from @engine/dom will break!"
    );
    Callback();
}

export function $<T extends HTMLElement>(selector: string): Result<T, Error> {
    if (!IsBrowser()) return [null, new Error("Not browser environment!")];

    const r = document.querySelector<T>(selector);
    if (!r) {
        return [null, new Error("Element missing!")];
    }
    return [r, null];
}

let root: HTMLElement;
export function GetRoot(): HTMLElement {
    if (!root) {
        let [rt, err] = $(".root");
        if (err) {
            const x = document.createElement("div");
            x.classList.add("root");
            document.body.appendChild(x);
            rt = x;
        }
        root = rt!;
    }
    return root;
}

export function $all<T extends HTMLElement>(selector: string): T[] {
    const Query_Result = document.querySelectorAll<T>(selector);
    return Array.from(Query_Result);
}

export function Render(tsx: React.ReactNode, to?: HTMLElement) {
    if (!to) to = GetRoot();

    const el = document.createElement("div");
    el.innerHTML = renderToString(tsx);

    for (const child of el.children) {
        to.appendChild(child);
    }
}

export function IsChildOf(parent: HTMLElement, child: HTMLElement) {
    return !!parent.querySelector(child.className);
}

export interface BoundingBox {
    x: number;
    y: number;
    top: number;
    left: number;
    width: number;
    height: number;
}

function ProcessClassName(cls: string): string[] {
    return cls.split(" ");
}

export function IsClassName<T extends HTMLElement>(element: T, cls: string): boolean {
    const className = ProcessClassName(cls);
    for (let c in className) {
        if (!element.classList.contains(c)) {
            return false;
        }
    }
    return true;
}

export function SetCSS<T extends HTMLElement>(element: T, property: string, value: any): void {
    element.style.setProperty(property, `${value}`);
}

export function GetProperty<T extends HTMLElement>(
    element: T,
    property: string
): Result<string, Error> {
    const value = element.computedStyleMap().get(property);
    /* istanbul ignore next */
    if (!value) return [null, new Error("Property not found!")];
    /* istanbul ignore next */
    return [value.toString(), null];
}

export function GetScale<T extends HTMLElement>(element: T): number {
    const [scale, err] = GetProperty(element, "scale");
    if (err) {
        return 1;
    }
    return parseFloat(scale!);
}

export function GetBounds<T extends HTMLElement>(element: T): BoundingBox {
    return {
        x: element.offsetLeft,
        y: element.offsetTop,
        left: element.offsetLeft,
        top: element.offsetTop,
        width: element.offsetWidth,
        height: element.offsetHeight,
    };
}
