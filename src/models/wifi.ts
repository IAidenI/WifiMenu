export class WifiInfos {
    ssid: string;
    bssid: string;
    secure: boolean;
    security: string;
    signal: number;
    connected: boolean;

    constructor(
        ssid: string = "",
        bssid: string = "",
        secure: boolean = false,
        security: string = "",
        signal: number = -1,
        connected: boolean = false
    ) {
        this.ssid = ssid;
        this.bssid = bssid;
        this.secure = secure;
        this.security = security;
        this.signal = signal;
        this.connected = connected;
    }

    isEmpty(): boolean {
        return (
            this.ssid === "" &&
            this.bssid === "" &&
            this.secure === false &&
            this.security === "" &&
            this.signal === -1 &&
            this.connected === false
        );
    }

    static empty(): WifiInfos {
        return new WifiInfos();
    }

    // split en respectant les ':' échappés (\:)
    private static splitNmcli(line: string): string[] {
        const parts: string[] = [];
        let cur = "";
        let escape = false;

        for (const ch of line) {
            if (escape) {
                cur += ch;
                escape = false;
                continue;
            }
            if (ch === "\\") {
                escape = true;
                continue;
            }
            if (ch === ":") {
                parts.push(cur);
                cur = "";
                continue;
            }
            cur += ch;
        }
        parts.push(cur);
        return parts;
    }

    static parseWifiList(out: string): WifiInfos[] {
        const networks = out
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
            .map((line) => {
                const [
                    inUse = "",
                    bssidRaw = "",
                    ssidRaw = "",
                    signalRaw = "0",
                    securityRaw = ""
                ] = WifiInfos.splitNmcli(line);

                const connected = inUse === "*";
                const ssid = ssidRaw.length ? ssidRaw : "<hidden>";
                const bssid = bssidRaw;

                const signalParsed = Number.parseInt(signalRaw, 10);
                const signal = Number.isFinite(signalParsed) ? signalParsed : 0;

                const security = (securityRaw ?? "").trim();
                const secure = security !== "" && security !== "--";

                return new WifiInfos(ssid, bssid, secure, security, signal, connected);
            });

        return networks.length ? networks : [WifiInfos.empty()];
    }
};
