import { Script } from "@engine/runtime";
import Contexts from "../contexts";
import { printf } from "@engine/stdlib";
import Input from "@engine/runtime/input";

Script(Contexts.MyContext, ({ Awake, Initalise, Tick, Render }) => {
    Awake((res, rej) => {
        printf("Awake");
        Render(<div>Rendered from script awake</div>);
        res();
    });
});

Script(Contexts.MyContext2, ({ Awake, Initalise, Tick, Render, Listen }) => {
    Awake((res, rej) => {
        printf("Awake");
        Render(
            <div>
                Rendered from <code>Awake</code>
            </div>
        );
        Listen("mousedown", (event) => {
            printf(event.clientX, event.clientY);
        });
        res();
    });

    Initalise((res, rej) => {
        Render(
            <div>
                Renedered from <code>Initalise</code>
            </div>
        );
        res();
    });

    Tick((res, rej) => {
        if (Input.GetKey("a")) {
            printf("GetKey Works");
        }
        if (Input.GetKeyDown("s")) {
            printf("GetKeyDown Works");
        }
        if (Input.GetKeyUp("d")) {
            printf("GetKeyUp Works");
        }
        res();
    });
});
