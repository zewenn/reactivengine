import { Script } from "@engine/runtime/workspace";
import { MyContext } from "@engine/runtime";
import { printf } from "@engine/general";

Script(MyContext, ({ Awake, Initalise, Tick, Render }) => {
    Awake((res, rej) => {
        printf("Awake")
        Render( <div>Rendered from script awake</div> );
        res();
    });
    Tick((res, rej) => {
        printf("Tick");
        res();
    });
});
