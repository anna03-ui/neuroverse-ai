# NeuroVerse AI - Product Requirement Document (PRD) & Testing Checklist

## 1. Executive Summary & Vision

NeuroVerse AI is an immersive, futuristic study orchestrator designed for next-generation students. By marrying an advanced cognitive model (powered by Google Gemini) with a gamified study environment, the platform transforms high-pressure academic preparation into structured, mindful, and high-performance sessions. 

The application utilizes a dark cyberpunk/synthwave aesthetic, premium custom vibes (sounds, custom avatars, dynamic backgrounds), and core behavioral modules to reduce cognitive load and organize study workflows.

---

## 2. Target Audience & Personas

- **The High-Stress Exam Crammer**: Under intense pressure, needs instant roadmap curation and syllabus division to prevent paralysis.
- **The Scatterbrain Focus Seeker**: Easily distracted, needs highly engaging aesthetic timers and real-time auditory focus support.
- **The Reflective Self-Learner**: Values diagnostic feedback, looking to track and optimize long-term cognitive learning habits.

---

## 3. Core Modules & Specifications

### A. Dashboard (Central Hub)
- **Visual Learning Metrics**: Aggregates the visual synthesis score, mind clarity percentage, and weekly streak levels.
- **Weekly Mission Tracker**: Tracks the XP accumulated from Monday to Sunday in a horizontal progress bar.
- **Achievements Feed**: Displays interactive, earned milestones (e.g., "Late Night Hustle").

### B. BrainMirror AI (Diagnostic Learning Profiler)
- **Diagnostic Flow**: An interactive quiz evaluating visual, verbal, and logical learning indices.
- **Cognitive Spider Radar**: Renders an interactive SVG radar graph mapping learning scores across 6 criteria.
- **AI Personalization Recommendations**: Connects to the Gemini backend to synthesize study adjustments matching the profile scores.

### C. MindDump AI (Cognitive Offloader)
- **Mental Offload Area**: Free-text area to write chaotic streams of thoughts.
- **Organized Checklist Parser**: Breaks down text into actionable checklist tasks categorized by priority (High, Medium, Low) and descriptions.
- **Clarity Gauge**: A circular progress indicator reflecting mental clarity, increasing as items are checked off.

### D. StudyVerse (Aesthetic Focus Rooms)
- **Atmospheric Room Themes**: Theme switcher (Scifi, Cozy, Gamer, Anime, Space, Superhero, Minimalist) that changes backgrounds and visual styling.
- **Soundscape Synthesizer**: Web Audio API focus engine playing procedural ambient sounds (rain, synth pulses, lo-fi chords) based on the active theme.
- **Custom Vibe Avatars**: Displays reactive SVG avatars representing the student's study vibe.
- **Pomodoro Timer**: Adjustable session timers granting streak bonuses and XP upon completion.

### E. ExamSprint (High-Pressure Cram Simulator)
- **Syllabus Curation Engine**: Parses topics to construct targeted revision roadmaps.
- **Strategic Briefing Card**: Highlights high-probability topics and quick-fire prep strategies.

### F. AI Companion
- **Adaptive Persona Bot**: A chat box sitting at the bottom right.
- **Vibe-Aligned Tone**: Chatbot changes tone (cosmic mentor, Shonen master, esports lead, lofi roommate) dynamically matching the active customization theme.

---

## 4. Technical Architecture & Data Models

### A. Tech Stack
- **Frontend Core**: React 19, TypeScript, TailwindCSS, Motion (formerly Framer Motion), Lucide Icons.
- **AI Integration**: Node.js Express server calling the `@google/genai` REST framework.
- **Database & Auth**: Firebase Auth (Google + Email) and Cloud Firestore.

### B. Data Objects (Types)

```typescript
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  xp: number;
  level: number;
  streak: number;
  selectedVibe: "scifi" | "cozy" | "gamer" | "anime" | "space" | "superhero" | "minimalist";
  themeMode?: "dark" | "light";
  fontFamily?: string;
  dashboardBg?: string;
  createdAt?: string;
  updatedAt?: string;
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
  recommendations: Array<{ title: string; description: string; type: string }>;
  createdAt: string;
}

export interface MindDumpEntry {
  id: string;
  userId: string;
  rawText: string;
  clarityPercentage: number;
  actionPlan: Array<{ task: string; description: string; priority: "High" | "Medium" | "Low"; completed: boolean }>;
  createdAt: string;
}
```

---

## 5. Comprehensive User Flow Testing Checklist

This testing matrix covers the 5 critical product zones to verify absolute stability prior to GitHub publication and production deployment:

### Flow 1: Authentication & Guest Sandbox
- [ ] **Verify standard Email Registration**: Creating an account triggers redirects, sets up defaults, and redirects to dashboard.
- [ ] **Verify Google Popup Sign-in**: Click popup, authorize, and verify profile sync.
- [ ] **Verify sandbox Guest Bypass**: Clicking "Continue as Guest" successfully sets active user UID prefix to `"demo_"` and bypasses authentication barriers.
- [ ] **Verify Session Persistence**: Refreshing the page with an active guest or logged-in account preserves the exact view tab.
- [ ] **Verify Auth Sign-out**: Clicking "Sign Out" cleans active local preferences, wipes guest state, and routes cleanly to the landing page.

### Flow 2: Navigation & Routing
- [ ] **Verify Workspace Routing**: Clicking side links navigates between core panels without losing local data state.
- [ ] **Verify Desktop Tab Indicators**: Active nav buttons display distinct active-state neon borders.
- [ ] **Verify Mobile Header Toggle**: Resizing to `< 768px` replaces the vertical menu with a hamburger header; clicking toggles drawer.
- [ ] **Verify Mobile Drawer Touch Dismiss**: Clicking the blurring backdrop overlay immediately closes the navigation drawer.
- [ ] **Verify Mobile Nav Auto-close**: Tapping a tab option in the mobile drawer closes the drawer overlay automatically.

### Flow 3: Core AI Modules
- [ ] **Verify BrainMirror Diagnostic assessment**: Completing the 6-question diagnostic compiles scores, renders the hexagonal radar chart, and triggers XP increments.
- [ ] **Verify MindDump offload**: Writing raw text and clicking "Create Action Plan" renders tasks divided by priority and estimates the mental clarity percentage.
- [ ] **Verify checklist interactive state**: Checking items in the MindDump checklist dynamically increments the mental clarity progress gauge.
- [ ] **Verify StudyVerse Pomodoro room**: Switching vibe themes instantly triggers background auditory synthesizers and swaps lofi/cosmic wallpapers.
- [ ] **Verify ExamSprint Roadmap**: Inputting an exam topic compiles revision roadmaps, syllabi progress bars, and strategic briefing cards.
- [ ] **Verify Adaptive AI Companion**: Chatting with the companion chatbot returns answers with distinct persona shifts matching the active vibe.

### Flow 4: UI/UX Quality
- [ ] **Verify Desktop/Laptop Responsiveness**: Layout elements scale, wrap, and align perfectly on laptop viewports.
- [ ] **Verify Dark/Light toggling**: Toggling dark/light modes changes background panels, color classes, and typography.
- [ ] **Verify Touch Targets**: All buttons, links, and text inputs have appropriate sizes and clear hover scaling animations.

### Flow 5: Stability & Performance
- [ ] **Verify zero typescript errors**: Command `npx tsc --noEmit` returns exit code 0.
- [ ] **Verify zero build warnings**: Build output compiles Vite files and node server scripts without breaking.
- [ ] **Verify guest write interceptions**: Verify guest accounts do not throw Firestore rule violations.
