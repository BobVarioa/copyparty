export interface Tags {
    /**
     * Wark, the first 16 characters of the unique file identifier
     */
    w: string;
    /**
     * Audio Codec
     */
    ac: string;
    /**
     * Format
     */
    fmt: string;
    /**
     * Resolution
     */
    res: string;
    /**
     * Video Codec
     */
    vc: string;
    /**
     * Audio Bitrate
     */
    ".aq": number;
    /**
     * Bitrate
     */
    ".q": number;
    /**
     * Frames per second
     */
    ".fps": number;
    /**
     * Video Bitrate
     */
    ".vq": number;
    /**
     * Duration in seconds
     */
    ".dur": number;
    /**
     * Track number
     */
    ".tn": number;
    /**
     * The number of files in a directory
     */
    ".files": number;

    title: string;
    artist: string;
    circle: string;
}
