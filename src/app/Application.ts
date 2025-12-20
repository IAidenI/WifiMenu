import Adw from "gi://Adw?version=1";
import GObject from "gi://GObject";
import { MainWindow } from "./Window.js";

export const WifiMenuApplication = GObject.registerClass(
    class WifiMenuApplication extends Adw.Application {
        constructor() {
            super({ application_id: "io.yourname.WifiMenu" });
        }

        vfunc_activate(): void {
            const win = new MainWindow(this);
            win.present();
        }
    }
);
