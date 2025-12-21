import Gtk from "gi://Gtk?version=4.0";

export class IconButton {
    widget: InstanceType<typeof Gtk.Button>;
    private icon: InstanceType<typeof Gtk.Image>;

    constructor(icon: string, onClick: () => void) {
        this.icon = new Gtk.Image({
            icon_name: icon,
            pixel_size: 16
        });

        this.widget = new Gtk.Box({
            child: this.icon
        });

        this.widget.connect("cliecked", () => {
            onClick()
        });
    }

    setIcon(icon: string) {
        this.icon.set_icon_name(icon);
    }
}