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
        const ret = await execAsync("nmcli -t -f IN-USE,SSID,SIGNAL,SECURITY dev wifi list");
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

    async connect(wifi: WifiInfos, password: string): Promise<void> {

    }

    async disconnect(wifi: WifiInfos): Promise<void> {

    }

    async forget(wifi: WifiInfos): Promise<void> {

    }
}