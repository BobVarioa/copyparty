import { $c, $id } from "../utils/elements";
import { FileManager } from "../utils/filemanager";
import { Requests } from "../utils/request";
import { TreeResponse } from "../utils/types";
import { Settings } from "../utils/settings";
import { alphabetize } from "../utils/strings";
import { BaseElement } from "./baselement";

class FileTree<K, V> {
    keyOrder: K[] = [];
    folders: Map<K, FileTree<K, V> | undefined> = new Map();
    values: Map<K, V> = new Map();

    constructor() {}

    addFolder(key: K, value: V, children: FileTree<K, V> = undefined) {
        if (this.folders.has(key)) {
            this.folders.set(key, children);
            return;
        }

        this.keyOrder.push(key);
        this.folders.set(key, children);
        this.values.set(key, value);
    }

    hasFolder(key: K): boolean {
        return this.folders.has(key);
    }

    getFolder(key: K): FileTree<K, V> | undefined {
        return this.folders.get(key);
    }

    getValue(key: K): V {
        return this.values.get(key);
    }

    getPath(pathKeys: K[]): { value?: V; children?: FileTree<K, V> } {
        const path = [...pathKeys];
        let map: FileTree<K, V> = this;
        let item: K;

        while (path.length > 1) {
            item = path.shift();

            const folder = map.folders.get(item);
            if (folder != undefined) {
                map = folder;
            } else {
                throw new RangeError("Invalid path");
            }
        }
        item = path.shift();

        return { value: map.values.get(item), children: map.folders.get(item) };
    }

    *[Symbol.iterator]() {
        for (const key of this.keyOrder) {
            yield [key, this.values.get(key), this.folders.get(key)];
        }
    }
}

export class SidebarElement extends BaseElement {
    tree: FileTree<string, { collapsed: boolean; ele: HTMLUListElement; button: HTMLButtonElement }> = new FileTree();
    treeRoot: HTMLUListElement;

    fs: FileManager;
    basePath: string;

    constructor(anchor: HTMLElement, sidebarToggle: HTMLElement, fs: FileManager) {
        super(anchor);
        this.fs = fs;

        if (Settings.get("SIDEBAR_COLLAPSED")) {
            this.anchor.classList.add("closed");
        } else {
            this.anchor.classList.remove("closed");
        }
        sidebarToggle.addEventListener("click", () => {
            this.anchor.classList.toggle("closed");
            Settings.set("SIDEBAR_COLLAPSED", !Settings.get("SIDEBAR_COLLAPSED"));
            Settings.save("SIDEBAR_COLLAPSED");
        });

        this.basePath = Settings.get("BASE_PATH") + "/";
    }

    init() {
        this.fs.addListener(() => this.updateSidebar());
    }

    addSidebarItems(
        parent: HTMLUListElement,
        map: typeof this.tree,
        items: string[],
        currentPath: string,
        selected: string = "",
    ) {
        alphabetize(items);

        for (const name of items) {
            const li = $c("li");

            const tree = $c("ul");
            if (name != selected) tree.classList.add("collapsed");

            const contain = $c("div");
            contain.classList.add("item");
            const expandButton = $c("button", name == selected ? "[-]" : "[+]");
            contain.appendChild(expandButton);

            expandButton.addEventListener("click", () => {
                tree.classList.toggle("collapsed");
                if (tree.classList.contains("collapsed")) {
                    expandButton.textContent = "[+]";
                } else {
                    expandButton.textContent = "[-]";
                    if (tree.children.length === 0) {
                        console.log(currentPath, name)
                        this.loadSidebarItems(`${this.basePath}${currentPath}${name}/`);
                    }
                }
            });

            map.addFolder(name, { collapsed: name != selected, ele: tree, button: expandButton }, new FileTree());

            const link = $c("a", decodeURIComponent(name));
            const newUrl = `${this.basePath}${currentPath}${name}/`;
            link.href = newUrl;
            contain.appendChild(link);

            li.appendChild(contain);

            li.appendChild(tree);

            parent.appendChild(li);
        }
    }

    parseTree(res: TreeResponse) {
        const paths = res.a ?? [];
        delete res.a;
        const selectedKey = Object.keys(res)[0] ?? "";
        let selectedTree: TreeResponse;
        const selected = selectedKey.slice(1);
        if (selectedKey.length !== 0) {
            paths.push(selected);

            selectedTree = res[selectedKey as any];
        }
        return { paths, selected, selectedTree };
    }

    async loadSidebarItems(currentPath: string) {
        const res = await Requests.tree(currentPath);

        const pathParts = currentPath.split("/").slice(1, -1); // ends with / and starts with /

        let path = "";
        let lastPath = "";
        let fullPath = ""; 

        let map: typeof this.tree = this.tree;
        let ele: HTMLUListElement = this.treeRoot;
        let treeRes: TreeResponse = res;

        while (pathParts.length > 0) {
            if (path != "") fullPath += path + "/";
            lastPath = path;
            path = pathParts.shift();

            if (map.hasFolder(path)) {
                ele = map.getValue(path).ele;
                map = map.getFolder(path);
                treeRes = treeRes["k" + path];
            } else {
                const obj = this.parseTree(treeRes);
                
                this.addSidebarItems(ele, map, obj.paths, fullPath, obj.selected);

                if (map.hasFolder(path)) {
                    ele = map.getValue(path).ele;
                    map = map.getFolder(path);
                    treeRes = obj.selectedTree;
                } else {
                    throw new RangeError(`Invalid url: ${currentPath}`);
                }
            }
        }

        if (ele.children.length == 0 && treeRes != undefined) {
            fullPath += path + "/";
            const obj = this.parseTree(treeRes);
            this.addSidebarItems(ele, map, obj.paths, fullPath, obj.selected);
        }
    }

    updateSidebar() {
        if (this.treeRoot == undefined) {
            const ul = this.anchor.querySelector("ul");
            ul.replaceChildren();

            const li = $c("li");
            const link = $c("a", "[root]");
            link.href = Settings.get("BASE_PATH") + "/?h";
            li.appendChild(link);

            ul.appendChild(li);

            const treeElement = $c("ul");
            this.treeRoot = treeElement;
            this.loadSidebarItems(this.fs.path);

            li.appendChild(treeElement);
        } else {
            this.loadSidebarItems(this.fs.path);
        }
    }
}
