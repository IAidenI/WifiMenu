import Gtk from "gi://Gtk?version=4.0";
import { IconButton } from "../buttons/IconButton.js";

export class Password {
    widget: InstanceType<typeof Gtk.Box>;
    private passwordInput: InstanceType<typeof Gtk.Entry>;
    private validateButton: IconButton;
    private cancelButton: IconButton;

    constructor(placeholder_text: string, onValidate: () => void, onCancel: () => void) {
        this.widget = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 2,
            halign: Gtk.Align.START,
            valign: Gtk.Align.START
        });
        
        this.passwordInput = new Gtk.Entry({
            visibility: false,
            hexpand: true,
            placeholder_text: placeholder_text
        });

        this.passwordInput.connect("activate", onValidate);

        this.validateButton = new IconButton("emblem-ok-symbolic", 14, onValidate);
        this.cancelButton = new IconButton("window-close-symbolic", 14, onCancel);

        this.widget.append(this.passwordInput);
        this.widget.append(this.validateButton.widget);
        this.widget.append(this.cancelButton.widget);
    }

    getValue(): string {
        return this.passwordInput.get_text() || "";
    }
}