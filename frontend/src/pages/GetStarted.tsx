import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AOS from "aos";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ArrowLeft, Check, CreditCard, Lock, QrCode, Smartphone, User, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api, ENABLE_DUMMY_DATA } from "@/lib/api";
import { useGoogleLogin } from "@react-oauth/google";
import { load } from "@cashfreepayments/cashfree-js";

type FormData = {
  // Basic Info
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  city: string;

  // Occupation & Lifestyle
  occupation: string;
  workingHours: string;
  maritalStatus: string;
  children: string;
  livingSituation: string;

  // Goals
  hormonalGoals: string[];
  primaryFitnessGoals: string[];
  targetTimeline: string;
  expectedWeight: string;
  motivationLevel: string;

  // Medical Conditions
  lifestyleMetabolic: string[];
  digestiveHealth: string[];
  hormonalMaleSpecific: string[];
  hormonalFemaleSpecific: string[];
  otherConditions: string[];

  // Female Specific
  menstrualRegularity: string;
  averageCycleLength: string;
  periodDuration: string;
  menstrualFlow: string;
  periodSymptoms: string[];
  pcos: string;
  pregnancyStatus: string;

  // Supplements & History
  currentSupplements: string[];
  pastSurgeries: string;
  digestiveHealthOverall: string;

  // Lifestyle Habits
  alcoholConsumption: string;
  smokingHabit: string;

  // Daily Routine
  wakeUpTime: string;
  sleepTime: string;
  sleepDuration: string;
  sleepQuality: string;
  dailyMovementLevel: string;
  stressLevel: string;
  waterIntake: string;

  // Physical Activity
  currentlyExercise: string;
  exerciseTypes: string[];
  exerciseFrequency: string;

  // Food Preferences
  dietType: string;
  foodsDislike: string;
  foodAllergies: string[];
  foodAllergiesOther: string;
  teaCoffeeIntake: string;
  outsideFood: string;
  spiceTolerance: string;

  // Meal Timings
  breakfastTime: string;
  midMorningSnackTime: string;
  lunchTime: string;
  eveningSnackTime: string;
  dinnerTime: string;
  lateNightEating: string;

  // Household Setup
  whoCooksMeals: string;
  kitchenAppliances: string[];
  budgetForFood: string;

  // Special Instructions
  specialInstructions: string;
};

type User = {
  id?: string;
  userId?: string;
  phone?: string;
  name?: string;
  email?: string;
  google_id?: string;
  picture?: string;
};

const initialFormData: FormData = {
  // Basic Info
  name: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
  height: "",
  weight: "",
  city: "",

  // Occupation & Lifestyle
  occupation: "",
  workingHours: "",
  maritalStatus: "",
  children: "",
  livingSituation: "",

  // Goals
  hormonalGoals: [],
  primaryFitnessGoals: [],
  targetTimeline: "",
  expectedWeight: "",
  motivationLevel: "",

  // Medical Conditions
  lifestyleMetabolic: [],
  digestiveHealth: [],
  hormonalMaleSpecific: [],
  hormonalFemaleSpecific: [],
  otherConditions: [],

  // Female Specific
  menstrualRegularity: "",
  averageCycleLength: "",
  periodDuration: "",
  menstrualFlow: "",
  periodSymptoms: [],
  pcos: "",
  pregnancyStatus: "",

  // Supplements & History
  currentSupplements: [],
  pastSurgeries: "",
  digestiveHealthOverall: "",

  // Lifestyle Habits
  alcoholConsumption: "",
  smokingHabit: "",

  // Daily Routine
  wakeUpTime: "",
  sleepTime: "",
  sleepDuration: "",
  sleepQuality: "",
  dailyMovementLevel: "",
  stressLevel: "",
  waterIntake: "",

  // Physical Activity
  currentlyExercise: "",
  exerciseTypes: [],
  exerciseFrequency: "",

  // Food Preferences
  dietType: "",
  foodsDislike: "",
  foodAllergies: [],
  foodAllergiesOther: "",
  teaCoffeeIntake: "",
  outsideFood: "",
  spiceTolerance: "",

  // Meal Timings
  breakfastTime: "",
  midMorningSnackTime: "",
  lunchTime: "",
  eveningSnackTime: "",
  dinnerTime: "",
  lateNightEating: "",

  // Household Setup
  whoCooksMeals: "",
  kitchenAppliances: [],
  budgetForFood: "",

  // Special Instructions
  specialInstructions: "",
};

interface Plan {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  days: number;
  features: string[];
  planKey: string;
}

const plans: Record<string, Plan> = {
  starter: {
    name: "30-Day Custom",
    description: "Personalized Indian meal plan & lifestyle guide.",
    price: (window as any).APP_CONFIG?.priceStarter || parseInt(import.meta.env.VITE_PRICE_STARTER) || 499,
    originalPrice: (window as any).APP_CONFIG?.originalPriceStarter || 1499,
    days: 30,
    features: ["Custom Indian Meals", "Calorie Tracking", "Basic Support", "PDF Download"],
    planKey: "starter"
  },
  premium: {
    name: "7-Day Ultimate",
    description: "Intensive 7-day expert plan for rapid results.",
    price: (window as any).APP_CONFIG?.pricePremium || parseInt(import.meta.env.VITE_PRICE_PREMIUM) || 799,
    originalPrice: (window as any).APP_CONFIG?.originalPricePremium || 1899,
    days: 7,
    features: ["Advanced Protocols", "Daily Timeline", "24/7 Priority Support", "Grocery Lists"],
    planKey: "premium"
  },
  elite: {
    name: "30-Day Ultimate",
    description: "Comprehensive 30-day health transformation.",
    price: (window as any).APP_CONFIG?.priceElite || parseInt(import.meta.env.VITE_PRICE_ELITE) || 2499,
    originalPrice: (window as any).APP_CONFIG?.originalPriceElite || 5999,
    days: 30,
    features: ["Full Transformation Guide", "Everything in Premium", "Personal Consultation", "Monthly Updates"],
    planKey: "elite"
  },
};

