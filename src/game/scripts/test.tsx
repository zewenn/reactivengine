import { Script } from "@engine/runtime";
import { MyContext, MyContext2 } from "../contexts";
import { printf } from "@engine/general";

Script(MyContext, ({ Awake, Initalise, Tick, Render }) => {
    Awake((res, rej) => {
        printf("Awake")
        Render( <div>Rendered from script awake</div> );
        res();
    });
});

Script(MyContext2, ({ Awake, Initalise, Tick, Render }) => {
    Awake((res, rej) => {
        printf("Awake")
        Render( <div>Rendered from script awake2</div> );
        res();
    });
});
