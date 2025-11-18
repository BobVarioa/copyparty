import { $c } from "../utils/elements";
import { FileManager } from "../utils/filemanager";
import { Key, Keybinds } from "../utils/keybinds";
import { LSFile } from "../utils/types";
import { Settings } from "../utils/settings";
import { getFileName, getThumbUrl, removeQuery } from "../utils/strings";
import { ActionBarElement } from "./actionbar";
import { BaseElement } from "./baselement";
import { Viewer } from "./viewer";

export class FileGridElement extends BaseElement {
    fs: FileManager;
    viewer: Viewer;
    keybinds: Keybinds;
    actionBar: ActionBarElement;

    constructor(anchor: HTMLElement, fs: FileManager, viewer: Viewer, actionBar: ActionBarElement, keybinds: Keybinds) {
        super(anchor);
        this.fs = fs;
        this.viewer = viewer;
        this.keybinds = keybinds;
        this.actionBar = actionBar;
    }

    init() {
        this.onGridSizeChange();

        this.fs.addListener(() => {
            this.updateGridItems();
        });

        this.keybinds.addListener(Key.ZOOM_IN, (mode) => {
            if (mode == "grid") {
                console.log("here");
                let itemSize = Settings.get("GRID_ITEM_SIZE");
                if (itemSize == -1) {
                    itemSize = parseFloat(getComputedStyle(this.anchor).fontSize) * 10 + 20;
                } else {
                    itemSize += 20;
                }
                console.log(itemSize);
                Settings.set("GRID_ITEM_SIZE", itemSize);
                Settings.save("GRID_ITEM_SIZE");
                this.onGridSizeChange();
            }
            return false;
        });

        this.keybinds.addListener(Key.ZOOM_OUT, (mode) => {
            if (mode == "grid") {
                let itemSize = Settings.get("GRID_ITEM_SIZE");
                if (itemSize == -1) {
                    itemSize = parseFloat(getComputedStyle(this.anchor).fontSize) * 10 - 20;
                } else {
                    itemSize -= 20;
                }
                console.log(itemSize);
                Settings.set("GRID_ITEM_SIZE", itemSize);
                Settings.save("GRID_ITEM_SIZE");
                this.onGridSizeChange();
            }
            return false;
        });

        this.keybinds.addListener(Key.TOGGLE_THUMBNAILS, (mode) => {
            if (mode == "grid") {
                let noThumbs = Settings.get("NO_THUMBS");
                Settings.set("NO_THUMBS", !noThumbs);
                Settings.save("NO_THUMBS");
                this.updateGridItems();
            }
            return false;
        })
    }

    show() {
        super.show();
        this.actionBar.show();
        this.keybinds.pushMode("grid");
    }

    hide() {
        super.hide();
        this.keybinds.popMode("grid");
    }

    async updateGridItems() {
        const ls = await this.fs.ls();

        this.anchor.replaceChildren();

        for (const folder of ls.dirs) {
            this.anchor.appendChild(this.createGridItem(folder, 0, true));
        }

        let i = 0;
        for (const file of ls.files) {
            this.anchor.appendChild(this.createGridItem(file, i, false));
            i++;
        }
    }

    createGridItem(file: LSFile, index: number, isFolder: boolean) {
        const node = $c("div");
        node.title = file.name;

        const image = $c("img");
        image.loading = "lazy";
        image.src = getThumbUrl(file.href);
        node.appendChild(image);

        const link = $c("a", file.name);
        link.href = file.href;
        node.appendChild(link);

        if (!isFolder) {
            node.addEventListener("click", () => {
                this.viewer.showImage(file.href, file.ext, index);
            });
        }

        return node;
    }

    onGridSizeChange() {
        const itemSize = Settings.get("GRID_ITEM_SIZE");
        console.log("here", itemSize);
        if (itemSize != -1) {
            this.anchor.style.setProperty("--item-size", `${itemSize}px`);
        }
    }
}
