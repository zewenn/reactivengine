
import wojak_sprite from "../../assets/cryingwojak.jpg";
import Contexts from "game/contexts";
import { Script } from "@engine/runtime";
import Items from "@engine/runtime/items";
import { printf } from "@engine/stdlib";
import Input from "@engine/runtime/input";
import Time from "@engine/runtime/time";
import { MakeTestComp } from "game/re-items/components/test";
import { TestExpansion } from "game/re-items/structures/test";

Script(Contexts.MyContext, ({ Awake, Tick }) => {
    Awake(async () => {
        const MyItem = Items.New<TestExpansion>({
            identity: {
                id: "wojak",
            },
            display: {
                default_sprite: wojak_sprite,
            },
            transform: {
                scale: {
                    x: 100,
                    y: 100,
                },
            },
            test: MakeTestComp(null),
        });

        Items.Register(MyItem);

        printf(wojak_sprite);
        printf("MyItem:", MyItem);
    });

    Tick(async () => {
        const [Wojak, Err] = Items.Query<TestExpansion>("wojak");

        if (Err) {
            printf("!w", Err);
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
    });
});
