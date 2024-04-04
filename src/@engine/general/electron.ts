import { app, BrowserWindow, Menu, ipcMain, IpcMainEvent, webFrameMain } from "electron";
import { lambda, printf } from ".";

namespace Application {
    export type IpcMainEventFn = (event?: IpcMainEvent, ...args: any[]) => void;

    interface EventBinds {
        [key: string]: IpcMainEventFn;
    }

    export let Window: BrowserWindow | undefined;
    const IPC_Events = new Map<string, IpcMainEventFn>()
    const Ready_Callbacks: lambda<[BrowserWindow: BrowserWindow], void>[] = [];

    export function Ready(Callback: lambda<[BrowserWindow: BrowserWindow], void>) {   
        Ready_Callbacks.push(Callback);
    }

    export function Bind(events: EventBinds) {
        for (const key in events) {
            const value = events[key];

            IPC_Events[key] = value;
            if (key.startsWith("once:")) {
                ipcMain.once(key, value);
                continue;
            }
            ipcMain.on(key, value);
        }
    }

    export function Initalise(ConstructorOptions: Electron.BrowserWindowConstructorOptions) {
        const NewBrowserWindow = () => {
            Window = new BrowserWindow(ConstructorOptions);
            Menu.setApplicationMenu(null);
            Window.loadFile('index.html');
            return Window;
        };

        app.whenReady().then(() => {
            const Win = NewBrowserWindow();
            for (const Callback of Ready_Callbacks) {
                Callback(Win);
            }
        });
        
        app.on('window-all-closed', () => {
            app.quit();
            console.log("\r\n");
        })
    }
}

export default Application;