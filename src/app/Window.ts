import Adw from "gi://Adw?version=1";
import GObject from "gi://GObject";
import Gtk from "gi://Gtk?version=4.0";
import { WifiHeader } from "../components/wifi/WifiHeader.js";
import { WifiList } from "../components/wifi/WifiList.js";
import { WifiService } from "../services/WifiService.js";

export const MainWindow = GObject.registerClass(
    class MainWindow extends Adw.ApplicationWindow {
        constructor(app: any) {
            super({
                application: app,
                title: "Wifi Menu",
                default_width: 300,
                default_height: 250,
            });
            this.set_default_size(300, 250);
            this.set_resizable(false);
            this.add_css_class("wifi-window");

            // Local pour l'instant
            let wifi = new WifiService();
            let active = wifi.isActive();

            // Box principal pour l'affichage
            const root = new Gtk.Box({
                orientation: Gtk.Orientation.VERTICAL,
                spacing: 16,
                halign: Gtk.Align.FILL,
                valign: Gtk.Align.FILL,
            });
            root.set_margin_top(12);
            root.set_margin_start(12);
            root.set_margin_end(12);
            root.set_margin_bottom(12);

            // Crée les différents composents
            let header: WifiHeader;

            const list = new WifiList(wifi, (loaded) => {
                header.setRefreshEnabled(wifi && loaded);
            });

            header = new WifiHeader(
                active,
                () => {
                    active ? wifi.disable() : wifi.enable();

                    active = wifi.isActive();

                    header.setActive(active);
                    list.setActive(active);
                },
                () => {
                    list.refresh();
                }
            );

            // Ajoute les composents à la fenêtre
            root.append(header.widget);
            root.append(list.widget);
            this.set_content(root);
        }
    }
);
