import { useState, useEffect } from "react";

interface WordCyclerProps {
  words: string[];
  interval: number;
}

const WordCycler = ({ words, interval }: WordCyclerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, words.length]);

  return (
    <span className="text-holobots-accent">
      {words[currentIndex]}
    </span>
  );
};

export default WordCycler;