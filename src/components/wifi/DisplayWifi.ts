import Gtk from "gi://Gtk?version=4.0";
import Pango from "gi://Pango";
import { WifiInfos } from "../../models/wifi.js";
import { WifiDetails } from "./WifiDetails.js";
import { WifiService } from "../../services/WifiService.js";

export class DisplayWifi {
    widget: InstanceType<typeof Gtk.Box>;
    private lineGrid: InstanceType<typeof Gtk.Grid>;
    // Elements de la ligne
    private nameLabel: InstanceType<typeof Gtk.Label>;
    private secureIcon: InstanceType<typeof Gtk.Label>;
    private signalLabel: InstanceType<typeof Gtk.Label>;
    // Détection du click
    private click: InstanceType<typeof Gtk.GestureClick>;
    // Elements des pour les infos supplémentaires
    private wifiDetails: WifiDetails | null = null;
    private wifiInfos: WifiInfos
    private wifiService: WifiService;

    constructor(wifiInfos: WifiInfos, wifiService: WifiService, onSelect?: (w: WifiInfos, wdg: any) => void) {
        this.widget = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 6,
            halign: Gtk.Align.FILL,
            valign: Gtk.Align.START,
            hexpand: true
        });

        this.wifiService = wifiService;
        this.wifiInfos = wifiInfos;

        this.lineGrid = new Gtk.Grid({
            column_spacing: 12,
            row_spacing: 0,
            halign: Gtk.Align.FILL,
            valign: Gtk.Align.FILL,
            hexpand: true
        });
        this.lineGrid.add_css_class("wifi-list");

        // Le nom du réseau
        this.nameLabel = new Gtk.Label({ label: (this.wifiInfos.connected ? "* " : "") + this.wifiInfos.ssid });
        // Si le ssid est trop long on remplace par des ...
        this.nameLabel.set_single_line_mode(true);
        this.nameLabel.set_ellipsize(Pango.EllipsizeMode.END);
        this.nameLabel.set_max_width_chars(22);
        this.nameLabel.set_xalign(0);
        this.nameLabel.set_hexpand(true);
        this.nameLabel.add_css_class("wifi-list-label");

        // Le cadenas qui représente si le réseau est sécurisé ou non
        this.secureIcon = new Gtk.Image({
            icon_name: this.wifiInfos.secure ? "changes-prevent-symbolic" : "",
            pixel_size: 14,
        });

        if (!this.wifiInfos.secure) {
            this.secureIcon.set_opacity(0); // garde la place, mais invisible
        }

        this.secureIcon.add_css_class("wifi-list-label");
        this.lineGrid.attach(this.secureIcon, 1, 0, 1, 1);

        // La qualité du signal
        this.signalLabel = new Gtk.Label({ label: `${this.wifiInfos.signal}%` });
        this.signalLabel.set_xalign(1);
        this.signalLabel.set_width_chars(5); // réserve la place pour "100%"
        this.signalLabel.add_css_class("wifi-list-label");

        // Ajout à la fenêtre
        this.lineGrid.attach(this.nameLabel, 0, 0, 1, 1);
        this.lineGrid.attach(this.signalLabel, 2, 0, 1, 1);

        // Détecte le click sur la ligne
        this.click = new Gtk.GestureClick();
        this.click.set_button(1);
        this.click.connect("released", () => onSelect?.(this.wifiInfos, this));
        this.lineGrid.add_controller(this.click);

        this.widget.append(this.lineGrid);
    }

    setSelected(selected: boolean) {
        if (selected) {
            this.lineGrid.add_css_class("wifi-list-selected");

            if (!this.wifiDetails) {
                this.wifiDetails = new WifiDetails(this.wifiInfos, this.wifiService, () => {
                    this.lineGrid.remove_css_class("wifi-list-selected");
                    
                    if (this.wifiDetails && this.wifiDetails.widget.get_parent() === this.widget) {
                        this.widget.remove(this.wifiDetails.widget);
                    }
                });
            }

            if (this.wifiDetails.widget.get_parent() !== this.widget) {
                this.widget.append(this.wifiDetails.widget);
            }
        } else {
            this.lineGrid.remove_css_class("wifi-list-selected");

            if (this.wifiDetails && this.wifiDetails.widget.get_parent() === this.widget) {
                this.widget.remove(this.wifiDetails.widget);
            }
        }
    }
}