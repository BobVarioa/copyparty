import { DataJson } from "./types";
import { UA } from "./useragent";

enum SettingTypes {
    STRING,
    BOOLEAN,
    NUMBER,
    STRING_SET,
}

const SETTINGS: Partial<Record<keyof SettingValues, SettingTypes>> = {
    CROP_THUMBS: SettingTypes.BOOLEAN,
    HI_RES_THUMBS: SettingTypes.BOOLEAN,
    NO_THUMBS: SettingTypes.BOOLEAN,
    CACHE_KEY: SettingTypes.STRING,
    TS: SettingTypes.STRING,
    VIEW: SettingTypes.STRING,
    HIDDEN_HEADERS: SettingTypes.STRING_SET,
    ASK_FOR_SAVE_LOCATION: SettingTypes.STRING,
    GRID_ITEM_SIZE: SettingTypes.NUMBER,
    SIDEBAR_COLLAPSED: SettingTypes.BOOLEAN,
    OPEN_BEHAVIOR: SettingTypes.STRING,
    DIRS_BEFORE_FILES: SettingTypes.BOOLEAN,
    USE_UP2K: SettingTypes.BOOLEAN,
};

export interface SettingValues {
    /**
     * Should we center crop thumbnails?
     */
    CROP_THUMBS: boolean;
    /**
     * Should we use a higher-resolution thumbnail?
     */
    HI_RES_THUMBS: boolean;

    /**
     * Disable thumbnails.
     */
    NO_THUMBS: boolean;

    /**
     * The current cache buster parameter for urls.
     */
    CACHE_KEY: string;

    /**
     * Timestamp?
     */
    TS: string;

    /**
     * User's preferred view
     */
    VIEW: "any" | "grid" | "music" | "list";

    /**
     * Headers that the user has hidden.
     */
    HIDDEN_HEADERS: Set<string>;

    /**
     * Are markdown plugins enabled?
     */
    MD_PLUGINS: boolean;

    /**
     * Whether Markdown will render a newline on double-newline or two tailing spaces
     */
    MD_NEWLINE: boolean;

    /**
     * Should markdown be sandboxed?
     */
    SANDBOX_MD: boolean;

    /**
     * Should logues be sandboxed?
     */
    SANDBOX_LOGUE: boolean;

    /**
     * If sandboxing markdown, which iframe cabilities should be allowed?
     * Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox
     */
    SANDBOX_MD_CAPABILITIES: string[];

    /**
     * If sandboxing logues, which iframe cabilities should be allowed?
     * Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox
     */
    SANDBOX_LOGUES_CAPABILITIES: string[];

    /**
     * If sandboxing markdown, what should be the value of the iframe's allow attribute?
     */
    SANDBOX_MD_ALLOW: string;

    /**
     * If sandboxing logues, what should be the value of the iframe's allow attribute?
     */
    SANDBOX_LOGUE_ALLOW: string;

    /**
     * When downloading files, ask for the save location for each file.
     */
    ASK_FOR_SAVE_LOCATION: "never" | "always" | "single";

    /**
     * The web root of the server, e.g. /copyparty-root/ if copyparty is hosted on domain.com/copyparty-root/
     */
    BASE_PATH: string;

    /**
     * The size of each grid item's thumbnail in px. -1 is that they should grow to an automatic size;
     */
    GRID_ITEM_SIZE: number;

    /**
     * Should the sidebar be collapsed?
     */
    SIDEBAR_COLLAPSED: boolean;

    /**
     * The default behavior for clicking on a link leading to a file.
     */
    OPEN_BEHAVIOR: "view" | "goto";

    /**
     * If directories will appear before files in applicable cases.
     */
    DIRS_BEFORE_FILES: boolean;

    /**
     * When to use a wasm-hasher instead of the browser's builtin. 
     * [0] = only when necessary (non-https), 
     * [1] = always (all browsers), 
     * [2] = always on chrome/firefox, 
     * [3] = always on chrome, 
     * [N] = chrome-version N and newer
     */
    USE_SUBTLE: number;

    /**
     * Should we use up2k?
     */
    USE_UP2K: boolean;

    /**
     * Should we use web workers (when possible)?
     */
    USE_WORKERS: boolean;

    /**
     * How many workers should we use when hashing?
     */
    THREADS: number;
}

export class Settings {
    static opts: Partial<Record<keyof SettingValues, any>> = {};

