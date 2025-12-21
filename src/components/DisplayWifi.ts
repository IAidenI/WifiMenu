import Gtk from "gi://Gtk?version=4.0";

export type WifiInfos = {
    ssid: string,
    secure: boolean,
    signal: number,
    connected: boolean // A imlémenter 
};

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
        nameLabel.set_xalign(0);
        nameLabel.set_hexpand(true);
        nameLabel.add_css_class("wifi-list-label");

        const secureIcon = new Gtk.Image({
            icon_name: wifi.secure ? "changes-prevent-symbolic" : "changes-allow-symbolic",
            pixel_size: 14,
        });
        secureIcon.add_css_class("wifi-list-label");

        const signalLabel = new Gtk.Label({
            label: wifi.signal + "%"
        });
        signalLabel.set_xalign(1);
        signalLabel.add_css_class("wifi-list-label");

        // Colonnes fixes
        this.widget.attach(nameLabel, 0, 0, 1, 1);   // SSID
        this.widget.attach(secureIcon, 1, 0, 1, 1);  // Sécurité
        this.widget.attach(signalLabel, 2, 0, 1, 1); // Signal
    }
}