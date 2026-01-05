import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import Loading from "../components/Loading";
import BackgroundMusic, { BackgroundMusicHandle } from "../components/BackgroundMusic";
import PortfolioTour from "../components/PortfolioTour";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(0);
  const musicRef = useRef<BackgroundMusicHandle>(null);

  // Create a ref object that PortfolioTour can use to access audio element
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Update audioElementRef when music component mounts
  useEffect(() => {
    if (musicRef.current) {
      audioElementRef.current = musicRef.current.getAudioElement();
    }
  });

  const value = {
    isLoading,
    setIsLoading,
    setLoading,
  };

  const handleTourComplete = () => {
    // Tour completed - could add additional logic here if needed
  };

  return (
    <LoadingContext.Provider value={value as LoadingType}>
      <BackgroundMusic ref={musicRef} />
      <PortfolioTour
        audioRef={audioElementRef}
        onTourComplete={handleTourComplete}
      />
      {isLoading && <Loading percent={loading} />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
