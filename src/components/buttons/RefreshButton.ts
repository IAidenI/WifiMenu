import Gtk from "gi://Gtk?version=4.0";
import GLib from "gi://GLib";

export class RefreshButton {
    widget: InstanceType<typeof Gtk.Button>;
    private icon: InstanceType<typeof Gtk.Image>;

    constructor(onClick: () => void) {
        this.icon = new Gtk.Image({
            icon_name: "view-refresh-symbolic",
            pixel_size: 16
        });
        this.icon.add_css_class("refresh-icon");

        this.widget = new Gtk.Button({
            child: this.icon,
            tooltip_text: "Actualiser"
        });

        this.widget.connect("clicked", () => {
            // Lance l'animation
            this.icon.add_css_class("spinning");

            // Animation durant 600ms
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 600, () => {
                this.icon.remove_css_class("spinning");
                return GLib.SOURCE_REMOVE;
            });

            onClick();
        });
    }
}