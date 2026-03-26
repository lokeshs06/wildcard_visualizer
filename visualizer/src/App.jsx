import { useState, useEffect, useRef } from 'react'
import './App.css'



const getWildcardMatchSteps = (s, p) => {
  const steps = [];
  let si = 0, pi = 0, match = 0, star = -1;
  const sn = s.length, pn = p.length;

  const pushStep = (line, text, status = 'running') => {
    steps.push({
      si, pi, match, star,
      s, p,
      codeLine: line,
      explanation: text,
      status // running, success, error
    });
  };

  pushStep(3, "Initialize pointers: si=0, pi=0, match=0, star=-1.");
  pushStep(4, `Store lengths: sn=${sn}, pn=${pn}.`);

  while (si < sn) {
    pushStep(5, `Loop condition si (${si}) < sn (${sn}) is true.`);
    if (pi < pn && (p[pi] === '?' || p[pi] === s[si])) {
      pushStep(6, `Characters match ('${p[pi]}' and '${s[si]}'). Move both pointers.`);
      si++;
      pi++;
      pushStep(8, "Incremented si and pi.");
    } else if (pi < pn && p[pi] === '*') {
      pushStep(9, `Pattern has '*', record star position and current match start.`);
      star = pi;
      match = si;
      pi++;
      pushStep(12, `Recorded star=${star} and match=${match}. Incremented pi.`);
    } else if (star !== -1) {
      pushStep(13, `Mismatch! But we saw a '*' earlier at index ${star}. Backtrack pi and advance match index.`);
      pi = star + 1;
      match++;
      si = match;
      pushStep(16, `Reset pi to star+1 (${pi}), incremented match to ${match}, and set si to match index (${si}).`);
    } else {
      pushStep(17, `Mismatch! No previous '*' found. String cannot match pattern.`, 'error');
      steps.push({ si, pi, match, star, s, p, codeLine: 18, explanation: "Returning false.", status: 'error' });
      return steps;
    }
  }
  
  if (sn === 0 && pn > 0) {
      pushStep(5, `Loop condition si (${si}) < sn (${sn}) is false. Starting second loop.`);
  } else if (si >= sn) {
      pushStep(5, `String s fully traversed (si >= sn). Check remaining pattern characters.`);
  }

  while (pi < pn && p[pi] === '*') {
    pushStep(21, `Pattern character at pi=${pi} is '*', skipping it.`);
    pi++;
  }

  if (pi < pn) {
     pushStep(21, `Pattern character at pi=${pi} is not '*'. Loop ends.`);
  } else {
     pushStep(21, `Pattern fully traversed. Loop ends.`);
  }

  const isMatch = pi === pn;
  if(isMatch) {
    pushStep(24, `All characters matched successfully! (pi == pn)`, 'success');
  } else {
    pushStep(24, `Pattern still has unmatched non-star characters remaining! (pi != pn)`, 'error');
  }
  
  return steps;
};

