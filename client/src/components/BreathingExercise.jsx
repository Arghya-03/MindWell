
import { useEffect, useRef, useState } from "react";
import { Wind, Play, Pause, RotateCcw } from "lucide-react";

const breathingPhases = [
  { name: "Inhale", duration: 4, instruction: "Breathe in slowly..." },
  { name: "Hold", duration: 7, instruction: "Hold your breath gently..." },
  { name: "Exhale", duration: 8, instruction: "Breathe out slowly..." },
];

function BreathingExercise() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(4);
  const [isRunning, setIsRunning] = useState(false);
  const [cycles, setCycles] = useState(0);

  const remainingRef = useRef(4);

  const currentPhase = breathingPhases[phaseIndex];

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      remainingRef.current -= 1;

      if (remainingRef.current <= 0) {
        const nextIndex =
          (phaseIndex + 1) % breathingPhases.length;

        if (nextIndex === 0) {
          setCycles((previous) => previous + 1);
        }

        const nextDuration = breathingPhases[nextIndex].duration;

        remainingRef.current = nextDuration;
        setRemaining(nextDuration);
        setPhaseIndex(nextIndex);
      } else {
        setRemaining(remainingRef.current);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, phaseIndex]);

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhaseIndex(0);
    setRemaining(4);
    remainingRef.current = 4;
    setCycles(0);
  };

  return (
    <section className="breathing-exercise">
      <div className="breathing-exercise-heading">
        <div className="card-icon wellness-icon">
          <Wind size={23} />
        </div>

        <h2>Mindful Breathing</h2>

        <p>
          Take a moment to slow down, relax and reconnect
          with yourself.
        </p>
      </div>

      <div className="breathing-session">
        <div
          className={`breathing-animation ${phaseIndex === 0
            ? "inhale"
            : phaseIndex === 1
              ? "hold"
              : "exhale"
          } ${isRunning ? "active" : ""}`}
        >
          <div className="breathing-animation-inner">
            <Wind size={34} />
          </div>
        </div>

        <h3>{currentPhase.name}</h3>

        <div className="breathing-countdown">
          {remaining}
        </div>

        <p className="breathing-instruction">
          {isRunning
            ? currentPhase.instruction
            : "Press start when you're ready."}
        </p>
      </div>

      <div className="breathing-cycle-info">
        <div>
          <span>Inhale</span>
          <strong>4 sec</strong>
        </div>

        <div>
          <span>Hold</span>
          <strong>7 sec</strong>
        </div>

        <div>
          <span>Exhale</span>
          <strong>8 sec</strong>
        </div>
      </div>

      <p className="breathing-cycle-count">
        Completed cycles: {cycles}
      </p>

      <div className="breathing-controls">
        {!isRunning ? (
          <button
            className="primary-button"
            onClick={handleStart}
          >
            <Play size={17} />
            {remaining === currentPhase.duration
              ? "Start breathing"
              : "Resume"}
          </button>
        ) : (
          <button
            className="primary-button"
            onClick={handlePause}
          >
            <Pause size={17} />
            Pause
          </button>
        )}

        <button
          className="secondary-button"
          onClick={handleReset}
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </section>
  );
}

export default BreathingExercise;
