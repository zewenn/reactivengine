/** @field scripts  */
import "./scripts/test";
/** @close scripts  */

import "@/styles/index.css";

import { printf } from "@engine/general";
import { $, Main, Render } from "@engine/general/dom";
import { ipcRenderer } from "electron";
import Ipc_Singals from "../../ipc.config";
import { MyContext2 } from "./contexts";


Main(async () => {
    window.addEventListener("keydown", (event) => {
        if (event.key === "F12") {
            ipcRenderer.send(Ipc_Singals.Toggle_Developer_Tools);
        }
        if (event.key === "Escape") {
            ipcRenderer.send(Ipc_Singals.Exit_App);
        }
    });

    await MyContext2.Load();
});