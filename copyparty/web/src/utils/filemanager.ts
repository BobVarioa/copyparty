import { Requests } from "./request";
import { LSResponse } from "./types";
import { LSFile } from "./types";
import { crc32, getFileName, removeQuery } from "./strings";

type FileUpdateCallback = (path: string) => void;

interface LSMinimal {
    dirs: LSFile[];
    files: LSFile[];
    taglist: string[];
}

export const EXTENSION_TO_TYPE: Record<string, string> = {
    ahk: "autohotkey",
    bas: "basic",
    bat: "batch",
    cxx: "cpp",
    diz: "ans",
    ex: "elixir",
    exs: "elixir",
    frag: "glsl",
    h: "c",
    hpp: "cpp",
    htm: "html",
    hxx: "cpp",
    log: "ans",
    m: "matlab",
    moon: "moonscript",
    patch: "diff",
    ps1: "powershell",
    psm1: "powershell",
    pl: "perl",
    rs: "rust",
    sh: "bash",
    service: "systemd",
    vb: "vbnet",
    v: "verilog",
    vert: "glsl",
    vh: "verilog",
    yml: "yaml",
};

export const FILE_TO_TYPE: Record<string, string> = {
    "cmakelists.txt": "cmake",
    dockerfile: "docker",
};

for (const ext of "ans c cfg conf cpp cs css diff glsl go html ini java js json jsx kt kts latex less lisp lua makefile md nim py r rss rb ruby sass scss sql svg swift tex toml ts vhdl xml yaml zig".split(
    " "
)) {
    EXTENSION_TO_TYPE[ext] = ext;
}

export class FileManager {
    static CLIPBOARD_KEY = "fm.clip";
    static CLIPBOARD_ACTION = "fm.clip.action";
    selectedItems = new Set<string>();
    clipboard = new Set<string>();
    cutting = false;
    listeners: FileUpdateCallback[] = [];
    path: string;
    lastLS: LSResponse;
    lsDirty: boolean = false;

    constructor(ls0: LSResponse) {
        this.lastLS = ls0;
        ls0.files.map((file) => {
            file.name = decodeURIComponent(getFileName(file.href));
            file.id = crc32(file.name);
        });
        ls0.dirs.map((file) => {
            file.name = decodeURIComponent(removeQuery(file.href));
            file.id = crc32(file.name);
        });

        this.path = window.location.pathname;
        const clip = localStorage.getItem(FileManager.CLIPBOARD_KEY);
        if (clip != undefined) {
            const clipJson = JSON.parse(clip);
            if (Array.isArray(clipJson) && clipJson.length > 0) {
                for (const item of clipJson) {
                    this.clipboard.add(item);
                }
            }
        }
        const clipAction = localStorage.getItem(FileManager.CLIPBOARD_ACTION);
        if (clipAction === "1") {
            this.cutting = true;
        } else {
            this.cutting = false;
        }
    }

    setPath(path: string) {
        this.lsDirty = true;
        this.path = path;
        this.onPathUpdate();
    }

    addListener(cb: FileUpdateCallback) {
        this.listeners.push(cb);
    }

    onPathUpdate() {
        for (const cb of this.listeners) {
            cb(this.path);
        }
    }

    select(path: string) {
        this.selectedItems.add(this.path + path);
    }

    unselect(path: string) {
        this.selectedItems.delete(this.path + path);
    }

    clearSelection() {
        this.selectedItems.clear();
    }

    lsPromise: Promise<LSResponse> | undefined;

    async ls() {
        if (this.lsDirty == true) {
            this.lsDirty = false;
            this.lsPromise = Requests.ls(this.path);
            const res = await this.lsPromise;
            this.lsPromise = undefined;

            if (res == undefined) throw new Error("Unexpected response from server");
            this.lastLS = res;
            return res;
        }

        if (this.lsPromise != undefined) {
            return await this.lsPromise;
        }

        return this.lastLS;
    }

    copy() {
        this.cutting = false;
        localStorage.setItem(FileManager.CLIPBOARD_ACTION, "0");
        if (this.selectedItems.size > 0) {
            for (const item of this.selectedItems) {
                this.clipboard.add(item);
            }
            localStorage.setItem(FileManager.CLIPBOARD_KEY, JSON.stringify([...this.clipboard]));
        }
    }

    cut() {
        this.cutting = true;
        localStorage.setItem(FileManager.CLIPBOARD_ACTION, "1");
        if (this.selectedItems.size > 0) {
            for (const item of this.selectedItems) {
                this.clipboard.add(item);
            }
            localStorage.setItem(FileManager.CLIPBOARD_KEY, JSON.stringify([...this.clipboard]));
        }
    }

    async paste() {
        if (this.clipboard.size > 0) {
            let queue = [];
            for (const path of this.clipboard) {
                const file = getFileName(path);
                if (this.cutting) {
                    queue.push(Requests.move(path, this.path + file));
                } else {
                    queue.push(Requests.copy(path, this.path + file));
                }
            }
            await Promise.allSettled(queue);
        }
    }

    async delete() {
        if (this.selectedItems.size > 0) {
            let queue = [];
            for (const file of this.selectedItems) {
                queue.push(Requests.delete(file));
            }
            await Promise.allSettled(queue);
        }
    }
}
