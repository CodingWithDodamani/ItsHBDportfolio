import "./styles/Work.css";
import WorkImage from "./WorkImage";
import { useEffect, useState } from "react";
import { config } from "../config";
import Marquee from "react-fast-marquee";

const Work = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const ProjectCard = ({ project, index }: { project: typeof config.projects[0]; index: number }) => (
    <div className="work-box">
      <div className="work-info">
        <div className="work-title">
          <h3>0{index + 1}</h3>
          <div>
            <h4>{project.title}</h4>
            <p>{project.category}</p>
          </div>
        </div>
        <h4>Tools and features</h4>
        <p>{project.technologies}</p>
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="work-live-link"
            data-cursor="disable"
          >
            View Live →
          </a>
        )}
      </div>
      <WorkImage image={project.image} alt={project.title} />
    </div>
  );

  return (
    <div className={`work-section ${isMobile ? 'mobile' : ''}`} id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        {isMobile ? (
          // Mobile: Stacked vertical layout
          <div className="work-flex mobile-flex">
            {config.projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        ) : (
          // Desktop: Infinite auto-scroll marquee
          <Marquee
            speed={40}
            pauseOnHover={true}
            gradient={false}
            className="work-marquee"
          >
            {config.projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
            {/* Duplicate for seamless loop */}
            {config.projects.map((project, index) => (
              <ProjectCard key={`dup-${project.id}`} project={project} index={index} />
            ))}
          </Marquee>
        )}
      </div>
    </div>
  );
};

export default Work;
