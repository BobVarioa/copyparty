import { $c, $i } from "../utils/elements";
import { FileManager } from "../utils/filemanager";
import { Formats } from "../utils/formats";
import { Key, Keybinds } from "../utils/keybinds";
import { LSFile } from "../utils/types";
import { getFileName, getThumbUrl } from "../utils/strings";
import { Modal } from "./modal";

export class Viewer extends Modal {
    fs: FileManager;
    keybinds: Keybinds;

    image: HTMLImageElement;
    video: HTMLVideoElement;
    title: HTMLSpanElement;
    next: HTMLButtonElement;
    prev: HTMLButtonElement;

    scale = 1;
    index = -1;
    maxIndex: number;
    x = 0;
    y = 0;

    scrollDisabled = false;

    constructor(fs: FileManager, keybinds: Keybinds) {
        super();

        this.fs = fs;
        this.keybinds = keybinds;
        fs.addListener(async () => {
            const ls = await this.fs.ls();

            this.maxIndex = ls.files.length - 1;
        });

        this.anchor.classList.add("viewer");
        this.anchor.addEventListener("wheel", (e) => {
            this.scale += e.deltaY * -0.01;
            this.scale = Math.min(Math.max(0.125, this.scale), 4);

            this.anchor.style.setProperty("--scale", this.scale.toString());
            e.preventDefault();
        });
        this.anchor.addEventListener("close", () => {
            this.keybinds.popMode("image-viewer");
            window.history.replaceState(location.pathname, "", location.pathname);
        });

        this.keybinds.addListener(Key.VIEWER_NEXT, (mode) => {
            if (mode == "image-viewer") {
                this.nextImage();
                return true;
            }
            return false;
        });

        this.keybinds.addListener(Key.VIEWER_PREV, (mode) => {
            if (mode == "image-viewer") {
                this.prevImage();
                return true;
            }
            return false;
        });

        const upperContainer = $c("div");
        upperContainer.classList.add("upper");

        this.keybinds.addListener(Key.VIEWER_FULLSCREEN, (mode) => {
            if (mode == "image-viewer") {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    upperContainer.requestFullscreen({ navigationUI: "hide" });
                }
                return true;
            }
            return false;
        });

        this.next = $c("button");
        this.next.classList.add("icon");
        this.next.appendChild($i("chevron-right"));
        this.next.addEventListener("click", () => {
            this.nextImage();
        });

        this.prev = $c("button");
        this.prev.classList.add("icon");
        this.prev.appendChild($i("chevron-left"));
        this.prev.addEventListener("click", () => {
            this.prevImage();
        });

        this.image = $c("img");
        this.image.classList.add("main");
        this.image.loading = "lazy";
        this.image.draggable = false;

        let initialX = -1;
        let initialY = -1;
        this.image.addEventListener("pointerdown", (e) => {
            if (this.scrollDisabled) return;
            initialX = e.clientX - this.x;
            initialY = e.clientY - this.y;
        });
        this.image.addEventListener("pointerup", (e) => {
            if (this.scrollDisabled) return;
            initialX = -1;
            initialY = -1;
        });
        this.image.addEventListener("mouseleave", (e) => {
            if (this.scrollDisabled) return;
            initialX = -1;
            initialY = -1;
        });
        this.image.addEventListener("pointermove", (e) => {
            if (this.scrollDisabled) return;
            if (initialX != -1) {
                this.x = e.clientX - initialX;
                this.y = e.clientY - initialY;
                this.updatePan();
            }
        });

        this.video = $c("video");
        this.video.classList.add("main");
        this.video.controls = true;
        this.title = $c("span");

        const contain = $c("div");

        this.anchor.addEventListener("click", (e) => {
            const target = e.target as Node;
            if (!contain.isSameNode(target) && contain.contains(target)) return;
            if (e.pointerId == -1) return;

            this.anchor.close();
            e.preventDefault();
        });
        contain.classList.add("inner");

        contain.appendChild(this.prev);
        contain.appendChild(this.image);
        contain.appendChild(this.video);
        contain.appendChild(this.next);
        upperContainer.appendChild(contain);

        upperContainer.appendChild(this.title);
        this.anchor.appendChild(upperContainer);
    }

    private async prevImage() {
        if (this.index != -1) {
            this.index -= 1;
            if (this.index < 0) {
                this.index = this.maxIndex;
            }

            const ls = await this.fs.ls();
            const file = ls.files[this.index];
            this.showImage(file.href, file.ext, this.index);
        }
    }

    private async nextImage() {
        if (this.index != -1) {
            this.index += 1;
            if (this.index > this.maxIndex) {
                this.index = 0;
            }

            const ls = await this.fs.ls();
            const file = ls.files[this.index];
            this.showImage(file.href, file.ext, this.index);
        }
    }

    showFile(file: LSFile, index = -1) {
        this.showImage(file.href, file.ext, index);
        const url = `${location.pathname}#gf-${file.id}`;
        window.history.replaceState(url, "", url);
    }

    showImage(href: string, ext: string = "", index = -1) {
        const filename = decodeURIComponent(getFileName(href));
        if (index != -1) {
            this.index = index;
            this.next.classList.remove("gone");
            this.prev.classList.remove("gone");
            this.title.textContent = `${filename} (${index + 1} / ${this.maxIndex + 1})`;
        } else {
            this.next.classList.add("gone");
            this.prev.classList.add("gone");
            this.title.textContent = `${filename}`;
        }

        if (Formats.VIDEO.has(ext)) {
            this.image.classList.add("gone");
            this.video.classList.remove("gone");

            this.video.src = href;
        } else if (Formats.AUDIO.has(ext)) {
        } else {
            this.video.classList.add("gone");
            this.image.classList.remove("gone");

            this.image.src = getThumbUrl(href, "w3");
        }

        this.x = 0;
        this.y = 0;
        this.updatePan();

        if (!this.anchor.open) {
            this.anchor.showModal();
            this.keybinds.pushMode("image-viewer");
        }
    }

    updatePan() {
        this.anchor.style.setProperty("--x", `${this.x}px`);
        this.anchor.style.setProperty("--y", `${this.y}px`);
    }
}
