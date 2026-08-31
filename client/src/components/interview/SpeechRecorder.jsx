import React from 'react';
import { Button } from '../ui/Button.jsx';
import { Mic, MicOff, Volume2, Clock, Activity } from 'lucide-react';

export function SpeechRecorder({
  isListening,
  onStart,
  onStop,
  duration = 0,
  wpm = 0,
  fillerCount = 0,
  interimTranscript = '',
  isSupported = true,
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPaceStatus = (speed) => {
    if (speed === 0) return { label: 'Silent / Typing', color: 'text-slate-400' };
    if (speed >= 110 && speed <= 150) return { label: 'Optimal Pace', color: 'text-emerald-400' };
    if (speed < 110) return { label: 'Slow Pace', color: 'text-amber-400' };
    return { label: 'Fast Pace', color: 'text-rose-400' };
  };

  const paceInfo = getPaceStatus(wpm);

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {isSupported ? (
            <Button
              variant={isListening ? 'danger' : 'primary'}
              size="md"
              onClick={isListening ? onStop : onStart}
              className="gap-2"
            >
              {isListening ? (
                <>
                  <MicOff size={16} />
                  <span>Stop Recording</span>
                </>
              ) : (
                <>
                  <Mic size={16} />
                  <span>Start Voice Recording</span>
                </>
              )}
            </Button>
          ) : (
            <span className="text-xs text-amber-400">
              Web Speech API is not supported in this browser. Please type your answer below.
            </span>
          )}

          {isListening && (
            <span className="flex items-center gap-1.5 text-xs text-rose-400 animate-pulse font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Recording...
            </span>
          )}
        </div>

        {/* Real-time telemetry metrics */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-slate-300">
            <Clock size={13} className="text-slate-400" />
            <span className="code-font">{formatTime(duration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity size={13} className="text-slate-400" />
            <span className={`code-font font-medium ${paceInfo.color}`}>{wpm} WPM</span>
          </div>
          {fillerCount > 0 && (
            <div className="text-[11px] text-amber-400 code-font">
              {fillerCount} filler{fillerCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {interimTranscript && (
        <div className="mt-3 p-2.5 bg-slate-950/60 rounded border border-slate-800 text-xs text-indigo-300 italic">
          <span className="text-slate-500 not-italic mr-1.5">Live Captions:</span>
          {interimTranscript}
        </div>
      )}
    </div>
  );
}
