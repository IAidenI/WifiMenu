import { WifiInfos } from "../models/wifi.js";
import { execSync, execAsync } from "../utils/exec.js";

export class WifiService {
    isActive() {
        const ret = execSync("nmcli radio wifi");
        if (!ret.ok) throw new Error(ret.err || ret.out);

        const state = ret.out.trim();

        if (state == "enabled") return true;
        if (state == "disabled") return false;

        throw new Error(`Etat Wi-Fi inconnu: ${state}`);
    }

    async enable(): Promise<void> {
        const ret = execSync("nmcli radio wifi on");
        if (!ret.ok) throw new Error(ret.err || ret.out);

        await this.isActive();
    }

    async disable(): Promise<void> {
        const ret = execSync("nmcli radio wifi off");
        if (!ret.ok) throw new Error(ret.err || ret.out);

        await this.isActive();
    }

    async scan(): Promise<WifiInfos[]> {
        const ret = await execAsync("nmcli -t -f IN-USE,BSSID,SSID,SIGNAL,SECURITY dev wifi list");
        if (!ret.ok) throw new Error(ret.err || ret.out);
        return WifiInfos.parseWifiList(ret.out);
    }

    private sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async scanWithRetry(retries = 10, delayMs = 300): Promise<WifiInfos[]> {
        for (let i = 0; i < retries; i++) {
            const wifiList = await this.scan();

            if (!(wifiList.length === 1 && wifiList[0].isEmpty())) {
                return wifiList;
            }

            await this.sleep(delayMs);
        }

        return [WifiInfos.empty()];
    }

    private async getWifiDevice(): Promise<string> {
        const devRet = await execAsync(
            `nmcli -t -f DEVICE,TYPE dev status | awk -F: '$2=="wifi"{print $1; exit}'`
        );
        if (!devRet.ok) throw new Error(devRet.err || devRet.out);
        const dev = devRet.out.trim();
        if (!dev) throw new Error("No Wi-Fi device found");
        return dev;
    }

    private isEnterpriseSecurity(sec?: string): boolean {
        const s = (sec ?? "").toUpperCase();
        return s.includes("802.1X") || s.includes("ENT") || s.includes("EAP");
    }

    private isWpa3(sec?: string): boolean {
        const s = (sec ?? "").toUpperCase();
        return s.includes("WPA3");
    }

    async connectWithoutPassword(wifi: WifiInfos): Promise<void> {
        const cmd = wifi.bssid ? `nmcli device wifi connect "${wifi.ssid}" bssid "${wifi.bssid}"` : `nmcli device wifi connect "${wifi.ssid}"`;

        const ret = await execAsync(cmd);
        if (!ret.ok) throw new Error(ret.err || ret.out);
    }

    // PSK (WPA2/WPA3) : password seulement
    async connectPsk(wifi: WifiInfos, password: string): Promise<void> {
        const dev = await this.getWifiDevice();
        const con = `tmp-${wifi.ssid}`;
        const keyMgmt = this.isWpa3(wifi.security) ? "sae" : "wpa-psk";

        await execAsync(`nmcli con delete "${con}" || true`);

        let ret = await execAsync(
            `nmcli con add type wifi ifname "${dev}" con-name "${con}" ssid "${wifi.ssid}"`
        );
        if (!ret.ok) throw new Error(ret.err || ret.out);

        ret = await execAsync(
            `nmcli con modify "${con}" wifi-sec.key-mgmt ${keyMgmt} wifi-sec.psk "${password}"`
        );
        if (!ret.ok) throw new Error(ret.err || ret.out);

        if (wifi.bssid) {
            ret = await execAsync(`nmcli con modify "${con}" 802-11-wireless.bssid "${wifi.bssid}"`);
            if (!ret.ok) throw new Error(ret.err || ret.out);
        }

        ret = await execAsync(`nmcli con up "${con}" ifname "${dev}"`);
        if (!ret.ok) throw new Error(ret.err || ret.out);
    }

    // Entreprise (eduroam) : username + password
    async connectEnterprise(wifi: WifiInfos, username: string, password: string, eap: "peap" | "ttls" = "peap", phase2: "mschapv2" | "pap" | "chap" | "mschap" = "mschapv2"): Promise<void> {
        const dev = await this.getWifiDevice();
        const con = `tmp-${wifi.ssid}`;

        await execAsync(`nmcli con delete "${con}" || true`);

        let ret = await execAsync(
            `nmcli con add type wifi ifname "${dev}" con-name "${con}" ssid "${wifi.ssid}"`
        );
        if (!ret.ok) throw new Error(ret.err || ret.out);

        ret = await execAsync(`nmcli con modify "${con}" wifi-sec.key-mgmt wpa-eap`);
        if (!ret.ok) throw new Error(ret.err || ret.out);

        ret = await execAsync(
            `nmcli con modify "${con}" 802-1x.eap ${eap} 802-1x.identity "${username}" 802-1x.password "${password}"`
        );
        if (!ret.ok) throw new Error(ret.err || ret.out);

        ret = await execAsync(`nmcli con modify "${con}" 802-1x.phase2-auth ${phase2}`);
        if (!ret.ok) throw new Error(ret.err || ret.out);

        if (wifi.bssid) {
            ret = await execAsync(`nmcli con modify "${con}" 802-11-wireless.bssid "${wifi.bssid}"`);
            if (!ret.ok) throw new Error(ret.err || ret.out);
        }

        ret = await execAsync(`nmcli con up "${con}" ifname "${dev}"`);
        if (!ret.ok) throw new Error(ret.err || ret.out);
    }

    async connect(wifi: WifiInfos, password: string, username?: string): Promise<void> {
        if (this.isEnterpriseSecurity(wifi.security)) {
            if (!username) throw new Error("Username required for enterprise Wi-Fi");
            await this.connectEnterprise(wifi, username, password);
            return;
        }
        await this.connectPsk(wifi, password);
    }

    async disconnect(): Promise<void> {
        const dev = execSync("nmcli -t -f DEVICE,TYPE,STATE dev status | grep ':wifi:connected$' | cut -d: -f1");
        if (!dev.ok || !dev.out.trim()) return;

        const device = dev.out.trim();
        const conn = execSync(`nmcli -t -g GENERAL.CONNECTION dev show "${device}"`);
        if (!conn.ok || !conn.out.trim()) return;

        const connectionName = conn.out.trim();
        const ret = execAsync(`nmcli connection down "${connectionName}"`);
        if (!(await ret).ok) {
            throw new Error((await ret).err || (await ret).out);
        }
    }

    async forget(wifi: WifiInfos): Promise<void> {
        const act = await execAsync(`nmcli -t -f NAME,UUID,TYPE,DEVICE con show --active`);
        if (!act.ok) throw new Error(act.err || act.out);

        const lines = act.out.split("\n").filter(Boolean);
        const match = lines
            .map(l => l.split(":"))
            .find(p => p.length >= 4 && p[2] === "802-11-wireless" && p[0].includes(wifi.ssid));
        
        if (!match) return;

        const [name] = match;
        const ret = await execAsync(`nmcli con delete "${name}"`);
        if (!ret.ok) throw new Error(ret.err || ret.out);
    }
}