import React from "react";

// Firebase Imports
import { auth, db, appId } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

// Component Imports
import AuthScreen from "./components/AuthScreen";
import OnboardingSurvey from "./components/OnboardingSurvey";
import MonthlyCheckInModal from "./components/MonthlyCheckInModal";
import CalorieProgressCircle from "./components/CalorieProgressCircle";
import StreakCounter from "./components/StreakCounter";
import MealList from "./components/MealList";
import AddMealModal from "./components/AddMealModal";
import MealInsightCard from "./components/MealInsightCard";
import Toast from "./components/Toast";
import { LogOutIcon, PlusIcon, SparklesIcon } from "./components/Icons";

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const FirebaseLoadingScreen = () => (
  <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center text-slate-300">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <h1 className="text-2xl font-bold text-blue-500">Connecting...</h1>
  </div>
);

export default function App() {
  const getTodaysDateKey = () => new Date().toISOString().split("T")[0];

  const [user, setUser] = React.useState(null);
  const [isFirebaseReady, setIsFirebaseReady] = React.useState(false);
  const [surveyHistory, setSurveyHistory] = React.useState(null);
  const [dailyGoal, setDailyGoal] = React.useState(2200);
  const [maintenanceCalories, setMaintenanceCalories] = React.useState(2000);
  const [meals, setMeals] = React.useState([]);
  const [streakData, setStreakData] = React.useState({});
  const [isAddMealModalOpen, setIsAddMealModalOpen] = React.useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = React.useState(false);
  const [insight, setInsight] = React.useState(null);
  const [isInsightLoading, setIsInsightLoading] = React.useState(false);
  const [insightError, setInsightError] = React.useState(null);
  const [toastMessage, setToastMessage] = React.useState("");

  const totalCalories = React.useMemo(
    () => meals.reduce((sum, meal) => sum + meal.calories, 0),
    [meals]
  );
  const prevTotalCalories = React.useRef(totalCalories);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsFirebaseReady(true);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!user) return;
    const userId = user.uid;
    const userProfileRef = doc(
      db,
      `artifacts/${appId}/users/${userId}/userProfile`,
      "settings"
    );
    const unsubscribeProfile = onSnapshot(userProfileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSurveyHistory(data.surveyHistory || null);
        setDailyGoal(data.dailyGoal || 2200);
        setMaintenanceCalories(data.maintenanceCalories || 2000);
        setStreakData(data.streakData || {});
      } else {
        setSurveyHistory(null);
      }
    });

    const todayKey = getTodaysDateKey();
    const mealsRef = doc(
      db,
      `artifacts/${appId}/users/${userId}/dailyMeals`,
      todayKey
    );
    const unsubscribeMeals = onSnapshot(mealsRef, (docSnap) => {
      setMeals(docSnap.exists() ? docSnap.data().meals || [] : []);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeMeals();
    };
  }, [user]);

  const handleSurveyComplete = async ({ goal, maintenance, initialSurvey }) => {
    if (!user) return;
    const todayKey = getTodaysDateKey();
    const surveyPayload = {
      startDate: todayKey,
      data: initialSurvey,
      lastCheckIn: todayKey,
    };
    const userProfileRef = doc(
      db,
      `artifacts/${appId}/users/${user.uid}/userProfile`,
      "settings"
    );
    await setDoc(
      userProfileRef,
      {
        dailyGoal: goal,
        maintenanceCalories: maintenance,
        surveyHistory: surveyPayload,
        streakData: {},
      },
      { merge: true }
    );
  };

  const handleCheckInUpdate = async ({ goal, maintenance, newWeight }) => {
    if (!user || !surveyHistory) return;
    const userProfileRef = doc(
      db,
      `artifacts/${appId}/users/${user.uid}/userProfile`,
      "settings"
    );
    const updatedHistory = {
      ...surveyHistory,
      data: { ...surveyHistory.data, weight: newWeight },
      lastCheckIn: getTodaysDateKey(),
    };
    await updateDoc(userProfileRef, {
      dailyGoal: goal,
      maintenanceCalories: maintenance,
      surveyHistory: updatedHistory,
    });
  };

  const addMeal = async (newMeal) => {
    if (!user) return;
    const todayKey = getTodaysDateKey();
    const mealsRef = doc(
      db,
      `artifacts/${appId}/users/${user.uid}/dailyMeals`,
      todayKey
    );
    await setDoc(mealsRef, { meals: arrayUnion(newMeal) }, { merge: true });
  };

  const removeMeal = async (mealToRemove) => {
    if (!user) return;
    const todayKey = getTodaysDateKey();
    const mealsRef = doc(
      db,
      `artifacts/${appId}/users/${user.uid}/dailyMeals`,
      todayKey
    );
    await updateDoc(mealsRef, { meals: arrayRemove(mealToRemove) });
  };

  const handleGoalChange = async (newGoal) => {
    if (!user) return;
    const userProfileRef = doc(
      db,
      `artifacts/${appId}/users/${user.uid}/userProfile`,
      "settings"
    );
    await updateDoc(userProfileRef, { dailyGoal: newGoal });
  };

  const updateStreakData = async () => {
    if (!user) return;
    const todayKey = getTodaysDateKey();
    const userProfileRef = doc(
      db,
      `artifacts/${appId}/users/${user.uid}/userProfile`,
      "settings"
    );
    await updateDoc(userProfileRef, { [`streakData.${todayKey}`]: true });
  };

  React.useEffect(() => {
    if (!isFirebaseReady || !user) return;
    const todayKey = getTodaysDateKey();
    const hasHitMaintenanceToday = streakData[todayKey] || false;

    if (
      prevTotalCalories.current < dailyGoal &&
      totalCalories >= dailyGoal &&
      dailyGoal > 0
    ) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js";
      script.onload = () =>
        window.confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      document.body.appendChild(script);
      setTimeout(
        () =>
          document.body.contains(script) && document.body.removeChild(script),
        4000
      );
    }

    if (totalCalories >= maintenanceCalories && !hasHitMaintenanceToday) {
      navigator.vibrate?.(200);
      updateStreakData();

      if (dailyGoal > totalCalories) {
        const remaining = dailyGoal - totalCalories;
        setToastMessage(`Maintenance hit! Just ${remaining} kcal more to go!`);
      } else {
        setToastMessage(`Daily goal achieved! Great job!`);
      }
      setTimeout(() => setToastMessage(""), 5000);
    }

    prevTotalCalories.current = totalCalories;
  }, [
    totalCalories,
    dailyGoal,
    maintenanceCalories,
    streakData,
    isFirebaseReady,
    user,
  ]);

  React.useEffect(() => {
    if (surveyHistory && isFirebaseReady) {
      const today = new Date();
      const lastCheckInDate = new Date(surveyHistory.lastCheckIn);
      const diffTime = Math.abs(today - lastCheckInDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 30) setIsCheckInModalOpen(true);
    }
  }, [surveyHistory, isFirebaseReady]);

  // src/App.jsx
  // hello

  const getMealInsights = async () => {
    if (!meals || meals.length === 0) return;
    setIsInsightLoading(true);
    setInsight(null);
    setInsightError(null);
    const mealSummary = meals
      .map((m) => `- ${m.name} (~${m.calories} kcal)`)
      .join("\n");
    const userPrompt = `Based on the following list of meals I ate today, provide a brief, one-paragraph nutritional analysis. Offer one positive insight and one simple, actionable suggestion for a healthier choice tomorrow. Keep the tone encouraging and friendly, like a helpful nutrition coach. Do not use markdown.\n\nHere are my meals:\n${mealSummary}\n\nMy daily calorie goal is ${dailyGoal} kcal.`;
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Or your hardcoded key for testing
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: userPrompt }] }] };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok)
        throw new Error("Failed to get a response from the AI.");
      const result = await response.json();
      const candidate = result.candidates?.[0];
      if (candidate && candidate.content?.parts?.[0]?.text) {
        setInsight(candidate.content.parts[0].text);
      } else {
        throw new Error(
          "The AI response was empty or in an unexpected format."
        );
      }
    } catch (err) {
      console.error("Insight API error:", err);
      setInsightError(
        "Sorry, I couldn't generate an insight right now. Please try again later."
      );
    } finally {
      setIsInsightLoading(false);
    }
  };

  const clearInsight = () => {
    setInsight(null);
    setInsightError(null);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (!isFirebaseReady) return <FirebaseLoadingScreen />;
  if (!user) return <AuthScreen />;
  if (!surveyHistory)
    return <OnboardingSurvey onComplete={handleSurveyComplete} />;

  return (
    <div className="bg-slate-900 min-h-screen font-sans text-slate-300">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-blue-500 tracking-tight">
            NutriScan AI
          </h1>
          <div className="flex items-center gap-6">
            <StreakCounter streakData={streakData} />
            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <LogOutIcon />
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 flex flex-col items-center max-w-2xl">
        <CalorieProgressCircle
          totalCalories={totalCalories}
          dailyGoal={dailyGoal}
          onGoalChange={handleGoalChange}
        />
        <div className="text-center mt-4 text-slate-400">
          Your maintenance level is <strong>{maintenanceCalories} kcal</strong>
        </div>
        {meals.length > 0 && !isInsightLoading && !insight && !insightError && (
          <div className="text-center mt-6 animate-fade-in-up">
            <button
              onClick={debounce(getMealInsights, 500)}
              disabled={isInsightLoading}
              className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center mx-auto shadow-lg shadow-indigo-900/50 hover:shadow-xl"
            >
              <SparklesIcon />
              <span className="ml-2">✨ Get Meal Insights</span>
            </button>
          </div>
        )}
        <MealInsightCard
          insight={insight}
          isLoading={isInsightLoading}
          error={insightError}
          onClear={clearInsight}
        />
        <MealList meals={meals} onRemove={removeMeal} />
      </main>
      <button
        onClick={() => setIsAddMealModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-900/50 flex items-center justify-center hover:bg-blue-500 transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-400/50"
        aria-label="Add new meal"
      >
        <PlusIcon />
      </button>
      <AddMealModal
        isOpen={isAddMealModalOpen}
        onClose={() => setIsAddMealModalOpen(false)}
        onAddMeal={addMeal}
      />
      {surveyHistory && (
        <MonthlyCheckInModal
          isOpen={isCheckInModalOpen}
          onClose={() => setIsCheckInModalOpen(false)}
          onUpdate={handleCheckInUpdate}
          surveyHistory={surveyHistory}
        />
      )}
      <Toast message={toastMessage} />
    </div>
  );
}
