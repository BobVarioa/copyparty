export enum Key {
    CLOSE,
    VIEW_TOGGLE,
    TOGGLE_THUMBNAILS,
    ZOOM_IN,
    ZOOM_OUT,
    NEXT,
    PREV,
    SELECT,
    HELP,

    FILE_DELETE,
    FILE_CUT,
    FILE_COPY,
    FILE_PASTE,
    FILE_DOWNLOAD,
    FILE_RENAME,
    FILE_EDIT,
    FILE_CLOSE,

    FILE_SELECT_ALL,
    FILE_CURSOR_UP,
    FILE_CURSOR_DOWN,
    FILE_VIEW_CURSOR_UP,
    FILE_VIEW_CURSOR_DOWN,
    FILE_SELECT_CURSOR_UP,
    FILE_SELECT_CURSOR_DOWN,

    TOGGLE_NAVPANE,
    NEXT_FOLDER,
    PREV_FOLDER,
    PARENT_FOLDER,
    TOGGLE_TEXT_FILES,
    NAVPANE_ZOOM_IN,
    NAVPANE_ZOOM_OUT,

    JUMP_0,
    JUMP_1,
    JUMP_2,
    JUMP_3,
    JUMP_4,
    JUMP_5,
    JUMP_6,
    JUMP_7,
    JUMP_8,
    JUMP_9,
    PLAY,
    SKIP_BACK,
    SKIP_FORWARD,
    LOOP,
    MUTE,
    LOOP_IN,
    LOOP_OUT,

    VIEWER_FIRST,
    VIEWER_LAST,
    VIEWER_NEXT,
    VIEWER_PREV,
    VIEWER_FULLSCREEN,
    VIEWER_ROTATE_CW,
    VIEWER_ROTATE_CCW,

    LENGTH, // must be last element
}

export type KeyListener = (mode: string) => boolean;

export class Keybinds {
    static DATA_KEY = "KEYBIND_DATA";

    keys = new Map<Key, Set<string>>();
    revKeys = new Map<string, Key>();

    events = new Map<Key, Array<KeyListener>>();

    modeStack: string[] = [];
    savedData: string[][];

    constructor() {
        document.addEventListener("keydown", (ev) => {
            const code = ev.code.startsWith("Key") ? ev.code.slice(3) : ev.code;

            const bind = this.serializeKey(code, ev.ctrlKey, ev.shiftKey, ev.altKey);
            const key = this.revKeys.get(bind);

            if (key != undefined) {
                const events = this.events.get(key);

                if (events?.length > 0) {
                    for (const listener of events) {
                        if (listener(this.modeStack[0])) break;
                    }
                    ev.preventDefault();
                }
            }
        });

        this.loadKey(Key.CLOSE, "Escape");
        this.loadKey(Key.VIEW_TOGGLE, "G");
        this.loadKey(Key.TOGGLE_THUMBNAILS, "T");
        this.loadKey(Key.ZOOM_IN, "+D");
        this.loadKey(Key.ZOOM_OUT, "+A");
        this.loadKey(Key.NEXT, "J");
        this.loadKey(Key.PREV, "L");
        this.loadKey(Key.SELECT, "S");
        this.loadKey(Key.HELP, "+?");

        this.loadKey(Key.FILE_DELETE, "^K");
        this.loadKey(Key.FILE_CUT, "^X");
        this.loadKey(Key.FILE_COPY, "^C");
        this.loadKey(Key.FILE_PASTE, "^V");
        this.loadKey(Key.FILE_DOWNLOAD, "Y");
        this.loadKey(Key.FILE_RENAME, "F2");
        this.loadKey(Key.FILE_EDIT, "E");
        this.loadKey(Key.FILE_CLOSE, "M");
        this.loadKey(Key.FILE_SELECT_ALL, "^A");
        this.loadKey(Key.FILE_CURSOR_UP, "ArrowUp");
        this.loadKey(Key.FILE_CURSOR_DOWN, "ArrowDown");
        this.loadKey(Key.FILE_VIEW_CURSOR_UP, "^ArrowUp");
        this.loadKey(Key.FILE_VIEW_CURSOR_DOWN, "^ArrowDown");
        this.loadKey(Key.FILE_SELECT_CURSOR_UP, "+ArrowUp");
        this.loadKey(Key.FILE_SELECT_CURSOR_DOWN, "+ArrowDown");

        this.loadKey(Key.TOGGLE_NAVPANE, "B");
        this.loadKey(Key.NEXT_FOLDER, "I");
        this.loadKey(Key.PREV_FOLDER, "K");
        this.loadKey(Key.PARENT_FOLDER, "M");
        this.loadKey(Key.TOGGLE_TEXT_FILES, "V");
        this.loadKey(Key.NAVPANE_ZOOM_IN, "A");
        this.loadKey(Key.NAVPANE_ZOOM_OUT, "D");

        this.loadKey(Key.JUMP_0, "0");
        this.loadKey(Key.JUMP_1, "1");
        this.loadKey(Key.JUMP_2, "2");
        this.loadKey(Key.JUMP_3, "3");
        this.loadKey(Key.JUMP_4, "4");
        this.loadKey(Key.JUMP_5, "5");
        this.loadKey(Key.JUMP_6, "6");
        this.loadKey(Key.JUMP_7, "7");
        this.loadKey(Key.JUMP_8, "8");
        this.loadKey(Key.JUMP_9, "9");

        this.loadKey(Key.PLAY, "P", "K", "Space");
        this.loadKey(Key.SKIP_BACK, "U");
        this.loadKey(Key.SKIP_FORWARD, "O");
        this.loadKey(Key.LOOP, "V");
        this.loadKey(Key.MUTE, "M"); // TODO: conflict
        this.loadKey(Key.LOOP_IN, "]");
        this.loadKey(Key.LOOP_OUT, "[");

        this.loadKey(Key.VIEWER_FIRST, "Home");
        this.loadKey(Key.VIEWER_LAST, "End");
        this.loadKey(Key.VIEWER_NEXT, "ArrowRight");
        this.loadKey(Key.VIEWER_PREV, "ArrowLeft");
        this.loadKey(Key.VIEWER_FULLSCREEN, "F");
        this.loadKey(Key.VIEWER_ROTATE_CW, "R");
        this.loadKey(Key.VIEWER_ROTATE_CCW, "+R");
    }

