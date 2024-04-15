import { Cast, CastRef, ForceCast, Ref, Result } from "@engine/stdlib";
import { Reactivengine } from ".";

export interface Vector2 {
    x: number;
    y: number;
}

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface Component {
    component_name: string;
    [key: string]: any;
}

export interface Identity extends Component {
    component_name: "identity";
    id: string;
    name: string[];
}

export interface Transform extends Component {
    component_name: "transform";
    position: Vector2;
    rotation: Vector3;
    scale: Vector2;
    anchor: Vector2;
    pivot: Vector2;
}

export interface Display extends Component {
    component_name: "display";
    default_sprite: string;
}

/**
 * A component stack or an *"item"* is the building block of the rendering, and data handling
 * Using an **ECS** (entity component system) allows the developer to make unique object without
 * using a lot of memory.
 */
export interface ComponentStack {
    identity: Identity;
    transform: Transform;
    display: Display;
    [key: string]: Component;
}

export function Vec2(x: number = 0, y: number = 0): Vector2 {
    return {
        x: x,
        y: y,
    };
}
export function Vec3(x: number = 0, y: number = 0, z: number = 0): Vector3 {
    return {
        x: x,
        y: y,
        z: z,
    };
}

export function MakeTransform(
    transform: Transform | Partial<Transform> | null
): Transform {
    return {
        component_name: "transform",
        position: transform?.position ?? Vec2(),
        rotation: transform?.rotation ?? Vec3(),
        scale: transform?.scale ?? Vec2(),
        anchor: transform?.anchor ?? Vec2(),
        pivot: transform?.pivot ?? Vec2(),
    };
}

export namespace Items {
    const Registered = new Map<string, ComponentStack>([]);

    /**
     * Create a new ComponentStack with the given parameters;
     * Optional ones default to 0 or []
     * @param default_sprite_url
     * @param id
     * @param name
     * @param transform
     * @returns
     */
    export function New(
        default_sprite_url: string,
        id: string,
        name?: string[],
        transform?: Transform
    ): ComponentStack {
        return {
            identity: {
                component_name: "identity",
                id: id,
                name: name ?? [],
            },
            transform: transform ?? MakeTransform({}),
            display: {
                component_name: "display",
                default_sprite: default_sprite_url,
            },
        };
    }

    export function Register(Item: ComponentStack) {
        Registered.set(Item.identity.id, Item);
        Reactivengine.RegisterItem(Item);
    }

    export function Expand(Item: ComponentStack) {
        function Attach(New_Component: Component) {
            Item[New_Component.component_name] = New_Component;
            return { Attach };
        }
        return {
            Attach,
        };
    }

    export function Query<T extends ComponentStack>(id: string): Result<Ref<T>, Error> {
        const Query_Res = Registered.get(id);
        if (!Query_Res) {
            return [null, new Error("The selected Item does not exist")];
        }
        return [CastRef(ForceCast<T>(Query_Res)), null];
    }
}

export default Items;
