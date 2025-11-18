import { $, $c, $i } from "../utils/elements";
import { EXTENSION_TO_TYPE, FILE_TO_TYPE, FileManager } from "../utils/filemanager";
import { MusicPlayer } from "../utils/musicplayer";
import { LSFile } from "../utils/types";
import { Settings } from "../utils/settings";
import { getFileName, getThumbUrl, removeQuery, secsToString, unix2ui } from "../utils/strings";
import { ActionBarElement } from "./actionbar";
import { BaseElement } from "./baselement";

export class MusicListElement extends BaseElement {
    fs: FileManager;
    mp: MusicPlayer;
    actionBar: ActionBarElement;

    constructor(anchor: HTMLElement, fs: FileManager, mp: MusicPlayer, actionBar: ActionBarElement) {
        super(anchor);

        this.fs = fs;
        this.mp = mp;
        this.actionBar = actionBar;
    }

    show(): void {
        super.show();
        this.actionBar.hide();
    }

    init() {
        this.fs.addListener(async () => {
            const ls = await this.fs.ls();

            this.anchor.replaceChildren();

            for (const d of ls.dirs) {
                this.anchor.appendChild(this.createMusic(d, ls.taglist, true));
            }

            for (const f of ls.files) {
                if (this.mp.isPlayable(f.ext)) {
                    this.anchor.appendChild(this.createMusic(f, ls.taglist, false));
                }
            }
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

    createMusic(file: LSFile, taglist: string[], isFolder: boolean): HTMLElement {
        /*
		<div class="music-item">
			<div class="music-left">
				<img src="{cover}" aria-hidden="true" />
				<button><i class="fa-play"></i></button>
			</div>
			<div class="music-center">
				<span>{title}</span>
				<span class="subtitle">{artist} . {length}</span>
			</div>
			<div class="music-right"><i class="fa-ellipsis-vertical"></i></div>
		</div>
		*/

        const mi = $c("div");
        mi.classList.add("music-item");

        const musicLeft = $c("div");
        musicLeft.classList.add("music-left");

        const coverImage = $c("img");
        coverImage.src = getThumbUrl(file.href);
        coverImage.loading = "lazy";
        musicLeft.appendChild(coverImage);

        if (!isFolder) {
            const playButton = $c("button");
            const playIcon = $i("play");
            playButton.appendChild(playIcon);
            // event listener and swap icons if necessary

            musicLeft.appendChild(playButton);
        } else {
            const openFolder = $c("button");
            const folderIcon = $i("folder");
            openFolder.appendChild(folderIcon);

            openFolder.addEventListener("click", () => {
                console.log(file.href);
                const folder = this.fs.path + removeQuery(decodeURIComponent(file.href));
                window.history.pushState(folder, "", folder);
                this.fs.setPath(folder);
            });

            musicLeft.appendChild(openFolder);
        }

        mi.appendChild(musicLeft);

        const musicCenter = $c("div");
        musicCenter.classList.add("music-center");

        const tags = file.tags ?? {};
        musicCenter.appendChild($c("span", tags.title ?? file.name));
        const subtitle = $c("span");
        if (tags?.artist != undefined) {
            subtitle.textContent += tags.artist;
        }
        if (tags[".dur"] != undefined) {
            if (subtitle.textContent.length > 0) {
                subtitle.textContent += " · ";
            }

            subtitle.textContent += secsToString(tags[".dur"]);
        }
        musicCenter.appendChild(subtitle);

        mi.appendChild(musicCenter);

        const musicRight = $c("div");
        musicRight.classList.add("music-right");

        const menuButton = $c("button");
        menuButton.classList.add("smallicon");
        menuButton.appendChild($i("ellipsis-vertical"));
        musicRight.appendChild(menuButton);

        mi.appendChild(musicRight);

        return mi;
    }
}