    pushMode(str: string) {
        this.modeStack.unshift(str);
        console.log(this.modeStack);
    }

    popMode(str: string = undefined) {
        if (this.modeStack[0] == str) {
            this.modeStack.shift();
        } else if (str == undefined) {
            this.modeStack.shift();
        }
        console.log(this.modeStack);
    }

    setKey(key: Key, bind: string) {
        let keys = this.keys.get(key);
        if (keys == undefined) {
            keys = new Set();
            this.keys.set(key, keys);
        }
        keys.add(bind);
        this.revKeys.set(bind, key);
    }

    removeKey(key: Key, bind: string) {
        let keys = this.keys.get(key);
        if (keys == undefined) {
            keys = new Set();
            this.keys.set(key, keys);
        }
        keys.delete(bind);
        this.revKeys.delete(bind);
    }

    serializeKey(key: string, ctrl: boolean, shift: boolean, alt: boolean) {
        let str = "";
        if (ctrl) str += "^";
        if (shift) str += "+";
        if (alt) str += "!";
        str += key;
        return str;
    }

    save() {
        const data: string[][] = new Array(Key.LENGTH).fill(undefined);

        for (const [key, binds] of this.keys.entries()) {
            const arr = data[key];
            for (const bind of binds) {
                arr.push(bind);
            }
        }

        localStorage.setItem(Keybinds.DATA_KEY, JSON.stringify(data));
        this.savedData = data;
    }

    loadKey(key: Key, ...defaultBinds: string[]) {
        if (this.savedData == undefined) {
            const val = localStorage.getItem(Keybinds.DATA_KEY);
            if (val != undefined) {
                this.savedData = JSON.parse(val);
            } else {
                this.savedData = [];
            }
        }

        let keys = this.keys.get(key);
        if (keys == undefined) {
            keys = new Set();
            this.keys.set(key, keys);
        }

        let savedBinds = this.savedData[key];
        if (savedBinds == undefined) {
            savedBinds = defaultBinds;
        }

        for (const bind of savedBinds) {
            keys.add(bind);
            this.revKeys.set(bind, key);
        }
    }

    addListener(key: Key, listener: KeyListener) {
        let arr = this.events.get(key);
        if (arr == undefined) {
            arr = [];
            this.events.set(key, arr);
        }

        arr.push(listener);
    }
}
