import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AOS from "aos";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Crown,
  Utensils,
  Coffee,
  Moon,
  Flame,
  Droplets,
  TrendingUp,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Download,
  Lock,
  Unlock,
  Clock,
  Apple,
  Cookie,
  Sun,
} from "lucide-react";
import { toast } from "sonner";
import { api, ENABLE_REGENERATE } from "@/lib/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type UserData = {
  name: string;
  email: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  goal: string;
  activityLevel: string;
  dietaryRestrictions: string[];
  allergies: string;
  mealPreference: string;
  plan: string;
  hasPaid: boolean;
  profileId?: string;
  subscriptionId?: string;
  endDate?: string;
  extendedData?: any;
};

type Meal = {
  type: string;
  time: string;
  name: string;
  items?: string[];
  ingredients?: string[];
  preparation_steps?: string[];
  benefits?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  tips?: string;
  // For Ultimate plans that use nested item structure
  title?: string;
  // New: Multiple Options support
  option_1?: MealOption;
  option_2?: MealOption;
  suggestions?: string;
};

type MealOption = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  preparation_steps: string[];
  benefits: string;
};

type DayPlan = {
  day_number: number;
  plan_date: string;
  is_unlocked: boolean;
  unlocked_at?: string;
  meal_plan?: {
    day_summary: string;
    total_calories: number;
    meals: Meal[];
    water_intake: string;
    special_notes: string;
  };
};

const getMealIcon = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("early")) return Sun;
  if (lowerType.includes("breakfast")) return Coffee;
  if (lowerType.includes("mid-morning") || lowerType.includes("snack")) return Cookie;
  if (lowerType.includes("lunch")) return Apple;
  if (lowerType.includes("evening")) return Cookie;
  if (lowerType.includes("dinner")) return Moon;
  return Utensils;
};