const GetStarted = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedGender, setSelectedGender] = useState<"men" | "women" | "">("");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get("plan") || "starter");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cashfree">("cashfree");

  // Auth states
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });

    // Check for existing session
    const checkSession = () => {
      const storedUser = localStorage.getItem("luxediet_auth_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setCurrentUser(user);
        setAuthEmail(user.email || "");

        // Check if user has completed profile and paid
        const userData = localStorage.getItem("luxediet_user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.hasPaid && parsedUser.subscriptionId) {
            navigate("/dashboard");
            return;
          }
        }
      }
    };
    checkSession();
  }, [navigate]);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoResponse.json();

        const data = await api.auth.googleLoginManual({
          email: userInfo.email,
          name: userInfo.name,
          google_id: userInfo.sub,
          picture: userInfo.picture
        });

        if (data.user) {
          setIsLoggedIn(true);
          setCurrentUser(data.user);
          localStorage.setItem("luxediet_auth_user", JSON.stringify(data.user));
          toast.success("Successfully logged in with Google!");
        }
      } catch (error: unknown) {
        console.error(error);
        toast.error("Google login failed");
      }
    },
    onError: () => toast.error("Google Login Failed"),
  });

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleNext = () => {
    const maxStep = 6;
    if (step >= maxStep) return;

    // Basic validation for step 2 (Personal)
    if (step === 2 && (!formData.name || !formData.age || !formData.height || !formData.weight)) {
      toast.error("Please fill in basic personal information");
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSignUp = async () => {
    if (!authEmail || !authPassword) {
      toast.error("Please enter email and password");
      return;
    }

    if (authPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsAuthLoading(true);
    try {
      const data = await api.auth.signup(authEmail, authPassword, formData.name);

      if (data.user) {
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        localStorage.setItem("luxediet_auth_user", JSON.stringify(data.user));
        toast.success("Account created successfully!");
      }
    } catch (error: unknown) {
      console.error("Signup error:", error);
      const errorMessage = (error as Error)?.message || "Failed to create account";
      if (errorMessage.includes("already registered")) {
        toast.error("Email already registered. Please login instead.");
        setAuthMode("login");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!authEmail || !authPassword) {
      toast.error("Please enter email and password");
      return;
    }

    setIsAuthLoading(true);
    try {
      const data = await api.auth.login(authEmail, authPassword);

      if (data.user) {
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        localStorage.setItem("luxediet_auth_user", JSON.stringify(data.user));
        toast.success("Logged in successfully!");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      toast.error((error as Error)?.message || "Failed to login");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("luxediet_auth_user");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setAuthPassword("");
    toast.success("Logged out successfully");
  };

  const saveUserToDatabase = async () => {
    const currentPlan = plans[selectedPlan as keyof typeof plans] || plans["starter"];

    try {
      // Create profile in database with user_id if logged in
      const profile = await api.profiles.create({
        name: formData.name,
        email: formData.email,
        user_id: currentUser?.id || null, // Ensure ID is passed
        age: parseInt(formData.age),
        gender: selectedGender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        goal: formData.primaryFitnessGoals.join(", "),
        activity_level: formData.dailyMovementLevel,
        dietary_restrictions: [...formData.lifestyleMetabolic, ...formData.digestiveHealth, ...formData.hormonalMaleSpecific, ...formData.hormonalFemaleSpecific, ...formData.otherConditions],
        allergies: [...formData.foodAllergies, formData.foodAllergiesOther].filter(Boolean).join(", "),
        meal_preference: `${formData.dietType}, ${formData.foodsDislike}`,
        extended_data: formData,
      });

      // Create subscription
      const planDays = currentPlan.days;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + planDays);

      const subscription = await api.subscriptions.create({
        profile_id: profile.id,
        plan_type: currentPlan.planKey,
        plan_days: planDays,
        end_date: endDate.toISOString().split("T")[0],
        amount: currentPlan.price,
        payment_method: paymentMethod,
        payment_status: "pending",
      });

      // Create day plan entries
      const dayPlanEntries = [];
      for (let i = 1; i <= planDays; i++) {
        const planDate = new Date();
        planDate.setDate(planDate.getDate() + i - 1);
        dayPlanEntries.push({
          subscription_id: subscription.id,
          day_number: i,
          plan_date: planDate.toISOString().split("T")[0],
          is_unlocked: false,
          user_name: currentUser?.name || formData.name,
        });
      }

      await api.dietPlans.createBatch(dayPlanEntries);

      return { profile, subscription };
    } catch (error) {
      console.error("Error saving user data:", error);
      throw error;
    }
  };

  const handleCashfreePayment = async () => {
    const currentPlan = plans[selectedPlan as keyof typeof plans] || plans["starter"];

    if (!isLoggedIn) {
      toast.error("Please login or create an account first");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Save user data to DB
      const { profile, subscription } = await saveUserToDatabase();

      // 2. Store pending data
      localStorage.setItem("luxediet_pending_payment", JSON.stringify({
        formData,
        selectedPlan,
        currentUser: currentUser || null,
        profileId: profile.id,
        subscriptionId: subscription.id
      }));

      // 3. Create Order
      const amount = currentPlan.price;
      const orderData = await api.payment.createOrder(amount, {
        ...(currentUser || {}),
        phone: formData.phone // Pass phone collected in form
      });

      // 4. Initialize Cashfree SDK
      const now = new Date().toLocaleTimeString();
      console.log(`[${now}] Initializing Cashfree in PRODUCTION mode`);
      toast.info("Opening Secure Payment Gateway...");

      const cashfree = await load({
        mode: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "sandbox" : "production"
      });

      // 5. Open Checkout
      console.log(`[${now}] Order Created:`, orderData);
      console.log(`[${now}] Session ID:`, orderData.payment_session_id);

      if (orderData.payment_session_id) {
        console.log(`[${now}] Redirecting to Cashfree Checkout (Production)...`);
        cashfree.checkout({
          paymentSessionId: orderData.payment_session_id,
          redirectTarget: "_self" // Or simple handling
        });
      } else {
        toast.error("Failed to initiate payment");
        setIsProcessing(false);
      }

    } catch (error: unknown) {
      console.error("Error during registration:", error);
      toast.error((error as Error)?.message || "Registration failed. Please try again.");
      setIsProcessing(false);
    }
  };


  const populateDummyData = (gender: "men" | "women") => {
    setSelectedGender(gender);
    const baseData = {
      name: gender === "men" ? "Rahul Sharma" : "Priya Patel",
      email: "", // User usually fills email or gets from login, keeping empty for flow or could fill dummy
      phone: "9876543210",
      age: "29",
      gender: gender,
      height: gender === "men" ? "178" : "165",
      weight: gender === "men" ? "78" : "62",
      city: "Mumbai",
      occupation: "Software Engineer",
      workingHours: "9 AM - 6 PM",
      maritalStatus: "Single",
      children: "None",
      livingSituation: "With Family",
      targetTimeline: "90 days (3 months)",
      expectedWeight: gender === "men" ? "72" : "57",
      motivationLevel: "8",
      alcoholConsumption: "Occasionally",
      smokingHabit: "No",
      wakeUpTime: "07:00",
      sleepTime: "23:00",
      sleepDuration: "8",
      sleepQuality: "Good",
      dailyMovementLevel: "Moderate",
      stressLevel: "Moderate",
      waterIntake: "2–3 litres",
      currentlyExercise: "Yes",
      exerciseFrequency: "3 days",
      dietType: "Non-Vegetarian",
      foodsDislike: "Bitter Gourd",
      foodAllergiesOther: "None",
      teaCoffeeIntake: "2 cups/day",
      outsideFood: "1–2 times/week",
      spiceTolerance: "Medium",
      breakfastTime: "08:30",
      midMorningSnackTime: "11:00",
      lunchTime: "13:30",
      eveningSnackTime: "17:00",
      dinnerTime: "20:30",
      lateNightEating: "No",
      whoCooksMeals: "Mother / Family member",
      budgetForFood: "Comfortable",
      specialInstructions: "Looking for a balanced diet plan.",
      // Arrays
      hormonalGoals: gender === "men" ? ["Reduce acidity / bloating"] : ["Hormonal balance", "Improve skin & hair health"],
      primaryFitnessGoals: ["Weight Loss", "Increase Energy"],
      lifestyleMetabolic: ["None"],
      digestiveHealth: ["None"],
      hormonalMaleSpecific: gender === "men" ? ["None"] : [],
      hormonalFemaleSpecific: gender === "men" ? [] : ["None"],
      otherConditions: ["None"],
      currentSupplements: ["Multivitamin"],
      menstrualRegularity: gender === "women" ? "Regular" : "",
      averageCycleLength: gender === "women" ? "25–28 days" : "",
      periodDuration: gender === "women" ? "4–5 days" : "",
      menstrualFlow: gender === "women" ? "Moderate" : "",
      periodSymptoms: gender === "women" ? ["Mild cramps"] : [],
      pcos: gender === "women" ? "No" : "",
      pregnancyStatus: gender === "women" ? "Not pregnant" : "",
      pastSurgeries: "None",
      digestiveHealthOverall: "Good",
      exerciseTypes: gender === "men" ? ["Gym", "Cardio"] : ["Yoga", "Cardio"],
      foodAllergies: [],
      kitchenAppliances: ["Gas stove", "Microwave", "Mixer / Blender"],
    };

    setFormData((prev) => ({ ...prev, ...baseData }));
    toast.success(`Dummy data filled for ${gender === "men" ? "Male" : "Female"}`);
  };

  const currentPlan = plans[selectedPlan as keyof typeof plans] || plans["starter"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          {/* Progress Steps */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 text-xs md:text-base ${step >= s
                      ? "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                      }`}
                  >
                    {step > s ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : s}
                  </div>
                  {s < 6 && (
                    <div
                      className={`w-4 md:w-12 lg:w-20 h-1 mx-1 rounded transition-all duration-300 ${step > s ? "bg-gold" : "bg-secondary"
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] md:text-sm text-muted-foreground">
              <span>Gender</span>
              <span>Personal</span>
              <span>Goals</span>
              <span>Medical</span>
              <span>Lifestyle</span>
              <span>Account</span>
            </div>
          </div>

          {/* Form Steps */}
          <Card variant="luxury" className="max-w-4xl mx-auto" data-aos="fade-up">
            {/* Step 1: Gender Selection */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Select Your Gender</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 justify-center py-8">
                    {/* Men Option */}
                    <div
                      className={`flex-1 p-10 rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center gap-6 group relative overflow-hidden
                        ${selectedGender === 'men'
                          ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-500/10'
                          : 'border-border hover:border-blue-300 hover:bg-blue-50/20'}`}
                      onClick={() => setSelectedGender("men")}
                    >
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-300
                          ${selectedGender === 'men' ? 'bg-blue-100 text-blue-600' : 'bg-secondary text-muted-foreground group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
                        <User className="w-12 h-12" />
                      </div>
                      <span className={`text-xl font-bold transition-colors ${selectedGender === 'men' ? 'text-blue-700' : 'text-foreground'}`}>
                        Men
                      </span>
                      {selectedGender === 'men' && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Women Option */}
                    <div
                      className={`flex-1 p-10 rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center gap-6 group relative overflow-hidden
                        ${selectedGender === 'women'
                          ? 'border-pink-500 bg-pink-50/50 shadow-lg shadow-pink-500/10'
                          : 'border-border hover:border-pink-300 hover:bg-pink-50/20'}`}
                      onClick={() => setSelectedGender("women")}
                    >
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-300
                          ${selectedGender === 'women' ? 'bg-pink-100 text-pink-600' : 'bg-secondary text-muted-foreground group-hover:bg-pink-100 group-hover:text-pink-500'}`}>
                        <User className="w-12 h-12" />
                      </div>
                      <span className={`text-xl font-bold transition-colors ${selectedGender === 'women' ? 'text-pink-700' : 'text-foreground'}`}>
                        Women
                      </span>
                      {selectedGender === 'women' && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dummy Data Buttons (For Testing) */}
                  {/* Dummy Data Buttons (For Testing) - Always Enabled */}
                  {ENABLE_DUMMY_DATA && (
                    <div className="flex justify-center gap-4 py-2 opacity-80 hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={(e) => { e.stopPropagation(); populateDummyData("men"); }}
                      >
                        Test: Fill Male Data
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-pink-600 border-pink-200 hover:bg-pink-50"
                        onClick={(e) => { e.stopPropagation(); populateDummyData("women"); }}
                      >
                        Test: Fill Female Data
                      </Button>
                    </div>
                  )}

                  <Button
                    variant="luxury"
                    size="lg"
                    className="w-full"
                    onClick={handleNext}
                    disabled={!selectedGender}
                  >
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </>
            )}

            {/* Step 2: Personal Information */}
            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Enter your age"
                        value={formData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (feet) *</Label>
                      <Input
                        id="height"
                        placeholder="e.g., 5.8"
                        value={formData.height}
                        onChange={(e) => handleInputChange("height", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg) *</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="e.g., 70"
                        value={formData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Enter your city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  </div>


                  <div className="space-y-2">
                    <Label>Occupation</Label>
                    <RadioGroup
                      value={formData.occupation}
                      onValueChange={(value) => handleInputChange("occupation", value)}
                      className="grid grid-cols-1 md:grid-cols-2 gap-2"
                    >
                      {(selectedGender === "women"
                        ? ["Student", "Desk Job", "Business", "Field / Outdoor Job", "Physical Job", "Night-Shift Job", "Homemaker", "None"]
                        : ["Student", "Desk Job", "Business", "Field / Outdoor Job", "Physical Job", "Night-Shift Job", "None"]
                      ).map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={option} />
                          <Label htmlFor={option}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workingHours">Working Hours (per day)</Label>
                    <Input
                      id="workingHours"
                      type="number"
                      placeholder="e.g. 8"
                      value={formData.workingHours}
                      onChange={(e) => handleInputChange("workingHours", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Marital Status</Label>
                      <RadioGroup
                        value={formData.maritalStatus}
                        onValueChange={(value) => handleInputChange("maritalStatus", value)}
                        className="grid gap-2"
                      >
                        {["Single", "Married", "Recently Married", selectedGender === "women" ? "Divorced / Separated" : "Planning", selectedGender === "women" ? "Planning marriage" : ""].filter(Boolean).map(opt => (
                          <div key={opt} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt} id={opt} />
                            <Label htmlFor={opt}>{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label>Children</Label>
                      <RadioGroup
                        value={formData.children}
                        onValueChange={(value) => handleInputChange("children", value)}
                        className="grid gap-2"
                      >
                        {["No children", "1 child", "2 children", "3+ children", selectedGender === "women" ? "Planning pregnancy" : "Planning"].map(opt => (
                          <div key={opt} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt} id={opt} />
                            <Label htmlFor={opt}>{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Living Situation</Label>
                    <RadioGroup
                      value={formData.livingSituation}
                      onValueChange={(value) => handleInputChange("livingSituation", value)}
                      className="grid grid-cols-1 md:grid-cols-2 gap-2"
                    >
                      {["With family", "With partner", "Living alone", "With roommates", "Hostel / PG"].map(opt => (
                        <div key={opt} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt} id={opt} />
                          <Label htmlFor={opt}>{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" size="lg" className="flex-1" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-5 w-5" /> Back
                    </Button>
                    <Button variant="luxury" size="lg" className="w-full" onClick={handleNext}>
                      Continue <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 2: Health Goals & Medical Conditions */}
            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Goals & Target</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Hormonal Goals */}
                  <div className="space-y-2">
                    <Label>{selectedGender === "men" ? "Hormonal Goals" : "Female Health Goals"} (Select all that apply)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(selectedGender === "men"
                        ? ["Thyroid management", "Diabetes / Prediabetes control", "Cholesterol management", "BP control", "Fatty liver improvement", "Reduce acidity / bloating", "Improve gut health", "Hormone balance", "Testosterone support", "Correct Vitamin D", "B12 deficiency", "None"]
                        : ["Hormonal balance", "Regular menstrual cycle", "Reduce PMS symptoms", "PCOS / PCOD management", "Thyroid management", "Diabetes / Prediabetes control", "Cholesterol management", "BP control", "Fatty liver improvement", "Reduce bloating / acidity", "Improve gut health", "Improve fertility", "Pregnancy nutrition support", "Post-pregnancy recovery", "Lactation support", "Improve skin & hair health", "Correct Vitamin D deficiency", "Correct Vitamin B12 deficiency", "Iron deficiency correction", "None"]
                      ).map((goal) => (
                        <div key={goal} className="flex items-center space-x-2">
                          <Checkbox
                            id={goal}
                            checked={formData.hormonalGoals.includes(goal)}
                            onCheckedChange={() => handleArrayToggle("hormonalGoals", goal)}
                          />
                          <Label htmlFor={goal}>{goal}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fitness Goals & Timeline */}
                  <div className="space-y-2">
                    <Label>Primary Fitness Goal (Select all that apply)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(selectedGender === "men"
                        ? ["Weight Loss", "Weight Gain", "Fat Loss", "Muscle Gain", "Lean Muscle Toning", "Strength Building", "Body Recomposition", "Increase Energy", "Improve Stamina"]
                        : ["Weight Loss", "Weight Gain", "Fat Loss", "Muscle Toning", "Lean Muscle Development", "Strength Building", "Body Recomposition", "Increase Energy", "Improve Stamina", "Improve Metabolism"]
                      ).map((goal) => (
                        <div key={goal} className="flex items-center space-x-2">
                          <Checkbox
                            id={goal}
                            checked={formData.primaryFitnessGoals.includes(goal)}
                            onCheckedChange={() => handleArrayToggle("primaryFitnessGoals", goal)}
                          />
                          <Label htmlFor={goal}>{goal}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Target Timeline</Label>
                      <RadioGroup
                        value={formData.targetTimeline}
                        onValueChange={(value) => handleInputChange("targetTimeline", value)}
                        className="grid gap-2"
                      >
                        {["30 days", "45 days", "60 days (2 months)", "90 days (3 months)", "No fixed timeline"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option} />
                            <Label htmlFor={option}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expectedWeight">Expected Weight (kg)</Label>
                      <Input
                        id="expectedWeight"
                        type="number"
                        placeholder="e.g., 65"
                        value={formData.expectedWeight}
                        onChange={(e) => handleInputChange("expectedWeight", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Motivation Level (1-10)</Label>
                      <RadioGroup
                        value={formData.motivationLevel}
                        onValueChange={(value) => handleInputChange("motivationLevel", value)}
                        className="grid grid-cols-5 gap-2"
                      >
                        {Array.from({ length: 10 }, (_, i) => (i + 1).toString()).map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <RadioGroupItem value={level} id={level} />
                            <Label htmlFor={level}>{level}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="luxuryOutline" size="lg" className="flex-1" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-5 w-5" /> Back
                    </Button>
                    <Button variant="luxury" size="lg" className="flex-1" onClick={handleNext}>
                      Continue <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 4: Medical & Habits */}
            {step === 4 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Medical & Habits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Menstrual Health for Women */}
                  {selectedGender === "women" && (
                    <>
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">Menstrual & Reproductive Health</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Menstrual Cycle Regularity</Label>
                              <RadioGroup
                                value={formData.menstrualRegularity}
                                onValueChange={(value) => handleInputChange("menstrualRegularity", value)}
                                className="grid gap-2"
                              >
                                {["Regular", "Irregular", "Very irregular", "Missed periods", "Not applicable (pregnant / menopause)"].map((option) => (
                                  <div key={option} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={option} />
                                    <Label htmlFor={option}>{option}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                            <div className="space-y-2">
                              <Label>Average Cycle Length</Label>
                              <RadioGroup
                                value={formData.averageCycleLength}
                                onValueChange={(value) => handleInputChange("averageCycleLength", value)}
                                className="grid gap-2"
                              >
                                {["21–24 days", "25–28 days", "29–32 days", "Varies every month", "Not sure"].map((option) => (
                                  <div key={option} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={option} />
                                    <Label htmlFor={option}>{option}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Period Duration</Label>
                              <RadioGroup
                                value={formData.periodDuration}
                                onValueChange={(value) => handleInputChange("periodDuration", value)}
                                className="grid gap-2"
                              >
                                {["2–3 days", "4–5 days", "6–7 days", "More than 7 days"].map((option) => (
                                  <div key={option} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={option} />
                                    <Label htmlFor={option}>{option}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                            <div className="space-y-2">
                              <Label>Menstrual Flow</Label>
                              <RadioGroup
                                value={formData.menstrualFlow}
                                onValueChange={(value) => handleInputChange("menstrualFlow", value)}
                                className="grid gap-2"
                              >
                                {["Light", "Moderate", "Heavy", "Very heavy"].map((option) => (
                                  <div key={option} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={option} />
                                    <Label htmlFor={option}>{option}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                            <div className="space-y-2">
                              <Label>PCOS / PCOD</Label>
                              <RadioGroup
                                value={formData.pcos}
                                onValueChange={(value) => handleInputChange("pcos", value)}
                                className="grid gap-2"
                              >
                                {["Diagnosed", "Suspected", "No"].map((option) => (
                                  <div key={option} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={option} />
                                    <Label htmlFor={option}>{option}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Period Symptoms (Select all that apply)</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {["Severe cramps", "Mild cramps", "Back pain", "Headaches / migraine", "Mood swings", "Fatigue", "Bloating", "Breast tenderness", "Acne breakouts", "None"].map((symptom) => (
                                <div key={symptom} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={symptom}
                                    checked={formData.periodSymptoms.includes(symptom)}
                                    onCheckedChange={() => handleArrayToggle("periodSymptoms", symptom)}
                                  />
                                  <Label htmlFor={symptom}>{symptom}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Pregnancy Status</Label>
                            <RadioGroup
                              value={formData.pregnancyStatus}
                              onValueChange={(value) => handleInputChange("pregnancyStatus", value)}
                              className="grid gap-2"
                            >
                              {["Not pregnant", "Pregnant", "Postpartum (within 1 year)", "Breastfeeding", "Menopause"].map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                  <RadioGroupItem value={option} id={option} />
                                  <Label htmlFor={option}>{option}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Medical Conditions */}
                  <div className="border-t pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Lifestyle & Metabolic (Select all that apply)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {["Obesity / Overweight", "Diabetes (Type 1 / Type 2)", "Prediabetes", "Insulin resistance", "High cholesterol", "High BP", "Fatty liver", "Anemia (low iron)", "None"].map((condition) => (
                          <div key={condition} className="flex items-center space-x-2">
                            <Checkbox
                              id={condition}
                              checked={formData.lifestyleMetabolic.includes(condition)}
                              onCheckedChange={() => handleArrayToggle("lifestyleMetabolic", condition)}
                            />
                            <Label htmlFor={condition}>{condition}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Digestive Health (Select all that apply)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {["Acidity / GERD", "Gas / Bloating", "IBS", "Constipation", "Diarrhea", "None"].map((condition) => (
                          <div key={condition} className="flex items-center space-x-2">
                            <Checkbox
                              id={condition}
                              checked={formData.digestiveHealth.includes(condition)}
                              onCheckedChange={() => handleArrayToggle("digestiveHealth", condition)}
                            />
                            <Label htmlFor={condition}>{condition}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{selectedGender === "men" ? "Hormonal & Male-Specific" : "Hormonal & Female-Specific"} (Select all that apply)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(selectedGender === "men"
                          ? ["Low testosterone", "Erectile dysfunction", "Low libido", "Thyroid issues (Hypo / Hyper)", "None"]
                          : ["Thyroid issues (Hypo / Hyper)", "PCOS / PCOD", "Hormonal imbalance", "Low energy / fatigue", "Hair fall", "Irregular periods", "None"]
                        ).map((condition) => (
                          <div key={condition} className="flex items-center space-x-2">
                            <Checkbox
                              id={condition}
                              checked={(selectedGender === "men" ? formData.hormonalMaleSpecific : formData.hormonalFemaleSpecific).includes(condition)}
                              onCheckedChange={() => handleArrayToggle(selectedGender === "men" ? "hormonalMaleSpecific" : "hormonalFemaleSpecific", condition)}
                            />
                            <Label htmlFor={condition}>{condition}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Other Conditions (Select all that apply)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {["Migraines", "Asthma", "Anxiety", "Stress", "Depression", "Joint pain", "Kidney issues", "None"].map((condition) => (
                          <div key={condition} className="flex items-center space-x-2">
                            <Checkbox
                              id={condition}
                              checked={formData.otherConditions.includes(condition)}
                              onCheckedChange={() => handleArrayToggle("otherConditions", condition)}
                            />
                            <Label htmlFor={condition}>{condition}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Supplements & History */}
                  <div className="border-t pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Current Supplements (Select all that apply)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(selectedGender === "men"
                          ? ["Multivitamin", "Omega-3", "Vitamin D", "Vitamin B12", "Protein powder", "Creatine", "Pre-workout", "Biotin", "Joint support", "None"]
                          : ["Multivitamin", "Omega-3", "Vitamin D", "Vitamin B12", "Iron supplement", "Calcium", "Protein powder", "Biotin", "Probiotics", "Prenatal vitamins", "None"]
                        ).map((supplement) => (
                          <div key={supplement} className="flex items-center space-x-2">
                            <Checkbox
                              id={supplement}
                              checked={formData.currentSupplements.includes(supplement)}
                              onCheckedChange={() => handleArrayToggle("currentSupplements", supplement)}
                            />
                            <Label htmlFor={supplement}>{supplement}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pastSurgeries">{selectedGender === "men" ? "Past Surgeries" : "Past Surgeries / Deliveries"}</Label>
                      <Textarea
                        id="pastSurgeries"
                        placeholder="Write details (max 600 characters)"
                        value={formData.pastSurgeries}
                        onChange={(e) => handleInputChange("pastSurgeries", e.target.value)}
                        className="min-h-[80px]"
                        maxLength={600}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Digestive Health (Overall)</Label>
                      <RadioGroup
                        value={formData.digestiveHealthOverall}
                        onValueChange={(value) => handleInputChange("digestiveHealthOverall", value)}
                        className="grid gap-2"
                      >
                        {["Very good", "Moderate", "Poor", "Changes frequently"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option} />
                            <Label htmlFor={option}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="luxuryOutline" size="lg" className="flex-1" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-5 w-5" /> Back
                    </Button>
                    <Button variant="luxury" size="lg" className="flex-1" onClick={handleNext}>
                      Continue <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 5: Lifestyle & Diet */}
            {step === 5 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Lifestyle & Diet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Lifestyle Habits */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Alcohol Consumption</Label>
                        <RadioGroup
                          value={formData.alcoholConsumption}
                          onValueChange={(value) => handleInputChange("alcoholConsumption", value)}
                          className="grid gap-2"
                        >
                          {["Never", "Occasionally", "Every weekend", "1–2 drinks/week", "3–4 drinks/week", "Daily drinking"].map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={option} />
                              <Label htmlFor={option}>{option}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label>Smoking Habit</Label>
                        <RadioGroup
                          value={formData.smokingHabit}
                          onValueChange={(value) => handleInputChange("smokingHabit", value)}
                          className="grid gap-2"
                        >
                          {["No", "Yes, occasionally", "Regular", "Heavy smoker", "Quit recently"].map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={option} />
                              <Label htmlFor={option}>{option}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  </div>

                  {/* Daily Routine */}
                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Daily Routine</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="wakeUpTime">Wake-Up Time</Label>
                        <Input
                          id="wakeUpTime"
                          type="time"
                          value={formData.wakeUpTime}
                          onChange={(e) => handleInputChange("wakeUpTime", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sleepTime">Sleep Time</Label>
                        <Input
                          id="sleepTime"
                          type="time"
                          value={formData.sleepTime}
                          onChange={(e) => handleInputChange("sleepTime", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sleepDuration">Sleep Duration (hours)</Label>
                        <Input
                          id="sleepDuration"
                          placeholder="e.g., 7"
                          value={formData.sleepDuration}
                          onChange={(e) => handleInputChange("sleepDuration", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sleep Quality</Label>
                        <RadioGroup
                          value={formData.sleepQuality}
                          onValueChange={(value) => handleInputChange("sleepQuality", value)}
                          className="grid gap-2"
                        >
                          {["Excellent", "Good", "Average", "Poor", "Very disturbed"].map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={option} />
                              <Label htmlFor={option}>{option}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label>Daily Movement Level</Label>
                        <RadioGroup
                          value={formData.dailyMovementLevel}
                          onValueChange={(value) => handleInputChange("dailyMovementLevel", value)}
                          className="grid gap-2"
                        >
                          {["Very low", "Low", "Moderate", "High", "Very high"].map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={option} />
                              <Label htmlFor={option}>{option}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Stress Level</Label>
                        <RadioGroup
                          value={formData.stressLevel}
                          onValueChange={(value) => handleInputChange("stressLevel", value)}
                          className="grid gap-2"
                        >
                          {["Very low", "Low", "Moderate", "High", "Very high"].map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={option} />
                              <Label htmlFor={option}>{option}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label>Water Intake</Label>
                        <RadioGroup
                          value={formData.waterIntake}
                          onValueChange={(value) => handleInputChange("waterIntake", value)}
                          className="grid gap-2"
                        >
                          {["Less than 1 litre", "1–1.5 litres", "1.5–2 litres", "2–3 litres", "More than 3 litres", "No idea"].map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={option} />
                              <Label htmlFor={option}>{option}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  </div>

                  {/* Physical Activity */}
                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Physical Activity</h3>
                    <div className="space-y-2">
                      <Label>Do You Currently Exercise?</Label>
                      <RadioGroup
                        value={formData.currentlyExercise}
                        onValueChange={(value) => handleInputChange("currentlyExercise", value)}
                        className="flex gap-4"
                      >
                        {["Yes", "No", "Sometimes"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option} />
                            <Label htmlFor={option}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label>Type of Exercise You Do (Select all that apply)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(selectedGender === "men"
                          ? ["Gym", "Home", "Bodyweight training", "Cardio", "Yoga", "None"]
                          : ["Gym", "Home workouts", "Yoga", "Pilates", "Cardio", "Strength training", "Walking", "None"]
                        ).map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={type}
                              checked={formData.exerciseTypes.includes(type)}
                              onCheckedChange={() => handleArrayToggle("exerciseTypes", type)}
                            />
                            <Label htmlFor={type}>{type}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Exercise Frequency</Label>
                      <RadioGroup
                        value={formData.exerciseFrequency}
                        onValueChange={(value) => handleInputChange("exerciseFrequency", value)}
                        className="grid gap-2"
                      >
                        {["0 days", "1–2 days", "3 days", "4 days", "5 days", "6 days", "Daily"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option} />
                            <Label htmlFor={option}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>


                </CardContent>
              </>
            )}

            {/* Step 5: Food Preferences & Meal Timings */}
            {step === 5 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Food Preferences & Meal Timings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Food Preferences */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Diet Type</Label>
                      <RadioGroup
                        value={formData.dietType}
                        onValueChange={(value) => handleInputChange("dietType", value)}
                        className="grid gap-2"
                      >
                        {["Vegetarian", "Non-Vegetarian", "Eggetarian", "Vegan", "Jain"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option} />
                            <Label htmlFor={option}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="foodsDislike">Foods You Dislike</Label>
                      <Textarea
                        id="foodsDislike"
                        placeholder="Write here (max 600 characters)"
                        value={formData.foodsDislike}
                        onChange={(e) => handleInputChange("foodsDislike", e.target.value)}
                        className="min-h-[80px]"
                        maxLength={600}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Food Allergies (Select all that apply)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {["Dairy allergy", "Lactose intolerance", "Gluten intolerance", "Peanut allergy", "Soy allergy", "Egg allergy", "Seafood allergy", "None"].map((allergy) => (
                          <div key={allergy} className="flex items-center space-x-2">
                            <Checkbox
                              id={allergy}
                              checked={formData.foodAllergies.includes(allergy)}
                              onCheckedChange={() => handleArrayToggle("foodAllergies", allergy)}
                            />
                            <Label htmlFor={allergy}>{allergy}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="foodAllergiesOther">Food Allergies (Other)</Label>
                      <Textarea
                        id="foodAllergiesOther"
                        placeholder="Write here (max 600 characters)"
                        value={formData.foodAllergiesOther}
                        onChange={(e) => handleInputChange("foodAllergiesOther", e.target.value)}
                        className="min-h-[80px]"
                        maxLength={600}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="teaCoffeeIntake">Tea & Coffee Intake</Label>
                        <Input
                          id="teaCoffeeIntake"
                          placeholder="e.g., 2 cups/day"
                          value={formData.teaCoffeeIntake}
                          onChange={(e) => handleInputChange("teaCoffeeIntake", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Outside Food</Label>
                        <RadioGroup
                          value={formData.outsideFood}
                          onValueChange={(value) => handleInputChange("outsideFood", value)}
                          className="grid gap-2"
                        >
                          {["Rarely (0–1 times/week)", "1–2 times/week", "3–4 times/week", "Almost daily", "None"].map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={option} />
                              <Label htmlFor={option}>{option}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Spice Tolerance</Label>
                      <RadioGroup
                        value={formData.spiceTolerance}
                        onValueChange={(value) => handleInputChange("spiceTolerance", value)}
                        className="flex gap-4"
                      >
                        {["Low", "Medium", "High (very spicy food)", "None"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option} />
                            <Label htmlFor={option}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Meal Timings & Household */}
                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Meal Timings & Household</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="breakfastTime">Breakfast Time</Label>
                        <Input
                          id="breakfastTime"
                          type="time"
                          value={formData.breakfastTime}
                          onChange={(e) => handleInputChange("breakfastTime", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lunchTime">Lunch Time</Label>
                        <Input
                          id="lunchTime"
                          type="time"
                          value={formData.lunchTime}
                          onChange={(e) => handleInputChange("lunchTime", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="eveningSnackTime">Evening Snack Time</Label>
                        <Input
                          id="eveningSnackTime"
                          type="time"
                          value={formData.eveningSnackTime}
                          onChange={(e) => handleInputChange("eveningSnackTime", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dinnerTime">Dinner Time</Label>
                        <Input
                          id="dinnerTime"
                          type="time"
                          value={formData.dinnerTime}
                          onChange={(e) => handleInputChange("dinnerTime", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lateNightEating">Late-Night Eating</Label>
                      <Input
                        id="lateNightEating"
                        placeholder="Yes / No – mention time if yes"
                        value={formData.lateNightEating}
                        onChange={(e) => handleInputChange("lateNightEating", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Who Cooks Your Daily Meals?</Label>
                      <RadioGroup
                        value={formData.whoCooksMeals}
                        onValueChange={(value) => handleInputChange("whoCooksMeals", value)}
                        className="grid gap-2"
                      >
                        {["I cook myself", "Mother / Family member", "Cook / House-help", "Mostly eat outside", "Tiffin service", "Hostel / PG food"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option} />
                            <Label htmlFor={option}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label>Kitchen Appliances Available (Select all that apply)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {["Gas stove", "Microwave", "Air Fryer", "Mixer / Blender"].map((appliance) => (
                          <div key={appliance} className="flex items-center space-x-2">
                            <Checkbox
                              id={appliance}
                              checked={formData.kitchenAppliances.includes(appliance)}
                              onCheckedChange={() => handleArrayToggle("kitchenAppliances", appliance)}
                            />
                            <Label htmlFor={appliance}>{appliance}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Budget for Food</Label>
                      <RadioGroup
                        value={formData.budgetForFood}
                        onValueChange={(value) => handleInputChange("budgetForFood", value)}
                        className="grid gap-2"
                      >
                        {["Low", "Medium", "Comfortable", "High", "Premium", "Not sure / varies"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option} />
                            <Label htmlFor={option}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="border-t pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="specialInstructions">Special Instructions</Label>
                      <Textarea
                        id="specialInstructions"
                        placeholder={`Write any personal preferences or limitations${selectedGender === "women" ? ", pregnancy notes, religious or cultural food restrictions" : ""} (max 600 characters)`}
                        value={formData.specialInstructions}
                        onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                        className="min-h-[100px]"
                        maxLength={600}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="luxuryOutline" size="lg" className="flex-1" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-5 w-5" /> Back
                    </Button>
                    <Button variant="luxury" size="lg" className="flex-1" onClick={handleNext}>
                      Submit <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
            {/* Step 6: Payment with Auth */}
            {step === 6 ? (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Complete Your Purchase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Account Section */}
                  <div className="space-y-4 p-4 rounded-lg border border-border bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gold" />
                      <Label className="text-lg font-semibold">Account</Label>
                    </div>

                    {isLoggedIn ? (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-gold" />
                          </div>
                          <div>
                            <p className="font-medium">{currentUser?.email}</p>
                            <p className="text-sm text-green-500">Logged in</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "login" | "signup")} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="signup">Create Account</TabsTrigger>
                          <TabsTrigger value="login">Login</TabsTrigger>
                        </TabsList>

                        <TabsContent value="signup" className="space-y-4 mt-4">
                          <p className="text-sm text-muted-foreground">
                            Create an account to track your diet plans and access them anytime.
                          </p>
                          <div className="space-y-2">
                            <Label htmlFor="signup-email">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="signup-email"
                                type="email"
                                placeholder="Enter your email"
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-password">Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password (min 6 characters)"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                className="pl-10 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <Button
                            variant="luxury"
                            className="w-full"
                            onClick={handleSignUp}
                            disabled={isAuthLoading}
                          >
                            {isAuthLoading ? "Creating Account..." : "Create Account"}
                          </Button>
                        </TabsContent>

                        <TabsContent value="login" className="space-y-4 mt-4">
                          <p className="text-sm text-muted-foreground">
                            Already have an account? Login to continue.
                          </p>
                          <div className="space-y-2">
                            <Label htmlFor="login-email">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="login-email"
                                type="email"
                                placeholder="Enter your email"
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="login-password">Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                className="pl-10 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <Button
                            variant="luxury"
                            className="w-full"
                            onClick={handleLogin}
                            disabled={isAuthLoading}
                          >
                            {isAuthLoading ? "Logging in..." : "Login"}
                          </Button>
                        </TabsContent>

                        <div className="relative my-6">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full relative py-5 border-border hover:bg-gold/10 hover:text-gold hover:border-gold transition-all duration-300"
                          onClick={() => loginWithGoogle()}
                        >
                          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                          </svg>
                          {authMode === "login" ? "Sign in with Google" : "Sign up with Google"}
                        </Button>
                      </Tabs>
                    )}

                    {!isLoggedIn && (
                      <p className="text-xs text-muted-foreground text-center">
                        Creating an account is optional but recommended for better experience.
                      </p>
                    )}
                  </div>

                  {/* Plan Selection */}
                  <div className="space-y-3">
                    <Label>Select Your Plan</Label>
                    <RadioGroup
                      value={selectedPlan}
                      onValueChange={setSelectedPlan}
                      className="grid gap-3"
                    >
                      {Object.entries(plans).map(([key, plan]) => (
                        <div
                          key={key}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${selectedPlan === key
                            ? "border-gold bg-gold/10"
                            : "border-border hover:border-gold/50"
                            }`}
                          onClick={() => setSelectedPlan(key)}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value={key} id={key} />
                            <Label htmlFor={key} className="cursor-pointer font-semibold">
                              {plan.name}
                            </Label>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-muted-foreground line-through mr-2">₹{plan.originalPrice}</span>
                            <span className="text-xl font-bold gold-text">₹{plan.price}</span>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-2 mt-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan</span>
                      <span>{currentPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Original Price</span>
                      <span className="line-through">₹{currentPlan.originalPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-500">-₹{currentPlan.originalPrice - currentPlan.price}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="gold-text">₹{currentPlan.price}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Your payment is secured with PCI-DSS compliant encryption</span>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="luxuryOutline" size="lg" className="flex-1" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-5 w-5" /> Back
                    </Button>
                    <Button
                      variant="luxury"
                      size="lg"
                      className="flex-1"
                      onClick={handleCashfreePayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        "Processing..."
                      ) : (
                        <>
                          Pay ₹{currentPlan.price} <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : null
            }
          </Card >
        </div >
      </main >

      <Footer />
    </div >
  );
};

export default GetStarted;
