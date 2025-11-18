import { $, $c, $i } from "../utils/elements";
import { FileManager } from "../utils/filemanager";
import { BaseElement } from "./baselement";

export class NavbarElement extends BaseElement {
    fs: FileManager;

    constructor(anchor: HTMLElement, fs: FileManager) {
        super(anchor);
		this.fs = fs;
    }

    init() {
        this.fs.addListener(() => this.updateNavBar());
    }

    updateNavBar() {
        this.anchor.replaceChildren();

        const root = $c("li");
        const rootLink = $c("a");
        rootLink.href = "/?h";
        rootLink.appendChild($i("tree"));
        root.appendChild(rootLink);
        this.anchor.appendChild(root);

        const paths = this.fs.path.split("/");
        let path = "/";
        for (let i = 0; i < paths.length; i++) {
            let item = paths[i];
            if (item.length > 0) {
                path += item + "/";
                const ele = $c("li");
                const eleLink = $c("a", decodeURIComponent(item));
                eleLink.href = path;
                ele.appendChild(eleLink);
                this.anchor.appendChild(ele);
            }
        }
    }
}
