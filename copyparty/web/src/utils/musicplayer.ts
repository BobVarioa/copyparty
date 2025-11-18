import { Formats } from "./formats";

interface SongInfo {
	file: string;
	name: string;
	artist: string;
	cover: string;

	length?: number;
}

export enum PlaybackState {
	PLAYING,
	PAUSED,
	LOADING,
	NONE,
}

export class MusicPlayer {
	hasAudioCodecs = true;
	queue: SongInfo[] = [];
	playbackState: PlaybackState = PlaybackState.NONE;

	constructor() {

	}

	getPlaybackState(): PlaybackState {
		return this.playbackState;
	}

	isPlayable(ext: string) {
		return Formats.AV.has(ext);
	}

	async play() {}

	async pause() {}

	async nextSong() {}

	async prevSong() {}

	songLength() {}

	isLooping() {}

	setLooping(state: boolean) {}

	async seek(seconds: number) {}

	getQueue(): SongInfo[] {
		throw 0;
	}

	enqueue(file: string, position = -1) {}

	dequeue(position: number) {}

	loadPlaylist(file: string) {}

	savePlaylist(toFile: string) {}
}
