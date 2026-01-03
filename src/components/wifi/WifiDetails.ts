import Gtk from "gi://Gtk?version=4.0";
import { WifiService } from "../../services/WifiService.js";
import { WifiInfos } from "../../models/wifi.js";
import { Password } from "../input/Password.js";
import { EnterpriseAuth } from "../input/EnterpriseAuth.js";

export class WifiDetails {
    widget: InstanceType<typeof Gtk.Box>;
    private connectButton: InstanceType<typeof Gtk.Button>;
    private disconnectButton: InstanceType<typeof Gtk.Button>;
    private forgetButton: InstanceType<typeof Gtk.Button>;
    private cancelButton: InstanceType<typeof Gtk.Button>;
    private wifiInfos: WifiInfos;
    private wifiService: WifiService;
    private passwordInput?: Password;
    private enterpriseInput?: EnterpriseAuth;
    private spinner: InstanceType<typeof Gtk.Spinner>;
    private messageTimeout?: number;

    constructor(wifiInfos: WifiInfos, wifiService: WifiService, onCancel: () => void) {
        this.widget = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 6,
            halign: Gtk.Align.START,
            valign: Gtk.Align.START,
            hexpand: false
        });
        this.widget.set_margin_start(15);
        this.widget.set_margin_end(15);

        this.wifiInfos = wifiInfos;
        this.wifiService = wifiService;

        this.spinner = new Gtk.Spinner();

        this.connectButton = new Gtk.Button({ label: "Connection" });
        this.connectButton.connect("clicked", () => this.onConnect());

        this.disconnectButton = new Gtk.Button({ label: "Déconnexion" });
        this.disconnectButton.connect("clicked", () => this.onDisconnect());

        this.forgetButton = new Gtk.Button({ label: "Oublier" });
        this.forgetButton.connect("clicked", () => this.onForget());

        this.cancelButton = new Gtk.Button({ label: "Annuler" });
        this.cancelButton.connect("clicked", onCancel);

        if (this.wifiInfos.connected) {
            this.widget.append(this.disconnectButton);
            this.widget.append(this.forgetButton);
        } else {
            this.widget.append(this.connectButton);
        }
        this.widget.append(this.cancelButton);
    }

    private async onForget() {
        this.setLoading(true);

        try {
            await this.wifiService.forget(this.wifiInfos);
            this.clear();
            this.setInfo("Réseau oublié");
        } catch (e: any) {
            this.setError("Erreur lors de l'oubli du réseau");
            console.log("Error : ", e);
        } finally {
            this.setLoading(false);
        }
    }

    private async onDisconnect() {
        this.setLoading(true);

        try {
            await this.wifiService.disconnect();
            this.clear();
            this.setInfo("Déconnecté");
        } catch (e: any) {
            this.setError("Erreur de déconnexion");
        } finally {
            this.setLoading(false);
        }
    }

    private async onConnect() {
        this.safeRemove(this.connectButton);
        this.safeRemove(this.cancelButton);

        const sec = (this.wifiInfos.security ?? "").toUpperCase();
        const isEnterprise = sec.includes("802.1X") || sec.includes("ENT") || sec.includes("EAP");

        if (isEnterprise) {
            this.enterpriseInput = new EnterpriseAuth(
                async (username, password) => {
                    this.setLoading(true);
                    try {
                        await this.wifiService.connect(this.wifiInfos, password, username);
                        this.setInfo("Connecté");
                    } catch (e: any) {
                        this.setError(this.mapNmcliError(String(e?.message ?? e)));
                    } finally {
                        this.setLoading(false);
                        this.safeRemove(this.enterpriseInput!.widget);
                    }
                },
                () => this.safeRemove(this.enterpriseInput!.widget)
            );

            this.widget.append(this.enterpriseInput.widget);
        } else {
            this.setLoading(true);
            try {
                await this.wifiService.connectWithoutPassword(this.wifiInfos);
                this.setInfo("Connecté");
                return;
            } catch (e: any) {
                const msg = String(e?.message ?? e).toLowerCase();

                const needsSecrets = msg.includes("secrets were required") || msg.includes("no secrets") || msg.includes("secrets") || msg.includes("password");

                if (!needsSecrets) {
                    this.setError(this.mapNmcliError(String(e?.message ?? e)));
                    return;
                }
            } finally {
                this.setLoading(false);
            }

            this.passwordInput = new Password(
                "Password...",
                async () => {
                    this.setLoading(true);
                    try {
                        await this.wifiService.connect(this.wifiInfos, this.passwordInput!.getValue());
                        this.setInfo("Connecté");
                    } catch (e: any) {
                        this.setError(this.mapNmcliError(String(e?.message ?? e)));
                    } finally {
                        this.setLoading(false);
                    }
                },
                () => this.safeRemove(this.passwordInput!.widget)
            );

            this.widget.append(this.passwordInput.widget);
        }
    }

    private mapNmcliError(msg: string): string {
        const m = msg.toLowerCase();

        console.log("NMCLI Error Message: ", m);
        if (m.includes("wrong password") || m.includes("secrets")) return "Mot de passe incorrect";
        if (m.includes("no network") || m.includes("not found")) return "Réseau introuvable";
        if (m.includes("802") || m.includes("1x")) return "Réseau entreprise (identifiant requis)";
        if (m.includes("disabled")) return "Wi-Fi désactivé";
        if (m.includes("timeout")) return "Timeout de connexion";
        return "Erreur de connexion";
    }

    private safeRemove(child: any) {
        if (!child) return;
        if (child.get_parent && child.get_parent() === this.widget) {
            this.widget.remove(child);
        }
    }

    private clear() {
        this.safeRemove(this.connectButton);
        this.safeRemove(this.disconnectButton);
        this.safeRemove(this.forgetButton);
        this.safeRemove(this.cancelButton);
        this.safeRemove(this.passwordInput?.widget);
        this.safeRemove(this.spinner);
    }

    private showMessage(message: string, cssClasses: string[] = [], timeout = 2000) {
        this.clear();

        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
            this.messageTimeout = undefined;
        }

        const label = new Gtk.Label({
            label: message,
            css_classes: cssClasses,
        });

        this.widget.append(label);

        this.messageTimeout = setTimeout(() => {
            this.safeRemove(label);
            this.messageTimeout = undefined;
        }, timeout);
    }

    private setInfo(message: string) {
        this.showMessage(message);
    }

    private setError(message: string) {
        this.showMessage(message, ["error"]);
    }

    private setLoading(activate: boolean) {
        this.clear();
        if (activate) {
            this.widget.append(this.spinner);
            this.spinner.start();
        } else {
            this.spinner.stop();
            this.safeRemove(this.spinner);
        }
    }
}