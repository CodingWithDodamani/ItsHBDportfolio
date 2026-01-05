import { useEffect, useRef, useState, useCallback } from "react";
import { lenis } from "./Navbar";
import gsap from "gsap";
import "./styles/PortfolioTour.css";

interface PortfolioTourProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    onTourComplete: () => void;
}

// Scroll speed configuration - optimized for smoothness
const PIXELS_PER_SECOND = 50; // Very slow, ultra-smooth (50 pixels per second)
const SCROLL_UP_SPEED = 300; // Return to top speed
const PAUSE_AT_BOTTOM = 1500; // 1.5 second pause at bottom
const FRAME_SKIP = 2; // Only update every 2 frames for smoother rendering

const PortfolioTour = ({ audioRef, onTourComplete }: PortfolioTourProps) => {
    const [isTourActive, setIsTourActive] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const tourStartedRef = useRef(false);
    const tourCancelledRef = useRef(false);
    const animationFrameRef = useRef<number | null>(null);

    // Fade out music smoothly
    const fadeOutMusic = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || audio.paused) return;

        gsap.to(audio, {
            volume: 0,
            duration: 2,
            ease: "power2.out",
            onComplete: () => {
                audio.pause();
                audio.loop = false;
            }
        });
    }, [audioRef]);

    // Stop the tour
    const stopTour = useCallback((skipMusic = false) => {
        tourCancelledRef.current = true;
        setIsTourActive(false);
        setIsVisible(false);

        // Remove tour-active class to resume animations
        document.body.classList.remove('tour-active');

        // Cancel any ongoing animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Restart Lenis for normal scrolling
        if (lenis) {
            lenis.start();
        }

        if (!skipMusic) {
            fadeOutMusic();
        }

        onTourComplete();
    }, [fadeOutMusic, onTourComplete]);

    // Handle user interaction
    const handleUserInteraction = useCallback((e: Event) => {
        if ((e.target as HTMLElement)?.closest('.tour-skip-button')) {
            return;
        }

        if (isTourActive && !tourCancelledRef.current) {
            stopTour();
        }
    }, [isTourActive, stopTour]);

    // Micro-scroll function - ultra smooth with tiny increments
    const microScroll = useCallback((
        targetY: number,
        pixelsPerSecond: number,
        onProgressUpdate?: (progress: number) => void
    ): Promise<void> => {
        return new Promise((resolve) => {
            const startY = window.scrollY;
            const distance = targetY - startY;
            const direction = distance > 0 ? 1 : -1;
            const totalDistance = Math.abs(distance);

            if (totalDistance === 0) {
                resolve();
                return;
            }

            let lastTime = performance.now();
            let traveled = 0;
            let frameCount = 0;

            const animate = (currentTime: number) => {
                if (tourCancelledRef.current) {
                    resolve();
                    return;
                }

                frameCount++;

                // Skip frames to reduce render load (update every FRAME_SKIP frames)
                if (frameCount % FRAME_SKIP !== 0) {
                    animationFrameRef.current = requestAnimationFrame(animate);
                    return;
                }
                if (tourCancelledRef.current) {
                    resolve();
                    return;
                }

                const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
                lastTime = currentTime;

                // Calculate how many pixels to move this frame
                const pixelsThisFrame = pixelsPerSecond * deltaTime;
                traveled += pixelsThisFrame;

                // Calculate new position
                const newPosition = startY + (Math.min(traveled, totalDistance) * direction);

                // Apply scroll
                window.scrollTo({
                    top: newPosition,
                    behavior: 'instant' as ScrollBehavior
                });

                // Update progress
                if (onProgressUpdate) {
                    const currentProgress = (Math.min(traveled, totalDistance) / totalDistance) * 100;
                    onProgressUpdate(currentProgress);
                }

                // Continue or complete
                if (traveled < totalDistance) {
                    animationFrameRef.current = requestAnimationFrame(animate);
                } else {
                    // Ensure we're exactly at target
                    window.scrollTo({ top: targetY, behavior: 'instant' as ScrollBehavior });
                    resolve();
                }
            };

            animationFrameRef.current = requestAnimationFrame(animate);
        });
    }, []);

    // Start the tour
    const startTour = useCallback(async () => {
        if (tourStartedRef.current || tourCancelledRef.current) return;
        tourStartedRef.current = true;

        // Pause Lenis to prevent conflicts
        if (lenis) {
            lenis.stop();
        }

        setIsTourActive(true);
        setIsVisible(true);

        // Add tour-active class to pause heavy animations
        document.body.classList.add('tour-active');

        // Start music with loop
        const audio = audioRef.current;
        if (audio) {
            audio.volume = 0.25;
            audio.loop = true;
            try {
                await audio.play();
            } catch (error) {
                console.log("Audio autoplay blocked");
            }
        }

        // Small delay for UI to settle
        await new Promise(resolve => setTimeout(resolve, 600));

        if (tourCancelledRef.current) return;

        // Get page dimensions
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const maxScroll = documentHeight - windowHeight;

        // Start at top
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        await new Promise(resolve => setTimeout(resolve, 100));

        if (tourCancelledRef.current) return;

        // Scroll down with micro-steps
        await microScroll(maxScroll, PIXELS_PER_SECOND, setProgress);

        if (tourCancelledRef.current) return;

        // Pause at bottom
        await new Promise(resolve => setTimeout(resolve, PAUSE_AT_BOTTOM));

        if (tourCancelledRef.current) return;

        // Fade out music
        fadeOutMusic();

        // Scroll back up faster
        await microScroll(0, SCROLL_UP_SPEED);

        // Complete
        if (!tourCancelledRef.current) {
            stopTour(true);
        }
    }, [audioRef, microScroll, fadeOutMusic, stopTour]);

    // Listen for tour start event
    useEffect(() => {
        const handleTourStart = () => {
            startTour();
        };

        window.addEventListener("startPortfolioTour", handleTourStart);

        return () => {
            window.removeEventListener("startPortfolioTour", handleTourStart);
        };
    }, [startTour]);

    // User interaction listeners
    useEffect(() => {
        if (isTourActive) {
            window.addEventListener("wheel", handleUserInteraction, { passive: true });
            window.addEventListener("touchstart", handleUserInteraction, { passive: true });
            window.addEventListener("keydown", handleUserInteraction);

            return () => {
                window.removeEventListener("wheel", handleUserInteraction);
                window.removeEventListener("touchstart", handleUserInteraction);
                window.removeEventListener("keydown", handleUserInteraction);
            };
        }
    }, [isTourActive, handleUserInteraction]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    if (!isVisible) return null;

    return (
        <>
            <button
                className={`tour-skip-button ${!isTourActive ? 'tour-hidden' : ''}`}
                onClick={() => stopTour()}
                aria-label="Skip tour"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Skip Tour
            </button>

            <div className={`tour-progress ${!isTourActive ? 'tour-hidden' : ''}`}>
                <span>Exploring</span>
                <div className="tour-progress-bar">
                    <div
                        className="tour-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </>
    );
};

export default PortfolioTour;
