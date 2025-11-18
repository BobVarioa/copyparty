import { ServerError } from "./error";
import { Settings } from "./settings";
import { crc32, getFileName, removeQuery } from "./strings";
import { LSResponse, TreeResponse } from "./types";

/*
file.ext?delete
file.ext?move=/dest/file.ext&akey=1
file.ext?copy=/dest/file.ext&akey=1
*/


export class Requests {
    static rtt = 10;
    static offline = false;

    static async ls(path: string): Promise<LSResponse> {
        const ts = Date.now();
        // TODO: dirkeys and dots
        const req = await fetch(`${Settings.get("BASE_PATH")}${path}?ls&rtt=${this.rtt}`, {
            method: "GET",
            headers: { Fnugg: ts.toString() },
        });

        if (req.ok) {
            const res: LSResponse = await req.json();
            this.rtt = Date.now() - ts;

            res.files.map((file) => {
                file.name = decodeURIComponent(getFileName(file.href));
                file.id = crc32(file.name);
            });
            res.dirs.map((file) => {
                file.name = decodeURIComponent(removeQuery(file.href));
                file.id = crc32(file.name);
            });

            return res;
        }

        this.offline = true;
        throw new ServerError();
    }
    static async tree(path: string): Promise<TreeResponse> {
        const req = await fetch(`${Settings.get("BASE_PATH")}${path}?tree`, { method: "GET" });

        if (req.ok) {
            const res = await req.json();
            return res;
        }

        this.offline = true;
        throw new ServerError();
    }

    static async copy(path: string, dest: string) {}
    static async move(path: string, dest: string) {}
    static async delete(path: string) {}

    static async mkdir(path: string) {}
}
