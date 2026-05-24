import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db, googleProvider } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  getDocs,
  limit,
  orderBy
} from "firebase/firestore";

// Component imports
import { BrainMirror } from "./components/BrainMirror";
import { MindDump } from "./components/MindDump";
import { StudyVerse } from "./components/StudyVerse";
import { ExamSprint } from "./components/ExamSprint";
import { AICompanion } from "./components/AICompanion";
import { PersonalizationPanel } from "./components/PersonalizationPanel";
import { NeuroVerseBrandLogo } from "./components/NeuroVerseBrandLogo";
import { UserProfile, MindDumpEntry, BrainMirrorAssessment, StudyVibe } from "./types";
import { VIBE_CONFIGS } from "./lib/vibeThemes";

// Lucide Icons
import {
  BrainCircuit,
  LayoutDashboard,
  CloudLightning,
  Milestone,
  Compass,
  Zap,
  LogOut,
  Sparkles,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  Key,
  Database,
  Terminal,
  Trophy,
  Flame,
  ChevronRight,
  Shield,
  Activity,
  User,
  Settings,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Menu,
  X
} from "lucide-react";

// Standardize Shared Constants & Helpers
export const DEFAULT_GUEST_PROFILE: UserProfile = {
  uid: "demo_user_123",
  email: "demo.scholar@neuroverse.edu",
  displayName: "Demo Navigator",
  xp: 240,
  level: 2,
  streak: 7,
  selectedVibe: "gamer"
};

export function calculateLevelFromXP(xp: number): number {
  return Math.floor(xp / 200) + 1;
}

export interface CompletedMission {
  id: string;
  title: string;
  day: string;
  xpEarned: number;
  completedAt: string;
}

