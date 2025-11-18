import { ActionBarElement } from "./ui/actionbar";
import { parseFavicon } from "./ui/favicon";
import { FileListElement } from "./ui/filelist";
import { FileGridElement } from "./ui/grid";
import { MusicListElement } from "./ui/musiclist";
import { NavbarElement } from "./ui/navbar"; 
import { SidebarElement } from "./ui/sidebar";
import { $, $c, $id } from "./utils/elements";
import { FileManager } from "./utils/filemanager";
import { Modal } from "./ui/modal";
import { MusicPlayer } from "./utils/musicplayer";
import { Settings, SettingValues } from "./utils/settings";
import { getPath } from "./utils/strings";
import { DataJson } from "./utils/types";
import { FileAccessor } from "./utils/fileaccess";
import { Viewer } from "./ui/viewer";
import { Sandbox } from "./utils/sandbox";
import { Formats } from "./utils/formats";
import { Keybinds } from "./utils/keybinds";
import { ViewSelector } from "./ui/viewselector";

document.addEventListener("DOMContentLoaded", () => {
    const data: DataJson = JSON.parse($id("data").textContent);
    Settings.load(data);

    // TODO: this is pretty jank, this should be changed to be more reasonable from the server
    let fs = new FileManager({ ...data, ...data.ls0, srvinfo: "", cfg: data.cgv1, logues: data.logues });

    let favicon: HTMLLinkElement;
    if (data.favico.length > 0) {
        try {
            favicon = $('head>link[rel~="icon"]') as HTMLLinkElement;
        } catch (e) {
            favicon = $c("link");
            favicon.rel = "icon";
            $("head").appendChild(favicon);
            favicon.href = parseFavicon(data.favico);
        }
    }

    $id("root").addEventListener("click", (e) => {
        const ele = e.target as HTMLElement | null;
        if (ele != undefined && ele.tagName === "A") {
            const path = ele.attributes.getNamedItem("href")!.value;
            if (path.at(-1) == "/" && path != "/") {
                const folder = getPath(path);
                window.history.pushState(folder, "", folder);
                fs.setPath(folder);
                e.preventDefault();
            }
        }
    });

    // general utils
    FileAccessor.init();
    Formats.init(data.cgv1.have_acode);
    const musicPlayer = new MusicPlayer();
    const keybinds = new Keybinds();
    
    // ui utils
    Modal.init($id("modalRoot"));
    const actionBar = new ActionBarElement($id("actionbar"), fs);
    actionBar.init();
    const viewer = new Viewer(fs, keybinds);
    const sandbox = new Sandbox(viewer);
    
    // ui views
    const fileList = new FileListElement($id("files"), fs, actionBar, viewer);
    fileList.init();
    const musicList = new MusicListElement($id("music"), fs, musicPlayer, actionBar);
    musicList.init();
    const grid = new FileGridElement($id("grid"), fs, viewer, actionBar, keybinds);
    grid.init();
    
    // misc
    const srvInfo = $id("srv_info");

    const viewSelector = new ViewSelector($id("view-selector"), fs, keybinds);
    viewSelector.addView("grid", grid, "fa-table-cells-large");
    viewSelector.addView("music", musicList, "fa-music");
    viewSelector.addView("list", fileList, "fa-list");


    fs.addListener(async () => {
        const ls = await fs.ls();

        if (ls.srvinfo) {
            srvInfo.textContent = ls.srvinfo;
        }

        if (favicon != undefined && ls.cfg.ufavico != undefined) {
            favicon.href = ls.cfg.ufavico;
        }

        let pro = ls.readmes[0];

        if (pro.length > 0) {
            sandbox.create(pro, "pro", true).then((ele) => {
                $id("prologue").classList.add("md");
                $id("prologue").replaceChildren($c("span", "PREADME.md"), ele);
            });
        } else {
            $id("prologue").classList.remove("md");
            pro = ls.logues[0];
            if (pro.length > 0) {
                sandbox.create(pro, "pro", false).then((ele) => {
                    $id("prologue").replaceChildren(ele);
                });
            } else {
                $id("prologue").replaceChildren();
            }
        }

        let epi = ls.readmes[1];

        if (epi.length > 0) {
            sandbox.create(epi, "epi", true).then((ele) => {
                $id("epilogue").classList.add("md");
                $id("epilogue").replaceChildren($c("span", "README.md"), ele);
            });
        } else {
            $id("epilogue").classList.remove("md");
            epi = ls.logues[1];

            if (epi.length > 0) {
                sandbox.create(epi, "epi", false).then((ele) => {
                    $id("epilogue").replaceChildren(ele);
                });
            } else {
                $id("epilogue").replaceChildren();
            }
        }

        const hash = location.hash;

        if (hash.startsWith("#gf")) {
            const id = hash.slice(4) // gf-<id>

            for (const file of ls.files) {
                if (id == file.id) {
                    viewer.showFile(file);
                    break;
                }
            }
        }
    });

    const sidebar = new SidebarElement($id("sidebar"), $id("sidebar-toggle"), fs);
    sidebar.init();

    const navbar = new NavbarElement($(".navbar > ul"), fs);
    navbar.init();


    // TODO: figure out why the server returns null for some clients
    if (data.ls0 == null) {
        fs.lsDirty = true;
        fs.lastLS = undefined;
        fs.ls().then(() => {
            fs.onPathUpdate();
        });
    } else {
        fs.onPathUpdate();
    }

    window.addEventListener("popstate", (e) => {
        fs.setPath(window.location.pathname);
    });
});
