"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type SentencePair = {
  keyword: string;
  sentence: string;
};

export default function LearningPage() {
  const [sentences, setSentences] = useState<SentencePair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentPair, setCurrentPair] = useState<SentencePair | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getSentences = () => {
    try {
      const stored = localStorage.getItem("sentences");
      return stored ? JSON.parse(stored) : [{ keyword: "hungry", sentence: "I am hungry" }];
    } catch (error) {
      console.error("Error reading sentences:", error);
      return [];
    }
  };

  const getSettings = () => {
    try {
      const stored = localStorage.getItem("settings");
      return stored
        ? JSON.parse(stored)
        : { wordDelay: 10, repeatCount: 1, speechRate: 0.8, speechPitch: 1.2 };
    } catch (error) {
      console.error("Error reading settings:", error);
      return { wordDelay: 10, repeatCount: 1, speechRate: 0.8, speechPitch: 1.2 };
    }
  };

  useEffect(() => {
    setSentences(getSentences());
    speechSynthesisRef.current = window.speechSynthesis;
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      speechSynthesisRef.current?.cancel();
    };
  }, []);

  const speak = (text: string, onComplete?: () => void) => {
    if (!speechSynthesisRef.current) {
      alert("Sorry, your browser does not support Speech Synthesis.");
      return;
    }
    
    console.log(`[speak] Starting to speak: "${text}"`);
    speechSynthesisRef.current.cancel();
    setIsPlaying(true);
    
    const settings = getSettings();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.speechRate;
    utterance.pitch = settings.speechPitch;
    
    utterance.onstart = () => {
      console.log(`[speak] Utterance started: "${text}"`);
      setIsPlaying(true);
    };
    
    utterance.onend = () => {
      console.log(`[speak] Utterance ended: "${text}"`);
      setIsPlaying(false);
      if (onComplete) onComplete();
    };
    
    utterance.onerror = (event) => {
      console.error(`[speak] Utterance error: "${text}"`, event);
      setIsPlaying(false);
    };
    
    speechSynthesisRef.current.speak(utterance);
    console.log(`[speak] Utterance queued: "${text}"`);
  };

  const speakWord = () => {
    if (!currentPair) return;
    console.log("[speakWord] Speaking keyword:", currentPair.keyword);
    speak(currentPair.keyword);
  };

  const speakSentence = () => {
    if (!currentPair) return;
    console.log("[speakSentence] Speaking sentence:", currentPair.sentence);
    speak(currentPair.sentence);
  };

  const showNextPair = () => {
    if (sentences.length === 0) return;
    
    let nextIndex = currentIndex;
    if (sentences.length === 1) {
      nextIndex = 0;
    } else {
      do {
        nextIndex = Math.floor(Math.random() * sentences.length);
      } while (nextIndex === currentIndex);
    }
    
    console.log("[showNextPair] Next index:", nextIndex);
    setCurrentIndex(nextIndex);
    const pair = sentences[nextIndex];
    setCurrentPair(pair);
    console.log("[showNextPair] New pair:", pair);
    
    // Only speak the word initially
    speak(pair.keyword);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center relative p-4">
      <Link 
        href="/admin"
        className="absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        Admin
      </Link>

      <div className="bg-white shadow-xl rounded-2xl p-8 text-center max-w-2xl w-full">
        <div className="text-4xl font-bold text-gray-800 min-h-[120px] flex items-center justify-center mb-8">
          {currentPair ? currentPair.keyword : "Click Start"}
        </div>
        
        <div className="text-3xl text-gray-700 min-h-[120px] flex items-center justify-center mb-8">
          {currentPair?.sentence || ""}
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={showNextPair}
            disabled={isPlaying}
            className="text-lg px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentIndex === -1 ? "Start" : "Next"}
          </button>
          
          {currentPair && (
            <>
              <button
                onClick={speakWord}
                disabled={isPlaying}
                className="text-lg px-8 py-4 border border-gray-400 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Word Only
              </button>
              <button
                onClick={speakSentence}
                disabled={isPlaying}
                className="text-lg px-8 py-4 border border-gray-400 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Full Sentence
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
