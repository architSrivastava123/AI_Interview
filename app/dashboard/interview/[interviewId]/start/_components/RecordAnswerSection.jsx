"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useRef } from "react";
import { 
  Mic, 
  StopCircle, 
  Loader2, 
  Video, 
  VideoOff, 
  Sparkles, 
  Volume2 
} from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModal";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import Webcam from "react-webcam";

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
  
  // Webcam & Canvas Blur states
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  const [isBlurActive, setIsBlurActive] = useState(false);
  
  // Real-Time Captions state
  const [liveCaption, setLiveCaption] = useState("");
  const [wpm, setWpm] = useState(0);

  const recognitionRef = useRef(null);
  const recordingStartTimeRef = useRef(null);
  const accumulatedDurationRef = useRef(0);
  
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  // Feature 2: Audio Context References for Pitch & Decibel Visualizer
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const dataArrayRef = useRef(null);
  const audioCanvasRef = useRef(null);
  const audioRequestRef = useRef(null);

  // HTML5 Real-Time Canvas Video Frame Render Loop (Vignette Portrait Blur)
  const drawFrame = () => {
    if (webcamRef.current && webcamRef.current.video && canvasRef.current) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (isBlurActive) {
          ctx.save();
          ctx.filter = 'blur(16px)';
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.restore();
          
          ctx.save();
          ctx.beginPath();
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radiusX = canvas.width * 0.32;
          const radiusY = canvas.height * 0.42;
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
          
          ctx.clip();
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.restore();
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
      }
    }
    requestRef.current = requestAnimationFrame(drawFrame);
  };

  useEffect(() => {
    if (webCamEnabled) {
      requestRef.current = requestAnimationFrame(drawFrame);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [webCamEnabled, isBlurActive]);

  // Audio Wave Painter
  const startAudioVisualizer = (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      audioContextRef.current = new AudioCtx();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      const drawAudio = () => {
        if (!audioCanvasRef.current) return;
        const canvas = audioCanvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Double resolution for smooth graphics
        canvas.width = canvas.parentElement.clientWidth * 2;
        canvas.height = 80;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        const barWidth = (canvas.width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArrayRef.current[i] * 0.28;
          
          const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
          grad.addColorStop(0, '#6366f1');
          grad.addColorStop(0.5, '#8b5cf6');
          grad.addColorStop(1, '#ec4899');
          ctx.fillStyle = grad;
          
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 4, barHeight);
          x += barWidth;
        }
        audioRequestRef.current = requestAnimationFrame(drawAudio);
      };
      
      drawAudio();
    } catch (e) {
      console.warn("Vocal analyzer failed to start", e);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (interimTranscript) {
          setLiveCaption(interimTranscript);
        } else if (finalTranscript) {
          setLiveCaption(finalTranscript);
        }

        const currentAnswer = (userAnswer + ' ' + finalTranscript).trim();
        if (finalTranscript.trim()) {
          setUserAnswer(prev => (prev + ' ' + finalTranscript).trim());
        }

        // Real-time Speaking Pace speed tracking (WPM)
        const words = currentAnswer.split(/\s+/).filter(w => w.length > 0).length;
        const elapsed = recordingStartTimeRef.current
          ? (Date.now() - recordingStartTimeRef.current) / 1000
          : 0;
        const computedWPM = elapsed > 2 ? Math.round((words / elapsed) * 60) : 0;
        setWpm(computedWPM);
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
      if (audioRequestRef.current) cancelAnimationFrame(audioRequestRef.current);
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
      
      // Clean up audio context monitor
      if (audioRequestRef.current) cancelAnimationFrame(audioRequestRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioContextRef.current) audioContextRef.current.close();

      setLiveCaption("");
      toast.info("Recording stopped");
    } else {
      recognitionRef.current.start();
      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);
      setLiveCaption("Listening... speak clearly into your microphone.");
      
      // Start microphone frequency monitor stream
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          startAudioVisualizer(stream);
        })
        .catch(err => {
          console.warn("Pitch and decibel monitor not active:", err);
        });

      toast.info("Recording started");
    }
  };

  const handleWebcamToggle = () => {
    if (!webCamEnabled) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => {
          setWebCamEnabled(true);
          toast.success("Interview camera studio enabled");
        })
        .catch((error) => {
          toast.error("Failed to access camera media stream");
          console.error("Camera access error:", error);
        });
    } else {
      setWebCamEnabled(false);
      setIsBlurActive(false);
    }
  };

  const UpdateUserAnswer = async () => {
    if (!userAnswer.trim() || userAnswer.split(" ").length < 4) {
      toast.warning("Please provide a substantial answer of at least 4 words.");
      return;
    }
    setLoading(true);

    try {
      if (isRecording && recordingStartTimeRef.current) {
        const elapsed = (Date.now() - recordingStartTimeRef.current) / 1000;
        accumulatedDurationRef.current += elapsed;
        recordingStartTimeRef.current = null;
        recognitionRef.current.stop();
        setIsRecording(false);
      }

      // Cleanup visualizer
      if (audioRequestRef.current) cancelAnimationFrame(audioRequestRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioContextRef.current) audioContextRef.current.close();

      const feedbackPrompt = "Question: " + mockInterviewQuestion[activeQuestionIndex]?.question + 
        ", User Answer: " + userAnswer + 
        ". Please evaluate this answer based on correctness, technical depth, and industry standards. Provide a numeric rating from 1 to 10 and construct clear, actionable feedback for improvement. Respond strictly in JSON format matching this exact schema: { \"rating\": <number>, \"feedback\": \"<text>\" }. Do not include any extra text, markdown code blocks, backticks, or other formatting.";
      
      const result = await chatSession.sendMessage(feedbackPrompt);
      const rawText = result.response.text();
      
      const cleaned = rawText.replace(/```json|```/gi, "").trim();
      let JsonfeedbackResp;
      try {
        JsonfeedbackResp = JSON.parse(cleaned);
      } catch (parseErr) {
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
      setLiveCaption("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete AI grading. Please try saving again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center flex-col relative w-full space-y-6">
      
      {/* Camera Studio Box */}
      <div className="w-full max-w-xl glass-panel p-4 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col items-center">
        
        {webCamEnabled && (
          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored={true}
            className="hidden"
            onUserMediaError={() => {
              toast.error("Webcam stream interrupted");
              setWebCamEnabled(false);
            }}
          />
        )}

        <div className="w-full aspect-[4/3] rounded-2xl bg-[#090d16] border border-white/5 relative overflow-hidden flex items-center justify-center">
          
          {webCamEnabled ? (
            <canvas ref={canvasRef} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <div className="text-center space-y-3 z-10 px-6">
              <div className="p-4 rounded-full bg-white/[0.02] border border-white/5 inline-block text-gray-500">
                <VideoOff size={32} />
              </div>
              <h4 className="text-sm font-bold text-white tracking-wide">Interview Studio Camera Offline</h4>
              <p className="text-gray-500 text-[11px] leading-relaxed max-w-xs mx-auto">
                Turn on your camera to simulate a face-to-face assessment. Video is processed locally and never stored.
              </p>
            </div>
          )}

          {/* Cyber Overlay Grid lines */}
          <div className="absolute inset-0 cyber-grid opacity-[0.05] pointer-events-none" />

          {/* Real-Time Floating Transcription Captions Overlay */}
          {isRecording && liveCaption && (
            <div className="absolute bottom-4 left-4 right-4 bg-[#070a13]/85 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl text-center z-20 shadow-xl transition-all duration-300">
              <p className="text-white text-[11px] sm:text-xs font-semibold tracking-wide flex items-center justify-center gap-2">
                <Volume2 size={13} className="text-indigo-400 animate-pulse shrink-0" />
                <span className="text-gray-300">🎙️ "{liveCaption}"</span>
              </p>
            </div>
          )}

        </div>

        {/* Webcam Controller Utility Bar */}
        <div className="w-full flex items-center justify-between mt-4 border-t border-white/5 pt-3.5">
          <Button
            variant="ghost"
            onClick={handleWebcamToggle}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
              webCamEnabled 
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20" 
                : "bg-white/5 text-gray-300 border border-white/5 hover:bg-white/10"
            }`}
          >
            {webCamEnabled ? (
              <>
                <VideoOff size={14} /> Stop Camera
              </>
            ) : (
              <>
                <Video size={14} /> Start Camera
              </>
            )}
          </Button>

          {webCamEnabled && (
            <Button
              onClick={() => setIsBlurActive(prev => !prev)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
                isBlurActive
                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20"
                  : "bg-white/5 text-gray-300 border border-white/5 hover:bg-white/10"
              }`}
            >
              <Sparkles size={14} className={isBlurActive ? "animate-pulse" : ""} />
              {isBlurActive ? "Disable Portrait Blur" : "Portrait Room Blur"}
            </Button>
          )}
        </div>

      </div>

      {/* Speech Recording controls */}
      <div className="w-full max-w-xl flex flex-col items-center">
        
        <Button 
          disabled={loading} 
          variant={isRecording ? "destructive" : "outline"} 
          className={`h-16 w-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
            isRecording 
              ? "bg-rose-600 border-rose-500 shadow-rose-500/20 hover:scale-105" 
              : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
          }`}
          onClick={StartStopRecording}
        >
          {isRecording ? (
            <StopCircle className="h-8 w-8 text-white animate-pulse" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>

        {/* Real-time Pitch Visualizer Canvas Block */}
        {isRecording && (
          <div className="w-full mt-6 flex flex-col items-center space-y-2 animate-fade-in relative z-10">
            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase flex items-center gap-1.5">
              <Volume2 size={11} className="animate-pulse" /> Live Pitch & Frequency Monitor
            </span>
            <canvas ref={audioCanvasRef} className="w-full h-[40px] bg-[#070a13]/60 rounded-2xl border border-white/5" />
            
            <div className="flex justify-between w-full text-[9px] font-bold text-gray-500 px-1 mt-1">
              <span>Speech Pace: <strong className={wpm > 150 ? "text-rose-400 animate-pulse" : "text-indigo-400"}>{wpm} WPM</strong></span>
              <span>Target Professional Pace: 110-150 WPM</span>
            </div>

            {/* Dynamic Breathing Regulation Circle */}
            {wpm > 150 && (
              <div className="w-full p-4 mt-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center gap-4 animate-bounce relative z-10">
                <div className="relative shrink-0 flex items-center justify-center">
                  <span className="absolute w-10 h-10 bg-indigo-400/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                  <span className="absolute w-8 h-8 bg-indigo-400/40 rounded-full animate-pulse" style={{ animationDuration: '1.5s' }} />
                  <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    🧘
                  </div>
                </div>
                <div className="space-y-0.5 text-left">
                  <h5 className="text-xs font-black text-white tracking-wide uppercase">Breath Regulation Active</h5>
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    Speaking at {wpm} WPM (above professional sweet spot). Slow down, inhale... exhale... keep pacing balanced.
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

        <textarea
          className="w-full h-32 p-4 mt-8 glass-panel border border-white/5 rounded-2xl text-xs sm:text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner bg-[#0b0f19]/30 leading-relaxed resize-none"
          placeholder="Your spoken words will transcribe here. You can click 'Start Camera' above to prepare, record, and speak naturally, or type directly into this console..."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
        />
      
        <Button 
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs py-3.5 shadow-lg shadow-indigo-500/10 hover:scale-[1.01] transition-all" 
          onClick={UpdateUserAnswer} 
          disabled={loading || !userAnswer.trim()}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> AI Analyzing and Evaluating Response...
            </span>
          ) : (
            "Save and Complete Answer"
          )}
        </Button>
      </div>

    </div>
  );
};

export default RecordAnswerSection;
