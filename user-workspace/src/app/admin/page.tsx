"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type SentencePair = {
  keyword: string;
  sentence: string;
};

type Settings = {
  wordDelay: number;
  repeatCount: number;
  speechRate: number;
  speechPitch: number;
};

export default function AdminPage() {
  const [sentences, setSentences] = useState<SentencePair[]>([]);
  const [keyword, setKeyword] = useState("");
  const [sentence, setSentence] = useState("");
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<Settings>({
    wordDelay: 10,
    repeatCount: 1,
    speechRate: 0.8,
    speechPitch: 1.2,
  });

  const loadSentences = () => {
    try {
      const stored = localStorage.getItem("sentences");
      setSentences(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.error("Error loading sentences:", e);
    }
  };

  useEffect(() => {
    loadSentences();
    const storedSettings = localStorage.getItem("settings");
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  const saveSentences = (sentences: SentencePair[]) => {
    localStorage.setItem("sentences", JSON.stringify(sentences));
    loadSentences();
  };

  const addSentence = () => {
    if (!keyword.trim() || !sentence.trim()) {
      setError("Please fill in both fields");
      return;
    }
    if (sentence.trim().split(/\s+/).length !== 3) {
      setError("Please enter exactly three words for the sentence");
      return;
    }
    setError("");
    const newSentences = [...sentences, { keyword: keyword.trim(), sentence: sentence.trim() }];
    saveSentences(newSentences);
    setKeyword("");
    setSentence("");
  };

  const deleteSentence = (index: number) => {
    if (confirm("Are you sure you want to delete this sentence?")) {
      const newSentences = sentences.filter((_, i) => i !== index);
      saveSentences(newSentences);
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem("settings", JSON.stringify(settings));
      alert("Settings saved successfully!");
    } catch (e) {
      console.error("Error saving settings:", e);
      alert("Error saving settings. Please try again.");
    }
  };

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all sentences and settings? This cannot be undone.")) {
      localStorage.removeItem("sentences");
      localStorage.removeItem("settings");
      setSentences([]);
      setSettings({
        wordDelay: 10,
        repeatCount: 1,
        speechRate: 0.8,
        speechPitch: 1.2,
      });
      alert("All data has been cleared.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link 
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Learning Page
          </Link>
          <Button 
            onClick={clearAllData}
            variant="destructive"
          >
            Clear All Data
          </Button>
        </div>

        <Card className="mb-8 p-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Manage Sentences
          </h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keyword:
              </label>
              <Input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter a single word"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Three Word Sentence:
              </label>
              <Input
                type="text"
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                placeholder="Enter a three word sentence"
                className="w-full"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>

            <Button 
              onClick={addSentence}
              className="w-full"
            >
              Add Sentence
            </Button>
          </div>
        </Card>

        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Speech Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seconds between keyword and sentence:
              </label>
              <Input
                type="number"
                value={settings.wordDelay}
                onChange={(e) => setSettings({ ...settings, wordDelay: Number(e.target.value) })}
                min={1}
                max={30}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of times to repeat:
              </label>
              <Input
                type="number"
                value={settings.repeatCount}
                onChange={(e) => setSettings({ ...settings, repeatCount: Number(e.target.value) })}
                min={1}
                max={5}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speech Speed (0.5 - 2.0):
              </label>
              <Input
                type="number"
                value={settings.speechRate}
                onChange={(e) => setSettings({ ...settings, speechRate: Number(e.target.value) })}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speech Pitch (0.5 - 2.0):
              </label>
              <Input
                type="number"
                value={settings.speechPitch}
                onChange={(e) => setSettings({ ...settings, speechPitch: Number(e.target.value) })}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          <Button 
            onClick={saveSettings}
            className="mt-6 w-full"
            variant="secondary"
          >
            Save Settings
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Saved Sentences
          </h2>
          
          {sentences.length > 0 ? (
            <div className="space-y-4">
              {sentences.map((pair, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-bold text-gray-900">{pair.keyword}</span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className="text-gray-600">{pair.sentence}</span>
                  </div>
                  <Button
                    onClick={() => deleteSentence(index)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No sentences added yet.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
