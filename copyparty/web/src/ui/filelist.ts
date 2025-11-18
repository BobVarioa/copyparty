import { crc32 } from "../utils/strings";
import { $, $c, $i } from "../utils/elements";
import { EXTENSION_TO_TYPE, FILE_TO_TYPE, FileManager } from "../utils/filemanager";
import { Formats } from "../utils/formats";
import { LSFile } from "../utils/types";
import { Settings } from "../utils/settings";
import { removeQuery, getFileName, unix2ui, alphabetizeMapper } from "../utils/strings";
import { Tags } from "../utils/tags";
import { ActionBarElement } from "./actionbar";
import { BaseElement } from "./baselement";
import { Viewer } from "./viewer";

interface FileElement {
    ele: HTMLElement;
    file: LSFile;
    isFolder: boolean;
}

export class FileListElement extends BaseElement {
    fs: FileManager;
    actionBar: ActionBarElement;

    elements: FileElement[] = [];

    sortIndicators: Map<string, HTMLElement> = new Map();

    body: HTMLElement;
    viewer: Viewer;

    constructor(anchor: HTMLElement, fs: FileManager, actionBar: ActionBarElement, viewer: Viewer) {
        super(anchor);
        this.fs = fs;
        this.actionBar = actionBar;
        this.viewer = viewer;
    }

    show(): void {
        super.show();
        this.actionBar.show();
    }

    hide(): void {
        super.hide();
    }

    init() {
        this.fs.addListener(async () => {
            const ls = await this.fs.ls();

            const header = this.anchor.children[0];
            header.replaceChildren();
            const tr = $c("tr");

            let headerCount = 3; // checkbox and file name are excluded
            tr.appendChild($c("th")); // checkbox
            tr.appendChild(this.createAlphaHeader("href", "File Name", (ele) => ele.file.name));
            tr.appendChild(this.createOrderedHeader("sz", "Size", (ele) => ele.file.sz));
            const hidden = Settings.get("HIDDEN_HEADERS");
            for (const tag of ls.taglist) {
                if (hidden.has(tag)) continue;

                headerCount++;

                if (tag[0] == ".") {
                    tr.appendChild(this.createOrderedHeader(`tags/${tag}`, tag.slice(1), (ele) => (ele.file.tags[tag] as number) ?? 0));
                } else {
                    const name = tag[0].toUpperCase() + tag.slice(1);
                    tr.appendChild(this.createAlphaHeader(`tags/${tag}`, name, (ele) => (ele.file.tags[tag] as string) ?? ""));
                }
            }
            tr.appendChild(this.createAlphaHeader("ext", "Type", (ele) => ele.file.ext));
            tr.appendChild(this.createOrderedHeader("ts", "Date", (ele) => ele.file.ts));

            header.appendChild(tr);

            this.anchor.style.setProperty("--headers-n", `${headerCount}`);

            this.body = this.anchor.children[1] as HTMLElement;

            this.elements = [];

            for (const d of ls.dirs) {
                this.createFileRow(d, ls.taglist, hidden, true);
            }

            for (const f of ls.files) {
                this.createFileRow(f, ls.taglist, hidden, false);
            }

            this.alphabetizeElements();
        });

        this.anchor.addEventListener("click", (e) => {
            const ele = e.target as HTMLElement | null;
            if (ele != undefined && ele.tagName === "TD") {
                const check = ele.parentElement!.childNodes[0].childNodes[0] as HTMLInputElement;
                check.checked = !check.checked;
                const link = ele.parentElement!.childNodes[1].childNodes[1] as HTMLLinkElement;
                const file = getFileName(link.href);

                if (check.checked) {
                    this.fs.select(file);
                } else {
                    this.fs.unselect(file);
                }
            }
        });
    }

    createBaseHeader(id: string, name: string, onClick: () => void) {
        const th = $c("th");
        th.title = id;
        th.setAttribute("name", id);
        const label = $c("span", name);
        th.appendChild(label);
        const sortIndicator = $c("span", " ");
        sortIndicator.classList.add("indicator");
        this.sortIndicators.set(id, sortIndicator);
        th.appendChild(sortIndicator);

        if (id == "href") {
            let initialX = -1;
            let initialWidth = -1;
            let resizeRange = false;

            th.addEventListener("pointerdown", (e) => {
                initialX = e.clientX;
                initialWidth = parseFloat(window.getComputedStyle(th).width);
            });

            th.addEventListener("pointerup", (e) => {
                initialX = -1;
            });

            th.addEventListener("pointerleave", (e) => {
                initialX = -1;
            });

            th.addEventListener("click", (e) => {
                if (initialX != -1 || resizeRange) return;

                if (e.target == label) {
                    onClick();
                }
            });

            th.addEventListener("pointermove", (e) => {
                const rect = th.getBoundingClientRect();
                const range = rect.width * 0.15;
                if (rect.left + range >= e.clientX || e.clientX >= rect.right - range) {
                    resizeRange = true;
                    th.style.cursor = "ew-resize";
                    if (initialX != -1) {
                        th.style.minWidth = `${e.clientX - initialX + initialWidth}px`;
                    }
                } else {
                    resizeRange = false;
                    th.style.cursor = "unset";
                }
            });
        } else {
            label.addEventListener("click", onClick);
        }

        return th;
    }

