import { useState, useEffect, useRef } from 'react';
import api from '../../api';

const TIMER_MODES = {
  POMODORO: {
    name: 'Pomodoro',
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 20 * 60,
    cyclesBeforeLongBreak: 4
  },
  ULTRADIAN: {
    name: '90-Minute Focus',
    work: 90 * 60,
    break: 25 * 60
  },
  CUSTOM: {
    name: 'Custom',
    work: 50 * 60,
    break: 10 * 60
  }
};

export default function FocusTimer() {
  const [mode, setMode] = useState('POMODORO');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES.POMODORO.work);
  const [sessionType, setSessionType] = useState('work');
  const [cycleCount, setCycleCount] = useState(0);

  const [customWork, setCustomWork] = useState(50);
  const [customBreak, setCustomBreak] = useState(10);
  const [showSettings, setShowSettings] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const workSessionStartRef = useRef(null); // Track when work session started
  const isWorkSessionActiveRef = useRef(false); // Track if work session is currently active

  // Helper to send status to backend
  async function updateStatus(status) {
    try {
      await api.updateUserStatus({ status });
    } catch (err) {
      console.error("Status update failed:", err);
    }
  }

  // Helper to finish a work session and create study session
  async function finishWorkSession() {
    if (!isWorkSessionActiveRef.current || !workSessionStartRef.current) {
      return; // No active work session to finish
    }

    const endTime = new Date().toISOString();
    const startTime = workSessionStartRef.current;
    const durationMs = new Date(endTime) - new Date(startTime);
    const durationSeconds = Math.floor(durationMs / 1000);

    // Only create session if duration is at least 1 second
    if (durationSeconds > 0) {
      try {
        await api.createStudySession({
          start_time: startTime,
          end_time: endTime,
        });
        console.log(`Study session created: ${durationSeconds} seconds`);
        
        // Dispatch custom event to notify other components to refresh
        window.dispatchEvent(new CustomEvent('studySessionCreated', {
          detail: { durationSeconds }
        }));
      } catch (err) {
        console.error("Failed to create study session:", err);
      }
    }

    // Reset session tracking
    workSessionStartRef.current = null;
    isWorkSessionActiveRef.current = false;
  }

  useEffect(() => {
    updateStatus("Idle");
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // === TIMER CONTROLS ===

  async function startTimer() {
    setIsActive(true);

    if (sessionType === "work") {
        updateStatus("Focusing");
        // Track work session start time
        workSessionStartRef.current = new Date().toISOString();
        isWorkSessionActiveRef.current = true;
    } else {
        updateStatus("Break");
    }
}

  async function pauseTimer() {
    setIsActive(false);
    updateStatus("Idle");
    // Note: We don't finish the work session on pause - user might resume
    // The session will be finished when they reset or the timer completes
  }

  async function resetTimer() {
    // Finish any active work session before resetting
    await finishWorkSession();

    setIsActive(false);
    setSessionType("work");
    setCycleCount(0);

    if (mode === "CUSTOM") {
      setTimeLeft(customWork * 60);
    } else {
      setTimeLeft(TIMER_MODES[mode].work);
    }

    updateStatus("Idle");
  }

  async function nextSession() {
    let nextType = sessionType;
    let nextCycles = cycleCount;
    let nextTime = timeLeft;

    if (mode === 'POMODORO') {
      if (sessionType === 'work') {
        nextCycles = cycleCount + 1;

        if (nextCycles >= TIMER_MODES.POMODORO.cyclesBeforeLongBreak) {
          nextType = 'longBreak';
          nextTime = TIMER_MODES.POMODORO.longBreak;
          nextCycles = 0;
        } else {
          nextType = 'shortBreak';
          nextTime = TIMER_MODES.POMODORO.shortBreak;
        }
      } else {
        nextType = 'work';
        nextTime = TIMER_MODES.POMODORO.work;
      }
    }

    else if (mode === 'ULTRADIAN') {
      if (sessionType === 'work') {
        nextType = 'break';
        nextTime = TIMER_MODES.ULTRADIAN.break;
      } else {
        nextType = 'work';
        nextTime = TIMER_MODES.ULTRADIAN.work;
      }
    }

    else if (mode === 'CUSTOM') {
      if (sessionType === 'work') {
        nextType = 'break';
        nextTime = customBreak * 60;
      } else {
        nextType = 'work';
        nextTime = customWork * 60;
      }
    }

    // If we're finishing a work session, create study session
    if (sessionType === "work" && isWorkSessionActiveRef.current) {
      await finishWorkSession();
    }

    setSessionType(nextType);
    setTimeLeft(nextTime);
    setCycleCount(nextCycles);
    setIsActive(false);

    // Set status to Idle when timer is paused
    updateStatus("Idle");
  }

    async function changeMode(newMode) {
        // Finish any active work session before changing mode
        await finishWorkSession();

        setIsActive(false);
        setSessionType("work");
        setCycleCount(0);
        setMode(newMode);

        setTimeLeft(
            newMode === "CUSTOM" 
            ? customWork * 60 
            : TIMER_MODES[newMode].work
        );

        updateStatus("Idle");
    }

    function handleModeClick(newMode) {
        if (isActive) {
            setPendingMode(newMode);
            setShowConfirmModal(true);
        } else {
            changeMode(newMode);
        }   
    }

  function updateCustomSettings() {
    if (mode === 'CUSTOM' && sessionType === 'work') {
      setTimeLeft(customWork * 60);
    }
    setShowSettings(false);
  }

  // === TIMER TICK EFFECT ===
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      audioRef.current?.play().catch(() => {});
      setTimeout(nextSession, 800);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  // Display label
  const getSessionLabel = () => {
    if (sessionType === 'work') return 'Focus Time';
    if (sessionType === 'shortBreak') return 'Short Break';
    if (sessionType === 'longBreak') return 'Long Break';
    if (sessionType === 'break') return 'Break Time';
    return '';
  };

  return (
    <div className="min-h-screen bg-bg p-8">
      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYHGGe77eeeTRALUKfj8LZjHAY4ktjyzHksBS"
        preload="auto"
      />

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text mb-4 text-center">
          Focus Timer
        </h1>

        {/* MODE BUTTONS */}
        <div className="flex gap-3 mb-8 justify-center flex-wrap">
          {Object.entries(TIMER_MODES).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => handleModeClick(key)}
              className="btn btn-lg px-6 py-3 rounded-lg font-medium transition-all"
            >
              {cfg.name}
            </button>
          ))}
        </div>

        {/* TIMER CARD */}
        <div className="card mb-6">
          <div className="text-center">

            <div className="mb-4">
              <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-medium">
                {getSessionLabel()}
              </span>
            </div>

            {mode === "POMODORO" && (
              <div className="mb-4 text-muted">
                Cycle {cycleCount} / {TIMER_MODES.POMODORO.cyclesBeforeLongBreak}
              </div>
            )}

            <div className="text-8xl font-bold text-primary mb-8 font-mono">
              {formatTime(timeLeft)}
            </div>

            <div className="flex gap-4 justify-center">
              {!isActive ? (
                <button onClick={startTimer} className="btn btn-lg px-8 py-4">Start</button>
              ) : (
                <button onClick={pauseTimer} className="btn btn-lg bg-transparent px-8 py-4">Pause</button>
              )}

              <button onClick={resetTimer} className="btn btn-lg bg-transparent px-8 py-4">
                Reset
              </button>

              <button onClick={nextSession} className="btn btn-lg bg-transparent px-8 py-4">
                Skip
              </button>
            </div>

          </div>
        </div>

        {/* CUSTOM SETTINGS */}
        {mode === "CUSTOM" && (
          <div className="card mb-6">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full text-left section-title flex justify-between items-center"
            >
              <span>Custom Settings</span>
              <span>{showSettings ? "▲" : "▼"}</span>
            </button>

            {showSettings && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Work Duration (minutes): {customWork}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    value={customWork}
                    onChange={(e) => setCustomWork(Number(e.target.value))}
                    className="slider"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Break Duration (minutes): {customBreak}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={customBreak}
                    onChange={(e) => setCustomBreak(Number(e.target.value))}
                    className="slider"
                  />
                </div>

                <button onClick={updateCustomSettings} className="btn btn-lg w-full">
                  Apply Settings
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showConfirmModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="card max-w-sm w-full text-center">
      <h3 className="section-title mb-2">Switch Mode?</h3>
      <p className="text-textLight/70 mb-6">
        Switching modes will stop your current timer and reset progress.
        Continue?
      </p>

      <div className="flex justify-center gap-4">
        <button
          className="btn px-6 py-3"
          onClick={() => {
            changeMode(pendingMode);
            setShowConfirmModal(false);
            setPendingMode(null);
          }}
        >
          Yes, Switch
        </button>

        <button
          className="btn bg-transparent px-6 py-3"
          onClick={() => {
            setShowConfirmModal(false);
            setPendingMode(null);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>

  );
}