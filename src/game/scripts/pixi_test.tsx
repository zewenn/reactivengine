import Contexts from "game/contexts";
import { Script } from "@engine/runtime";

import Items, { MakeTransform, Vec2, Vec3 } from "@engine/runtime/items";
import PixiBridge from "@engine/runtime/pixi_bridge";

import wojak_sprite from "../../assets/cryingwojak.jpg";
import { printf } from "@engine/stdlib";
import Input from "@engine/runtime/input";
import Time from "@engine/runtime/time";

Script(Contexts.MyContext, ({ Awake, Tick }) => {
    Awake(async (res, rej) => {
        const MyItem = Items.New(
            wojak_sprite,
            "wojak",
            [],
            MakeTransform({
                position: Vec2(50, 50),
                scale: Vec2(100, 100),
                anchor: Vec2(0.5, 0.5),
            })
        );

        Items.Register(MyItem);

        res();
    });

    Tick(async (res, rej) => {
        const [Wojak, Err] = Items.Query("wojak");

        if (Err) {
            rej(Err);
            return;
        }

        if (Input.GetKey("w")) {
            Wojak.transform.position.y -= 100 * Time.DeltaTime();
        }
        if (Input.GetKey("s")) {
            Wojak.transform.position.y += 100 * Time.DeltaTime();
        }
        if (Input.GetKey("a")) {
            Wojak.transform.position.x -= 100 * Time.DeltaTime();
        }
        if (Input.GetKey("d")) {
            Wojak.transform.position.x += 100 * Time.DeltaTime();
        }

        Wojak.transform.rotation.z += 0.1;
    });
});
