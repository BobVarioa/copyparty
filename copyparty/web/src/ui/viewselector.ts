import { FileManager } from "../utils/filemanager";
import { Key, Keybinds } from "../utils/keybinds";
import { Settings, SettingValues } from "../utils/settings";
import { BaseElement } from "./baselement";

interface View {
    name: string;
    element: BaseElement;
    icon: string;
}

export class ViewSelector extends BaseElement {
    fs: FileManager;
    keybinds: Keybinds;

    views: View[] = [];

    constructor(anchor: HTMLElement, fs: FileManager, keybinds: Keybinds) {
        super(anchor);

        this.fs = fs;
        this.keybinds = keybinds;

        this.fs.addListener(async () => {
            const ls = await this.fs.ls();

            let view = Settings.get("VIEW");
            if (view === "any") {
                if (ls.cfg.dgrid) {
                    view = "grid";
                } else if (ls.cfg.dmusic) {
                    view = "music";
                } else {
                    view = "list";
                }
            }

            this.updateView(view);
        });

        this.anchor.addEventListener("click", async () => {
            const ls = await fs.ls();

            let defaultView: SettingValues["VIEW"];
            if (ls.cfg.dgrid) {
                defaultView = "grid";
            } else if (ls.cfg.dmusic) {
                defaultView = "music";
            } else {
                defaultView = "list";
            }

            let view = Settings.get("VIEW");
            if (view === "any") {
                view = defaultView;
            }

            if (view === "grid") {
                view = "music";
            } else if (view === "music") {
                view = "list";
            } else {
                view = "grid";
            }

            if (view == defaultView) {
                Settings.set("VIEW", "any");
            } else {
                Settings.set("VIEW", view);
            }

            Settings.save("VIEW");

            this.updateView(view);
        });

        this.keybinds.addListener(Key.VIEW_TOGGLE, () => {
            let view = Settings.get("VIEW");

            if (view === "grid") {
                view = "music";
            } else if (view === "music") {
                view = "list";
            } else {
                view = "grid";
            }
            
            Settings.set("VIEW", view);
            Settings.save("VIEW");
            this.updateView(view);
            
            return true;
        })
    }

    addView(name: string, element: BaseElement, icon: string) {
        this.views.push({ name, element, icon });
    }

    updateView(currentView: string) {
        for (const view of this.views) {
            if (view.name === currentView) {
                view.element.show();
                this.anchor.children[0].className = view.icon;
            } else {
                view.element.hide();
            }
        }
    }
}