// Helper: Get Local Date as YYYY-MM-DD
const getLocalISODate = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollDays = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 300;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const currentDayPlan = dayPlans[selectedDay];

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });

    loadUserData();
  }, [navigate]);

  const loadUserData = async () => {
    console.log("Dashboard: loadUserData called");
    const orderId = searchParams.get("order_id");
    console.log("Dashboard: orderId =", orderId);

    if (orderId) {
      try {
        console.log("Dashboard: Verifying order", orderId);
        const orderData = await api.payment.verifyOrder(orderId);
        console.log("Dashboard: Order data", orderData);
        if (orderData.order_status === 'PAID') {
          const pending = localStorage.getItem("luxediet_pending_payment");
          console.log("Dashboard: Pending data", pending);
          if (pending) {
            const pendingData = JSON.parse(pending);
            await api.subscriptions.update(pendingData.subscriptionId, { payment_status: "completed" });
            const userData: UserData = {
              ...pendingData.formData,
              goal: pendingData.formData.primaryFitnessGoals?.join(", ") || "",
              plan: pendingData.selectedPlan,
              hasPaid: true,
              subscriptionId: pendingData.subscriptionId,
              profileId: pendingData.profileId,
              dietaryRestrictions: [
                ...(pendingData.formData.hormonalGoals || []),
                ...(pendingData.formData.foodAllergies || []),
                ...(pendingData.formData.lifestyleMetabolic || []),
                ...(pendingData.formData.digestiveHealth || []),
              ],
            };
            localStorage.setItem("luxediet_user", JSON.stringify(userData));
            localStorage.removeItem("luxediet_pending_payment");
            toast.success("Payment successful! Welcome to your dashboard.");
            navigate("/dashboard", { replace: true });
            setUserData(userData);
            await loadDayPlans(userData.subscriptionId, userData.plan);
            setIsLoading(false);
            return;
          } else {
            toast.error("Payment data not found");
            navigate("/get-started");
            return;
          }
        } else {
          toast.error("Payment not completed");
          navigate("/get-started");
          return;
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("Error verifying payment");
        navigate("/get-started");
        return;
      }
    }

    // 1. Check Authentication
    const authUserStr = localStorage.getItem("luxediet_auth_user");
    console.log("Dashboard: authUser =", authUserStr);
    if (!authUserStr) {
      console.log("Dashboard: No auth user, redirecting to /auth");
      toast.error("Please login to access dashboard");
      navigate("/auth");
      return;
    }
    const authUser = JSON.parse(authUserStr);

    // 2. Check Profile/Plan Data
    const storedUser = localStorage.getItem("luxediet_user");
    console.log("Dashboard: storedUser =", storedUser);

    let user: UserData | null = null;

    if (storedUser) {
      user = JSON.parse(storedUser) as UserData;

      // AUTO-SYNC: Force refresh of Plan Data from Backend to prevent stale localStorage
      try {
        const subscription = await api.subscriptions.getActiveByUserId(authUser.id);
        if (subscription) {
          user.plan = subscription.plan_type;
          user.subscriptionId = subscription.id;
          user.endDate = subscription.end_date;
          user.hasPaid = true;
          localStorage.setItem("luxediet_user", JSON.stringify(user));
          console.log("Dashboard: Synced plan with backend:", user.plan);
        }
      } catch (e) {
        console.warn("Dashboard: Could not sync subscription (might be expired or network error)");
      }

      console.log("Dashboard: user =", user);
      if (!user.hasPaid || !user.subscriptionId) {
        console.log("Dashboard: User not paid or no subscription, checking backend");
        // Try to fetch from backend
        try {
          const subscription = await api.subscriptions.getActiveByUserId(authUser.id);
          const profile = await api.profiles.getByUserId(authUser.id);
          user = {
            ...profile,
            plan: subscription.plan_type,
            hasPaid: true,
            subscriptionId: subscription.id,
            profileId: profile.id,
            dietaryRestrictions: profile.dietary_restrictions || [],
            endDate: subscription.end_date,
            extendedData: profile.extended_data || {},
          };
          localStorage.setItem("luxediet_user", JSON.stringify(user));
          console.log("Dashboard: Recovered user data from backend");
        } catch (error) {
          console.log("Dashboard: No active subscription found, redirecting to /get-started");
          toast.info("Please complete your subscription to access the dashboard");
          navigate("/get-started");
          return;
        }
      }
    } else {
      // No local data, check backend
      console.log("Dashboard: No stored user, checking backend");
      try {
        const subscription = await api.subscriptions.getActiveByUserId(authUser.id);
        const profile = await api.profiles.getByUserId(authUser.id);
        user = {
          ...profile,
          plan: subscription.plan_type,
          hasPaid: true,
          subscriptionId: subscription.id,
          profileId: profile.id,
          endDate: subscription.end_date,
          extendedData: profile.extended_data || {},
        };
        localStorage.setItem("luxediet_user", JSON.stringify(user));
        console.log("Dashboard: Loaded user data from backend");
      } catch (error) {
        console.log("Dashboard: No data found, redirecting to /get-started");
        toast.info("Please set up your diet plan to continue");
        navigate("/get-started");
        return;
      }
    }

    // 3. Check Subscription Expiry
    if (user.endDate) {
      const today = getLocalISODate();
      if (user.endDate < today) {
        console.log("Dashboard: Subscription expired", user.endDate);
        toast.error("Your subscription has expired. Please renew to continue.");
        localStorage.removeItem("luxediet_user"); // Clear invalid user data
        navigate("/get-started");
        return;
      }
    }

    setUserData(user);

    // Load day plans
    await loadDayPlans(user.subscriptionId, user.plan);

    setIsLoading(false);
  };

  const createSubscription = async (user: UserData) => {
    try {
      // First create profile
      // Get Auth User ID
      const authUserStr = localStorage.getItem("luxediet_auth_user");
      const authUser = authUserStr ? JSON.parse(authUserStr) : null;

      if (!authUser || !authUser.id) {
        throw new Error("User ID not found. Please login again.");
      }

      // First create/update profile
      const profile = await api.profiles.create({
        user_id: authUser.id, // Pass user_id
        name: user.name,
        email: user.email,
        age: parseInt(user.age),
        gender: user.gender,
        height: parseFloat(user.height),
        weight: parseFloat(user.weight),
        goal: user.goal,
        activity_level: user.activityLevel,
        dietary_restrictions: user.dietaryRestrictions,
        allergies: user.allergies,
        meal_preference: user.mealPreference,
      });

      // Create subscription
      const planDays = user.plan === "elite" ? 30 : user.plan === "premium" ? 30 : 7;
      const amount = user.plan === "elite" ? 2499 : user.plan === "premium" ? 799 : 499;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + planDays);

      const subscription = await api.subscriptions.create({
        user_id: authUser.id, // Pass user_id
        profile_id: profile.id,
        plan_type: user.plan,
        plan_days: planDays,
        end_date: getLocalISODate(endDate), // Use Local Date
        amount: amount,
        payment_method: "cashfree",
        payment_status: "completed",
      });

      // Create day plan entries
      const dayPlanEntries = [];
      for (let i = 1; i <= planDays; i++) {
        const planDate = new Date(); // Today
        planDate.setDate(planDate.getDate() + i - 1);
        dayPlanEntries.push({
          subscription_id: subscription.id,
          day_number: i,
          plan_date: getLocalISODate(planDate), // Use Local Date
          is_unlocked: false,
        });
      }

      await api.dietPlans.createBatch(dayPlanEntries);

      // Update local storage with IDs
      const updatedUser = {
        ...user,
        profileId: profile.id,
        subscriptionId: subscription.id,
      };
      localStorage.setItem("luxediet_user", JSON.stringify(updatedUser));
      setUserData(updatedUser);

      await loadDayPlans(subscription.id, user.plan);
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error("Failed to initialize your plan. Please try again.");
    }
  };

  const loadDayPlans = async (subscriptionId: string, plan: string) => {
    try {
      const data = await api.dietPlans.getBySubscription(subscriptionId);

      const plans: DayPlan[] = (data || []).map((d: any) => ({
        day_number: d.day_number,
        plan_date: d.plan_date,
        is_unlocked: d.is_unlocked ?? false,
        unlocked_at: d.unlocked_at ?? undefined,
        meal_plan: d.meal_plan as DayPlan["meal_plan"] ?? undefined,
      }));

      setDayPlans(plans);

      // Find current day or first unlocked day
      const today = getLocalISODate();
      const todayIndex = plans.findIndex((p) => p.plan_date === today);
      if (todayIndex >= 0) {
        setSelectedDay(todayIndex);
      }
    } catch (error) {
      console.error("Error loading day plans:", error);
    }
  };

  const canUnlockDay = (dayPlan: DayPlan, index: number): boolean => {
    const today = getLocalISODate();
    const planDate = dayPlan.plan_date;

    // Can only unlock if it's today or a past date (within the plan)
    // String comparison works for YYYY-MM-DD
    return planDate <= today && !dayPlan.is_unlocked;
  };

  const isDayAccessible = (dayPlan: DayPlan): boolean => {
    return dayPlan.is_unlocked;
  };

  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinData, setCheckinData] = useState({ weight: "", mood: "Good", notes: "", language: "English" });

  const unlockTodaysPlan = () => {
    if (!userData?.subscriptionId) return;
    const currentPlan = dayPlans[selectedDay];
    if (!currentPlan || !canUnlockDay(currentPlan, selectedDay)) {
      toast.error("This day's plan is not available yet");
      return;
    }
    // Open Check-in Modal instead of direct generate
    setCheckinData({ weight: userData.weight || "", mood: "Good", notes: "", language: "English" });
    setIsRegenerating(false);
    setShowCheckinModal(true);
  };

  const startRegeneration = () => {
    if (!userData?.subscriptionId) return;
    if (!confirm("Are you sure? This will OVERWRITE existing plan data for this day.")) return;
    setCheckinData({ weight: userData.weight || "", mood: "Good", notes: "", language: "English" });
    setIsRegenerating(true);
    setShowCheckinModal(true);
  };

  const processUnlock = async (skipCheckin: boolean) => {
    if (!userData?.subscriptionId) return;
    const currentPlan = dayPlans[selectedDay];

    setIsGenerating(true);
    setShowCheckinModal(false); // Close modal
    toast.info(skipCheckin ? "Generating your plan..." : "Saving check-in and generating plan...");

    try {
      console.log("Starting meal plan generation for day", currentPlan.day_number);
      // 1. Optional Check-in
      if (!skipCheckin) {
        await api.dietPlans.checkIn({
          subscription_id: userData.subscriptionId,
          day_number: currentPlan.day_number,
          weight: checkinData.weight ? parseFloat(checkinData.weight) : undefined,
          mood: checkinData.mood,
          notes: checkinData.notes
        });
      }

      // 2. Generate Plan (Pass updated weight if provided!)
      // If user provided a new weight, use it for calculation, otherwise profile weight
      const currentWeight = (!skipCheckin && checkinData.weight) ? parseFloat(checkinData.weight) : parseFloat(userData.weight);

      console.log("Calling generate API");
      const response = await api.dietPlans.generate({
        ...userData,
        weight: currentWeight, // Use current weight for accurate TDEE
        age: parseInt(userData.age),
        height: parseFloat(userData.height),
        extended_data: userData.extendedData, // Pass as snake_case for backend consistency
        // Pass daily check-in data to AI (even if skipped, it might be null or default)
        current_mood: !skipCheckin ? checkinData.mood : undefined,
        current_notes: !skipCheckin ? checkinData.notes : undefined,
        language: !skipCheckin ? checkinData.language : "English",
      }, currentPlan.day_number, userData.plan);

      console.log("Generate API response:", response);
      const { mealPlan } = response;

      if (!mealPlan) {
        console.error("No meal plan in response");
        throw new Error("No meal plan generated");
      }

      console.log("Meal plan generated:", mealPlan);

      // 3. Unlock
      console.log("Calling unlock API");
      await api.dietPlans.unlock(userData.subscriptionId, currentPlan.day_number, mealPlan);

      // Reload
      await loadDayPlans(userData.subscriptionId, userData.plan);
      toast.success("Your meal plan is ready!");

    } catch (error) {
      console.error("Error in processUnlock:", error);
      toast.error((error as Error)?.message || "Failed to generate plan. Please try again.");
    } finally {
      setIsGenerating(false);
      setIsRegenerating(false);
    }
  };

  // WARNING: Test function to regenerate current day's plan
  const regenerateCurrentDay = async () => {
    if (!userData?.subscriptionId) return;
    if (!confirm("Are you sure? This will OVERWRITE existing plan data for this day.")) return;

    const currentPlan = dayPlans[selectedDay];
    setIsGenerating(true);
    try {
      // 1. Clear unlock status (optional, but cleaner)
      // Actually we just overwrite via generate and update

      console.log("Regenerating plan for day", currentPlan.day_number);

      const response = await api.dietPlans.generate({
        ...userData,
        weight: parseFloat(userData.weight),
        age: parseInt(userData.age),
        height: parseFloat(userData.height),
        extended_data: userData.extendedData,
      }, currentPlan.day_number, userData.plan);

      const { mealPlan } = response;
      if (!mealPlan) throw new Error("No meal plan generated");

      // 2. Overwrite via unlock (which updates if exists or creates)
      await api.dietPlans.unlock(userData.subscriptionId, currentPlan.day_number, mealPlan);

      // 3. Reload
      await loadDayPlans(userData.subscriptionId, userData.plan);
      toast.success("Plan regenerated successfully!");

    } catch (error) {
      console.error("Regeneration failed:", error);
      toast.error("Failed to regenerate plan.");
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateBMI = () => {
    if (!userData) return 0;
    const heightM = parseFloat(userData.height) / 100;
    const weight = parseFloat(userData.weight);
    return (weight / (heightM * heightM)).toFixed(1);
  };

  const calculateDailyCalories = () => {
    if (!userData) return 0;
    const weight = parseFloat(userData.weight);
    const height = parseFloat(userData.height);
    const age = parseFloat(userData.age);

    const bmr =
      userData.gender === "female"
        ? 10 * weight + 6.25 * height - 5 * age - 161
        : 10 * weight + 6.25 * height - 5 * age + 5;

    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      "very-active": 1.9,
    };

    const tdee = bmr * (multipliers[userData.activityLevel] || 1.55);

    const goals = (userData.goal || "").toLowerCase();
    if (goals.includes("weight loss") || goals.includes("weight-loss") || goals.includes("fat loss"))
      return Math.round(tdee - 500);
    if (goals.includes("muscle gain") || goals.includes("muscle-gain") || goals.includes("weight gain"))
      return Math.round(tdee + 300);
    return Math.round(tdee);
  };

  const downloadPlan = async () => {
    if (!currentDayPlan?.meal_plan) return;

    const input = document.getElementById('printable-meal-plan');
    if (!input) {
      toast.error("Could not find plan content.");
      return;
    }

    try {
      toast.info("Generating high-quality PDF...");

      const canvas = await html2canvas(input, {
        scale: 1.5, // Reduced from 2 for smaller file size
        useCORS: true,
        backgroundColor: '#09090b',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.8); // JPEG compression (0.8 quality)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add extra pages if long
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`LuxeDiet_Plan_Day${currentDayPlan.day_number}.pdf`);
      toast.success("Download started!");
    } catch (error) {
      console.error("PDF Error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const planName = (userData?.plan || "").toLowerCase();
  let planDays = 30; // Default or Starter (30 days)

  if (planName.includes("premium")) {
    planDays = 7; // Premium is 7-Day Ultimate
  } else if (planName.includes("elite")) {
    planDays = 30; // Elite is 30-Day Ultimate
  } else if (planName.includes("starter")) {
    planDays = 30; // Starter is 30-Day Custom
  }
  // Fallback if unknown? 7 or 30? Let's assume 30 if not premium.
  // Actually, safely:
  if (planName === "premium") planDays = 7;
  else if (planName === "elite" || planName === "starter") planDays = 30;
  else if (planName.includes("7")) planDays = 7; // safety
  else if (planName.includes("30")) planDays = 30; // safety
  const targetCalories = calculateDailyCalories();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center" data-aos="fade-up">
          <div className="relative inline-block mb-8">
            <Sparkles className="h-16 w-16 text-gold animate-pulse" />
            <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Loading Your Dashboard</h2>
          <p className="text-muted-foreground">Please wait...</p>
          <Progress value={66} className="w-64 mx-auto mt-6" />
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 md:pt-28">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-10" data-aos="fade-up">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="h-6 w-6 md:h-8 md:w-8 text-gold" />
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                Welcome, <span className="gold-text">{userData.name}</span>
              </h1>
            </div>
            <p className="text-muted-foreground">
              Your <span className="capitalize">{userData.plan}</span> plan is active • {(userData.goal || "Health Transformation").split(",")[0].replace("-", " ")} journey
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-10">
            {[
              { icon: Flame, label: "Daily Target", value: `${targetCalories || 2000} kcal`, color: "text-orange-500" },
              { icon: TrendingUp, label: "BMI", value: calculateBMI() || "0.0", color: "text-green-500" },
              { icon: Calendar, label: "Progress", value: `Day ${selectedDay + 1}`, color: "text-blue-500" },
              { icon: Crown, label: "Plan Type", value: userData.plan || "Starter", color: "text-gold" },
            ].map((stat, i) => (
              <Card key={i} variant="luxury" data-aos="fade-up" data-aos-delay={100 + i * 50}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Day Selector */}
          <div className="mb-8" data-aos="fade-up" data-aos-delay="200">
            <h3 className="text-lg font-semibold mb-4">Select Day</h3>
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md hidden md:flex hover:bg-background border border-border/50 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => scrollDays('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth md:px-10">
                {dayPlans.slice(0, Math.min(dayPlans.length, 14)).map((day, index) => {
                  const isUnlocked = day.is_unlocked;
                  const canUnlock = canUnlockDay(day, index);
                  const today = getLocalISODate();
                  const isToday = day.plan_date === today;

                  return (
                    <Button
                      key={day.day_number}
                      variant={selectedDay === index ? "luxury" : isUnlocked ? "glass" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDay(index)}
                      className={`flex-shrink-0 relative h-9 md:h-11 px-4 md:px-8 text-xs md:text-sm ${!isUnlocked && !canUnlock ? "opacity-50" : ""}`}
                      disabled={!isUnlocked && !canUnlock}
                    >
                      <span className="flex items-center gap-1.5 md:gap-2">
                        {isUnlocked ? (
                          <Unlock className="h-3 w-3 md:h-4 md:w-4" />
                        ) : (
                          <Lock className="h-3 w-3 md:h-4 md:w-4" />
                        )}
                        Day {day.day_number}
                      </span>
                      {isToday && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-gold rounded-full animate-pulse" />
                      )}
                    </Button>
                  );
                })}
                {dayPlans.length > 14 && (
                  <Button variant="ghost" size="lg" className="flex-shrink-0">
                    +{dayPlans.length - 14} more
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md hidden md:flex hover:bg-background border border-border/50 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => scrollDays('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Meal Plan Content */}
          <div id="printable-meal-plan" className="grid lg:grid-cols-3 gap-6 mb-10 p-2 lg:p-4 bg-background">
            <div className="lg:col-span-2">
              {currentDayPlan && !currentDayPlan.is_unlocked ? (
                /* Unlock Button Card */
                <Card variant="luxury" data-aos="fade-up" data-aos-delay="300">
                  <CardContent className="p-6 md:p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                      {canUnlockDay(currentDayPlan, selectedDay) ? (
                        <Unlock className="h-10 w-10 text-gold" />
                      ) : (
                        <Lock className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-3">
                      Day {currentDayPlan.day_number} Meal Plan
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {canUnlockDay(currentDayPlan, selectedDay)
                        ? "Click below to get your personalized meal plan for today. Your plan will be generated based on your profile and goals."
                        : `This day's plan will be available on ${new Date(currentDayPlan.plan_date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}.`}
                    </p>
                    {canUnlockDay(currentDayPlan, selectedDay) && (
                      <Button
                        variant="luxury"
                        size="lg"
                        onClick={unlockTodaysPlan}
                        disabled={isGenerating}
                        className="text-lg px-8 py-6"
                      >
                        {isGenerating ? (
                          <>
                            <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                            Generating Your Plan...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Get Your Diet Plan for Today
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : currentDayPlan?.meal_plan ? (
                /* Meal Plan Display */
                /* Meal Plan Display */
                <Card variant="luxury" data-aos="fade-up" data-aos-delay="300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {/* @ts-ignore */}
                      {currentDayPlan.meal_plan.day_title ? (
                        <>
                          {/* @ts-ignore */}
                          <Crown className="h-6 w-6 text-gold" />
                          {/* @ts-ignore */}
                          <span className="text-xl">{currentDayPlan.meal_plan.day_title}</span>
                        </>
                      ) : (
                        <>
                          <Utensils className="h-5 w-5 text-gold" />
                          Day {currentDayPlan.day_number} Meal Plan
                        </>
                      )}
                    </CardTitle>
                    {/* @ts-ignore */}
                    {currentDayPlan.meal_plan.daily_objectives && (
                      <div className="mt-4 p-4 rounded-xl bg-gold/5 border border-gold/10">
                        <h4 className="text-sm font-semibold text-gold mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Day Objectives
                        </h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          {/* @ts-ignore */}
                          {currentDayPlan.meal_plan.daily_objectives.map((obj: any, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-gold">•</span> {typeof obj === 'object' ? JSON.stringify(obj) : obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Check if Standard or Ultimate Plan */}
                    {/* @ts-ignore */}
                    {currentDayPlan.meal_plan.timeline ? (
                      // --- ULTIMATE TIMELINE VIEW ---
                      // @ts-ignore
                      currentDayPlan.meal_plan.timeline.map((item: any, index: number) => (
                        <div key={index} className="flex gap-4 group">
                          {/* Time Column */}
                          <div className="flex flex-col items-center">
                            <div className="w-16 py-1 bg-gold/10 rounded-md text-xs font-bold text-center text-gold border border-gold/20">
                              {item.time}
                            </div>
                            {/* Vertical Line */}
                            {/* @ts-ignore */}
                            {index < currentDayPlan.meal_plan.timeline.length - 1 && (
                              <div className="w-0.5 flex-1 bg-border my-2 group-hover:bg-gold/30 transition-colors" />
                            )}
                          </div>

                          {/* Content Card */}
                          <div className="flex-1 pb-3 md:pb-4">
                            <div className={`p-2.5 md:p-3 rounded-xl border transition-all hover:bg-secondary/40 
                                         ${item.type === 'ritual' ? 'bg-blue-500/5 border-blue-500/10' : 'bg-secondary/20 border-border'}`}>

                              <div className="flex justify-between items-start mb-1 md:mb-2">
                                <h4 className="font-bold text-base md:text-lg flex items-center gap-2">
                                  {item.type === 'ritual' && <Sun className="w-4 h-4 text-blue-400" />}
                                  {item.title}
                                </h4>
                                {item.calories && <span className="text-[10px] md:text-xs font-bold text-gold px-1.5 md:px-2 py-0.5 md:py-1 bg-gold/10 rounded-full shrink-0">{item.calories} kcal</span>}
                              </div>

                              {item.name && <p className="text-primary font-medium mb-1">{item.name}</p>}

                              {/* MEAL OPTIONS LOGIC */}
                              {item.option_1 && item.option_2 ? (
                                <div className="mt-3 space-y-4">
                                  {/* Option 1 */}
                                  <div className="p-3 bg-background/40 rounded-lg border border-border/50">
                                    <div className="flex justify-between items-start mb-2">
                                      <p className="font-bold text-gold text-sm">Option 1: {item.option_1.name}</p>
                                      <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">{item.option_1.calories} kcal</span>
                                    </div>
                                    <div className="flex gap-2 text-[10px] text-muted-foreground mb-2">
                                      <span>Protein: <span className="text-foreground">{item.option_1.protein}g</span></span>
                                      <span>Carbs: <span className="text-foreground">{item.option_1.carbs}g</span></span>
                                      <span>Fat: <span className="text-foreground">{item.option_1.fat}g</span></span>
                                    </div>
                                    <div className="mb-2">
                                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1 block">Ingredients</span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {item.option_1.ingredients?.map((ing: any, i: number) => (
                                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border">
                                            {typeof ing === 'object' ? `${ing.quantity || ''} ${ing.item || ing.name || ''}`.trim() : ing}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="mb-2">
                                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1 block">Benefits</span>
                                      {item.option_1.benefits?.includes("1.") ? (
                                        <ul className="list-none space-y-1">
                                          {item.option_1.benefits.split(/\d+\.\s+/).filter(b => b.trim()).map((b, i) => (
                                            <li key={i} className="text-xs text-muted-foreground flex gap-2">
                                              <span className="text-gold font-bold text-[10px] mt-0.5">{i + 1}.</span>
                                              <span>{b.trim()}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-xs text-muted-foreground italic mb-2">{item.option_1.benefits}</p>
                                      )}
                                    </div>
                                    <div className="mt-2">
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Prep:</span>
                                      <ol className="list-decimal list-inside text-xs text-muted-foreground mt-1">
                                        {item.option_1.preparation_steps?.map((step: string, i: number) => (
                                          <li key={i}>{step}</li>
                                        ))}
                                      </ol>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <div className="h-px bg-border flex-1"></div>
                                    <span className="text-xs text-muted-foreground font-semibold">OR</span>
                                    <div className="h-px bg-border flex-1"></div>
                                  </div>

                                  {/* Option 2 */}
                                  <div className="p-3 bg-background/40 rounded-lg border border-border/50">
                                    <div className="flex justify-between items-start mb-2">
                                      <p className="font-bold text-gold text-sm">Option 2: {item.option_2.name}</p>
                                      <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">{item.option_2.calories} kcal</span>
                                    </div>
                                    <div className="flex gap-2 text-[10px] text-muted-foreground mb-2">
                                      <span>Protein: <span className="text-foreground">{item.option_2.protein}g</span></span>
                                      <span>Carbs: <span className="text-foreground">{item.option_2.carbs}g</span></span>
                                      <span>Fat: <span className="text-foreground">{item.option_2.fat}g</span></span>
                                    </div>
                                    <div className="mb-2">
                                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1 block">Ingredients</span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {item.option_2.ingredients?.map((ing: any, i: number) => (
                                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border">
                                            {typeof ing === 'object' ? `${ing.quantity || ''} ${ing.item || ing.name || ''}`.trim() : ing}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="mb-2">
                                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1 block">Benefits</span>
                                      {item.option_2.benefits?.includes("1.") ? (
                                        <ul className="list-none space-y-1">
                                          {item.option_2.benefits.split(/\d+\.\s+/).filter(b => b.trim()).map((b, i) => (
                                            <li key={i} className="text-xs text-muted-foreground flex gap-2">
                                              <span className="text-gold font-bold text-[10px] mt-0.5">{i + 1}.</span>
                                              <span>{b.trim()}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-xs text-muted-foreground italic mb-2">{item.option_2.benefits}</p>
                                      )}
                                    </div>
                                    <div className="mt-2">
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Prep:</span>
                                      <ol className="list-decimal list-inside text-xs text-muted-foreground mt-1">
                                        {item.option_2.preparation_steps?.map((step: string, i: number) => (
                                          <li key={i}>{step}</li>
                                        ))}
                                      </ol>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // FALLBACK / STANDARD ULTIMATE ITEM (No Options)
                                <>
                                  {/* Macros Display */}
                                  {(item.protein || item.carbs || item.fat) && (
                                    <div className="flex gap-3 text-xs text-muted-foreground mb-3 bg-secondary/30 p-1.5 rounded-lg inline-flex">
                                      {item.protein && <span>Protein: <span className="text-foreground font-medium">{item.protein}g</span></span>}
                                      {item.carbs && <span>Carbs: <span className="text-foreground font-medium">{item.carbs}g</span></span>}
                                      {item.fat && <span>Fat: <span className="text-foreground font-medium">{item.fat}g</span></span>}
                                    </div>
                                  )}

                                  {/* Ingredients/Items */}
                                  {item.items && (
                                    <ul className="mb-3 space-y-1">
                                      {item.items.map((sub: any, i: number) => (
                                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                          <span className="mt-1.5 w-1 h-1 rounded-full bg-gold shrink-0"></span>
                                          <span>
                                            <strong className="text-foreground">{sub.name}</strong>
                                            {sub.instruction && ` - ${sub.instruction}`}
                                            {sub.benefit && <span className="block text-xs text-green-500/80 italic">Benefit: {sub.benefit}</span>}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}

                                  {/* Ingredients List */}
                                  {item.ingredients && (
                                    <div className="mb-2">
                                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ingredients</span>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {item.ingredients.map((ing: any, i: number) => (
                                          <span key={i} className="text-xs px-2 py-1 rounded bg-background border">
                                            {typeof ing === 'object' ? `${ing.quantity || ''} ${ing.item || ing.name || ''}`.trim() : ing}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {item.preparation_steps && (
                                    <div className="mt-3 p-3 bg-background/50 rounded-lg">
                                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Preparation</span>
                                      <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                        {item.preparation_steps.map((step: string, i: number) => (
                                          <li key={i}>{step}</li>
                                        ))}
                                      </ol>
                                    </div>
                                  )}

                                  {item.benefits && (
                                    <p className="mt-3 text-xs text-gold/80 flex gap-1">
                                      <Sparkles className="w-3 h-3" />
                                      <span className="italic">{item.benefits}</span>
                                    </p>
                                  )}
                                </>
                              )}

                              {/* Suggestions Logic (Applies to both) */}
                              {item.suggestions && (
                                <div className="mt-3 pt-3 border-t border-dashed border-border">
                                  <p className="text-xs text-blue-400 flex items-start gap-1">
                                    <Sparkles className="w-3 h-3 mt-0.5" />
                                    <span className="font-semibold">Chef's Tip:</span> {item.suggestions}
                                  </p>
                                </div>
                              )}

                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      // --- STANDARD GRID VIEW ---
                      currentDayPlan.meal_plan.meals.map((meal, index) => {
                        const MealIcon = getMealIcon(meal.type);
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                              <MealIcon className="h-5 w-5 text-gold" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-muted-foregroundcapitalize">{meal.type}</p>
                                  <span className="text-xs text-gold flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {meal.time}
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full">{meal.calories} kcal</span>
                              </div>

                              <p className="font-semibold mb-1">{meal.name}</p>

                              {/* Macros for Standard Plan */}
                              {(meal.protein || meal.carbs || meal.fat) && (
                                <div className="flex gap-3 text-[10px] text-muted-foreground mb-2">
                                  {meal.protein && <span>Protein: <span className="font-medium text-foreground">{meal.protein}g</span></span>}
                                  {meal.carbs && <span>Carbs: <span className="font-medium text-foreground">{meal.carbs}g</span></span>}
                                  {meal.fat && <span>Fat: <span className="font-medium text-foreground">{meal.fat}g</span></span>}
                                </div>
                              )}

                              {/* Standard Plan Ingredients Display */}
                              {meal.ingredients && meal.ingredients.length > 0 && (
                                <div className="mt-2 mb-2">
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1 block">Ingredients</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {meal.ingredients.map((ing: any, i: number) => (
                                      <span key={i} className="text-xs px-2 py-0.5 rounded bg-background border border-border text-foreground/80">
                                        {typeof ing === 'object' ? `${ing.quantity || ''} ${ing.item || ing.name || ''}`.trim() : ing}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {meal.tips && (
                                <p className="text-xs text-gold/80 mt-2 italic flex items-start gap-1">
                                  <span>💡</span>
                                  <span>{meal.tips}</span>
                                </p>
                              )}
                            </div>
                            {/* Removed redundant right-side macro summary to fix spacing issues */}
                          </div>
                        );
                      }))}
                  </CardContent>
                </Card>
              ) : (
                <Card variant="luxury" data-aos="fade-up" data-aos-delay="300">
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">No meal plan available</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Daily Summary */}
            <div className="space-y-6">
              <Card variant="luxury" data-aos="fade-up" data-aos-delay="400">
                <CardHeader>
                  <CardTitle>Daily Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentDayPlan?.meal_plan ? (
                    <>
                      {/* Calculate Actual Stats from the Plan Data */}
                      {(() => {
                        let actualIdx = { calories: 0, protein: 0, carbs: 0, fat: 0 };
                        // @ts-ignore
                        if (currentDayPlan.meal_plan.timeline) {
                          // Ultimate Plan Calculation
                          // @ts-ignore
                          currentDayPlan.meal_plan.timeline.forEach((item: any) => {
                            if (item.option_1 && item.option_2) {
                              // Average of options
                              actualIdx.calories += (item.option_1.calories + item.option_2.calories) / 2;
                              actualIdx.protein += (item.option_1.protein + item.option_2.protein) / 2;
                              actualIdx.carbs += (item.option_1.carbs + item.option_2.carbs) / 2;
                              actualIdx.fat += (item.option_1.fat + item.option_2.fat) / 2;
                            } else if (item.calories) {
                              // Single item
                              actualIdx.calories += parseFloat(item.calories);
                              actualIdx.protein += parseFloat(item.protein || 0);
                              actualIdx.carbs += parseFloat(item.carbs || 0);
                              actualIdx.fat += parseFloat(item.fat || 0);
                            }
                          });
                        } else if (currentDayPlan.meal_plan.meals) {
                          // Standard Plan Calculation
                          currentDayPlan.meal_plan.meals.forEach((m) => {
                            actualIdx.calories += m.calories;
                            actualIdx.protein += m.protein || 0;
                            actualIdx.carbs += m.carbs || 0;
                            actualIdx.fat += m.fat || 0;
                          });
                        }

                        // Fallback to target_stats if calc is zero (just in case)
                        // But prefer calc to show truth
                        const displayCalories = actualIdx.calories > 0 ? Math.round(actualIdx.calories) : parseInt((currentDayPlan.meal_plan as any).target_stats?.calories || '0');

                        return (
                          <>
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-muted-foreground">Calories (Actual / Target)</span>
                                <span className={`font-semibold ${displayCalories < targetCalories * 0.9 ? 'text-red-500' : 'text-green-600'}`}>
                                  {displayCalories} / {targetCalories}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-xl md:text-2xl font-bold text-gold">
                                  {Math.round(actualIdx.protein) || parseFloat((currentDayPlan.meal_plan as any).target_stats?.protein) || 0}g
                                </p>
                                <p className="text-xs text-muted-foreground">Protein</p>
                              </div>
                              <div>
                                <p className="text-xl md:text-2xl font-bold text-gold">
                                  {Math.round(actualIdx.carbs) || parseFloat((currentDayPlan.meal_plan as any).target_stats?.carbs) || 0}g
                                </p>
                                <p className="text-xs text-muted-foreground">Carbs</p>
                              </div>
                              <div>
                                <p className="text-xl md:text-2xl font-bold text-gold">
                                  {Math.round(actualIdx.fat) || parseFloat((currentDayPlan.meal_plan as any).target_stats?.fat) || 0}g
                                </p>
                                <p className="text-xs text-muted-foreground">Fat</p>
                              </div>
                            </div>
                          </>
                        );
                      })()}

                      {/* Summary Table for Ultimate Plans */}
                      {(currentDayPlan.meal_plan as any).summary_table && (
                        <div className="grid gap-3 pt-4 border-t border-border">
                          {Object.entries((currentDayPlan.meal_plan as any).summary_table).map(([key, value]) => {
                            if (key === 'calories') return null; // Already shown in progress bar
                            return (
                              <div key={key} className="flex justify-between items-center text-sm">
                                <span className="capitalize text-muted-foreground">{key}</span>
                                <span className="font-medium text-foreground">
                                  {typeof value === 'object' ? JSON.stringify(value) : (value as React.ReactNode)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {currentDayPlan.meal_plan.day_summary && (
                        <div className="p-4 rounded-xl bg-gold/5 border border-gold/10">
                          <h4 className="text-sm font-semibold text-gold mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Professional Summary
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {currentDayPlan.meal_plan.day_summary}
                          </p>
                        </div>
                      )}

                      {/* Do's and Don'ts Section */}
                      {/* @ts-ignore */}
                      {(currentDayPlan.meal_plan.daily_dos || currentDayPlan.meal_plan.daily_donts) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          {/* @ts-ignore */}
                          {currentDayPlan.meal_plan.daily_dos && (
                            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                              <h4 className="text-sm font-semibold text-green-500 mb-2 flex items-center gap-2">
                                ✅ Daily Do's
                              </h4>
                              <ul className="text-xs space-y-1 text-muted-foreground">
                                {/* @ts-ignore */}
                                {currentDayPlan.meal_plan.daily_dos.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2">• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {/* @ts-ignore */}
                          {currentDayPlan.meal_plan.daily_donts && (
                            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                              <h4 className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-2">
                                ❌ Daily Don'ts
                              </h4>
                              <ul className="text-xs space-y-1 text-muted-foreground">
                                {/* @ts-ignore */}
                                {currentDayPlan.meal_plan.daily_donts.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2">• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {currentDayPlan.meal_plan.water_intake && (
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                          <div className="flex items-center gap-2 text-blue-400">
                            <Droplets className="h-5 w-5" />
                            <span className="font-semibold">Water Intake</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {currentDayPlan.meal_plan.water_intake}
                          </p>
                        </div>
                      )}

                      {/* @ts-ignore */}
                      {currentDayPlan.meal_plan.special_notes && (
                        <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
                          <p className="text-sm text-foreground">
                            {/* @ts-ignore */}
                            📝 {currentDayPlan.meal_plan.special_notes}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Unlock today's plan to see your daily summary
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card variant="luxury" data-aos="fade-up" data-aos-delay="500" data-html2canvas-ignore="true">
                <CardContent className="p-6">
                  <Button variant="luxury" size="lg" className="w-full" disabled={!currentDayPlan?.meal_plan} onClick={downloadPlan}>
                    <Download className="mr-2 h-5 w-5" />
                    Download Plan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* DEBUG: Regenerate Button (Visible only if enabled in ENV or Config) */}
      {ENABLE_REGENERATE && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            variant="destructive"
            size="sm"
            onClick={startRegeneration}
            disabled={isGenerating}
            className="shadow-xl"
          >
            {isGenerating ? "Regenerating..." : "↻ Regenerate Plan (Debug)"}
          </Button>
        </div>
      )}

      {/* Daily Check-in Modal */}
      {showCheckinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" data-aos="fade-in">
          <Card className="w-full max-w-md bg-background border-gold/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sun className="h-5 w-5 text-gold" />
                Daily Check-in
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Help our system customize today's plan by updating your stats (Optional).
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium">Current Weight (kg)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-2 rounded-md border border-input bg-background"
                    placeholder={userData.weight}
                    value={checkinData.weight}
                    onChange={(e) => setCheckinData({ ...checkinData, weight: e.target.value })}
                  />
                  <span className="absolute right-3 top-2 text-muted-foreground text-sm">kg</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mood / Energy</label>
                <select
                  className="w-full p-2 rounded-md border border-input bg-background"
                  value={checkinData.mood}
                  onChange={(e) => setCheckinData({ ...checkinData, mood: e.target.value })}
                >
                  <option value="Good">Good / Energetic</option>
                  <option value="Tired">Tired / Low Energy</option>
                  <option value="Stressed">Stressed</option>
                  <option value="Sore">Sore from Workout</option>
                  <option value="Bloated">Bloated</option>
                  <option value="Hungry">Very Hungry</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Preferred Language</label>
                <div className="grid grid-cols-3 gap-2">
                  {['English', 'Hindi', 'Hinglish'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setCheckinData({ ...checkinData, language: lang })}
                      className={`p-2 text-xs rounded-md border-2 transition-all ${checkinData.language === lang
                        ? 'border-gold bg-gold/10 text-gold-dark font-bold'
                        : 'border-border hover:border-gold/30'
                        }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes for Specialist</label>
                <textarea
                  className="w-full p-2 rounded-md border border-input bg-background h-20 resize-none"
                  placeholder="E.g., I have a headache, or I'm craving sweets..."
                  value={checkinData.notes}
                  onChange={(e) => setCheckinData({ ...checkinData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => processUnlock(true)}
                >
                  Skip & Generate
                </Button>
                <Button
                  variant="luxury"
                  className="flex-1"
                  onClick={() => processUnlock(false)}
                >
                  Submit & Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
