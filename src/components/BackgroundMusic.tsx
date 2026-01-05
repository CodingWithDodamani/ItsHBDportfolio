import { forwardRef, useImperativeHandle, useRef } from "react";

export interface BackgroundMusicHandle {
    play: () => Promise<void>;
    pause: () => void;
    fadeOut: () => void;
    getAudioElement: () => HTMLAudioElement | null;
}

/**
 * BackgroundMusic Component
 * 
 * Plays background music for the portfolio.
 * - Can be controlled externally via ref
 * - Works on every page load/refresh
 */
const BackgroundMusic = forwardRef<BackgroundMusicHandle, object>(
    (_, ref) => {
        const audioRef = useRef<HTMLAudioElement | null>(null);

        // Expose methods to parent
        useImperativeHandle(ref, () => ({
            play: async () => {
                const audio = audioRef.current;
                if (!audio) return;

                try {
                    audio.volume = 0.3;
                    await audio.play();
                } catch (error) {
                    console.log("Audio play failed:", error);
                }
            },
            pause: () => {
                const audio = audioRef.current;
                if (audio) {
                    audio.pause();
                }
            },
            fadeOut: () => {
                const audio = audioRef.current;
                if (!audio) return;

                const fadeInterval = setInterval(() => {
                    if (audio.volume > 0.05) {
                        audio.volume = Math.max(0, audio.volume - 0.05);
                    } else {
                        audio.volume = 0;
                        audio.pause();
                        clearInterval(fadeInterval);
                    }
                }, 100);
            },
            getAudioElement: () => audioRef.current
        }));

        return (
            <audio
                ref={audioRef}
                src="/background-music.mp3"
                preload="auto"
                style={{ display: "none" }}
            />
        );
    }
);

BackgroundMusic.displayName = "BackgroundMusic";

export default BackgroundMusic;
