import { Settings } from "./settings";
import { formatString } from "./strings";

export class L {
    static langs = new Set([
        "eng",
        "nor",
        "chi",
        "cze",
        "deu",
        "epo",
        "fin",
        "fra",
        "grc",
        "ita",
        "kor",
        "nld",
        "nno",
        "pol",
        "por",
        "rus",
        "spa",
        "swe",
        "tur",
        "ukr",
    ]);

    static json: Record<string, string> = {};

    static async changeLanguage(lang: string) {
        if (this.langs.has(lang)) {
            const langJson = await import(`${Settings.get("BASE_PATH")}/.cpr/tl/${lang}.browser.json`);
            this.json = await langJson.json();
        }
    }
 
    static get(key: string, ...args: any[]) {
        if (args.length > 0) {
            return formatString(key, ...args);
        }
        return this.json[key];
    }
}
