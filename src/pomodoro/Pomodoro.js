import React, { useState } from "react";
import classNames from "../utils/class-names";
import useInterval from "../utils/useInterval";
import { minutesToDuration } from "../utils/duration";
import { secondsToDuration } from "../utils/duration";

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
  // The progress bar status
  const [progress, setProgress] = useState(0);
  // Duration of focus session
  const [focusDuration, setFocusDuration] = useState(25);
  // Duration of break session
  const [breakDuration, setBreakDuration] = useState(5);
  
  // Hooks for +/- buttons
  const handleIncreaseFocus = () => setFocusDuration(Math.min(60, focusDuration + 5));
  const handleDecreaseFocus = () => setFocusDuration(Math.max(5, focusDuration - 5));
  const handleIncreaseBreak = () => setBreakDuration(Math.min(15, breakDuration + 1));
  const handleDecreaseBreak = () => setBreakDuration(Math.max(1, breakDuration - 1));
  
  // Hook for stop button
  const handleStop = () => {
    if(isTimerRunning) {
      setIsTimerRunning(false);
      setSession(null);
      setFocusDuration(25);
      setBreakDuration(5);
    }
  }
  
  // Calculates the progress bar per useInterval tick
  function calculateProgress() {
    if(session) {
      const duration = session.label==="Focusing" ? (focusDuration * 60) : (breakDuration  * 60);
      setProgress((1 - (session.timeRemaining/duration))*100);
    }
  }
  
  // Shows session details and time remaining when session is active
  function showSession(session) {
      return session && (<>
              <h2 data-testid="session-title">
                {/*Checks whether focusing or breaking, and formats duration*/}
                {<>{session.label} for {session.label==="Focusing" ? (minutesToDuration(focusDuration)) : (minutesToDuration(breakDuration))} minutes</>}
              </h2>
              <p className="lead" data-testid="session-sub-title">
                {secondsToDuration(session.timeRemaining)} remaining
              </p>
            </>);
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
      calculateProgress();
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
          <div className="input-group input-group-lg mb-2">
            <span className="input-group-text" data-testid="duration-focus">
              Focus Duration: {minutesToDuration(focusDuration)}
            </span>
            <div className="input-group-append">
              <button
                type="button"
                className="btn btn-secondary"
                data-testid="decrease-focus"
                onClick={handleDecreaseFocus}
              >
                <span className="oi oi-minus" />
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                data-testid="increase-focus"
                onClick={handleIncreaseFocus}
              >
                <span className="oi oi-plus" />
              </button>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="float-right">
            <div className="input-group input-group-lg mb-2">
              <span className="input-group-text" data-testid="duration-break">
                Break Duration: {minutesToDuration(breakDuration)}
              </span>
              <div className="input-group-append">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-testid="decrease-break"
                  onClick={handleDecreaseBreak}
                >
                  <span className="oi oi-minus" />
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-testid="increase-break"
                  onClick={handleIncreaseBreak}
                >
                  <span className="oi oi-plus" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div
            className="btn-group btn-group-lg mb-2"
            role="group"
            aria-label="Timer controls"
          >
            <button
              type="button"
              className="btn btn-primary"
              data-testid="play-pause"
              title="Start or pause timer"
              onClick={playPause}
            >
              <span
                className={classNames({
                  oi: true,
                  "oi-media-play": !isTimerRunning,
                  "oi-media-pause": isTimerRunning,
                })}
              />
            </button>
            <button
              disabled={!isTimerRunning}
              type="button"
              className="btn btn-secondary"
              data-testid="stop"
              title="Stop the session"
              onClick={handleStop}
            >
              <span className="oi oi-media-stop" />
            </button>
          </div>
        </div>
      </div>
      <div>
        <div className="row mb-2">
          <div className="col">
            <>{showSession(session)}</>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col">
            <div className="progress" style={{ height: "20px" }}>
              <div
                className="progress-bar"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow= {progress}  //Updates from calculateProgress() per tick in useInterval
                style={{ width: {progress}}}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pomodoro;
