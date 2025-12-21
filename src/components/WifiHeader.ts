import Gtk from "gi://Gtk?version=4.0";
import { OnOffButton } from "../components/OnOffButton.js";

export class WifiHeader {
    widget: InstanceType<typeof Gtk.Box>;
    status: InstanceType<typeof Gtk.Box>;
    button: OnOffButton

    constructor(active: boolean, onToggle: () => void) {
        // Conteneur principal horizontal
        this.widget = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 8
        });

        // Permet d'avoir un affichage visuel du status
        this.status = new Gtk.Box({
            width_request: 10,
            height_request: 10
        });

        this.widget.append(this.status);

        // Bouton pour se connecter/déconnecté du wifi
        this.button = new OnOffButton(active ? "Wi-Fi activé" : "Wi-Fi désactivé", onToggle);
        this.widget.append(this.button.widget);

        this.setActive(active);
    }

    // Mets à jour le header
    setActive(active: boolean) {
        this.status.remove_css_class("wifi-dot-on");
        this.status.remove_css_class("wifi-dot-off");
        this.status.add_css_class(active ? "wifi-dot-on" : "wifi-dot-off");

        this.button.setLabel(active ? "Wi-Fi activé" : "Wi-Fi désactivé");
    }
}