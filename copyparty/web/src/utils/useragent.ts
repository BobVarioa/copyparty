// @ts-nocheck half of these are specific to different browsers, and other such things, so typings cannot be consistent

export class UA {
    static readonly TOUCH: boolean = "ontouchstart" in window;
    static readonly MOBILE: boolean = UA.TOUCH;

    static readonly CHROME: boolean = !!window.chrome; // safari=false
    static readonly VCHROME: number = UA.CHROME ? 1 : 0;

    static readonly USER_AGENT: string = navigator.userAgent.toString();
    static readonly FIREFOX: boolean = "netscape" in window && / rv:/.test(UA.USER_AGENT);
    static readonly IPHONE: boolean = UA.TOUCH && /iPhone|iPad|iPod/i.test(UA.USER_AGENT);
    static readonly LINUX: boolean = /Linux/.test(UA.USER_AGENT);
    static readonly MACOS: boolean = /Macintosh/.test(UA.USER_AGENT);
    static readonly WINDOWS: boolean = /Windows/.test(UA.USER_AGENT);
    static readonly APPLE: boolean = UA.IPHONE || UA.MACOS;
    static readonly APPLEM: boolean = UA.TOUCH && UA.APPLE;

    static init() {
        try {
            if (navigator.userAgentData.mobile) UA.MOBILE = true;

            if (navigator.userAgentData.platform == "Windows") UA.WINDOWS = true;

            const chromeBrand = navigator.userAgentData.brands.find(function (d) {
                return d.brand == "Chromium";
            });
            if (chromeBrand != undefined) {
                UA.VCHROME = parseInt(chromeBrand.version);
                UA.CHROME = true;
            } else {
                UA.VCHROME = 0;
            }
        } catch (e) {}
    }
}
