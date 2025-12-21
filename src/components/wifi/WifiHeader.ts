import Gtk from "gi://Gtk?version=4.0";
import { OnOffButton } from "../buttons/OnOffButton.js";
import { RefreshButton } from "../buttons/RefreshButton.js";

export class WifiHeader {
    widget: InstanceType<typeof Gtk.Grid>;
    private left: InstanceType<typeof Gtk.Box>;
    private status: InstanceType<typeof Gtk.Box>;
    private button: OnOffButton;
    private refresh: RefreshButton;

    constructor(active: boolean, onToggle: () => void, onRefresh: () => void) {
        // Conteneur principal horizontal
        this.widget = new Gtk.Grid({
            column_spacing: 12,
            row_spacing: 0,
            hexpand: true,
            halign: Gtk.Align.FILL,
            valign: Gtk.Align.CENTER
        });

        this.left = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 8,
            hexpand: true,
            halign: Gtk.Align.START
        });

        // Permet d'avoir un affichage visuel du status
        this.status = new Gtk.Box({
            width_request: 10,
            height_request: 10
        });

        this.left.append(this.status);

        // Bouton pour se connecter/déconnecté du wifi
        this.button = new OnOffButton(active ? "Wi-Fi activé" : "Wi-Fi désactivé", onToggle);
        this.left.append(this.button.widget);

        this.widget.attach(this.left, 0, 0, 1, 1);

        // Ajoute le bouton pour rafraîchir
        this.refresh = new RefreshButton(onRefresh);
        this.refresh.widget.set_halign(Gtk.Align.END);
        this.refresh.widget.set_sensitive(false);
        this.widget.attach(this.refresh.widget, 1, 0, 1, 1);
        

        this.setActive(active);
    }

    // Mets à jour le header
    setActive(active: boolean) {
        this.status.remove_css_class("wifi-dot-on");
        this.status.remove_css_class("wifi-dot-off");
        this.status.add_css_class(active ? "wifi-dot-on" : "wifi-dot-off");

        this.button.setLabel(active ? "Wi-Fi activé" : "Wi-Fi désactivé");
    }

    setRefreshEnabled(enable: boolean) {
        this.refresh.widget.set_sensitive(enable);
    }
}