import Gtk from "gi://Gtk?version=4.0";
import { IconButton } from "../buttons/IconButton.js";

export class EnterpriseAuth {
  widget: InstanceType<typeof Gtk.Box>;
  private userInput: InstanceType<typeof Gtk.Entry>;
  private passInput: InstanceType<typeof Gtk.Entry>;
  private validateButton: IconButton;
  private cancelButton: IconButton;

  constructor(
    onValidate: (username: string, password: string) => void,
    onCancel: () => void
  ) {
    this.widget = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 4,
      halign: Gtk.Align.START,
      valign: Gtk.Align.START
    });

    this.userInput = new Gtk.Entry({
      hexpand: true,
      placeholder_text: "Username"
    });

    this.passInput = new Gtk.Entry({
      hexpand: true,
      visibility: false,
      placeholder_text: "Password"
    });

    const validate = () =>
      onValidate(this.userInput.get_text() || "", this.passInput.get_text() || "");

    this.userInput.connect("activate", validate);
    this.passInput.connect("activate", validate);

    this.validateButton = new IconButton("emblem-ok-symbolic", 14, validate);
    this.cancelButton = new IconButton("window-close-symbolic", 14, onCancel);

    this.widget.append(this.userInput);
    this.widget.append(this.passInput);
    this.widget.append(this.validateButton.widget);
    this.widget.append(this.cancelButton.widget);
  }
}
