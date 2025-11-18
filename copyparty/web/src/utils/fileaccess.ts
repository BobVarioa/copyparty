import { $c } from "./elements";
import { Settings } from "./settings";
import { sleep } from "./sleep";
import { getFileName } from "./strings";
import { Up2k } from "./up2k";
import { UA } from "./useragent";

interface FileAccessorType {
    download(file: string): Promise<void>;
    downloadAll(files: string[]): Promise<void>;
}

class DomFileAccessor implements FileAccessorType {
    up2k: Up2k;
    constructor(up2k: Up2k) {
        this.up2k = up2k;
    }

    async download(file: string) {
        const fileName = getFileName(file);
        const a = $c("a");
        a.classList.add("gone");
        a.download = Settings.get("ASK_FOR_SAVE_LOCATION") === "always" ? "" : fileName;
        a.href = file;
        document.body.appendChild(a);

        a.click();

        a.remove();
    }
    async downloadAll(files: string[]) {
        for (const file of files) {
            const fileName = getFileName(file);
            const a = $c("a");
            a.classList.add("gone");
            a.download = fileName;
            a.href = file;
            document.body.appendChild(a);

            a.click();

            if (UA.CHROME) await sleep(100);

            a.remove();
        }
    }
}

class AccessAPIFileAccessor implements FileAccessorType {
    up2k: Up2k;
    constructor(up2k: Up2k) {
        this.up2k = up2k;
    }

    async download(file: string) {
        const fileName = getFileName(file);
        try {
            // @ts-expect-error chrome only
            const fileHandle: FileSystemFileHandle = await window.showSaveFilePicker({
                suggestedName: fileName,
                id: "file_download",
                startIn: "downloads",
            });
            const f = await fileHandle.createWritable();

            const download = await fetch(file);
            await download.body.pipeTo(f);
        } catch (e) {
            if (e.name != "AbortError") {
                throw e;
            }
        }
    }
    async downloadAll(files: string[]) {
        try {
            const promises: Promise<void>[] = [];

            if (Settings.get("ASK_FOR_SAVE_LOCATION") === "always") {
                for (const file of files) {
                    const fileName = getFileName(file);
                    // @ts-expect-error chrome only
                    const fileHandle: FileSystemFileHandle = await window.showSaveFilePicker({
                        suggestedName: fileName,
                        id: "file_download",
                        startIn: "downloads",
                    });
                    const f = await fileHandle.createWritable();

                    const download = await fetch(file);
                    promises.push(download.body.pipeTo(f));
                }
            } else {
                // @ts-expect-error chrome only
                const dirHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker({ mode: "readwrite" });

                for (const file of files) {
                    const fileName = getFileName(file);
                    const f = await (await dirHandle.getFileHandle(fileName, { create: true })).createWritable();

                    const download = await fetch(file);
                    promises.push(download.body.pipeTo(f));
                }
            }

            await Promise.allSettled(promises);
        } catch (e) {
            if (e.name != "AbortError") {
                throw e;
            }
        }
    }

    async *getFilesRecursively(entry: FileSystemDirectoryHandle | FileSystemFileHandle): AsyncGenerator<File> {
        if (entry.kind === "file") {
            const file = await entry.getFile();
            if (file !== null) {
                yield file;
            }
        } else if (entry.kind === "directory") {
            // @ts-expect-error im not sure why this isn't typed? this is a standard method
            for await (const handle of entry.values()) {
                yield* this.getFilesRecursively(handle);
            }
        }
    }
}

enum Backend {
    ACCESS_API,
    DOM,
}

export class FileAccessor {
    static backend: Backend;
    static up2k: Up2k;

    static accessBackend: AccessAPIFileAccessor;
    static domBackend: DomFileAccessor;

    static init() {
        this.accessBackend = new AccessAPIFileAccessor(this.up2k);
        this.domBackend = new DomFileAccessor(this.up2k);

        if ("showSaveFilePicker" in window && "showDirectoryPicker" in window && "showOpenFilePicker" in window) {
            this.backend = Backend.ACCESS_API;
            // NOTE: maybe prompt user for extensions?
            // https://apps.apple.com/us/app/file-picker/id1595132894?uo=4
            // https://addons.mozilla.org/en-US/firefox/addon/file-system-access/
        } else {
            this.backend = Backend.DOM;
        }
    }

    static async download(file: string) {
        if (this.backend == Backend.ACCESS_API && Settings.get("ASK_FOR_SAVE_LOCATION") !== "never") {
            return this.accessBackend.download(file);
        } else if (this.backend == Backend.DOM) {
            return this.domBackend.download(file);
        }
    }

    static async downloadAll(files: string[]) {
        if (this.backend == Backend.ACCESS_API && Settings.get("ASK_FOR_SAVE_LOCATION") !== "never") {
            return this.accessBackend.downloadAll(files);
        } else if (this.backend == Backend.DOM) {
            return this.domBackend.downloadAll(files);
        }
    }
}