    static load(config: DataJson) {
        this.loadOrDefault("CROP_THUMBS", true);
        this.loadOrDefault("HI_RES_THUMBS", false);
        this.loadOrDefault("NO_THUMBS", false);
        this.loadOrDefault("CACHE_KEY", "1");
        this.loadOrDefault("VIEW", "any");
        this.loadOrDefault("HIDDEN_HEADERS", new Set(["ac", "fmt", "res", "vc", ".aq", ".q", ".fps", ".vq", "w", "circle", ".files"]));
        this.loadOrDefault("ASK_FOR_SAVE_LOCATION", "always");
        this.loadOrDefault("GRID_ITEM_SIZE", -1);
        this.loadOrDefault("SIDEBAR_COLLAPSED", false);
        this.loadOrDefault("OPEN_BEHAVIOR", "view");
        this.loadOrDefault("DIRS_BEFORE_FILES", true);
        this.loadOrDefault("USE_UP2K", true);
        
        // unsaved settings
        this.opts.TS = config.ts;
        this.opts.BASE_PATH = config.basePath;
        this.opts.MD_PLUGINS = config.cgv1.have_emp == 1;
        this.opts.SANDBOX_LOGUE = config.sb_lg != "";
        this.opts.SANDBOX_LOGUE_ALLOW = config.cgv1.sba_lg;
        if (config.sb_lg != "") {
            this.opts.SANDBOX_LOGUES_CAPABILITIES = config.sb_lg.split(" ").map((v) => `allow-${v}`);
        } else {
            this.opts.SANDBOX_LOGUES_CAPABILITIES = ""
        }
        
        this.opts.SANDBOX_MD = config.cgv1.sb_md != "";
        this.opts.SANDBOX_MD_ALLOW = config.cgv1.sba_md;
        if (config.cgv1.sb_md != "") {
            this.opts.SANDBOX_MD_CAPABILITIES = config.cgv1.sb_md.split(" ").map((v) => `allow-${v}`);
        } else {
            this.opts.SANDBOX_MD_CAPABILITIES = ""
        }

        this.opts.USE_WORKERS = true; // i believe there's a way to disable this in og copyparty, might need to be saveable
        
        
        // settings with complex defaults / deps / etc
        this.opts.USE_SUBTLE = config.cgv1.nosubtle;

        let threads = Math.min(navigator.hardwareConcurrency ?? 4, 16);
        if (UA.CHROME) {
            // chrome-bug 383568268 // #124
            threads = Math.max(1, (threads > 4 ? 4 : (threads - 1)));
            if (UA.VCHROME < 137 && this.opts.USE_SUBTLE && !UA.MOBILE && threads > 2) {
                threads = 2;
            }
        }

        this.loadOrDefault("THREADS", threads);

    }

    static get<T extends keyof SettingValues>(key: T): SettingValues[T] {
        // @ts-expect-error this is fine
        return this.opts[key];
    }

    static set<T extends keyof SettingValues>(key: T, value: SettingValues[T]) {
        this.opts[key] = value;
    }

    static save(key: keyof SettingValues) {
        if (this.opts[key] == undefined) return;

        switch (SETTINGS[key]) {
            case SettingTypes.STRING:
                localStorage.setItem(key, this.opts[key].toString());
                break;
            case SettingTypes.BOOLEAN:
                localStorage.setItem(key, this.opts[key] ? "1" : "0");
                break;
            case SettingTypes.NUMBER:
                localStorage.setItem(key, this.opts[key].toString());
                break;
            case SettingTypes.STRING_SET:
                localStorage.setItem(key, JSON.stringify([...this.opts[key]]));
                break;
        }
    }

    static loadOrDefault<T extends keyof SettingValues>(key: T, def: SettingValues[T]) {
        const item = localStorage.getItem(key);
        // console.log(key, item);
        if (item != undefined) {
            switch (SETTINGS[key]) {
                case SettingTypes.STRING:
                    this.opts[key] = item;
                    break;
                case SettingTypes.BOOLEAN:
                    this.opts[key] = item === "1";
                    break;
                case SettingTypes.NUMBER:
                    this.opts[key] = Number.parseFloat(item);
                    break;
                case SettingTypes.STRING_SET:
                    this.opts[key] = new Set(JSON.parse(item));
                    break;
            }
        } else {
            this.opts[key] = def;
        }
    }
}
