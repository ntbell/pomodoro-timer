import React, { useState } from "react";
import classNames from "../utils/class-names";
import useInterval from "../utils/useInterval";
import Focus from "./Focus";
import Break from "./Break";
import PlayPauseStop from "./PlayPauseStop";
import Timer from "./Timer";

// These functions are defined outside of the component to insure they do not have access to state
// and are, therefore more likely to be pure.

/**
 * Update the session state with new state after each tick of the interval.
 * @param prevState
 *  the previous session state
 * @returns
 *  new session state with timing information updated.
 */
function nextTick(prevState) {
  const timeRemaining = Math.max(0, prevState.timeRemaining - 1);
  return {
    ...prevState,
    timeRemaining,
  };
}

/**
 * Higher order function that returns a function to update the session state with the next session type upon timeout.
 * @param focusDuration
 *    the current focus duration
 * @param breakDuration
 *    the current break duration
 * @returns
 *  function to update the session state.
 */
function nextSession(focusDuration, breakDuration) {
  /**
   * State function to transition the current session type to the next session. e.g. On Break -> Focusing or Focusing -> On Break
   */
  return (currentSession) => {
    if (currentSession.label === "Focusing") {
      return {
        label: "On Break",
        timeRemaining: breakDuration * 60,
      };
    }
    return {
      label: "Focusing",
      timeRemaining: focusDuration * 60,
    };
  };
}


function Pomodoro() {
  // Timer starts out paused
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  // The current session - null where there is no session running
  const [session, setSession] = useState(null);
  // Duration of break session
  const [breakDuration, setBreakDuration] = useState(5);
  // Duration of focus session
  const [focusDuration, setFocusDuration] = useState(25);
  
  // Hooks for focus +/- buttons
  const handleIncreaseFocus = () => setFocusDuration((current) => Math.min(60, current + 5));
  const handleDecreaseFocus = () => setFocusDuration((current) => Math.max(5, current - 5));
  
  // Hooks for break +/- buttons
  const handleIncreaseBreak = () => setBreakDuration((current) => Math.min(15, current + 1));
  const handleDecreaseBreak = () => setBreakDuration((current) => Math.max(1, current - 1));
  
  // Hook for stop button
  const handleStop = () => {
    if(isTimerRunning) {
      setIsTimerRunning(false);
      setSession(null);
      setFocusDuration(25);
      setBreakDuration(5);
    }
  }

  /**
   * Custom hook that invokes the callback function every second
   * NOTE: You will not need to make changes to the callback function
   */
  useInterval(() => {
      if (session.timeRemaining === 0) {
        new Audio("https://bigsoundbank.com/UPLOAD/mp3/1482.mp3").play();
        return setSession(nextSession(focusDuration, breakDuration));
      }
      return setSession(nextTick);
    },
    isTimerRunning ? 1000 : null
  );

  /**
   * Called whenever the play/pause button is clicked.
   */
  function playPause() {
    setIsTimerRunning((prevState) => {
      const nextState = !prevState;
      if (nextState) {
        setSession((prevStateSession) => {
          // If the timer is starting and the previous session is null,
          // start a focusing session.
          if (prevStateSession === null) {
            return {
              label: "Focusing",
              timeRemaining: focusDuration * 60,
            };
          }
          return prevStateSession;
        });
      }
      return nextState;
    });
  }
  
  
  return (
    <div className="pomodoro">
      <div className="row">
        <div className="col">
          <Focus focusDuration={focusDuration} handleIncreaseFocus={handleIncreaseFocus} handleDecreaseFocus={handleDecreaseFocus} />
        </div>
        <div className="col">
          <Break breakDuration={breakDuration} handleIncreaseBreak={handleIncreaseBreak} handleDecreaseBreak={handleDecreaseBreak} />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <PlayPauseStop playPause={playPause} isTimerRunning={isTimerRunning} handleStop={handleStop} />
        </div>
      </div>
        <Timer session={session} breakDuration={breakDuration} focusDuration={focusDuration} />
    </div>
  );
}


export default Pomodoro;
