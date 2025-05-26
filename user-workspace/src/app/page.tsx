"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type SentencePair = {
  keyword: string;
  sentence: string;
};

export default function LearningPage() {
  const [sentences, setSentences] = useState<SentencePair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentPair, setCurrentPair] = useState<SentencePair | null>(null);
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

  const speak = (text: string) => {
    if (!speechSynthesisRef.current) {
      alert("Sorry, your browser does not support Speech Synthesis.");
      return;
    }
    console.log(`[speak] Starting to speak: "${text}"`);
    speechSynthesisRef.current.cancel();
    const settings = getSettings();
    for (let i = 0; i < settings.repeatCount; i++) {
      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = settings.speechRate;
          utterance.pitch = settings.speechPitch;
          utterance.onstart = () => console.log(`[speak] Utterance started: "${text}" (repeat ${i + 1})`);
          utterance.onend = () => console.log(`[speak] Utterance ended: "${text}" (repeat ${i + 1})`);
          utterance.onerror = (event) => console.error(`[speak] Utterance error: "${text}"`, event);
          speechSynthesisRef.current?.speak(utterance);
          console.log(`[speak] Utterance queued: "${text}" (repeat ${i + 1})`);
        } catch (e) {
          console.error("[speak] Speech error:", e);
        }
      }, i * 2500);
    }
  };

  const showNextPair = () => {
    if (sentences.length === 0) return;
    let nextIndex = currentIndex;
    // Ensure nextIndex is different from currentIndex
    if (sentences.length === 1) {
      nextIndex = 0;
    } else {
      do {
        nextIndex = Math.floor(Math.random() * sentences.length);
      } while (nextIndex === currentIndex);
    }
    console.log("Next index:", nextIndex);
    setCurrentIndex(nextIndex);
    const pair = sentences[nextIndex];
    setCurrentPair(pair);
    console.log("Showing next pair:", pair);
    speak(pair.keyword);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      speak(pair.sentence);
    }, getSettings().wordDelay * 1000);
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
          <Button 
            onClick={showNextPair}
            className="text-lg px-8 py-4"
          >
            {currentIndex === -1 ? "Start" : "Next"}
          </Button>
          
          {currentPair && (
            <>
              <Button
                onClick={() => {
                  console.log("Repeat word:", currentPair.keyword);
                  speak(currentPair.keyword);
                }}
                variant="outline"
                className="text-lg px-8 py-4"
              >
                Repeat Word
              </Button>
              <Button
                onClick={() => {
                  console.log("Repeat sentence:", currentPair.sentence);
                  speak(currentPair.sentence);
                }}
                variant="outline"
                className="text-lg px-8 py-4"
              >
                Repeat Sentence
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
