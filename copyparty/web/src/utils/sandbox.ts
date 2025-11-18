import { Viewer } from "../ui/viewer";
import { $, $c, $id } from "./elements";
import { mdToHTML } from "./md";
import { Settings } from "./settings";

export class Sandbox {
    viewer: Viewer;

    constructor(viewer: Viewer) {
        this.viewer = viewer;
    }

    async create(str: string, className: string, markdown: boolean): Promise<HTMLIFrameElement> {
        if (markdown) {
            str = await mdToHTML(str);
        }

        let hash = location.hash;
        let want = "";

        if (hash.startsWith("#md-")) want = hash.slice(1);

        const srcdoc = /*html*/ `<html class="iframe ${document.documentElement.className}">
            <head>
                <link rel="stylesheet" media="screen" href="${Settings.get("BASE_PATH")}/.cpr/dist/ui.css?_=${Settings.get("TS")}" />
                <link rel="stylesheet" media="screen" href="${Settings.get("BASE_PATH")}/.cpr/dist/logue.css?_=${Settings.get("TS")}" />
                <base target="_parent">
            </head>
            <body id="b" class="logue ${className} ${markdown ? "mdo" : ""}">
                ${str} 
                <script type="module" src="${Settings.get("BASE_PATH")}/.cpr/dist/logue.js?_=${Settings.get("TS")}"></script>
                <script type="application/json" id="config">{"hash":"${want}","url":"${location.href.split("?")[0]}"}</script>
            </body>
        </html>`;

        const iframe = $c("iframe");
        iframe.setAttribute("title", "folder " + className);
        iframe.sandbox = Settings.get(markdown ? "SANDBOX_MD_CAPABILITIES" : "SANDBOX_LOGUES_CAPABILITIES").join(" ");
        iframe.allow = Settings.get(markdown ? "SANDBOX_MD_ALLOW" : "SANDBOX_LOGUE_ALLOW");
        iframe.srcdoc = srcdoc;

        const handler = (ev: MessageEvent<any>) => {
            if (!iframe.isConnected) {
                window.removeEventListener("message", handler);
            }

            if (ev.source === iframe.contentWindow) {
                const [command, ...args] = ev.data.split(" ");

                if (command === "iheight") {
                    iframe.height = args[0] + "px";
                }

                if (command === "iscroll") {
                    const content = iframe.parentElement.parentElement;
                    const height = iframe.offsetTop - content.offsetTop + parseInt(args[0]);
                    console.log(height);
                    content.scrollTo({
                        top: height,
                        behavior: "smooth",
                    });
                }

                if (command === "ishow") {
                    this.viewer.showImage(args[0]);
                }
            }
        };
        window.addEventListener("message", handler);

        return iframe;
    }
}
