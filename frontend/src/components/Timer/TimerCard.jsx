import { useState, useEffect, useRef } from 'react';

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
  const [sessionType, setSessionType] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [cycleCount, setCycleCount] = useState(0);
  
  // Custom timer settings
  const [customWork, setCustomWork] = useState(50);
  const [customBreak, setCustomBreak] = useState(10);
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = () => {
    setIsActive(true);
  };

  // Pause timer
  const pauseTimer = () => {
    setIsActive(false);
  };

  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    setSessionType('work');
    setCycleCount(0);
    
    const modeConfig = TIMER_MODES[mode];
    if (mode === 'CUSTOM') {
      setTimeLeft(customWork * 60);
    } else {
      setTimeLeft(modeConfig.work);
    }
  };

  // Switch to next session
  const nextSession = () => {
    if (mode === 'POMODORO') {
      if (sessionType === 'work') {
        const newCycleCount = cycleCount + 1;
        setCycleCount(newCycleCount);
        
        if (newCycleCount % TIMER_MODES.POMODORO.cyclesBeforeLongBreak === 0) {
          setSessionType('longBreak');
          setTimeLeft(TIMER_MODES.POMODORO.longBreak);
        } else {
          setSessionType('shortBreak');
          setTimeLeft(TIMER_MODES.POMODORO.shortBreak);
        }
      } else {
        setSessionType('work');
        setTimeLeft(TIMER_MODES.POMODORO.work);
      }
    } else if (mode === 'ULTRADIAN') {
      if (sessionType === 'work') {
        setSessionType('break');
        setTimeLeft(TIMER_MODES.ULTRADIAN.break);
      } else {
        setSessionType('work');
        setTimeLeft(TIMER_MODES.ULTRADIAN.work);
      }
    } else if (mode === 'CUSTOM') {
      if (sessionType === 'work') {
        setSessionType('break');
        setTimeLeft(customBreak * 60);
      } else {
        setSessionType('work');
        setTimeLeft(customWork * 60);
      }
    }
    
    setIsActive(false);
  };

  // Change timer mode
  const changeMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setSessionType('work');
    setCycleCount(0);
    
    const modeConfig = TIMER_MODES[newMode];
    if (newMode === 'CUSTOM') {
      setTimeLeft(customWork * 60);
    } else {
      setTimeLeft(modeConfig.work);
    }
  };

  // Update custom settings
  const updateCustomSettings = () => {
    if (mode === 'CUSTOM' && sessionType === 'work') {
      setTimeLeft(customWork * 60);
    }
    setShowSettings(false);
  };

  // Timer countdown effect
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      
      // Auto-switch to next session
      setTimeout(() => {
        nextSession();
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const getSessionLabel = () => {
    if (sessionType === 'work') return '🎯 Focus Time';
    if (sessionType === 'shortBreak') return '☕ Short Break';
    if (sessionType === 'longBreak') return '🌴 Long Break';
    if (sessionType === 'break') return '☕ Break Time';
    return '';
  };

  return (
    <div className="min-h-screen bg-bg p-8">
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYHGGe77eeeTRALUKfj8LZjHAY4ktjyzHksBS" preload="auto" />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-text mb-8 text-center">
          Focus Timer
        </h1>

        {/* Mode Selection */}
        <div className="flex gap-3 mb-8 justify-center flex-wrap">
          {Object.entries(TIMER_MODES).map(([key, config]) => (
            <button
              key={key}
              onClick={() => changeMode(key)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                mode === key
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              {config.name}
            </button>
          ))}
        </div>

        {/* Timer Card */}
        <div className="card mb-6">
          <div className="text-center">
            {/* Session Type */}
            <div className="mb-4">
              <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-medium">
                {getSessionLabel()}
              </span>
            </div>

            {/* Cycle Counter (Pomodoro only) */}
            {mode === 'POMODORO' && (
              <div className="mb-4 text-muted">
                Cycle {cycleCount} / {TIMER_MODES.POMODORO.cyclesBeforeLongBreak}
              </div>
            )}

            {/* Timer Display */}
            <div className="text-8xl font-bold text-primary mb-8 font-mono">
              {formatTime(timeLeft)}
            </div>

            {/* Control Buttons */}
            <div className="flex gap-4 justify-center">
              {!isActive ? (
                <button
                  onClick={startTimer}
                  className="btn-primary px-8 py-4"
                >
                  ▶ Start
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="btn-accent px-8 py-4"
                >
                  ⏸ Pause
                </button>
              )}
              
              <button
                onClick={resetTimer}
                className="btn-secondary px-8 py-4"
              >
                ↻ Reset
              </button>
              
              <button
                onClick={nextSession}
                className="btn-secondary px-8 py-4"
              >
                ⏭ Skip
              </button>
            </div>
          </div>
        </div>

        {/* Custom Timer Settings */}
        {mode === 'CUSTOM' && (
          <div className="card mb-6">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full text-left section-title flex justify-between items-center"
            >
              <span>⚙️ Custom Settings</span>
              <span>{showSettings ? '▲' : '▼'}</span>
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
                    className="w-full accent-primary"
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
                    className="w-full accent-primary"
                  />
                </div>
                
                <button
                  onClick={updateCustomSettings}
                  className="btn-primary w-full"
                >
                  Apply Settings
                </button>
              </div>
            )}
          </div>
        )}

        
      </div>
    </div>
  );
}