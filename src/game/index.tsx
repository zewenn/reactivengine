/** @field scripts  */
import "./scripts/test";
/** @close scripts  */

import "@/styles/index.css";

import { printf } from "@engine/stdlib";
import { $, Main, Render } from "@engine/stdlib/dom";
import { ipcRenderer } from "electron";
import Ipc_Singals from "../../ipc.config";
import Contexts from "./contexts";
import { Reactivengine } from "@engine/runtime";

Main(async () => {
    window.addEventListener("keydown", (event) => {
        if (event.key === "F12") {
            ipcRenderer.send(Ipc_Singals.Toggle_Developer_Tools);
        }
        if (event.key === "Escape") {
            ipcRenderer.send(Ipc_Singals.Exit_App);
        }
    });

    Reactivengine.Start();

    await Contexts.MyContext2.Load();
});
