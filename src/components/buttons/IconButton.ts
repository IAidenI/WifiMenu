import Gtk from "gi://Gtk?version=4.0";

export class IconButton {
    widget: InstanceType<typeof Gtk.Button>;
    private icon: InstanceType<typeof Gtk.Image>;

    constructor(icon: string, pixel_size: number, onClick: () => void) {
        this.icon = new Gtk.Image({
            icon_name: icon,
            pixel_size: pixel_size
        });

        this.widget = new Gtk.Button({ child: this.icon });

        this.widget.connect("clicked", onClick);
    }

    setIcon(icon: string) {
        this.icon.set_icon_name(icon);
    }
}