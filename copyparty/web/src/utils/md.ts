import { type Token, type TokenizerAndRendererExtension, type Marked as MarkedImport } from "marked";
import { type gfmHeadingId } from "marked-gfm-heading-id";
import { Settings } from "./settings";
import { getThumbUrl } from "./strings";

/*
Copyparty MD Extensions:
- `!th[flags](some.jpg)`: renders a thumbnail that shows the image viewer when clicked
- ```copyparty_pre [...]```: allows you to write a markdown extension inline
- ```copyparty_post [...]```: allows you to run code inside the sandbox after the dom has loaded 

*/

let Marked: typeof MarkedImport;
let markedHeadingPlugin: typeof gfmHeadingId;
let DOMPurify: typeof import("dompurify");

const thumbStart = /!th\[/;
const thumbFull = /!th\[([lr]*)]\(([^)]+)\)/;

const thumbsPlugin: TokenizerAndRendererExtension = {
    name: "thumb",
    level: "inline",
    start(src: string) {
        return src.match(thumbStart)?.index;
    },
    tokenizer(str: string, tokens: Token[]) {
        const match = thumbFull.exec(str);
        if (match) {
            return {
                type: "thumb",
                raw: match[0],
                flags: match[1],
                url: match[2],
            };
        }
    },
    renderer(token) {
        const style = token.flags.indexOf("l") != -1 ? "l" :  token.flags.indexOf("r") != -1 ? "r" : "";
        return `<a href="${token.url}" class="mdth mdth${style}"><img src="${getThumbUrl(token.url, undefined, true)}" /></a>`;
    },
};

export const mdToHTML = async (text: string) => {
    if (Marked == undefined) {
        try {
            Marked = (await import("marked")).Marked;
            markedHeadingPlugin = (await import("marked-gfm-heading-id")).gfmHeadingId;
        } catch (e) {
            throw e;
        }
    }

    if (DOMPurify == undefined && !Settings.get("MD_PLUGINS")) {
        try {
            // @ts-expect-error im pretty sure the typings are wrong, this works
            DOMPurify = (await import("dompurify")).default;
        } catch (e) {
            throw e;
        }
    }

    let md = new Marked({
        breaks: !Settings.get("MD_NEWLINE"),
        gfm: true,
        async: true,
    });
    md.use(markedHeadingPlugin({ prefix: "md-" }));
    if (text.indexOf("<!-- th -->") != -1) {
        md.use({ extensions: [thumbsPlugin] });
    }

    let res = await md.parse(text);

    if (!Settings.get("MD_PLUGINS")) {
        res = DOMPurify.sanitize(res);
    }

    return res;
};