function App() {
  const [inputS, setInputS] = useState("adceb");
  const [inputP, setInputP] = useState("*a*b");
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);

  const initSimulation = () => {
    const newSteps = getWildcardMatchSteps(inputS, inputP);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    initSimulation();
  }, [inputS, inputP]); // Re-run when inputs change

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(c => c + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentStep, steps.length]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1);
      setIsPlaying(false);
    }
  };

  const stepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(c => c - 1);
      setIsPlaying(false);
    }
  };

  const activeState = steps[currentStep] || { si: 0, pi: 0, match: 0, star: -1, s: inputS, p: inputP, codeLine: 3, explanation: "Initializing...", status: 'running' };
  const isFinished = steps.length > 0 && currentStep === steps.length - 1 && !isPlaying;

  return (
    <div className="app-container">
      {isFinished && (
        <div className="result-popup-overlay">
          <div className={`result-popup ${activeState.status}`}>
            <h2>{activeState.status === 'success' ? 'String Matched!' : 'String Mismatched!'}</h2>
            <p>{activeState.explanation}</p>
            <div className="popup-actions">
               <button className="btn popup-btn" onClick={initSimulation}>Restart Simulation</button>
               <button className="btn popup-btn-outline" onClick={stepBack}>Review Last Step</button>
            </div>
          </div>
        </div>
      )}

      <header className="header">
        <h1>Wildcard Matching Visualizer</h1>
        <p>Step-by-step visualization of the O(N) backtracking algorithm</p>
      </header>

      <section className="controls-card">
        <div className="input-group">
          <label htmlFor="string-input">String (s)</label>
          <input 
            id="string-input"
            value={inputS} 
            onChange={e => setInputS(e.target.value)} 
            placeholder="e.g. adceb"
          />
        </div>
        <div className="input-group">
          <label htmlFor="pattern-input">Pattern (p)</label>
          <input 
            id="pattern-input"
            value={inputP} 
            onChange={e => setInputP(e.target.value)} 
            placeholder="e.g. *a*b"
          />
        </div>
        <button className="btn btn-outline" onClick={initSimulation}>
          Restart Simulation
        </button>
      </section>

      <main className="main-content">
        <section className="card">
          <h2>State Visualization</h2>
          
          <div className="array-container">
            <div className="array-label">
              <span className="var-si">●</span> String Array (s)
            </div>
            <div className="array-cells">
              {activeState.s.split('').map((char, idx) => (
                <div key={`s-${idx}`} className="array-cell-wrapper">
                  <div className={`array-cell ${idx === activeState.si ? 'active' : ''}`}>
                    {char}
                  </div>
                  <div className="array-idx">{idx}</div>
                  {idx === activeState.si && <div className="pointer-indicator pointer-si">si</div>}
                </div>
              ))}
              {/* Extra cell to show when si is out of bounds */}
              {activeState.si >= activeState.s.length && (
                <div className="array-cell-wrapper">
                  <div className="array-cell" style={{opacity: 0.3}}>-</div>
                  <div className="array-idx">{activeState.s.length}</div>
                  <div className="pointer-indicator pointer-si">si</div>
                </div>
              )}
            </div>
          </div>

          <div className="array-container">
            <div className="array-label">
               <span className="var-pi">●</span> Pattern Array (p)
            </div>
            <div className="array-cells">
              {activeState.p.split('').map((char, idx) => (
                <div key={`p-${idx}`} className="array-cell-wrapper">
                  <div className={`array-cell ${idx === activeState.pi ? 'active' : ''}`}>
                    {char}
                  </div>
                  <div className="array-idx">{idx}</div>
                  {idx === activeState.pi && <div className="pointer-indicator pointer-pi">pi</div>}
                  {idx === activeState.star && idx !== activeState.pi && <div className="pointer-indicator pointer-star" style={{bottom: '-3.25rem', backgroundColor: 'var(--pointer-star)'}}>star</div>}
                </div>
              ))}
              {/* Extra cell to show when pi is out of bounds */}
              {activeState.pi >= activeState.p.length && (
                <div className="array-cell-wrapper">
                   <div className="array-cell" style={{opacity: 0.3}}>-</div>
                   <div className="array-idx">{activeState.p.length}</div>
                   <div className="pointer-indicator pointer-pi">pi</div>
                </div>
              )}
            </div>
          </div>

          <h2>Variables</h2>
          <div className="variables-panel">
            <div className="var-box">
              <div className="var-name">si</div>
              <div className="var-value var-si">{activeState.si}</div>
            </div>
            <div className="var-box">
              <div className="var-name">pi</div>
              <div className="var-value var-pi">{activeState.pi}</div>
            </div>
            <div className="var-box">
              <div className="var-name">match</div>
              <div className="var-value var-match">{activeState.match}</div>
            </div>
            <div className="var-box">
              <div className="var-name">star</div>
              <div className="var-value var-star">{activeState.star}</div>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', borderBottom: 'none' }}>Current Process Step</h2>
            <div className={`explanation-box ${activeState.status}`}>
              <strong>Action:</strong> {activeState.explanation}
            </div>
          </div>

          <div className="playback-controls">
            <button className="btn btn-outline" onClick={stepBack} disabled={currentStep === 0}>
              &laquo; Prev
            </button>
            <button className="btn btn-primary" onClick={togglePlay} disabled={currentStep >= steps.length - 1}>
              {isPlaying ? "Pause" : "Play ▶"}
            </button>
            <button className="btn btn-outline" onClick={stepForward} disabled={currentStep >= steps.length - 1}>
              Next &raquo;
            </button>
          </div>
          <div style={{textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-muted)'}}>
            Step {currentStep + 1} of {steps.length > 0 ? steps.length : 1}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
