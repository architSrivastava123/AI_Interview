"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useRef } from "react";
import { Mic, StopCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModal";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

const RecordAnswerSection = ({ 
  mockInterviewQuestion, 
  activeQuestionIndex, 
  interviewData, 
  onAnswerSave,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const recordingStartTimeRef = useRef(null);
  const accumulatedDurationRef = useRef(0);

  useEffect(() => {
    if (typeof window !== "undefined" && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript.trim()) {
          setUserAnswer(prev => (prev + ' ' + finalTranscript).trim());
        }
      };

      recognition.onerror = (event) => {
        toast.error("Speech recognition error: " + event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const StartStopRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Speech-to-text not supported");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      if (recordingStartTimeRef.current) {
        const elapsed = (Date.now() - recordingStartTimeRef.current) / 1000;
        accumulatedDurationRef.current += elapsed;
        recordingStartTimeRef.current = null;
      }
      toast.info("Recording stopped");
    } else {
      recognitionRef.current.start();
      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);
      toast.info("Recording started");
    }
  };

  const UpdateUserAnswer = async () => {
    if (!userAnswer.trim() || userAnswer.split(" ").length < 4) {
      toast.warning("Please provide a substantial answer of at least 4 words.");
      return;
    }
    setLoading(true);

    try {
      // In case they click save while still recording, capture final elapsed
      if (isRecording && recordingStartTimeRef.current) {
        const elapsed = (Date.now() - recordingStartTimeRef.current) / 1000;
        accumulatedDurationRef.current += elapsed;
        recordingStartTimeRef.current = null;
        recognitionRef.current.stop();
        setIsRecording(false);
      }

      const feedbackPrompt = "Question: " + mockInterviewQuestion[activeQuestionIndex]?.question + 
        ", User Answer: " + userAnswer + 
        ". Please evaluate this answer based on correctness, technical depth, and industry standards. Provide a numeric rating from 1 to 10 and construct clear, actionable feedback for improvement. Respond strictly in JSON format matching this exact schema: { \"rating\": <number>, \"feedback\": \"<text>\" }. Do not include any extra text, markdown code blocks, backticks, or other formatting.";
      
      const result = await chatSession.sendMessage(feedbackPrompt);
      const rawText = result.response.text();
      
      // Clean up markdown block wraps if returned despite instruction
      const cleaned = rawText.replace(/```json|```/gi, "").trim();
      let JsonfeedbackResp;
      try {
        JsonfeedbackResp = JSON.parse(cleaned);
      } catch (parseErr) {
        // Fallback robust regex extract if AI wraps in text
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          JsonfeedbackResp = JSON.parse(match[0]);
        } else {
          throw new Error("Unable to parse structured JSON response");
        }
      }

      const finalDuration = Math.round(accumulatedDurationRef.current);
      const answerRecord = {
        mockIdRef: interviewData?.mockId,
        question: mockInterviewQuestion[activeQuestionIndex]?.question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
        userAns: userAnswer + (finalDuration > 0 ? `|||duration:${finalDuration}` : ""),
        feedback: JsonfeedbackResp?.feedback || "No feedback generated",
        rating: String(JsonfeedbackResp?.rating || "5"),
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("DD-MM-YYYY"),
      };

      await db.insert(UserAnswer).values(answerRecord);
      onAnswerSave?.(answerRecord);
      toast.success("Answer recorded and AI evaluation complete.");
      accumulatedDurationRef.current = 0;
      setUserAnswer("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete AI grading. Please try saving again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center flex-col relative w-full">
      <div className="w-full max-w-xl flex flex-col items-center">
        <Button 
          disabled={loading} 
          variant={isRecording ? "destructive" : "outline"} 
          className="my-10 h-16 w-16 rounded-full flex items-center justify-center shadow-lg" 
          onClick={StartStopRecording}
        >
          {isRecording ? <StopCircle className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8" />}
        </Button>

        <textarea
          className="w-full h-40 p-4 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
          placeholder="Your speech transcript will populate here. Feel free to refine or type directly..."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
        />
      
        <Button className="mt-6 w-full" onClick={UpdateUserAnswer} disabled={loading || !userAnswer.trim()}>
          {loading ? "Analyzing and Grading..." : "Save Answer"}
        </Button>
      </div>
    </div>
  );
};

export default RecordAnswerSection;
