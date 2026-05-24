// Core Shared Types for NeuroVerse AI

export type StudyVibe = "anime" | "gamer" | "scifi" | "cozy" | "superhero" | "minimalist" | "space";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  xp: number;
  level: number;
  streak: number;
  selectedVibe: StudyVibe;
  createdAt?: string;
  updatedAt?: string;
  themeMode?: "dark" | "light";
  customTheme?: StudyVibe;
  fontFamily?: "futuristic" | "clean" | "rounded" | "sans";
  dashboardBg?: "grid" | "nebula" | "particles" | "minimal" | "cafe" | "arcade";
}

export interface MindDumpChecklistItem {
  task: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
}

export interface MindDumpEntry {
  id: string;
  userId: string;
  rawText: string;
  clarityPercentage: number;
  actionPlan: MindDumpChecklistItem[];
  createdAt: string;
}

export interface DiagnosticAnswer {
  questionId: number;
  question: string;
  answerValue: number; // 0 to 10
}

export interface BrainRecommendation {
  title: string;
  description: string;
  type: string;
}

export interface BrainMirrorAssessment {
  id: string;
  userId: string;
  visualSynthesis: number;
  logicalFlow: number;
  retention: number;
  verbalRecall: number;
  focusDepth: number;
  creativity: number;
  recommendations: BrainRecommendation[];
  diagnosticAnswers?: DiagnosticAnswer[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface StudySession {
  id: string;
  userId: string;
  topic: string;
  messages: ChatMessage[];
  focusDuration: number; // minutes focused
  createdAt: string;
}

export interface ExamSprintTask {
  topic: string;
  timeMinutes: number;
  priority: "Critical" | "High" | "Normal";
  description: string;
  completed: boolean;
}

export interface ExamSprintState {
  topic: string;
  syllabusCompletionReady: number;
  roadmap: ExamSprintTask[];
  quickFireStrategy: string;
  createdAt: string;
}
