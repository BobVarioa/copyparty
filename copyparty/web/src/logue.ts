import { $$, $id } from "./utils/elements";

interface LogueConfig {
    url: string;
    hash: string;
}

document.addEventListener("DOMContentLoaded", () => {
    const data: LogueConfig = JSON.parse($id("config").textContent);

    globalThis.loc = new URL(data.url);

    const d = document.documentElement;

    let height = 2 + Math.min(parseInt(getComputedStyle(d).height), d.scrollHeight);
    if (!Number.isNaN(height)) {
        window.parent.postMessage(`iheight ${height}`, "*");
    }

    // NOTE: ordering is important here, this must come after we fix the parent's height
    try {
        const ele = $id(data.hash);

        ele.focus();
        console.log(ele.offsetHeight, ele.offsetTop);
        window.parent.postMessage(`iscroll ${ele.offsetTop}`, "*");
    } catch (e) {
        // user put incorrect header name
    }

    $$(".mdth").forEach((ele) => {
        const img = ele.children[0] as HTMLImageElement;
        if (img.tagName == "IMG") {
            ele.addEventListener("click", (e) => {
                window.parent.postMessage(`ishow ${img.src}`, "*");
                e.preventDefault();
            });
        }
    });
});
