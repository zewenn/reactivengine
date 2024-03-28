/** @field scripts  */
import "./scripts/test";
/** @close scripts  */

import { printf } from "@engine/general";
import { $, Main, Render } from "@engine/general/dom";
import { ipcRenderer } from "electron";
import Ipc_Singals from "../../ipc.config";
import Start from "@engine/runtime";


import "@/styles/index.css";

Main(async () => {
    window.addEventListener("keydown", (event) => {
        if (event.key === "F12") {
            ipcRenderer.send(Ipc_Singals.Toggle_Developer_Tools);
        }
        if (event.key === "Escape") {
            ipcRenderer.send(Ipc_Singals.Exit_App);
        }
    });

    Start();
});