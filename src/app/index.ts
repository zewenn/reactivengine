import Application from "@engine/stdlib/application";
import Ipc_Singals from "@/../ipc.config";

Application.Use({
    width: 1600,
    height: 900,
    webPreferences: {
        backgroundThrottling: false,
        nodeIntegration: true,
        contextIsolation: false,
        offscreen: false
    },
    frame: false,
    fullscreen: false
})

Application.Bind({
    [Ipc_Singals.Toggle_Developer_Tools]: () => {
        if (!Application.Window) return;
        if (Application.Window.webContents.isDevToolsOpened()) {
            Application.Window.webContents.closeDevTools();
            return;
        }
        Application.Window.webContents.openDevTools();
    },
    [Ipc_Singals.Exit_App]: () => {
        if (!Application.Window) return;
        Application.Window.close();
    }
});


Application.Ready((Window) => {
    Window.webContents.setFrameRate(240);
});