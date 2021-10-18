import React from "react";
import { minutesToDuration, secondsToDuration } from "../utils/duration";


function Timer({ session, breakDuration, focusDuration }) {
  // Percent remaining is 0 when no session is active
  let percentRemaining = 0;
  if(session) {
    const duration = session.label==="Focusing" ? (focusDuration * 60) : (breakDuration  * 60);
    percentRemaining = (1 - (session.timeRemaining/duration))*100;
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
  
  return (
    <div>
      <div className="row mb-2">
        <div className="col">
          {showSession(session)}
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
              aria-valuenow= {percentRemaining}  //Based on session state (session.timeRemaining)
              style={{ width: {percentRemaining}}}
              />
          </div>
        </div>
      </div>
    </div>
  );
}


export default Timer;