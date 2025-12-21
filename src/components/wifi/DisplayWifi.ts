import Gtk from "gi://Gtk?version=4.0";
import Pango from "gi://Pango";
import { WifiInfos } from "../../models/wifi";

export class DisplayWifi {
    widget: InstanceType<typeof Gtk.Box>;

    constructor(wifi: WifiInfos) {
        this.widget = new Gtk.Grid({
            column_spacing: 12,
            row_spacing: 0,
            halign: Gtk.Align.FILL,
            valign: Gtk.Align.CENTER
        });
        this.widget.set_hexpand(true);
        this.widget.add_css_class("wifi-list");

        const nameLabel = new Gtk.Label({
            label: wifi.ssid
        });
        // Si le ssid est trop long on remplace par des ...
        nameLabel.set_single_line_mode(true);
        nameLabel.set_ellipsize(Pango.EllipsizeMode.END);
        nameLabel.set_max_width_chars(22);
        nameLabel.set_xalign(0);
        nameLabel.set_hexpand(true);
        nameLabel.add_css_class("wifi-list-label");

        if (wifi.secure) {
            const secureIcon = new Gtk.Image({
                icon_name: "changes-prevent-symbolic",
                pixel_size: 14,
            });
            secureIcon.add_css_class("wifi-list-label");
            this.widget.attach(secureIcon, 1, 0, 1, 1);
        }

        const signalLabel = new Gtk.Label({
            label: wifi.signal + "%"
        });
        signalLabel.set_xalign(1);
        signalLabel.add_css_class("wifi-list-label");

        // Colonnes fixes
        this.widget.attach(nameLabel, 0, 0, 1, 1);   // SSID
        this.widget.attach(signalLabel, 2, 0, 1, 1); // Signal
    }
}