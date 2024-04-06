import { Script } from "@engine/runtime";
import Contexts from "../contexts";
import { printf } from "@engine/general";
import Time from "@engine/runtime/time";

Script(Contexts.MyContext, ({ Awake, Initalise, Tick, Render }) => {
    Awake((res, rej) => {
        printf("Awake");
        Render(<div>Rendered from script awake</div>);
        res();
    });
});

Script(Contexts.MyContext2, ({ Awake, Initalise, Tick, Render }) => {
    Awake((res, rej) => {
        printf("Awake");
        Render(
            <div>
                Rendered from <code>Awake</code>
            </div>
        );
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
        printf(Time.DeltaTime());
        res();
    });
});
