import { Settings } from "./settings";

export const getFileName = (str: string): string => {
    str = removeQuery(str);
    const nameBegin = str.lastIndexOf("/");
    if (nameBegin != -1) {
        return str.slice(nameBegin + 1);
    }
    return str;
};

export const removeQuery = (str: string): string => {
    const idx = str.indexOf("?");
    if (idx != -1) {
        return str.slice(0, idx);
    }
    return str;
};

export const getExtension = (str: string): string => {
    const url = removeQuery(str);
    const dotIndex = url.lastIndexOf(".");
    if (dotIndex == -1) {
        return "unk";
    }
    return url.slice(dotIndex + 1);
};

export const unix2iso = (ts: number) => {
    return new Date(ts * 1000).toISOString().replace("T", " ").slice(0, -5);
};

export const pad2 = (v: number) => {
    return v.toString().padStart(2, "0");
};

export const formatString = (str: string, ...args: string[]) => {
    return str.replace(/{(\d+)}/g, (match: any, sub: number) => {
        return typeof args[sub] != "undefined" ? args[sub] : match;
    });
};

export const unix2iso_localtime = (ts: number) => {
    var o = new Date(ts * 1000);
    return formatString(
        "{0}-{1}-{2} {3}:{4}:{5}",
        o.getFullYear().toString(),
        pad2(o.getMonth() + 1),
        pad2(o.getDate()),
        pad2(o.getHours()),
        pad2(o.getMinutes()),
        pad2(o.getSeconds())
    );
};

export const unix2ui = (ts: any) => {
    if (localStorage.getItem("localtime") === "on") {
        return unix2iso(ts);
    }
    return unix2iso_localtime(ts);
};

let NATSORT: Intl.Collator | undefined;
try {
    NATSORT = new Intl.Collator([], { numeric: true });
} catch (e) {}

/**
 * @param {string[]} words
 */
export const alphabetize = (words: string[], desc = false) => {
    if (localStorage.getItem("nsort") === "1" && NATSORT !== undefined) {
        words.sort((a, b) => NATSORT.compare(a, b) * (desc ? -1 : 1));
    } else {
        words.sort((a, b) => a.localeCompare(b) * (desc ? -1 : 1));
    }
};

export const alphabetizeMapper = <T>(words: T[], mapper: (ele: T) => string, desc = false) => {
    if (localStorage.getItem("nsort") === "1" && NATSORT !== undefined) {
        words.sort((a, b) => NATSORT.compare(mapper(a), mapper(b)) * (desc ? -1 : 1));
    } else {
        words.sort((a, b) => mapper(a).localeCompare(mapper(b)) * (desc ? -1 : 1));
    }
};

export const getPath = (url: string) => {
    const u = new URL(url, window.location.href);
    return u.pathname;
};

export const secsToString = (secs: number) => {
    const hours = Math.floor(secs / 60 / 60);
    const mins = Math.floor((secs - hours * 60 * 60) / 60);
    const seconds = Math.floor(secs - hours * 60 * 60 - mins * 60);

    if (hours > 0) {
        return `${hours}:${pad2(mins)}:${pad2(seconds)}`;
    }
    return `${mins}:${pad2(seconds)}`;
};

export const getThumbUrl = (url: string, opts: string | undefined = undefined, forceThumb: boolean = false) => {
    let thumbUrl: URL;
    if (Settings.get("NO_THUMBS") && !forceThumb) {
        const ext = getExtension(url);
        thumbUrl = new URL(`${Settings.get("BASE_PATH")}.cpr/ico/${ext}`, location.origin);
    } else {
        thumbUrl = new URL(url, window.location.href);
        let thumbOpts = "w";
        if (opts != undefined) {
            thumbOpts = opts;
        } else {
            if (!Settings.get("CROP_THUMBS")) {
                thumbOpts += "f";
            }
            if (Settings.get("HI_RES_THUMBS")) {
                thumbOpts += "3";
            }
        }
        thumbUrl.searchParams.append("th", thumbOpts);
    }

    thumbUrl.searchParams.append("cache", "i");
    thumbUrl.searchParams.append("_", Settings.get("CACHE_KEY") + Settings.get("TS"));
    return thumbUrl.href;
};

const CRC_TABLE = (() => {
    let c: number;
    const tab = [];
    for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        tab[n] = c;
    }
    return tab;
})();

export const crc32 = (str) => {
    let crc = 0 ^ -1;
    for (let i = 0; i < str.length; i++) {
        crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ str.charCodeAt(i)) & 0xff];
    }
    return ((crc ^ -1) >>> 0).toString(16);
};

export const basenames = (txt: string) => {
    return txt.replace(/https?:\/\/[^ \/]+\//g, "/").replace(/js\?_=[a-zA-Z]{4}/g, "js");
};

// https://gist.github.com/jonleighton/958841
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
export const bufferToBase64 = (arrayBuffer: ArrayBuffer) => {
    const src = new Uint8Array(arrayBuffer);
    const nbytes = src.byteLength;
    const byteRem = nbytes % 3;
    const mainLen = nbytes - byteRem;
    let base64 = "";
    let a: number;
    let b: number;
    let c: number;
    let d: number;
    let chunk: number;

    for (let i = 0; i < mainLen; i = i + 3) {
        chunk = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2];
        // create 8*3=24bit segment then split into 6bit segments
        a = (chunk & 16515072) >> 18; // (2^6 - 1) << 18
        b = (chunk & 258048) >> 12; // (2^6 - 1) << 12
        c = (chunk & 4032) >> 6; // (2^6 - 1) << 6
        d = chunk & 63; // 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += ALPHABET[a] + ALPHABET[b] + ALPHABET[c] + ALPHABET[d];
    }

    if (byteRem == 1) {
        chunk = src[mainLen];
        a = (chunk & 252) >> 2; // (2^6 - 1) << 2
        b = (chunk & 3) << 4; // 2^2 - 1  (zero 4 LSB)
        base64 += ALPHABET[a] + ALPHABET[b]; //+ '==';
    } else if (byteRem == 2) {
        chunk = (src[mainLen] << 8) | src[mainLen + 1];
        a = (chunk & 64512) >> 10; // (2^6 - 1) << 10
        b = (chunk & 1008) >> 4; // (2^6 - 1) << 4
        c = (chunk & 15) << 2; // 2^4 - 1  (zero 2 LSB)
        base64 += ALPHABET[a] + ALPHABET[b] + ALPHABET[c]; //+ '=';
    }

    return base64;
};


export const bustCache = () => {
    Settings.set("CACHE_KEY", (Date.now() % 46656).toString(36));
    Settings.save("CACHE_KEY");
}