    createAlphaHeader(id: string, name: string, map: (ele: FileElement) => string) {
        let rev = false;
        const th = this.createBaseHeader(id, name, () => {
            this.alphabetizeElements((ele) => map(ele) + "", rev);
            for (const sort of this.sortIndicators.values()) {
                sort.textContent = " ";
            }

            const indicator = this.sortIndicators.get(id);
            indicator.textContent = rev ? "⌃" : "⌄";
            if (rev) {
                indicator.classList.add("rev");
            } else {
                indicator.classList.remove("rev");
            }

            rev = !rev;
        });

        return th;
    }

    createOrderedHeader(id: string, name: string, map: (ele: FileElement) => number) {
        let rev = false;
        const th = this.createBaseHeader(id, name, () => {
            this.orderElements(map, rev);
            for (const sort of this.sortIndicators.values()) {
                sort.textContent = " ";
            }

            const indicator = this.sortIndicators.get(id);
            indicator.textContent = rev ? "⌃" : "⌄";
            if (rev) {
                indicator.classList.add("rev");
            } else {
                indicator.classList.remove("rev");
            }
            rev = !rev;
        });

        return th;
    }

    createFileRow(file: LSFile, taglist: (keyof Tags)[], hidden: Set<string>, isFolder: boolean): HTMLElement {
        const tr = $c("tr");

        const td1 = $c("td");
        const check = $c("input");
        check.type = "checkbox";
        check.name = "select";
        td1.appendChild(check);
        tr.appendChild(td1);

        const td2 = $c("td");
        td2.appendChild($i(isFolder ? "folder" : "file"));

        const link = $c("a", file.name);
        link.tabIndex = 0;
        link.title = file.name;

        if (Settings.get("OPEN_BEHAVIOR") === "view") {
            if (Formats.IMAGE.has(file.ext) || Formats.VIDEO.has(file.ext)) {
                link.href = `${this.fs.path}${file.name}`;
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.viewer.showFile(file);
                });
            } else if (Formats.AUDIO.has(file.ext)) {
                link.href = `${this.fs.path}#af-${file.id}`;
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    // TODO: play music
                });
            } else if (!isFolder) {
                link.href = `${this.fs.path}?doc=${file.name}`;
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    // TODO: show document
                });
            } else {
                link.href = `${this.fs.path}${file.href}`;
            }
        } else {
            link.href = `${this.fs.path}${file.href}`;
        }

        td2.appendChild(link);
        tr.appendChild(td2);

        tr.appendChild($c("td", file.sz.toString()));

        for (const tag of taglist) {
            if (hidden.has(tag)) continue;

            tr.appendChild($c("td", file.tags[tag]?.toString()));
        }

        tr.appendChild($c("td", EXTENSION_TO_TYPE[file.ext] ?? FILE_TO_TYPE[file.name] ?? file.ext));
        tr.appendChild($c("td", unix2ui(file.ts)));

        this.elements.push({ ele: tr, file, isFolder });

        return tr;
    }

    sortElements(method: (files: FileElement[]) => void, reversed: boolean = false) {
        let files = [...this.elements];
        let dirs: HTMLElement[] = [];
        const dirBefore = Settings.get("DIRS_BEFORE_FILES");

        method(files);

        this.body.replaceChildren();

        if (reversed) {
            for (let i = files.length - 1; i >= 0; i--) {
                const file = files[i];
                if (file.isFolder && dirBefore) {
                    dirs.push(file.ele);
                } else {
                    this.body.appendChild(file.ele);
                }
            }
        } else {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.isFolder && dirBefore) {
                    dirs.push(file.ele);
                } else {
                    this.body.appendChild(file.ele);
                }
            }
        }

        if (dirs.length != 0) {
            this.body.prepend(...dirs);
        }
    }

    alphabetizeElements(mapper: (ele: FileElement) => string = (ele) => ele.file.name, reversed: boolean = false) {
        this.sortElements((files) => alphabetizeMapper(files, mapper), reversed)
    }
    
    orderElements(mapper: (a: FileElement) => number, reversed: boolean) {
        this.sortElements((files) => files.sort((a, b) => mapper(a) - mapper(b)), reversed)
    }
}
