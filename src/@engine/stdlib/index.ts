/**
 * Basic definition of an arrow function or lambda
 */
export type lambda<T extends any[] = any[], R = any> = (...args: T) => R;

/**
 * A function which returns a `Result<T, Err>` value will always return, even if it encountered an error.
 * When the function wants to throw an error, the error will be returned.
 */
export type Result<T, Err extends Error> = [T, null] | [null, Err];

/**
 * A function which returns a `Option<T>` might return `undefined`.
 */
export type Option<T> = T | undefined;

/**
 * An object or a Patrial object or null
 */
export type Incomplete<T extends object> = T | Partial<T> | null;

/**
 * Never is a phantom which helps defining types
 */
export type Never = { __phantom__: "Never" };

/**
 * A function which returns a `Volatile<T>` value might not return, and it can call `PANIC` instead.
 */
export type Volatile<T> = T | Never;

/**
 * A value marked as `Ref` is also used somewhere else in the codebase. If changed, it will change everywhere.
 */
export type Ref<T extends object> = T & { __phantom__: "Reference" };

/**
 * A value marked as `Val` is a duplicate of another value; use this as you wish since it won't break anything.
 */
export type Val<T> = T & { __phantom__: "Value" };

export type Matcher<T extends string | number | symbol> = {
    [key in T]: any;
} & {
    _: any;
};

type MissingKeys<T extends K, K> = Pick<T, Exclude<keyof T, keyof K>>;

export let IS_BROWSER_PROCESS: boolean | undefined = undefined;
const Func_Cache: Map<lambda, Map<string, any>> = new Map<lambda, Map<string, any>>([]);

/**
 *
 * @returns
 */
export function IsBrowser(): boolean {
    if (IS_BROWSER_PROCESS !== undefined) return IS_BROWSER_PROCESS;
    try {
        if (document && window) {
            IS_BROWSER_PROCESS = true;
            return true;
        }
    } catch {
        IS_BROWSER_PROCESS = false;
        return false;
    }
    IS_BROWSER_PROCESS = false;
    return false;
}

/**
 * # printf
 * Bassic binding to `console.log` for easier use. If used without special params, just calls `console.log`.
 * ## Warn
 * If the `"!w"` flag is used `console.warn` will be called.
 * ## Error
 * If the `"!e"` flag is used `console.error` will be called.
 */
export const printf = (...message: any[]) => {
    const colouring = !IsBrowser();

    if (message.includes("!w")) {
        message.splice(message.indexOf("!w"), 1);
        if (colouring) message = ["[Warn]\x1b[33m", ...message, "\x1b[0m"];
        console.warn(...message);
        return;
    }
    if (message.includes("!e")) {
        message.splice(message.indexOf("!e"), 1);
        if (colouring) message = ["[Error]\x1b[35m", ...message, "\x1b[0m"];
        console.error(...message);
        return;
    }
    console.log(...message);
};

/**
 * Stop the program from executing by throwing an error.
 * @param msg
 */
export function PANIC<T extends Error>(msg: T): Never {
    throw msg;
}

/**
 * Cast a value as `T` but only if the value's type is a subset of the generic `T` type.
 */
export function Cast<T>(x: Partial<T> | T) {
    return x as T;
}

/**
 * Ignore any type concerns and cast x as `T` no matter what.
 */
export function ForceCast<T>(x: any) {
    return x as unknown as T;
}

/**
 * Converts from a type (**F**) to another type (**T**), but only if **T** extends **F**
 * ### Note:
 * This will extend the original object!
 * @param obj The object you wish to convert cast
 * @param missing The missing keys of the new object type
 * @returns
 */
export function ConvertCast<F, T extends F>(obj: F, missing?: MissingKeys<T, F>) {
    const res: T = <T>obj;
    if (missing) {
        for (const key in missing) {
            res[key] = missing[key];
        }
    }
    return res;
}

/**
 * Marks a value as a `Ref` to explicitly state that it will change somewhere else.
 * @param value
 * @returns
 */
export function CastRef<T extends Object | Function>(value: T): Ref<T> {
    return ForceCast<Ref<T>>(value);
}

/**
 * Creates a `structuredClone` of the object and cast it as `Val` to explicitly state that
 * this variable is only a value and won't change anywhere else.
 *
 * If the value is an `HTMLElement`, the clone is created with a different approach. 
 * This is done using the `element.cloneNode()` function.
 * @param value
 * @returns
 */
export function CastVal<T>(value: T): Val<T> {
    if (typeof value === "function") {
        return ForceCast<Val<T>>(value);
    }

    if (value instanceof HTMLElement) {
        return ForceCast<Val<T>>(value.cloneNode());
    }
    
    return ForceCast<Val<T>>(structuredClone(value));
}

/**
 * Match a value to an object's keys. If no key is valid the function returns the default one (`_`).
 * @param val
 * @param to
 * @returns
 */
export function Match<T extends string | number | symbol>(val: T, to: Matcher<T>) {
    if (!to[val]) {
        return to["_"];
    }
    return to[val];
}

/**
 * Silences the common outputs (log, warn, error) of a function
 * @param cb
 */
export function Silence(cb: lambda) {
    const log = console.log;
    const wrn = console.warn;
    const err = console.error;
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    cb();
    console.log = log;
    console.warn = wrn;
    console.error = err;
}

/**
 * Create a chached lambda for faster runtime
 * @version alpha
 * @param cb
 * @returns
 */
export function Cache<T extends any[], R>(cb: lambda<T, R>): lambda<T, Val<R>> {
    if (!Func_Cache.get(cb)) Func_Cache.set(cb, new Map<string, any>([]));

    return (...args: T): Val<R> => {
        const argstr = args.join("-");

        if (Func_Cache.get(cb)!.get(argstr)) return CastVal(Func_Cache.get(cb)!.get(argstr));

        const res = cb(...args);
        Func_Cache.get(cb)!.set(argstr, res);
        return CastVal(res);
    };
}


export function NotImplemented() {
    function Res() {
        printf("!e", new Error(`This function is not implemented!`));
        return new Error("Not Implemented!");
    }

    return Res;
}