export default function App() {
  // Authentication & Profile states
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isStreakGlowing, setIsStreakGlowing] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Log of completed daily missions & XP tracking over the week
  const [completedMissionsLog, setCompletedMissionsLog] = useState<CompletedMission[]>(() => {
    const saved = localStorage.getItem("neuroverse_completed_missions_log");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved missions log", e);
      }
    }
    // Rich, premium looking initial dataset showing real-looking student progress for the start of the week
    return [
      { id: "m-init-1", title: "Complete study diagnostic with BrainMirror AI", day: "Monday", xpEarned: 75, completedAt: "2026-05-18T14:24:00.000Z" },
      { id: "m-init-2", title: "Generate 1 MindDump action checklist plan", day: "Tuesday", xpEarned: 60, completedAt: "2026-05-19T10:15:00.000Z" },
      { id: "m-init-3", title: "Complete first 15m focus study timer", day: "Thursday", xpEarned: 50, completedAt: "2026-05-21T18:40:00.000Z" }
    ];
  });

  // Sync log to local storage
  useEffect(() => {
    localStorage.setItem("neuroverse_completed_missions_log", JSON.stringify(completedMissionsLog));
  }, [completedMissionsLog]);

  // Navigation: "landing" | "login" | "dashboard" | "brainmirror" | "minddump" | "studyverse" | "examsprint" | "settings"
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("neuroverse_active_tab") || "landing";
  });

  // Keep track of mobile sidebar drawer open state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync active view to persistent state
  useEffect(() => {
    localStorage.setItem("neuroverse_active_tab", activeTab);
  }, [activeTab]);

  // Onboarding phase trigger
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Firebase auth form states
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Firestore collections states for active child view feed-ins
  const [previousAssessments, setPreviousAssessments] = useState<BrainMirrorAssessment[]>([]);
  const [previousDumps, setPreviousDumps] = useState<MindDumpEntry[]>([]);

  // 1. Monitor Auth State Change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setAuthSuccessMsg(null);
        localStorage.removeItem("neuroverse_guest_active");
        await fetchOrCreateUserProfile(user);
        
        // Restore tab or default to dashboard
        const savedTab = localStorage.getItem("neuroverse_active_tab");
        const nextTab = (savedTab && savedTab !== "landing" && savedTab !== "login") ? savedTab : "dashboard";
        setActiveTab(nextTab);
      } else {
        const isGuestActive = localStorage.getItem("neuroverse_guest_active") === "true";
        if (isGuestActive) {
          setUserProfile(DEFAULT_GUEST_PROFILE);
          const savedTab = localStorage.getItem("neuroverse_active_tab");
          const nextTab = (savedTab && savedTab !== "landing" && savedTab !== "login") ? savedTab : "dashboard";
          setActiveTab(nextTab);
        } else {
          setUserProfile(null);
          setPreviousAssessments([]);
          setPreviousDumps([]);
          if (activeTab !== "landing" && activeTab !== "login") {
            setActiveTab("landing");
          }
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Load Firestore Data
  useEffect(() => {
    if (currentUser) {
      fetchUserSubcollections(currentUser.uid);
    }
  }, [currentUser]);

  const fetchOrCreateUserProfile = async (user: FirebaseUser) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        // Build robust Default Student Profile
        const defaultProfile: UserProfile = {
          uid: user.uid,
          email: user.email || "student@neuroverse.edu",
          displayName: user.displayName || displayName || user.email?.split("@")[0] || "Scholar Alpha",
          xp: 85,
          level: 1,
          streak: 4,
          selectedVibe: "scifi",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, defaultProfile);
        setUserProfile(defaultProfile);
        setIsOnboarding(true); // Open onboarding vibe selector
      }
    } catch (err: any) {
      console.error("Firestore user profile error:", err);
      // Failover locally if Firestore is provisioned but still syncing permissions
      setUserProfile({
        uid: user.uid,
        email: user.email || "fail@neuroverse.edu",
        displayName: user.displayName || "Scholar Alpha",
        xp: 120,
        level: 1,
        streak: 3,
        selectedVibe: "scifi"
      });
    }
  };

  const handleDailyMissionComplete = async (missionTitle?: string, xpEarned?: number) => {
    setIsStreakGlowing(true);
    
    // Auto reset the fire-glow feedback after 4.5 seconds
    setTimeout(() => {
      setIsStreakGlowing(false);
    }, 4500);

    const actualTitle = missionTitle || "Continuous Focus Session completed";
    const actualXP = xpEarned || 55;

    // Get the weekday of today
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayName = weekdays[new Date().getDay()];

    const newLogItem = {
      id: `m-log-${Date.now()}`,
      title: actualTitle,
      day: currentDayName,
      xpEarned: actualXP,
      completedAt: new Date().toISOString()
    };

    setCompletedMissionsLog((prev) => [newLogItem, ...prev]);

    // Increment streak by 1 locally and in firestore for beautiful reward gamification!
    if (userProfile) {
      const updatedStreak = userProfile.streak + 1;
      const updatedProfile = { ...userProfile, streak: updatedStreak };
      setUserProfile(updatedProfile);
      
      try {
        if (userProfile.uid && !userProfile.uid.startsWith("demo_")) {
          const userDocRef = doc(db, "users", userProfile.uid);
          await setDoc(userDocRef, { streak: updatedStreak }, { merge: true });
        }
      } catch (err) {
        console.error("Failed to update streak in DB:", err);
      }
    }
  };

  const fetchUserSubcollections = async (uid: string) => {
    try {
      // Fetch assessments
      const assessRef = collection(db, "users", uid, "assessments");
      const assessSnap = await getDocs(assessRef);
      const assessmentsList: BrainMirrorAssessment[] = [];
      assessSnap.forEach((doc) => {
        assessmentsList.push(doc.data() as BrainMirrorAssessment);
      });
      // Sort newest first
      assessmentsList.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPreviousAssessments(assessmentsList);

      // Fetch mindDumps
      const dumpsRef = collection(db, "users", uid, "mindDumps");
      const dumpsSnap = await getDocs(dumpsRef);
      const dumpsList: MindDumpEntry[] = [];
      dumpsSnap.forEach((doc) => {
        dumpsList.push(doc.data() as MindDumpEntry);
      });
      dumpsList.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPreviousDumps(dumpsList);
    } catch (err) {
      console.error("Failed to load user subcollections from Firestore:", err);
    }
  };

  // 3. Auth Actions
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);

    if (!email || !password) {
      setAuthError("Email and password are required study profile parameters.");
      return;
    }

    try {
      if (isRegistering) {
        // Create account
        await createUserWithEmailAndPassword(auth, email, password);
        setAuthSuccessMsg("Account created successfully. Redirecting to onboarding...");
      } else {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password);
        setAuthSuccessMsg("Sign-in successful. Loading your workspace...");
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || "Failed to sign in. Please verify your credentials.");
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google sign-in error occurred:", err);
      const errorCode = err?.code || "";
      const errorMessage = err?.message || "";
      
      if (
        errorCode === "auth/popup-closed-by-user" || 
        errorMessage.includes("popup-closed-by-user") ||
        errorMessage.includes("Popup closed by user")
      ) {
        setAuthError(
          "The Google sign-in window was closed containing unsigned session data. " +
          "If this was unexpected, please ensure third-party cookies & popups are enabled. " +
          "Note: Inside sandboxed preview views (like AI Studio), browsers often block popups or third-party cookies. " +
          "Try opening the application in a new tab, or use Email/Password registration or '⚡ OR USE QUICK LOCAL DEMO MODE' to bypass."
        );
      } else if (
        errorCode === "auth/popup-blocked" || 
        errorMessage.includes("popup-blocked") ||
        errorMessage.includes("Popup blocked")
      ) {
        setAuthError(
          "The sign-in popup was blocked by your browser settings. " +
          "Please enable popups for this origin and try again, open the app in a new tab, or use local demo mode."
        );
      } else if (
        errorCode === "auth/cancelled-popup-request" || 
        errorMessage.includes("cancelled-popup-request")
      ) {
        setAuthError("The sign-in popup request was cancelled by a subsequent action. Please click again.");
      } else {
        setAuthError(`Google session sync declined: ${err?.message || "Please check your browser settings and try again."}`);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("neuroverse_guest_active");
      setActiveTab("landing");
    } catch (err) {
      console.error(err);
    }
  };

  // Demo bypass mode to explore everything instant without constraints
  const handleDemoBypass = () => {
    localStorage.setItem("neuroverse_guest_active", "true");
    setUserProfile(DEFAULT_GUEST_PROFILE);
    setActiveTab("dashboard");
  };

  const handlePillarNavigation = (tab: string) => {
    if (userProfile) {
      setActiveTab(tab);
    } else {
      localStorage.setItem("neuroverse_guest_active", "true");
      setUserProfile(DEFAULT_GUEST_PROFILE);
      setActiveTab(tab);
    }
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // Loading animation state checker
  if (authLoading) {
    return (
      <div className="min-h-screen bg-cyber-dark text-[#00f0ff] flex flex-col items-center justify-center font-mono gap-4">
        <BrainCircuit className="w-16 h-16 animate-spin" />
        <div className="text-sm font-semibold tracking-widest text-[#00f0ff] animate-pulse">
          INITIALIZING NEUROVERSE CORE...
        </div>
      </div>
    );
  }

  // Dynamic Vibe state mapping
  const activeVibe = userProfile?.selectedVibe || "scifi";
  const config = VIBE_CONFIGS[activeVibe] || VIBE_CONFIGS["scifi"];

  // Active Vibe Color Styling Helpers
  const getVibeAccentColor = () => {
    return config?.gradientAccent || "from-neon-blue to-neon-purple";
  };

  // Convert font identifier keyword to the real Tailwind standard class defined in index.css
  const getFontFamilyClass = () => {
    switch (userProfile?.fontFamily) {
      case "futuristic":
        return "font-futuristic";
      case "clean":
        return "font-clean";
      case "rounded":
        return "font-rounded";
      case "sans":
        return "font-productivity";
      default:
        return "font-sans";
    }
  };

  const isLightMode = userProfile?.themeMode === "light";

  return (
    <div className={`min-h-screen relative flex flex-col overflow-x-hidden transition-all duration-700 ${
      isLightMode ? "theme-light-mode bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-100"
    } ${getFontFamilyClass()}`}>
      
      {/* Decorative scanline backdrop overlay */}
      <div className="pointer-events-none fixed inset-0 z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] opacity-15"></div>

      {/* Dynamic Ambient Vibe Wallpaper Backdrops */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-50 transition-all duration-1000`}></div>
        
        {/* Dynamic Background Customization */}
        {userProfile?.dashboardBg === "grid" && (
          <div className="absolute inset-0 bg-grid-white/[0.015] bg-[size:40px_40px] pointer-events-none"></div>
        )}
        {userProfile?.dashboardBg === "nebula" && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] bg-indigo-505/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s' }}></div>
            <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-white rounded-full animate-ping"></div>
            <div className="absolute top-2/3 left-2/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
          </div>
        )}
        {userProfile?.dashboardBg === "particles" && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[15%] left-[10%] w-2 h-2 rounded-full bg-cyan-400/20 animate-pulse" style={{ animationDuration: '4s' }}></div>
            <div className="absolute top-[45%] left-[85%] w-3.5 h-3.5 rounded-full bg-pink-400/10 animate-pulse" style={{ animationDuration: '6s' }}></div>
            <div className="absolute top-[75%] left-[25%] w-1.5 h-1.5 rounded-full bg-purple-400/20 animate-pulse" style={{ animationDuration: '3s' }}></div>
          </div>
        )}
        {userProfile?.dashboardBg === "cafe" && (
          <div className="absolute inset-0 bg-radial-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none"></div>
        )}
        {userProfile?.dashboardBg === "arcade" && (
          <div className="absolute inset-0 pointer-events-none opacity-25 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_8px]"></div>
        )}
        {userProfile?.dashboardBg === "minimal" && (
          <div className="absolute inset-0 bg-slate-950/20 pointer-events-none"></div>
        )}

        {/* Fallback to Vibe-based defaults if no custom background is explicitly chosen */}
        {(!userProfile?.dashboardBg || userProfile?.dashboardBg === undefined) && (
          <>
            {activeVibe === "anime" && (
              <>
                <div className="absolute inset-0 bg-radial-to-b from-rose-500/10 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-[12%] left-[23%] w-2 h-2 rounded-full bg-rose-300/30 animate-pulse" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute top-[35%] left-[72%] w-1.5 h-1.5 rounded-full bg-pink-300/25 animate-pulse" style={{ animationDuration: '5s' }}></div>
                  <div className="absolute top-[68%] left-[44%] w-2.5 h-2.5 rounded-full bg-rose-450/20 pointer-events-none"></div>
                  <div className="absolute top-[55%] left-[18%] w-1.5 h-1.5 rounded-full bg-pink-400/30 animate-pulse" style={{ animationDuration: '6s' }}></div>
                  <div className="absolute top-[82%] left-[81%] w-2 h-2 rounded-full bg-rose-300/25 animate-pulse" style={{ animationDuration: '4s' }}></div>
                </div>
              </>
            )}
            {activeVibe === "gamer" && (
              <>
                <div className="absolute inset-0 bg-grid-white/[0.015] bg-[size:30px_30px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-radial-to-r from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/[0.04] blur-3xl rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/[0.04] blur-3xl rounded-full"></div>
              </>
            )}
            {activeVibe === "scifi" && (
              <>
                <div className="absolute inset-0 bg-grid-white/[0.015] bg-[size:40px_40px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_8px] pointer-events-none opacity-40"></div>
              </>
            )}
            {activeVibe === "cozy" && (
              <>
                <div className="absolute inset-0 bg-radial-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-[18%] left-[48%] w-1.5 h-1.5 rounded-full bg-amber-400/25 animate-pulse" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute top-[42%] left-[28%] w-1 h-1 rounded-full bg-amber-300/35 animate-pulse" style={{ animationDuration: '2.5s' }}></div>
                  <div className="absolute top-[58%] left-[78%] w-2 h-2 rounded-full bg-amber-400/15 animate-pulse" style={{ animationDuration: '5s' }}></div>
                  <div className="absolute top-[78%] left-[52%] w-1.5 h-1.5 rounded-full bg-amber-300/25 animate-pulse" style={{ animationDuration: '4s' }}></div>
                </div>
              </>
            )}
            {activeVibe === "superhero" && (
              <>
                <div className="absolute inset-0 bg-radial-to-t from-red-500/5 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:50px_50px] pointer-events-none"></div>
              </>
            )}
            {activeVibe === "space" && (
              <>
                <div className="absolute inset-0 bg-radial-to-t from-indigo-500/5 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 bg-grid-white/[0.012] bg-[size:65px_65px] pointer-events-none"></div>
              </>
            )}
            {activeVibe === "minimalist" && (
              <>
                {/* Neat void */}
                <div className="absolute inset-0 bg-slate-950/20 pointer-events-none"></div>
              </>
            )}
          </>
        )}
      </div>      {/* Landing page layout */}
      {activeTab === "landing" && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950">
          
          {/* Main starry space graphic background with futuristic particle grids */}
          <div className="absolute inset-0 bg-radial-to-t from-slate-950 via-[#0a0f24] to-slate-950 pointer-events-none opacity-80"></div>
          <div className="absolute inset-0 bg-grid-white/[0.015] bg-[size:40px_40px] pointer-events-none"></div>

          {/* Animated Ambient Light Rings/Glow in Background */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-cyan-500/10 rounded-full filter blur-[120px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: "6s" }}></div>
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[250px] h-[250px] bg-purple-500/10 rounded-full filter blur-[100px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: "4s" }}></div>

          {/* Centered Futuristic hero info card */}
          <div className="relative z-10 text-center max-w-5xl mx-auto space-y-8 px-4 py-8">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                <BrainCircuit className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: "8s" }} /> COGNITIVE COMPILER ONLINE
              </div>
              
              {/* Large Centered Logo */}
              <div className="flex justify-center transition-all duration-300">
                <NeuroVerseBrandLogo className="w-40 h-40 md:w-52 md:h-52 drop-shadow-[0_0_45px_rgba(6,182,212,0.35)] saturate-125 mb-1 hover:rotate-3 transition-transform cursor-pointer" />
              </div>

              {/* Brand Title with premium futuristic typography */}
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-slate-100 select-none font-sans">
                NEUROVERSE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#4f46e5] to-[#ec4899] drop-shadow-[0_4px_24px_rgba(79,70,229,0.3)]">AI</span>
              </h1>
              
              {/* Tagline */}
              <div className="inline-block py-1 px-4 rounded-md border border-slate-900 bg-slate-950/85">
                <p className="text-xs md:text-sm text-slate-300 font-mono tracking-[0.35em] uppercase font-bold text-center">
                  YOUR MIND. AMPLIFIED.
                </p>
              </div>

              <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed font-sans font-medium">
                The next-generation neurological study orchestrator. Streamline your session workflows, dismantle study pressure, and calibrate your focus states with premium AI.
              </p>
            </div>

            {/* Main Interactive Action Cards Grid (Sign In, Create Profile, Guest) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto pt-4 relative">
              
              {/* Action Card 1: Create Profile */}
              <div className="group relative rounded-2xl border border-slate-900 bg-slate-950/70 p-5 text-center transition-all duration-300 hover:border-cyan-500/40 hover:bg-slate-950/95 hover:-translate-y-1 flex flex-col justify-between space-y-3.5 shadow-xl hover:shadow-cyan-950/15">
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
                
                <div className="space-y-1.5 pt-1.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/30 border border-cyan-800/20 flex items-center justify-center mx-auto text-cyan-400 group-hover:scale-110 transition-transform">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-200">
                    Create Profile
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    Store assessment indices, accumulate permanent XP benchmarks, and register custom student companion settings.
                  </p>
                </div>

                <button
                  id="landing-card-register-btn"
                  onClick={() => {
                    setIsRegistering(true);
                    setActiveTab("login");
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-400 hover:to-blue-500 border border-cyan-500/20 hover:border-transparent text-cyan-300 hover:text-slate-950 text-[10.5px] font-mono font-bold uppercase tracking-widest transition-all duration-300 active:scale-95"
                >
                  Create Account
                </button>
              </div>

              {/* Action Card 2: Sign In */}
              <div className="group relative rounded-2xl border border-slate-900 bg-slate-950/70 p-5 text-center transition-all duration-300 hover:border-purple-500/40 hover:bg-slate-950/95 hover:-translate-y-1 flex flex-col justify-between space-y-3.5 shadow-xl hover:shadow-purple-950/15">
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
                
                <div className="space-y-1.5 pt-1.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/30 border border-purple-800/20 flex items-center justify-center mx-auto text-purple-400 group-hover:scale-110 transition-transform">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-200">
                    Existing Student
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    Synchronize your active database matrices. Restore your customized StudyVerse room settings and active task queues.
                  </p>
                </div>

                <button
                  id="landing-card-signin-btn"
                  onClick={() => {
                    setIsRegistering(false);
                    setActiveTab("login");
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500 hover:to-pink-500 border border-purple-500/20 hover:border-transparent text-purple-300 hover:text-slate-950 text-[10.5px] font-mono font-bold uppercase tracking-widest transition-all duration-300 active:scale-95"
                >
                  Sign In
                </button>
              </div>

              {/* Action Card 3: Continue as Guest (Bypass Demo) */}
              <div className="group relative rounded-2xl border border-slate-900 bg-slate-950/70 p-5 text-center transition-all duration-300 hover:border-emerald-500/40 hover:bg-slate-950/95 hover:-translate-y-1 flex flex-col justify-between space-y-3.5 shadow-xl hover:shadow-emerald-950/15">
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
                
                <div className="space-y-1.5 pt-1.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/30 border border-emerald-800/20 flex items-center justify-center mx-auto text-emerald-400 group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
                  </div>
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-200">
                    Local Guest
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    Immediate visual entrance inside the interactive workspace with pre-populated demo records. No credentials required.
                  </p>
                </div>

                <button
                  id="landing-card-guest-btn"
                  onClick={handleDemoBypass}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-400 hover:to-teal-500 border border-emerald-500/20 hover:border-transparent text-emerald-300 hover:text-slate-950 text-[10.5px] font-mono font-bold uppercase tracking-widest transition-all duration-300 active:scale-95"
                >
                  Continue as Guest
                </button>
              </div>

            </div>

            {/* Core Pillars preview widget row */}
            <div className="pt-6">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#64748b] mb-4 font-bold">
                EXPLORE CORE LEARNING UTILITY PILLARS // DEMO DIRECT TRIGGER
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
                <button
                  id="landing-nav-brainmirror"
                  onClick={() => handlePillarNavigation("brainmirror")}
                  className="p-3 bg-slate-900/40 border border-slate-900 hover:border-cyan-500/40 hover:-translate-y-0.5 rounded-xl text-center space-y-1 transition duration-200 hover:bg-slate-900/80 active:scale-95 group w-full cursor-pointer"
                >
                  <BrainCircuit className="w-4 h-4 mx-auto text-cyan-400 animate-pulse group-hover:scale-115 transition-transform" />
                  <h3 className="font-mono text-[10px] uppercase font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">BrainMirror AI</h3>
                  <p className="text-[8.5px] text-slate-400 font-medium">Diagnose cognitive study habits</p>
                </button>
                <button
                  id="landing-nav-minddump"
                  onClick={() => handlePillarNavigation("minddump")}
                  className="p-3 bg-slate-900/40 border border-slate-900 hover:border-purple-500/40 hover:-translate-y-0.5 rounded-xl text-center space-y-1 transition duration-200 hover:bg-slate-900/80 active:scale-95 group w-full cursor-pointer"
                >
                  <CloudLightning className="w-4 h-4 mx-auto text-purple-400 animate-pulse group-hover:scale-115 transition-transform" />
                  <h3 className="font-mono text-[10px] uppercase font-bold text-slate-100 group-hover:text-purple-400 transition-colors">MindDump AI</h3>
                  <p className="text-[8.5px] text-slate-400 font-medium">Convert mental strain into tasks</p>
                </button>
                <button
                  id="landing-nav-studyverse"
                  onClick={() => handlePillarNavigation("studyverse")}
                  className="p-3 bg-slate-900/40 border border-slate-900 hover:border-emerald-500/40 hover:-translate-y-0.5 rounded-xl text-center space-y-1 transition duration-200 hover:bg-slate-900/80 active:scale-95 group w-full cursor-pointer"
                >
                  <Compass className="w-4 h-4 mx-auto text-emerald-400 group-hover:scale-115 transition-transform" />
                  <h3 className="font-mono text-[10px] uppercase font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">StudyVerse Rooms</h3>
                  <p className="text-[8.5px] text-slate-400 font-medium">Atmospheric sounds & avatars</p>
                </button>
                <button
                  id="landing-nav-examsprint"
                  onClick={() => handlePillarNavigation("examsprint")}
                  className="p-3 bg-slate-900/40 border border-slate-900 hover:border-rose-500/40 hover:-translate-y-0.5 rounded-xl text-center space-y-1 transition duration-200 hover:bg-slate-900/80 active:scale-95 group w-full cursor-pointer"
                >
                  <Zap className="w-4 h-4 mx-auto text-rose-500 group-hover:scale-115 transition-transform" />
                  <h3 className="font-mono text-[10px] uppercase font-bold text-slate-100 group-hover:text-rose-500 transition-colors">ExamSprint AI</h3>
                  <p className="text-[8.5px] text-slate-400 font-medium">Rehearse high-pressure exams</p>
                </button>
              </div>
            </div>

            {/* Metrics footer info */}
            <div className="pt-8 border-t border-slate-900 max-w-xl mx-auto flex justify-between text-[10px] font-mono text-slate-600">
              <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5" /> PERSISTENT CLOUD RULES ACTIVE</span>
              <span className="flex items-center gap-1"><Terminal className="w-3.5 h-3.5" /> ADVANCED GEMINI COGNITION LAYER</span>
            </div>

          </div>
        </div>
      )}

      {/* Login / Register authentication page layout */}
      {activeTab === "login" && (
        <div className="min-h-screen flex items-center justify-center p-6 relative bg-slate-950">
          <div className="absolute inset-0 bg-radial-to-t from-slate-950 via-[#0d071a] to-slate-950 pointer-events-none"></div>
          
          {/* Subtle grid lines */}
          <div className="absolute inset-0 bg-grid-white/[0.012] bg-[size:50px_50px] pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-md bg-slate-950/50 border border-slate-800/80 rounded-3xl p-8 md:p-10 space-y-6 shadow-[0_0_60px_rgba(6,182,212,0.05)] backdrop-blur-xl relative overflow-hidden group">
            
            {/* Elegant top color border */}
            <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500"></div>

            {/* Elegant Branding header with Logo */}
            <div className="text-center space-y-3 pb-2">
              <div className="flex justify-center mb-1">
                <NeuroVerseBrandLogo className="w-22 h-22 drop-shadow-[0_0_30px_rgba(6,182,212,0.25)] select-none" />
              </div>
              <h2 className="text-[10.5px] font-semibold tracking-[0.45em] text-cyan-400 font-mono uppercase">
                NEUROVERSE AI
              </h2>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-100 uppercase font-sans">
                {isRegistering ? "Register Scholar Profile" : "Scholar Sign In"}
              </h1>
              <p className="text-[9.5px] text-slate-400 font-mono uppercase tracking-wider">
                {isRegistering ? "Unshackle study blocks with synchronized workflows" : "Authenticate credentials to resume task modules"}
              </p>
            </div>

            {/* General Auth form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Student Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full text-xs py-3 pl-11 pr-4 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500/80 transition duration-200 text-slate-100 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                  />
                </div>
              </div>

              {isRegistering && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Student Name / Call Sign</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      id="auth-alias-input"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Scholar Omega"
                      className="w-full text-xs py-3 pl-11 pr-4 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500/80 transition duration-200 text-slate-100 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Master Key / Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    id="auth-pass-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    className="w-full text-xs py-3 pl-11 pr-4 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500/80 transition duration-200 text-slate-100 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                  />
                </div>
              </div>

              {/* Status Display Messages */}
              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-start gap-2 leading-relaxed">
                  <Shield className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <div>{authError}</div>
                </div>
              )}

              {authSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl">
                  {authSuccessMsg}
                </div>
              )}

              <button
                id="auth-submit-btn"
                type="submit"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-cyan-400 to-[#4f46e5] text-slate-950 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.01] rounded-xl font-bold uppercase tracking-widest text-[10px] transition duration-300 pointer-events-auto"
              >
                {isRegistering ? (
                  <>
                    <UserPlus className="w-4 h-4 text-slate-950" /> Register Profile
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-slate-950" /> Enter Workspace
                  </>
                )}
              </button>
            </form>

            {/* Google Identity Sync Provider */}
            <div className="space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-900 w-full"></div>
                <div className="absolute bg-[#020617] px-3.5 text-[8px] font-mono text-slate-500 uppercase tracking-widest">OR CLOUD SECURED FAST-PASS</div>
              </div>

              <button
                id="google-sync-btn"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2.5 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 rounded-xl text-[9px] font-mono uppercase text-slate-200 hover:text-cyan-400 transition duration-300 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: "5s" }} /> Authenticate via Google
              </button>
            </div>

            {/* Toggle Signin/Register links */}
            <div className="flex justify-between items-center text-xs pt-2">
              <button
                id="toggle-auth-reg-btn"
                onClick={() => {
                  setAuthError(null);
                  setAuthSuccessMsg(null);
                  setIsRegistering(!isRegistering);
                }}
                className="text-slate-400 hover:text-cyan-400 font-mono uppercase text-[9px] tracking-wider transition-colors"
              >
                {isRegistering ? "← Back to User Sign In" : "Create standard account →"}
              </button>

              <button
                id="back-to-portal-btn"
                onClick={() => setActiveTab("landing")}
                className="text-slate-500 hover:text-slate-300 font-mono text-[9px] uppercase tracking-wider transition-colors"
              >
                Main Portal Layout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authenticated Dashboard layout frame with Sidebar navigation */}
      {userProfile && activeTab !== "landing" && activeTab !== "login" && (
        <div className="flex-1 flex flex-col md:flex-row min-h-screen">
          
          {/* Mobile Sticky Header */}
          <div className="md:hidden bg-slate-950 border-b border-slate-900 px-4 py-3 flex items-center justify-between z-30 sticky top-0">
            <div className="flex items-center gap-2.5" onClick={() => handleTabClick("dashboard")}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 p-[1px] flex items-center justify-center flex-shrink-0 shadow-inner">
                <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center">
                  <NeuroVerseBrandLogo className="w-6 h-6" isAnimated={true} />
                </div>
              </div>
              <div>
                <h1 className="font-bold text-slate-100 tracking-wider text-xs font-mono uppercase">NeuroVerse AI</h1>
              </div>
            </div>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-300 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Sidebar Backdrop Overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
          )}

          {/* Sidebar Area */}
          <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-900 flex flex-col justify-between p-5 relative select-none transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-auto ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } ${isMobileMenuOpen ? "fixed h-full" : "hidden md:flex"}`}>
            
            <div className="space-y-6">
              {/* App logo brand heading */}
              <div
                onClick={() => handleTabClick("dashboard")}
                className="flex items-center gap-2.5 px-1 pb-4 border-b border-slate-900 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 p-[1px] flex items-center justify-center flex-shrink-0 shadow-inner">
                  <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center">
                    <NeuroVerseBrandLogo className="w-6 h-6" isAnimated={true} />
                  </div>
                </div>
                <div>
                  <h1 className="font-bold text-slate-100 tracking-wider text-xs font-mono uppercase">NeuroVerse AI</h1>
                  <span className="text-[9px] text-zinc-500 font-mono">STUDENT OS v3.5</span>
                </div>
              </div>

              {/* Adaptive user stats snippet */}
              <div className="bg-slate-900/60 p-3.5 border border-slate-855 rounded-xl space-y-2 relative">
                <div className="absolute top-1 right-2 animate-ping h-2.5 w-2.5 rounded-full bg-emerald-500 opacity-60"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 text-neon-purple font-mono font-bold text-xs">
                    {userProfile.level}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-205 truncate max-w-[120px]">{userProfile.displayName}</h3>
                    <span className="block text-[9px] text-slate-500 font-mono uppercase">LEVEL REGISTERED</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 gap-2 relative">
                  <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-neon-blue" /> {userProfile.xp} XP</span>
                  
                  <motion.span
                    id="sidebar-streak-counter"
                    animate={isStreakGlowing ? {
                      scale: [1, 1.15, 1.05, 1.12, 1],
                      color: ["#94a3b8", "#f97316", "#fb923c", "#f97316", "#94a3b8"],
                      filter: [
                        "drop-shadow(0 0 0px rgba(0,0,0,0))",
                        "drop-shadow(0 0 12px rgba(249,115,22,0.95))",
                        "drop-shadow(0 0 18px rgba(251,146,60,0.95))",
                        "drop-shadow(0 0 10px rgba(249,115,22,0.85))",
                        "drop-shadow(0 0 0px rgba(0,0,0,0))"
                      ]
                    } : {}}
                    transition={{ duration: 3.5, ease: "easeInOut" }}
                    className="flex items-center gap-1.5 text-slate-400 relative"
                  >
                    <motion.span
                      className="inline-block"
                      animate={isStreakGlowing ? {
                        rotate: [0, -12, 12, -8, 8, -4, 4, 0],
                        scale: [1, 1.35, 1.15, 1.3, 1.1, 1.2, 1]
                      } : {}}
                      transition={{ duration: 3.2, ease: "easeInOut" }}
                    >
                      <Flame className={`w-3.5 h-3.5 ${isStreakGlowing ? "text-orange-500 fill-orange-500 animate-pulse" : "text-orange-500"}`} />
                    </motion.span>
                    
                    <span className={isStreakGlowing ? "font-black text-orange-400 tracking-wider font-sans transition-colors duration-300" : ""}>
                      {userProfile.streak} days
                    </span>

                    {/* Miniature rising beautiful sparks feedback when glowing */}
                    <AnimatePresence>
                      {isStreakGlowing && (
                        <span className="absolute inset-0 pointer-events-none overflow-visible">
                          {[...Array(6)].map((_, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ y: 5, x: (Math.random() - 0.5) * 20, opacity: 1, scale: Math.random() * 0.5 + 0.5 }}
                              animate={{
                                y: -45 - Math.random() * 25,
                                x: (Math.random() - 0.5) * 35,
                                opacity: 0,
                                scale: 0
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 2.0 + Math.random() * 1.5, ease: "easeOut" }}
                              className="absolute w-1 h-1 rounded-full bg-orange-500"
                              style={{
                                left: `${30 + Math.random() * 40}%`,
                                filter: "blur(0.4px)"
                              }}
                            />
                          ))}
                        </span>
                      )}
                    </AnimatePresence>
                  </motion.span>
                </div>
              </div>

              {/* Adaptive list links */}
              <nav className="space-y-1.5 font-mono text-xs uppercase">
                <button
                  id="tab-dashboard-btn"
                  onClick={() => handleTabClick("dashboard")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 relative group/btn ${
                    activeTab === "dashboard"
                      ? `bg-gradient-to-r ${getVibeAccentColor()} text-slate-950 font-bold`
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50 hover:translate-x-1"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                  {activeTab === "dashboard" && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-slate-950 rounded-full md:block hidden"></div>
                  )}
                </button>

                <button
                  id="tab-brainmirror-btn"
                  onClick={() => handleTabClick("brainmirror")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 relative group/btn ${
                    activeTab === "brainmirror"
                      ? `bg-gradient-to-r ${getVibeAccentColor()} text-slate-950 font-bold`
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50 hover:translate-x-1"
                  }`}
                >
                  <BrainCircuit className="w-4 h-4" /> BrainMirror AI
                  {activeTab === "brainmirror" && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-slate-950 rounded-full md:block hidden"></div>
                  )}
                </button>

                <button
                  id="tab-minddump-btn"
                  onClick={() => handleTabClick("minddump")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 relative group/btn ${
                    activeTab === "minddump"
                      ? `bg-gradient-to-r ${getVibeAccentColor()} text-slate-950 font-bold`
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50 hover:translate-x-1"
                  }`}
                >
                  <CloudLightning className="w-4 h-4" /> MindDump AI
                  {activeTab === "minddump" && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-slate-950 rounded-full md:block hidden"></div>
                  )}
                </button>

                <button
                  id="tab-studyverse-btn"
                  onClick={() => handleTabClick("studyverse")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 relative group/btn ${
                    activeTab === "studyverse"
                      ? `bg-gradient-to-r ${getVibeAccentColor()} text-slate-950 font-bold`
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50 hover:translate-x-1"
                  }`}
                >
                  <Compass className="w-4 h-4" /> StudyVerse Timer
                  {activeTab === "studyverse" && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-slate-950 rounded-full md:block hidden"></div>
                  )}
                </button>

                <button
                  id="tab-examsprint-btn"
                  onClick={() => handleTabClick("examsprint")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 relative group/btn ${
                    activeTab === "examsprint"
                      ? `bg-gradient-to-r ${getVibeAccentColor()} text-slate-950 font-bold`
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50 hover:translate-x-1"
                  }`}
                >
                  <Zap className="w-4 h-4 animate-pulse" /> ExamSprint Mode
                  {activeTab === "examsprint" && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-slate-950 rounded-full md:block hidden"></div>
                  )}
                </button>

                <button
                  id="tab-settings-btn"
                  onClick={() => handleTabClick("settings")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 relative group/btn ${
                    activeTab === "settings"
                      ? `bg-gradient-to-r ${getVibeAccentColor()} text-slate-950 font-bold`
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50 hover:translate-x-1"
                  }`}
                >
                  <Settings className="w-4 h-4" /> Personalization
                  {activeTab === "settings" && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-slate-950 rounded-full md:block hidden"></div>
                  )}
                </button>

                <button
                  id="tab-welcome-portal-btn"
                  onClick={() => handleTabClick("landing")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 relative group/btn ${
                    activeTab === "landing"
                      ? `bg-gradient-to-r ${getVibeAccentColor()} text-slate-950 font-bold`
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50 hover:translate-x-1"
                  }`}
                >
                  <Sparkles className="w-4 h-4" /> Landing Page
                  {activeTab === "landing" && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-slate-950 rounded-full md:block hidden"></div>
                  )}
                </button>
              </nav>
            </div>

            {/* Logout Action */}
            <div className="pt-4 border-t border-slate-900 space-y-2">
              <button
                id="signout-btn"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-450 transition duration-300 font-mono text-xs uppercase"
              >
                <LogOut className="w-4.5 h-4.5 text-slate-500" /> Sign Out
              </button>
            </div>

          </aside>

          {/* Main workspace panels */}
          <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full relative">
            
            {/* Holographic Header metrics row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-900">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-100 uppercase tracking-tight font-mono">
                  {activeTab === "dashboard" && "Dashboard"}
                  {activeTab === "brainmirror" && "BrainMirror AI"}
                  {activeTab === "minddump" && "MindDump AI"}
                  {activeTab === "studyverse" && "StudyVerse Timer"}
                  {activeTab === "examsprint" && "ExamSprint Mode"}
                  {activeTab === "settings" && "Settings"}
                </h2>
                <span className="text-[10.5px] text-slate-450 font-mono uppercase">
                  ACTIVE SESSION: {currentUser?.email || "GUEST ACCOUNT"}
                </span>
              </div>

              {/* Displaying Quick multipliers */}
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-neon-blue font-bold">
                  FOCUS STATUS: HIGH
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-neon-purple font-bold">
                  VIBE: {userProfile.selectedVibe.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Core Panels Router switcher */}

            {/* 1. Hub Dashboard view */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                
                {/* Visual Onboarding prompt reminder */}
                {isOnboarding && (
                  <div className="bg-[#00f0ff]/10 border border-[#00f0ff]/30 p-4.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-[#00f0ff] font-bold text-xs uppercase font-mono flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 animate-spin" /> Onboarding tutorial unlocked!
                      </div>
                      <p className="text-xs text-slate-350">
                        Customize your study universe with ambient music. Go to <strong>StudyVerse Timer</strong> to select Cozy, Gamer, or Minimalist themes.
                      </p>
                    </div>
                    <button
                      id="onboard-dismiss-btn"
                      onClick={() => setIsOnboarding(false)}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-[#00f0ff] font-bold font-mono uppercase rounded-lg"
                    >
                      Customize Theme
                    </button>
                  </div>
                )}

                {/* Grid metrics stats row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Cognitive Index overview */}
                  <div className="cyber-glass-glow rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-201 font-mono text-xs uppercase">LEARNING RATING</h3>
                      <Activity className="w-5 h-5 text-neon-blue" />
                    </div>

                    <div className="py-2">
                      <h1 className="text-4xl font-extrabold tracking-widest font-mono text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-purple-400">
                        {previousAssessments.length > 0 ? previousAssessments[0].visualSynthesis : 65}%
                      </h1>
                      <p className="text-xs text-slate-500 font-mono mt-1">LATEST ASSESSMENT PERCENTAGE</p>
                    </div>

                    <button
                      id="hub-mirror-btn"
                      onClick={() => setActiveTab("brainmirror")}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-neon-blue hover:text-neon-blue text-xs font-mono uppercase rounded-xl transition duration-300 flex items-center justify-center gap-1"
                    >
                      View Style Profile <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stress release clarity summary */}
                  <div className="cyber-glass rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-201 font-mono text-xs uppercase">MIND CLARITY GAUGE</h3>
                      <Flame className="w-5 h-5 text-neon-purple animate-pulse" />
                    </div>

                    <div className="py-2">
                      <h1 className="text-4xl font-extrabold tracking-widest font-mono text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">
                        {previousDumps.length > 0 ? previousDumps[0].clarityPercentage : 82}%
                      </h1>
                      <p className="text-xs text-slate-500 font-mono mt-1">RATED FOCUS PERFORMANCE</p>
                    </div>

                    <button
                      id="hub-dump-btn"
                      onClick={() => setActiveTab("minddump")}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-neon-purple hover:text-neon-purple text-xs font-mono uppercase rounded-xl transition duration-300 flex items-center justify-center gap-1"
                    >
                      Empty Mind Now <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Active multiplier xp track */}
                  <div className={`cyber-glass rounded-2xl p-6 space-y-4 transition-all duration-550 overflow-hidden relative ${
                    isStreakGlowing
                      ? "border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.25)] bg-slate-950/90"
                      : ""
                  }`}>
                    {isStreakGlowing && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full filter blur-xl pointer-events-none animate-pulse"></div>
                    )}
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-201 font-mono text-xs uppercase">XP TRACK & STATS</h3>
                      <Trophy className="w-5 h-5 text-amber-500" />
                    </div>

                    <div className="py-2">
                      <h1 className={`text-4xl font-extrabold tracking-widest font-mono transition-transform duration-300 ${
                        isStreakGlowing ? "text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 scale-105 origin-left" : "text-amber-400"
                      }`}>
                        {userProfile.streak} <span className="text-xs font-semibold text-slate-500 flex-noneInline select-none">DAYS</span>
                      </h1>
                      <p className="text-xs text-slate-500 font-mono mt-1">CURRENT STUDY SEQUENCE</p>
                    </div>

                    <button
                      id="hub-verse-btn"
                      onClick={() => setActiveTab("studyverse")}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-amber-400 hover:text-amber-400 text-xs font-mono uppercase rounded-xl transition duration-300 flex items-center justify-center gap-1"
                    >
                      Open Focus Timer <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Visual logs segment: Achievements & Weekly trackers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Achievements block */}
                  <div className="cyber-glass rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-100 font-mono text-sm uppercase flex items-center gap-2 mb-4">
                        <Trophy className="w-4.5 h-4.5 text-amber-400 animate-bounce" /> Achievements Unlocked
                      </h3>
                      
                      <div className="space-y-3.5">
                        <div className="p-4 bg-slate-900/50 border border-slate-855 rounded-xl flex items-start gap-3">
                          <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-mono text-xs uppercase font-bold text-slate-100">Late Night Hustle</h4>
                            <p className="text-xs text-slate-400 mt-1">Complete and log a practice session during late night study hours.</p>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-900/50 border border-slate-855 rounded-xl flex items-start gap-3">
                          <div className="p-2 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg">
                            <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-mono text-xs uppercase font-bold text-slate-100">Super Focused Academic</h4>
                            <p className="text-xs text-slate-400 mt-1">Complete 25 minutes of continuous smart study timers.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-900/60 text-[10px] text-slate-500 font-mono uppercase flex justify-between items-center">
                      <span>Achievements: 2 / 10 Earned</span>
                      <span className="text-[#00f0ff] font-bold">Level {userProfile.level} status</span>
                    </div>
                  </div>

                  {/* Daily Missions Log & Weekly XP Progress Tracker */}
                  <div className="cyber-glass rounded-2xl p-6 space-y-5 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff]/5 rounded-full filter blur-xl pointer-events-none"></div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-100 font-mono text-sm uppercase flex items-center gap-2">
                          <Calendar className="w-4.5 h-4.5 text-cyan-400" /> Weekly Mission Tracking
                        </h3>
                        {/* Interactive tag representing sum of earned weekly XP */}
                        <span className="px-3 py-1 bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-cyan-400 font-mono text-[11px] font-bold rounded-full flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {completedMissionsLog.reduce((sum, m) => sum + m.xpEarned, 0)} TOTAL XP
                        </span>
                      </div>

                      {/* 7-DAY VISUAL WEEKLY PROGRESS BAR / CHIPS */}
                      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pb-2">
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((dayName) => {
                          const matchingMissions = completedMissionsLog.filter(m => m.day === dayName);
                          const totalDayXP = matchingMissions.reduce((sum, m) => sum + m.xpEarned, 0);
                          const isCompleted = totalDayXP > 0;
                          const isToday = dayName === ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];

                          return (
                            <div 
                              key={dayName} 
                              className={`flex flex-col items-center p-2 rounded-xl border transition-all duration-300 ${
                                isToday 
                                  ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)]" 
                                  : isCompleted 
                                    ? "bg-slate-900/60 border-slate-800" 
                                    : "bg-slate-950/40 border-slate-900"
                              }`}
                            >
                              <span className={`text-[10px] font-mono uppercase font-bold select-none ${
                                isToday 
                                  ? "text-cyan-400" 
                                  : isCompleted 
                                    ? "text-slate-300" 
                                    : "text-slate-500"
                              }`}>
                                {dayName.slice(0, 3)}
                              </span>
                              
                              <div className="my-1.5 relative">
                                {isCompleted ? (
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </div>
                                ) : (
                                  <div className={`w-5 h-5 rounded-full border border-dashed flex items-center justify-center ${
                                    isToday ? "border-cyan-500/50" : "border-slate-800"
                                  }`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-805"></div>
                                  </div>
                                )}
                              </div>

                              <span className={`text-[9px] font-mono leading-none tracking-tight font-extrabold ${
                                totalDayXP > 0 
                                  ? "text-cyan-400" 
                                  : isToday 
                                    ? "text-cyan-400/40" 
                                    : "text-slate-600"
                              }`}>
                                {totalDayXP > 0 ? `+${totalDayXP}` : "0"}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* MISSION CHRONICLES LIST LOG */}
                      <div className="mt-4 space-y-2 max-h-[175px] overflow-y-auto custom-scrollbar pr-1">
                        <div className="text-[10px] font-mono text-slate-550 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
                          <span>Timeline of Accomplishments</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse"></span>
                        </div>

                        {completedMissionsLog.length === 0 ? (
                          <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl text-center">
                            <p className="text-xs text-slate-500 leading-relaxed">
                              No study milestones logged this week. Navigate to the <strong>StudyVerse Timer</strong> room to activate and claim study missions!
                            </p>
                          </div>
                        ) : (
                          completedMissionsLog.map((log) => (
                            <div 
                              key={log.id} 
                              className="p-2.5 bg-slate-905/30 border border-slate-900 hover:border-slate-850 rounded-xl flex items-center justify-between gap-3 text-left group/item hover:bg-slate-900/50 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-1 text-cyan-400 bg-cyan-950/20 border border-cyan-800/10 rounded-lg group-hover/item:scale-105 transition-transform flex-shrink-0">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-[11px] font-medium text-slate-100 truncate pr-2 leading-tight">
                                    {log.title}
                                  </h4>
                                  <span className="text-[9px] font-mono text-slate-500 uppercase">
                                    Completed on {log.day}
                                  </span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 bg-cyan-950/20 border border-cyan-850 text-cyan-400 font-mono text-[9.5px] font-bold rounded flex-shrink-0">
                                +{log.xpEarned} XP
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-900/60 text-[10px] text-slate-500 font-mono uppercase flex justify-between items-center">
                      <span>Weekly Status: Consistency High</span>
                      <button 
                        onClick={() => {
                          if (confirm("Are you sure you want to clear your current weekly mission log metrics?")) {
                            setCompletedMissionsLog([]);
                          }
                        }}
                        className="text-slate-600 hover:text-rose-450 transition-colors cursor-pointer text-[9.5px]"
                      >
                        Reset Weekly Log
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* 2. BrainMirror module view */}
            {activeTab === "brainmirror" && (
              <BrainMirror
                userId={userProfile.uid}
                previousAssessment={previousAssessments.length > 0 ? previousAssessments[0] : null}
                onAssessmentCompleted={(newAssess) => {
                  setPreviousAssessments((prev) => [newAssess, ...prev]);
                  // Reward student profile XP instantly
                  const extraXP = userProfile.xp + 75;
                  const bonusLevel = calculateLevelFromXP(extraXP);
                  const updated = { ...userProfile, xp: extraXP, level: bonusLevel };
                  setUserProfile(updated);
                }}
              />
            )}

            {/* 3. MindDump module view */}
            {activeTab === "minddump" && (
              <MindDump
                userId={userProfile.uid}
                previousDumps={previousDumps}
                onPlanCreated={(newDump) => {
                  setPreviousDumps((prev) => [newDump, ...prev]);
                  // Reward student profile XP
                  const extraXP = userProfile.xp + 60;
                  const bonusLevel = calculateLevelFromXP(extraXP);
                  const updated = { ...userProfile, xp: extraXP, level: bonusLevel };
                  setUserProfile(updated);
                }}
              />
            )}

            {/* 4. StudyVerse module view */}
            {activeTab === "studyverse" && (
              <StudyVerse
                userProfile={userProfile}
                onProfileUpdated={(updated) => {
                  setUserProfile(updated);
                }}
                onDailyMissionComplete={handleDailyMissionComplete}
              />
            )}

            {/* 5. ExamSprint module view */}
            {activeTab === "examsprint" && (
              <ExamSprint userId={userProfile.uid} />
            )}

            {/* 6. Personalization settings panel */}
            {activeTab === "settings" && (
              <PersonalizationPanel
                userProfile={userProfile}
                onProfileUpdated={(updated) => {
                  setUserProfile(updated);
                }}
              />
            )}

          </main>

        </div>
      )}

      {/* Mount Adaptive Companion/Chatbot statically on all pages (Landing, Login, and Workspace) */}
      <AICompanion currentVibe={userProfile?.selectedVibe || "scifi"} userDisplayName={userProfile?.displayName || "Scholar"} />
    </div>
  );
}
