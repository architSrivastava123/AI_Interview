/**
 * useSpeechToText.js
 * Custom hook integrating the browser's Web Speech API with real-time WPM,
 * live interim captions, duration tracking, and filler word detection.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const FILLER_WORDS = ['um', 'uh', 'ah', 'like', 'basically', 'actually', 'you know', 'literally', 'sort of'];

export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [wpm, setWpm] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fillerCount, setFillerCount] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let currentFinal = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          currentFinal += result[0].transcript + ' ';
        } else {
          currentInterim += result[0].transcript;
        }
      }

      if (currentFinal) {
        setTranscript((prev) => {
          const updated = (prev + ' ' + currentFinal).trim();

          // Calculate real-time filler words
          const lower = updated.toLowerCase();
          let fillers = 0;
          for (const f of FILLER_WORDS) {
            const regex = new RegExp(`\\b${f}\\b`, 'gi');
            const matches = lower.match(regex);
            if (matches) fillers += matches.length;
          }
          setFillerCount(fillers);

          return updated;
        });
      }

      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // If user is still meant to be listening, resume recognition
      if (isListening && recognitionRef.current) {
        try {
          recognition.start();
        } catch {
          // ignore
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isListening]);

  // Duration & WPM tracking timer
  useEffect(() => {
    if (isListening) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsedSec);

        // Update WPM
        if (elapsedSec > 2) {
          setTranscript((curr) => {
            const words = curr.trim().split(/\s+/).filter((w) => w.length > 0).length;
            const currentWpm = Math.round((words / elapsedSec) * 60);
            setWpm(currentWpm);
            return curr;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isListening]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      setInterimTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    } catch (err) {
      console.warn('Recognition already started or failed:', err);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      setIsListening(false);
      recognitionRef.current.stop();
    } catch (err) {
      console.warn('Error stopping recognition:', err);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setWpm(0);
    setDuration(0);
    setFillerCount(0);
  }, []);

  return {
    isListening,
    transcript,
    setTranscript,
    interimTranscript,
    wpm,
    duration,
    fillerCount,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
