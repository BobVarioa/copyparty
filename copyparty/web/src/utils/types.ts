import { type SettingValues } from "./settings";
import { Tags } from "./tags";

export interface GeneralConfig {
    SPINNER: string;
    s_name: string;
    idp_login: string;
    have_up2k_idx: boolean;
    have_acode: boolean;
    have_c2flac: boolean;
    have_c2wav: boolean;
    have_shr: string;
    shr_who: string;
    have_zip: boolean;
    have_mv: boolean;
    have_del: boolean;
    have_unpost: number;
    /**
     * @see {SettingValues#MD_PLUGINS}
     */
    have_emp: number;
    /**
     * @see {SettingValues#MD_NEWLINE}
     */
    md_no_br: number;
    // ext_th: {},
    /**
     * @see {SettingValues#SANDBOX_MD}
     */
    sb_md: "" | "y" | string;
    /**
     * @see {SettingValues#SANDBOX_MD_ALLOW}
     */
    sba_md: string;
    /**
     * @see {SettingValues#SANDBOX_MD_ALLOW}
     */
    sba_lg: string;
    txt_ext: string;
    def_hcols: string[];
    unlist0: string;
    see_dots: boolean;
    dqdel: number;
    /**
     * Should the default view be the grid view?
     */
    dgrid: boolean;
    dgsel: boolean;
    /**
     * Should the default view be the music view?
     */
    dmusic: boolean;
    dnsort: boolean;
    dhsortn: number;
    dsort: string;
    dcrop: string;
    dth3x: string;
    dvol: number;
    idxh: number;
    dutc: boolean;
    dfszf: string;
    themes: number;
    turbolvl: number;
    /**
     * @see {SettingValues#USE_SUBTLE}
     */
    nosubtle: number;
    u2j: number;
    u2sz: string;
    u2ts: string;
    u2ow: number;
    frand: boolean;
    lifetime: number;
    u2sort: string;
}

export interface DataJson {
    acct: string;
    ls0: {
        dirs: LSFile[];
        files: LSFile[];
        taglist: string[];
    };
    perms: string[];
    readmes: [string, string];
    cgv1: GeneralConfig;
    basePath: string;
    favico: string;
    ts: string;
    logues: [string, string];
    /**
     * @see {SettingValues#SANDBOX_LOGUES}
     */
    sb_lg: "" | "y" | string;
}

/**
 * A wrapper for File.
 * @see File
 */
export interface FileInfo {
    name: string;
    lastModified: number;
    size: number;
    file: File;
    /**
     * The full path to the file.
     * @note initialized by up2k
     */
    path?: string;
    /**
     * @note initialized by up2k
     */
    chunks?: number;
    /**
     * @note initialized by up2k
     */
    chunksize?: number;
}

export interface FileInfoResponse {
    dwrk: string; // TODO: idk what this is used for
    /**
     * The generated file key of the uploaded file
     */
    fk: string;
    hash: string[]; // TODO: idk what this is used for, maybe the already uploaded hashes?
    /**
     * The file's last modify date.
     */
    lmod: number;
    /**
     * The file's name
     */
    name: string;
    /**
     * The full path to the uploaded file
     */
    purl: string;
    /**
     * The file's size.
     */
    size: number;
    sprs: true; // TODO: idk what this is used for
    /**
     * The file's wark. A unique identifier for this file.
     */
    wark: string;
} 

export interface LSFile {
    /**
     * A crc32 hash of the filename
     * @note not in the initial request, added by the client
     */
    id: string;
    /**
     * The file's filename
     * @note not in the initial request, added by the client
     */
    name: string;
    lead: string;
    href: string;
    sz: number;
    ext: string;
    ts: number;
    tags: Partial<Tags>;
}
export interface VolumeConfig {
    idx: boolean;
    itag: boolean;
    dgrid: boolean;
    dmusic: boolean;
    dnsort: boolean;
    dnsortn: boolean;
    dsort: string;
    dcrop: string;
    dth3x: string;
    u2ts: string;
    shr_who: string;
    frand: boolean;
    lifetime: number;
    unlist: string;
    sb_lg: string;
    ufavico?: string;
}
export interface LSResponse {
    dirs: LSFile[];
    files: LSFile[];
    taglist: (keyof Tags)[];
    srvinfo: string;
    acct: string;
    perms: string[];
    cfg: VolumeConfig;
    logues: [string, string];
    readmes: [string, string];
}
export interface TreeResponse {
    [k: `k${string}`]: TreeResponse;
    a?: string[];
}
