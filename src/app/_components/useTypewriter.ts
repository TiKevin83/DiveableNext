import { useState, useEffect, useRef } from "react";

const useTypewriter = (text: string, speed = 25) => {
  const [displayText, setDisplayText] = useState("");
  const typingIndex = useRef(0);

  useEffect(() => {
    setDisplayText("");
    typingIndex.current = 0;
  }, [text]);

  useEffect(() => {
    const typingInterval = setInterval(() => {
      if (typingIndex.current < text.length) {
        setDisplayText(text.slice(0, typingIndex.current++));
      } else {
        clearInterval(typingInterval);
      }
    }, speed);

    return () => {
      clearInterval(typingInterval);
    };
  }, [text, speed]);

  return displayText;
};

export default useTypewriter;
