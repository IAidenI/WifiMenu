import Gtk from "gi://Gtk?version=4.0";

export class OnOffButton {
    widget: InstanceType<typeof Gtk.Button>;

    constructor(label: string, onClick: () => void) {
        this.widget = new Gtk.Button({ label });

        this.widget.connect("clicked", () => {
            onClick()
        });
    }

    setLabel(label: string) {
        this.widget.set_label(label);
    }
}