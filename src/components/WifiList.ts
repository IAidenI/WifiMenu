import GLib from "gi://GLib";
import Gtk from "gi://Gtk?version=4.0";
import { DisplayWifi, WifiInfos } from "./DisplayWifi.js";

export class WifiList {
    widget: InstanceType<typeof Gtk.Box>
    private scanSourceId: number | null = null; // ID du timer GLib utilisé pour simuler le scan Wi-Fi

    constructor(active: boolean) {
        // Conteneur principal vertical
        this.widget = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 3,
            halign: Gtk.Align.FILL,
            valign: Gtk.Align.FILL,
        });

        // Applique l’état initial
        this.setActive(active);
    }

    // Mets à jour la liste des wifis
    setActive(active: boolean) {
        if (active) this.startScan();
        else {
            this.stopScan();
            this.setWifiOff();
        }
    }

    // Supprime tous les widgets enfants de la liste
    private clear() {
        let child = this.widget.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            this.widget.remove(child);
            child = next;
        }
    }

    // Arrête un scan Wi-Fi en cours (annule le timer GLib)
    private stopScan() {
        if (this.scanSourceId !== null) {
            GLib.Source.remove(this.scanSourceId);
            this.scanSourceId = null;
        }
    }

    // Lance un scan Wi-Fi (mocké avec un timeout)
    private startScan() {
        this.stopScan();
        this.setLoading();

        // Des wifis random
        const wifi1: WifiInfos = {
            ssid: "OnePlus Nord 2T",
            secure: true,
            signal: 85,
            connected: true
        };
        const wifi2: WifiInfos = {
            ssid: "SFR_F8C8",
            secure: true,
            signal: 68,
            connected: false
        };
        const wifi3: WifiInfos = {
            ssid: "eduroam",
            secure: false,
            signal: 45,
            connected: false
        };

        this.scanSourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 3000, () => {
            this.setNetworks([wifi1, wifi2, wifi3]);
            this.scanSourceId = null;
            return GLib.SOURCE_REMOVE;
        });
    }

    // Affiche la liste des réseaux Wi-Fi trouvés
    private setNetworks(networks: WifiInfos[]) {
        this.clear();

        if (networks.length === 0) {
            this.widget.append(new Gtk.Label({ label: "Aucun réseau trouvé" }));
            return;
        }

        for (const n of networks) {
            this.widget.append(new DisplayWifi(n).widget);
        }
    }

    // Affiche l’état "Recherche des Wi-Fi" avec un spinner
    private setLoading(text = "Recherche des Wi-Fi…") {
        this.clear();

        const row = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 10,
            halign: Gtk.Align.START,
            valign: Gtk.Align.CENTER,
        });

        const spinner = new Gtk.Spinner();
        spinner.start();

        const label = new Gtk.Label({
            label: text,
            halign: Gtk.Align.START,
        });

        row.append(spinner);
        row.append(label);

        this.widget.append(row);
    }

    // Affiche l’état "Wi-Fi désactivé" avec icône et texte centré
    private setWifiOff() {
        this.clear();

        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 12,
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER,
        });

        const icon = new Gtk.Image({
            icon_name: "network-wireless-offline-symbolic",
            pixel_size: 64,
        });

        const label = new Gtk.Label({
            label: "Wi-Fi désactivé",
            halign: Gtk.Align.CENTER,
        });

        label.add_css_class("dim-label");

        box.append(icon);
        box.append(label);

        this.widget.append(box);
    }
}