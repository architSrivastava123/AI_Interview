import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService } from '../services/interviewService.js';
import { useSpeechToText } from '../hooks/useSpeechToText.js';
import { QuestionCard } from '../components/interview/QuestionCard.jsx';
import { SpeechRecorder } from '../components/interview/SpeechRecorder.jsx';
import { AnswerEditor } from '../components/interview/AnswerEditor.jsx';
import { InterviewProgress } from '../components/interview/InterviewProgress.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { Send, ArrowRight, CheckCircle2, Award, AlertCircle } from 'lucide-react';

export default function Interview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(1);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepEvaluation, setStepEvaluation] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [error, setError] = useState('');

  const {
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
  } = useSpeechToText();

  // Combine speech transcript with typed answer
  const combinedAnswer = transcript ? `${transcript} ${typedAnswer}`.trim() : typedAnswer;

  const loadSession = async () => {
    try {
      setIsLoadingSession(true);
      const res = await interviewService.getById(id);
      const data = res.data;
      setInterview(data.interview);
      setQuestions(data.questions || []);

      if (data.interview.status === 'completed') {
        navigate(`/reports/${id}`);
        return;
      }

      // If no questions exist yet, start the interview
      if (!data.questions || data.questions.length === 0) {
        const startRes = await interviewService.start(id);
        setCurrentQuestion(startRes.data.question);
        setCurrentOrder(1);
      } else {
        const lastQ = data.questions[data.questions.length - 1];
        const answers = data.answers || [];
        const isLastAnswered = answers.some((a) => a.questionId === lastQ._id);

        if (isLastAnswered && data.questions.length < data.interview.totalQuestions) {
          // Fetch next question
          const nextRes = await interviewService.nextQuestion(id);
          if (nextRes.data?.question) {
            setCurrentQuestion(nextRes.data.question);
            setCurrentOrder(data.questions.length + 1);
          }
        } else {
          setCurrentQuestion(lastQ);
          setCurrentOrder(data.questions.length);
        }
      }
      setIsLoadingSession(false);
    } catch (err) {
      console.error('Failed to load session:', err);
      setError(err.message || 'Failed to load interview session.');
      setIsLoadingSession(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [id]);

  const handleSubmitAnswer = async () => {
    if (!combinedAnswer.trim()) {
      setError('Please provide an answer via speech or typing before submitting.');
      return;
    }

    if (isListening) {
      stopListening();
    }

    setError('');
    setIsSubmitting(true);

    try {
      const res = await interviewService.submitAnswer(id, {
        questionId: currentQuestion._id,
        answerText: combinedAnswer,
        durationSeconds: duration,
      });

      setStepEvaluation(res.data);
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to evaluate answer.');
    }
  };

  const handleNextStep = async () => {
    if (stepEvaluation?.isComplete || currentOrder >= (interview?.totalQuestions || 5)) {
      // Complete interview and navigate to reports
      try {
        setIsSubmitting(true);
        await interviewService.complete(id);
        navigate(`/reports/${id}`);
      } catch (err) {
        setIsSubmitting(false);
        setError(err.message || 'Failed to complete interview.');
      }
      return;
    }

    try {
      setIsSubmitting(true);
      const nextRes = await interviewService.nextQuestion(id);
      if (nextRes.data?.isComplete) {
        await interviewService.complete(id);
        navigate(`/reports/${id}`);
        return;
      }

      setCurrentQuestion(nextRes.data.question);
      setCurrentOrder((prev) => prev + 1);
      setStepEvaluation(null);
      setTypedAnswer('');
      resetTranscript();
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to advance to next question.');
    }
  };

  if (isLoadingSession) {
    return (
      <div className="py-20 flex items-center justify-center">
        <LoadingSpinner text="Retrieving technical knowledge context and interview graph..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Session Progress Header */}
      <InterviewProgress
        current={currentOrder}
        total={interview?.totalQuestions || 5}
      />

      {error && (
        <div className="mb-4 p-3 bg-rose-950/40 border border-rose-900/60 rounded-md text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Main Question Display */}
      <div className="mb-6">
        <QuestionCard
          question={currentQuestion}
          currentOrder={currentOrder}
          totalQuestions={interview?.totalQuestions || 5}
        />
      </div>

      {/* Evaluation Drawer / View if Answer has been submitted */}
      {stepEvaluation ? (
        <Card className="bg-slate-900 border-indigo-900/60 mb-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">Question Evaluation</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Score:</span>
              <span className="text-sm font-bold text-slate-100 code-font">
                {stepEvaluation.scores?.overall || 0}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Technical</span>
              <span className="text-xs font-semibold code-font text-slate-200">
                {stepEvaluation.scores?.technical}%
              </span>
            </div>
            <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Fluency</span>
              <span className="text-xs font-semibold code-font text-slate-200">
                {stepEvaluation.scores?.fluency}%
              </span>
            </div>
            <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Pace</span>
              <span className="text-xs font-semibold code-font text-slate-200">
                {stepEvaluation.scores?.pace}%
              </span>
            </div>
            <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Confidence</span>
              <span className="text-xs font-semibold code-font text-slate-200">
                {stepEvaluation.scores?.confidence}%
              </span>
            </div>
            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 block">Communication</span>
              <span className="text-xs font-semibold code-font text-slate-200">
                {stepEvaluation.scores?.communication}%
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded border border-slate-800/80">
            <span className="font-medium text-indigo-300 block mb-1">Feedback:</span>
            {stepEvaluation.evaluation?.feedback}
          </div>

          {stepEvaluation.evaluation?.missingConcepts && stepEvaluation.evaluation.missingConcepts.length > 0 && (
            <div className="text-xs">
              <span className="text-slate-400 block mb-1 font-medium">Missing Concepts:</span>
              <div className="flex flex-wrap gap-1.5">
                {stepEvaluation.evaluation.missingConcepts.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 bg-rose-950/40 text-rose-300 border border-rose-900/40 rounded text-[11px] code-font">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {stepEvaluation.nextDifficulty && (
                <span>
                  Adaptive next difficulty: <strong className="text-slate-200">{stepEvaluation.nextDifficulty}</strong>
                </span>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleNextStep}
              isLoading={isSubmitting}
              className="gap-2"
            >
              <span>{currentOrder >= (interview?.totalQuestions || 5) ? 'Finish & Generate Report' : 'Next Question'}</span>
              <ArrowRight size={15} />
            </Button>
          </div>
        </Card>
      ) : (
        /* Answer Input Section */
        <div className="space-y-4">
          <SpeechRecorder
            isListening={isListening}
            onStart={startListening}
            onStop={stopListening}
            duration={duration}
            wpm={wpm}
            fillerCount={fillerCount}
            interimTranscript={interimTranscript}
            isSupported={isSupported}
          />

          <AnswerEditor
            value={combinedAnswer}
            onChange={(val) => {
              setTranscript('');
              setTypedAnswer(val);
            }}
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Answer will be analyzed for technical correctness, pacing, and filler word density.
            </span>

            <Button
              variant="primary"
              size="md"
              onClick={handleSubmitAnswer}
              isLoading={isSubmitting}
              disabled={!combinedAnswer.trim() || isSubmitting}
              className="gap-2"
            >
              <Send size={14} />
              <span>Submit Answer</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
