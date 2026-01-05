import "./styles/Achievements.css";
import { useEffect, useState } from "react";
import { config } from "../config";
import { MdClose } from "react-icons/md";
import Marquee from "react-fast-marquee";

const Achievements = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedTitle, setSelectedTitle] = useState<string>("");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setSelectedImage(null);
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, []);

    const openImagePopup = (image: string, title: string) => {
        setSelectedImage(image);
        setSelectedTitle(title);
    };

    const closeImagePopup = () => {
        setSelectedImage(null);
    };

    const AchievementCard = ({ achievement, index }: { achievement: typeof config.achievements[0]; index: number }) => (
        <div className="achievement-box">
            <div className="achievement-info">
                <div className="achievement-title">
                    <h3>0{index + 1}</h3>
                    <div>
                        <h4>{achievement.title}</h4>
                        <p>{achievement.issuer} • {achievement.date}</p>
                    </div>
                </div>
                <p className="achievement-description">{achievement.description}</p>
                {achievement.credentialUrl && (
                    <a
                        href={achievement.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="achievement-link"
                        data-cursor="disable"
                    >
                        View Credential →
                    </a>
                )}
            </div>
            <div className="achievement-image">
                <div
                    className="achievement-image-in"
                    onClick={() => openImagePopup(achievement.image, achievement.title)}
                    data-cursor="disable"
                    style={{ cursor: "pointer" }}
                >
                    <div className="achievement-zoom-hint">
                        Click to view full size
                    </div>
                    <img src={achievement.image} alt={achievement.title} />
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className={`achievements-section ${isMobile ? 'mobile' : ''}`} id="achievements">
                <div className="achievements-container section-container">
                    <h2>
                        My <span>Achievements</span>
                    </h2>
                    {isMobile ? (
                        // Mobile: Stacked vertical layout
                        <div className="achievements-flex mobile-flex">
                            {config.achievements.map((achievement, index) => (
                                <AchievementCard key={achievement.id} achievement={achievement} index={index} />
                            ))}
                        </div>
                    ) : (
                        // Desktop: Infinite auto-scroll marquee
                        <Marquee
                            speed={35}
                            pauseOnHover={true}
                            gradient={false}
                            className="achievements-marquee"
                        >
                            {config.achievements.map((achievement, index) => (
                                <AchievementCard key={achievement.id} achievement={achievement} index={index} />
                            ))}
                            {/* Duplicate for seamless loop */}
                            {config.achievements.map((achievement, index) => (
                                <AchievementCard key={`dup-${achievement.id}`} achievement={achievement} index={index} />
                            ))}
                        </Marquee>
                    )}
                </div>
            </div>

            {/* Full-screen Image Popup Modal */}
            {selectedImage && (
                <div className="achievement-modal-overlay" onClick={closeImagePopup}>
                    <div className="achievement-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="achievement-modal-close" onClick={closeImagePopup}>
                            <MdClose />
                        </button>
                        <h3 className="achievement-modal-title">{selectedTitle}</h3>
                        <img src={selectedImage} alt={selectedTitle} className="achievement-modal-image" />
                    </div>
                </div>
            )}
        </>
    );
};

export default Achievements;
