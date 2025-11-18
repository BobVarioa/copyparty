
import { UA } from "./useragent";

export class Formats {
    static PLAYLIST = new Set(["m3u8"]);
    // prettier-ignore
    static VIDEO = new Set(["3gp","asf","avi","flv","m4v","mkv","mov","mp4","mpeg","mpeg2","mpegts","mpg","mpg2","nut","ogm","ogv","rm","ts","vob","webm","wmv"]);
    // prettier-ignore
    static AV = new Set(["aac","ac3","aif","aiff","alac","alaw","amr","ape","au","dfpwm","dts","flac","gsm","it","itgz","itxz","itz","m4a","mdgz","mdxz","mdz","mo3","mod","mp2","mp3","mpc","mptm","mt2","mulaw","oga","ogg","okt","opus","ra","s3m","s3gz","s3xz","s3z","tak","tta","ulaw","wav","wma","wv","xm","xmgz","xmxz","xmz","xpk","3gp","asf","avi","flv","m4v","mkv","mov","mp4","mpeg","mpeg2","mpegts","mpg","mpg2","nut","ogm","ogv","rm","ts","vob","webm","wmv"]);
    // prettier-ignore
    static AUDIO = new Set(["aac", "flac", "m4a", "mp3", "wav"]);
    // prettier-ignore
    static IMAGE = new Set(["apng", "png", "avif", "gif", "jpg", "jpeg", "jfif", "pjpeg", "pjp", "png", "svg", "webp"])
    
    static can_ogg = true;
    static can_owa = false;
    static can_flac = false;
    static can_caf = false;

    static init(hasAudioCodecs: boolean) {
        try {
            let za = new Audio();
            Formats.can_ogg = za.canPlayType("audio/ogg; codecs=opus") === "probably";
            Formats.can_owa = za.canPlayType("audio/webm; codecs=opus") === "probably";
            Formats.can_flac = za.canPlayType("audio/flac") === "probably";
            Formats.can_caf = UA.APPLE && za.canPlayType("audio/x-caf") != "" && !/ OS ([1-9]|1[01])_/.test(UA.USER_AGENT);
        } catch (ex) {}
        
        if (Formats.can_owa && UA.APPLE && / OS ([1-9]|1[0-7])_/.test(UA.USER_AGENT)) Formats.can_owa = false;
        
        if (Formats.can_ogg || hasAudioCodecs) {
            Formats.AUDIO.add("oga");
            Formats.AUDIO.add("ogg");
            Formats.AUDIO.add("opus");
        }
    }
}
