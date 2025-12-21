import GLib from "gi://GLib";
import Gtk from "gi://Gtk?version=4.0";
import { WifiInfos } from "../../models/wifi.js";
import { DisplayWifi } from "./DisplayWifi.js";
import { WifiService } from "../../services/WifiService.js";

export class WifiList {
    widget: InstanceType<typeof Gtk.ScrolledWindow>
    private listBox: InstanceType<typeof Gtk.ListBox>;
    private wifi: WifiService;
    private loaded: boolean;
    private onLoadedChange?: (loaded: boolean) => void;
    private scanId = 0;

    constructor(wifi: WifiService, onLoadedChange?: (loaded: boolean) => void) {
        // Conteneur principal vertical
        this.widget = new Gtk.ScrolledWindow({
            hexpand: true,
            vexpand: true,
            hscrollbar_policy: Gtk.PolicyType.NEVER,
            vscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
        });
        this.widget.set_propagate_natural_height(false);

        this.listBox = new Gtk.ListBox({
            selection_mode: Gtk.SelectionMode.NONE,
            hexpand: true,
            vexpand: true,
        });
        this.listBox.add_css_class("wifi-listbox");
        this.widget.set_child(this.listBox);

        this.wifi = wifi;
        this.loaded = false;
        this.onLoadedChange = onLoadedChange;

        // Applique l’état initial
        this.setActive(this.wifi.isActive());
    }

    // Mets à jour la liste des wifis
    setActive(active: boolean) {
        if (active) this.startScan();
        else {
            this.setWifiOff();
            this.setLoaded(false);
        }
    }

    // Rafraichit la liste avec un nouveau scan
    refresh() {
        if (!this.loaded) return;
        this.startScan();
    }

    // Mets à jour le flag pour savoir si les données sont chargés
    private setLoaded(value: boolean) {
        if (this.loaded === value) return;
        this.loaded = value;
        this.onLoadedChange?.(this.loaded);
    }


    // Supprime tous les widgets enfants de la liste
    private clear() {
        let child = this.listBox.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            this.listBox.remove(child);
            child = next;
        }
    }

    // Lance un scan Wi-Fi (mocké avec un timeout)
    private async startScan() {
        const id = ++this.scanId;

        this.setLoading();
        this.setLoaded(false);

        // Start scan
        try {
            const networks = await this.wifi.scanWithRetry();
            if (id != this.scanId) return;
            this.setNetworks(networks);
        } catch (e) {
            if (id != this.scanId) return;
            this.setError("Erreur lors du scan Wif-Fi : (error) " + e);
        }
    }

    private startFakeScan() {
        this.setLoading();
        this.setLoaded(false);

        // Des wifis random
        const wifi1 = new WifiInfos("OnePlus Nord 2T", true, 85, true);
        const wifi2 = new WifiInfos("SFR_F8C8", true, 68, false);
        const wifi3 = new WifiInfos("eduroammmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm", false, 45, false);

        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 3000, () => {
            this.setNetworks([wifi1, wifi2, wifi3]);
            return GLib.SOURCE_REMOVE;
        });
    }

    private setError(text: string) {
        this.clear();

        this.listBox.append(
            new Gtk.Label({ label: text, css_classes: ["error"], halign: Gtk.Align.CENTER })
        );
    }

    // Affiche la liste des réseaux Wi-Fi trouvés
    private setNetworks(networks: WifiInfos[]) {
        this.clear();

        if (networks.length === 0) {
            this.listBox.append(new Gtk.Label({ label: "Aucun réseau trouvé" }));
            this.setLoaded(true);
            return;
        }

        for (const n of networks) {
            const row = new Gtk.ListBoxRow();
            row.set_child(new DisplayWifi(n).widget);
            this.listBox.append(row);
        }
        this.setLoaded(true);
    }

    // Affiche l’état "Recherche des Wi-Fi" avec un spinner
    setLoading(text = "Recherche des Wi-Fi…") {
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

        this.listBox.append(row);
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

        this.listBox.append(box);
    }
}