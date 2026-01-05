import "./styles/About.css";
import { config } from "../config";

const About = () => {
  // Split the description into paragraphs
  const paragraphs = config.about.description.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <h3 className="title">{config.about.title}</h3>
        {/* Using 'about-content' class instead of 'para' to avoid text splitter animation */}
        <div className="about-content">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="about-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
