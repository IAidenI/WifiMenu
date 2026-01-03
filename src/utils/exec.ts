import GLib from "gi://GLib";
import Gio from "gi://Gio";

export function execSync(cmd: string): { ok: boolean; out: string; err: string; status: number } {
    try {
        const argv = ["sh", "-lc", cmd];
        const [ok, stdout, stderr, status] = GLib.spawn_sync(
            null,          // working dir
            argv,          // argv
            null,          // env
            GLib.SpawnFlags.SEARCH_PATH,
            null
        );

        const out = stdout ? new TextDecoder().decode(stdout) : "";
        const err = stderr ? new TextDecoder().decode(stderr) : "";

        return { ok: Boolean(ok) && status === 0, out, err, status };
    } catch (e) {
        return { ok: false, out: "", err: String(e), status: -1 };
    }
}

export async function execAsync(cmd: string): Promise<{ ok: boolean; out: string; err: string; status: number }> {
    const argv = ["sh", "-lc", cmd];

    const proc = new Gio.Subprocess({
        argv,
        flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE,
    });

    proc.init(null);

    return await new Promise((resolve) => {
        proc.communicate_utf8_async(null, null, (_p: any, res: any) => {
            try {
                const [, stdout, stderr] = proc.communicate_utf8_finish(res);
                const status = proc.get_exit_status();
                resolve({
                    ok: status === 0,
                    out: stdout ?? "",
                    err: stderr ?? "",
                    status,
                });
            } catch (e) {
                resolve({ ok: false, out: "", err: String(e), status: -1 });
            }
        });
    });
}
