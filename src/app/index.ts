import ElectronWindow, { IpcMainEventFn } from "../@engine/general/electron";
import Ipc_Singals from "@/../ipc.config";

const Window = new ElectronWindow("", "windowed-fullscreen", {
    width: 1600,
    height: 900,
});

Window.Bind(
    new Map<string, IpcMainEventFn>([
        [
            Ipc_Singals.Exit_App,
            () => {
                if (!Window.browser_window) return;
                Window.browser_window.close();
            },
        ],
        [
            Ipc_Singals.Toggle_Developer_Tools,
            () => {
                if (!Window.browser_window) return;
                if (Window.browser_window.webContents.isDevToolsOpened()) {
                    Window.browser_window.webContents.closeDevTools();
                    return;
                }
                Window.browser_window.webContents.openDevTools();
            },
        ],
        [
            Ipc_Singals.Reload,
            () => {
                if (!Window.browser_window) return;
                Window.browser_window.reload();
            },
        ],
    ])
);

Window.Init();
Window.browser_window?.webContents.setFrameRate(120);