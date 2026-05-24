import React, { useState } from "react";
import { BrainCircuit, Play, Sparkles, HelpCircle, Save, CheckCircle2, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { BrainMirrorAssessment, DiagnosticAnswer } from "../types";

interface BrainMirrorProps {
  userId: string;
  onAssessmentCompleted: (assessment: BrainMirrorAssessment) => void;
  previousAssessment: BrainMirrorAssessment | null;
}

const quizQuestions = [
  { id: 1, text: "Do you mentally convert concepts or lists into diagrams, structures, and mind-maps?", aspect: "visualSynthesis", label: "Visual Synthesis" },
  { id: 2, text: "Do you prefer studying with structured steps and code blocks/logical formulas over plain essays?", aspect: "logicalFlow", label: "Logical Flow" },
  { id: 3, text: "Can you recall a specific definition or sentence you read 48 hours ago without review?", aspect: "retention", label: "Information Retention" },
  { id: 4, text: "How easily can you synthesize and teach a complex point out loud on short notice?", aspect: "verbalRecall", label: "Verbal Recall" },
  { id: 5, text: "How long can you study in a noisy environment before your attention degrades?", aspect: "focusDepth", label: "Focus Depth" },
  { id: 6, text: "Do you seek imaginative or hyper-creative analogies to understand hard topics?", aspect: "creativity", label: "Cognitive Creativity" }
];

export const BrainMirror: React.FC<BrainMirrorProps> = ({ userId, onAssessmentCompleted, previousAssessment }) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({
    visualSynthesis: 5,
    logicalFlow: 5,
    retention: 5,
    verbalRecall: 5,
    focusDepth: 5,
    creativity: 5
  });
  const [userNotes, setUserNotes] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"analysis" | "diagnostic">(
    previousAssessment ? "analysis" : "diagnostic"
  );

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setError(null);
  };

  const currentQ = quizQuestions[currentQuestionIndex];

  const handleSliderChange = (val: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.aspect]: val
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const triggerSearchAnalysis = async () => {
    setIsSynthesizing(true);
    setError(null);
    try {
      // Setup payload matching our questions
      const diagnosticAnswersPayload: DiagnosticAnswer[] = quizQuestions.map((q) => ({
        questionId: q.id,
        question: q.text,
        answerValue: answers[q.aspect]
      }));

      const res = await fetch("/api/gemini/brain-mirror", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosticAnswers: diagnosticAnswersPayload,
          userNotes
        })
      });

      if (!res.ok) {
        throw new Error("Cognitive engine response compromised.");
      }

      const aiData = await res.json();

      const assessmentId = `assess_${Date.now()}`;
      const assessmentRecord: BrainMirrorAssessment = {
        id: assessmentId,
        userId,
        visualSynthesis: aiData.visualSynthesis || answers.visualSynthesis * 10,
        logicalFlow: aiData.logicalFlow || answers.logicalFlow * 10,
        retention: aiData.retention || answers.retention * 10,
        verbalRecall: aiData.verbalRecall || answers.verbalRecall * 10,
        focusDepth: aiData.focusDepth || answers.focusDepth * 10,
        creativity: aiData.creativity || answers.creativity * 10,
        recommendations: aiData.recommendations || [],
        diagnosticAnswers: diagnosticAnswersPayload,
        createdAt: new Date().toISOString()
      };

      // Persist using spec format + handle errors (bypass for demo guest accounts)
      if (userId && !userId.startsWith("demo_")) {
        try {
          const assessmentDocRef = doc(db, "users", userId, "assessments", assessmentId);
          await setDoc(assessmentDocRef, assessmentRecord);
        } catch (fErr: any) {
          const firestoreInfo = {
            code: fErr.code || "unavailable",
            message: fErr.message || "Could not write assessment",
            operation: "setDoc"
          };
          throw new Error(JSON.stringify(firestoreInfo));
        }
      } else {
        console.log("Guest session: bypassed assessment persistence.");
      }

      onAssessmentCompleted(assessmentRecord);
      setQuizStarted(false);
      setActiveTab("analysis");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Connection error. Please try again.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Helper values to draw the hexagonal spider radar
  const getRadarPoints = (scores: { visualSynthesis: number, logicalFlow: number, retention: number, verbalRecall: number, focusDepth: number, creativity: number }) => {
    const center = 150;
    const maxRadius = 100;
    const angles = [0, 60, 120, 180, 240, 300];
    const metricsOrder = [
      scores.visualSynthesis,
      scores.logicalFlow,
      scores.retention,
      scores.verbalRecall,
      scores.focusDepth,
      scores.creativity
    ];

    return angles.map((angle, k) => {
      const radians = (angle * Math.PI) / 180;
      const val = metricsOrder[k] / 100; // normalize
      const radius = val * maxRadius;
      const x = center + radius * Math.cos(radians);
      const y = center - radius * Math.sin(radians);
      return `${x},${y}`;
    }).join(" ");
  };

  const getHexagonOutlinePoints = (radius: number) => {
    const center = 150;
    const angles = [0, 60, 120, 180, 240, 300];
    return angles.map((angle) => {
      const radians = (angle * Math.PI) / 180;
      const x = center + radius * Math.cos(radians);
      const y = center - radius * Math.sin(radians);
      return `${x},${y}`;
    }).join(" ");
  };

  const activeAssessment = previousAssessment || {
    visualSynthesis: 65,
    logicalFlow: 75,
    retention: 50,
    verbalRecall: 60,
    focusDepth: 55,
    creativity: 80,
    recommendations: [
      {
        title: "Adaptive Visualization Action Plan",
        description: "Focus heavily on spatial diagramming for complex formulas to offset standard recall fatigue.",
        type: "visual"
      },
      {
        title: "Focus Tunnel Protocol",
        description: "Engage the auditory shield layer during deep study phases. Set a 25-minute Pomodoro threshold.",
        type: "fatigue"
      }
    ],
    createdAt: new Date().toISOString()
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("analysis")}
          className={`px-5 py-3 font-mono text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "analysis"
              ? "border-neon-blue text-neon-blue"
              : "border-transparent text-slate-400 hover:text-slate-100"
          }`}
        >
          Study Profile (Active Radar)
        </button>
        <button
          onClick={() => setActiveTab("diagnostic")}
          className={`px-5 py-3 font-mono text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "diagnostic"
              ? "border-neon-blue text-neon-blue"
              : "border-transparent text-slate-400 hover:text-slate-100"
          }`}
        >
          Take Assessment
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "analysis" ? (
          <motion.div
            key="analysis-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Visual Spider Chart Component */}
            <div className="lg:col-span-5 cyber-glass rounded-2xl p-6 flex flex-col items-center justify-center relative">
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-neon-blue animate-pulse" />
                <span className="font-mono text-xs text-neon-blue uppercase font-bold">Study Balance</span>
              </div>

              {/* Hexagon Chart Container */}
              <div className="w-full max-w-[320px] aspect-square flex items-center justify-center mt-4">
                <svg viewBox="0 0 300 300" className="w-full h-full text-slate-500">
                  {/* Grid Lines (Hexagonal Rings) */}
                  <polygon points={getHexagonOutlinePoints(100)} fill="none" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="1" />
                  <polygon points={getHexagonOutlinePoints(75)} fill="none" stroke="rgba(0, 240, 255, 0.07)" strokeWidth="1" />
                  <polygon points={getHexagonOutlinePoints(50)} fill="none" stroke="rgba(0, 240, 255, 0.05)" strokeWidth="1" />
                  <polygon points={getHexagonOutlinePoints(25)} fill="none" stroke="rgba(0, 240, 255, 0.03)" strokeWidth="1" />

                  {/* Axis spines */}
                  {[0, 60, 120, 180, 240, 300].map((angle, idx) => {
                    const r = (angle * Math.PI) / 180;
                    const x = 150 + 100 * Math.cos(r);
                    const y = 150 - 100 * Math.sin(r);
                    return <line key={idx} x1="150" y1="150" x2={x} y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />;
                  })}

                  {/* Active Polygon */}
                  <polygon
                    points={getRadarPoints(activeAssessment)}
                    fill="rgba(0, 240, 255, 0.15)"
                    stroke="#00f0ff"
                    strokeWidth="2"
                    className="transition-all duration-700"
                  />

                  {/* Metrics Labels */}
                  <text x="150" y="32" textAnchor="middle" fill="#00f0ff" fontSize="10" fontFamily="monospace" className="font-bold">VIS</text>
                  <text x="250" y="90" textAnchor="start" fill="#e2e8f0" fontSize="10" fontFamily="monospace">LOG</text>
                  <text x="250" y="215" textAnchor="start" fill="#e2e8f0" fontSize="10" fontFamily="monospace">RET</text>
                  <text x="150" y="278" textAnchor="middle" fill="#bd00ff" fontSize="10" fontFamily="monospace" className="font-bold">REC</text>
                  <text x="50" y="215" textAnchor="end" fill="#e2e8f0" fontSize="10" fontFamily="monospace">FOC</text>
                  <text x="50" y="90" textAnchor="end" fill="#e2e8f0" fontSize="10" fontFamily="monospace">CRE</text>
                </svg>
              </div>

              {/* Labels explanation list */}
              <div className="grid grid-cols-3 gap-2 w-full mt-2 text-[10px] font-mono text-center">
                <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                  <div className="text-neon-blue font-bold">{activeAssessment.visualSynthesis}%</div>
                  <div className="text-[8px] text-slate-400">Visual (VIS)</div>
                </div>
                <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                  <div className="text-emerald-400 font-bold">{activeAssessment.logicalFlow}%</div>
                  <div className="text-[8px] text-slate-400">Logic (LOG)</div>
                </div>
                <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                  <div className="text-indigo-400 font-bold">{activeAssessment.retention}%</div>
                  <div className="text-[8px] text-slate-400">Retention (RET)</div>
                </div>
                <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                  <div className="text-neon-purple font-bold">{activeAssessment.verbalRecall}%</div>
                  <div className="text-[8px] text-slate-400">Recall (REC)</div>
                </div>
                <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                  <div className="text-amber-400 font-bold">{activeAssessment.focusDepth}%</div>
                  <div className="text-[8px] text-slate-400">Focus (FOC)</div>
                </div>
                <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                  <div className="text-neon-pink font-bold">{activeAssessment.creativity}%</div>
                  <div className="text-[8px] text-slate-400">Creative (CRE)</div>
                </div>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="cyber-glass rounded-2xl p-6">
                <h3 className="font-bold text-slate-100 flex items-center gap-1.5 mb-1 font-mono text-sm uppercase">
                  <Sparkles className="w-4 h-4 text-neon-blue" /> Personalized Learning Insights
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Generated by Gemini using on-the-spot assessments. Tailored to prevent exam and lesson fatigue.
                </p>

                <div className="space-y-3">
                  {activeAssessment.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-xl transition duration-300 flex items-start gap-3"
                    >
                      <div className="p-2 rounded-lg bg-neon-blue/10 border border-neon-blue/20 text-neon-blue flex-shrink-0">
                        <BrainCircuit className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-slate-200 tracking-wide font-mono uppercase">{rec.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{rec.description}</p>
                      </div>
                    </div>
                  ))}

                  {activeAssessment.recommendations.length === 0 && (
                    <p className="text-xs text-slate-500 italic text-center py-6">
                      No matching study profile yet. Go to the "Take Assessment" tab to start.
                    </p>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    id="trigger-diagnostic-quiz-btn"
                    onClick={() => setActiveTab("diagnostic")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 hover:from-neon-blue/30 hover:to-neon-purple/30 border border-neon-blue/40 hover:border-neon-blue/60 text-neon-blue rounded-xl text-xs font-mono uppercase transition duration-300"
                  >
                    <RefreshCw className="w-4 h-4" /> Retake Assessment
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="diagnostic-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto cyber-glass rounded-2xl p-6 space-y-6"
          >
            {!quizStarted ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto w-16 h-16 bg-neon-blue/10 border border-neon-blue/20 rounded-full flex items-center justify-center text-neon-blue shadow-inner animate-pulse">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-100 font-mono text-center uppercase tracking-wider">
                    Take the BrainMirror Assessment
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                     Answer 6 quick progress questions to profile your learning style (Visual, Logical, Creative) and unlock smart advice.
                  </p>
                </div>
                <button
                  id="start-diag-btn"
                  onClick={handleStartQuiz}
                  className="mx-auto flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-neon-blue to-neon-purple text-slate-900 rounded-xl hover:cyber-glow-blue transition duration-300 text-xs uppercase font-bold tracking-wider"
                >
                  <Play className="w-4 h-4 text-slate-900" /> Start Assessment
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Micro step tracker */}
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-neon-blue">ASSESSMENT QUESTIONS</span>
                  <span className="text-slate-400">QUESTION {currentQuestionIndex + 1} OF {quizQuestions.length}</span>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                  ></div>
                </div>

                <div className="space-y-4">
                  <span className="inline-block px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-neon-purple font-mono text-[10px] uppercase font-bold tracking-wide">
                    {currentQ.label}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100 leading-relaxed font-sans">{currentQ.text}</h4>
                </div>

                {/* Cyberpunk Slider interface */}
                <div className="space-y-3 bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Weak / Never</span>
                    <span className="text-neon-blue font-bold">Preference Level: {answers[currentQ.aspect]} / 10</span>
                    <span>Excellent / Constantly</span>
                  </div>
                  <input
                    id="diag-slider"
                    type="range"
                    min="1"
                    max="10"
                    value={answers[currentQ.aspect]}
                    onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                    className="w-full accent-neon-blue h-1 px-1.5 focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Question buttons row */}
                <div className="flex items-center justify-between">
                  <button
                    id="diag-back-btn"
                    onClick={handleBack}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-850 rounded-lg text-xs font-mono uppercase disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>

                  {currentQuestionIndex < quizQuestions.length - 1 ? (
                    <button
                      id="diag-next-btn"
                      onClick={handleNext}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-850 text-neon-blue border border-neon-blue/30 hover:border-neon-blue rounded-lg text-xs font-mono uppercase transition duration-300"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="text-right">
                      {/* Show habit context inputs on last step */}
                      <span className="block text-[10px] text-slate-500 font-mono mb-2">Final Step: Optional Habit Context</span>
                    </div>
                  )}
                </div>

                {currentQuestionIndex === quizQuestions.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4 pt-4 border-t border-slate-900"
                  >
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-slate-400 uppercase">Describe Your Study Weaknesses or General Subject:</label>
                      <textarea
                        id="diag-notes-text"
                        value={userNotes}
                        onChange={(e) => setUserNotes(e.target.value)}
                        placeholder="e.g., I find complex algebra logic highly tedious, and screen glare is keeping me fatigued. I am prepping for midterms in 2 weeks."
                        rows={3}
                        className="w-full text-xs p-3 bg-slate-900 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:border-neon-blue transition-all"
                      ></textarea>
                    </div>

                    {error && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-start gap-2">
                        <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                        <div>{error}</div>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        id="submit-diag-btn"
                        onClick={triggerSearchAnalysis}
                        disabled={isSynthesizing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-neon-blue to-neon-purple text-slate-900 hover:cyber-glow-blue text-xs uppercase font-bold tracking-wider rounded-xl transition duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isSynthesizing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-slate-900" /> Analyzing study habits...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-slate-900 animate-pulse" /> Create Study Profile
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
