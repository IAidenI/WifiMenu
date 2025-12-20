import Adw from "gi://Adw?version=1";
import GObject from "gi://GObject";
import Gtk from "gi://Gtk?version=4.0";
import { WifiHeader } from "../components/WifiHeader.js";
import { WifiList } from "../components/WifiList.js";

export const MainWindow = GObject.registerClass(
    class MainWindow extends Adw.ApplicationWindow {
        constructor(app: any) {
            super({
                application: app,
                title: "Wifi Menu",
                default_width: 300,
                default_height: 200,
            });

            // Local pour l'instant
            let wifi = false;

            // Box principal pour l'affichage
            const root = new Gtk.Box({
                orientation: Gtk.Orientation.VERTICAL,
                spacing: 16,
                halign: Gtk.Align.FILL,
                valign: Gtk.Align.START,
            });
            root.set_margin_top(12);
            root.set_margin_start(12);
            root.set_margin_end(12);
            root.set_margin_bottom(12);

            // Crée les différents composents
            const list = new WifiList(wifi);
            const header = new WifiHeader(wifi, () => {
                wifi = !wifi
                console.log("[DEBUG] Wifi : " + wifi);
                header.setActive(wifi);
                list.setActive(wifi);
            });

            // Ajoute les composents à la fenêtre
            root.append(header.widget);
            root.append(list.widget);
            this.set_content(root);
        }
    }
);
