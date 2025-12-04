"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { 
  Wallet, 
  TrendingUp, 
  Coins, 
  PieChart, 
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  User
} from "lucide-react";
import { completeOnboarding, checkOnboardingStatus } from "@/actions/user";
import { toast } from "sonner";

// Goals with icons and descriptions
const goals = [
  { 
    id: "budgeting", 
    label: "Budgeting", 
    icon: Wallet,
    description: "Track expenses and manage your budget"
  },
  { 
    id: "savings", 
    label: "Savings Growth", 
    icon: TrendingUp,
    description: "Set goals and watch your savings grow"
  },
  { 
    id: "crypto", 
    label: "Crypto Tracking", 
    icon: Coins,
    description: "Monitor your cryptocurrency portfolio"
  },
  { 
    id: "investments", 
    label: "Investments", 
    icon: PieChart,
    description: "Track your investment performance"
  },
  { 
    id: "ai", 
    label: "AI Insights", 
    icon: Sparkles,
    description: "Get intelligent financial recommendations"
  },
];

const steps = [
  { number: 1, title: "Welcome" },
  { number: 2, title: "Your Goals" },
  { number: 3, title: "All Set!" },
];

export default function OnboardingPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const hasRedirectedRef = useRef(false);

  // Form state
  const [name, setName] = useState("");
  const [selectedGoals, setSelectedGoals] = useState([]);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirectedRef.current) {
      return;
    }

    if (!isLoaded) {
      return;
    }

    // If not signed in, redirect to sign-in (only once)
    if (!isSignedIn) {
      if (pathname !== "/sign-in" && pathname !== "/sign-up") {
        hasRedirectedRef.current = true;
        router.replace("/sign-in");
      }
      return;
    }

    // If signed in, check onboarding status from server (not localStorage)
    const verifyOnboarding = async () => {
      try {
        const status = await checkOnboardingStatus();
        if (status.onboardingCompleted) {
          // User has completed onboarding, redirect to dashboard
          if (pathname !== "/dashboard") {
            hasRedirectedRef.current = true;
            router.replace("/dashboard");
          }
          return;
        }
        
        // Onboarding not completed, show the form
        setCheckingStatus(false);
        if (user?.firstName && !name) {
          setName(user.firstName);
        }
      } catch (error) {
        console.error("Error verifying onboarding:", error);
        // On error, show onboarding form (safer than redirecting)
        setCheckingStatus(false);
        if (user?.firstName && !name) {
          setName(user.firstName);
        }
      }
    };

    verifyOnboarding();
  }, [isLoaded, isSignedIn, router, pathname, user?.firstName, name]);

  const toggleGoal = (goalId) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) 
        ? prev.filter((g) => g !== goalId) 
        : [...prev, goalId]
    );
  };

  const handleNext = async () => {
    if (step < 3) {
      // Validation
      if (step === 1 && !name.trim()) {
        toast.error("Please enter your name");
        return;
      }
      setStep(step + 1);
    } else {
      // Complete onboarding
      setLoading(true);
      try {
        await completeOnboarding({
          name: name.trim(),
          preferences: selectedGoals,
        });
        
        toast.success("Welcome to Trackify! 🎉");
        // Use replace to avoid back button issues
        router.replace("/dashboard");
      } catch (error) {
        console.error("Error completing onboarding:", error);
        toast.error("Something went wrong. Please try again.");
        setLoading(false);
        // Don't redirect on error - let user try again
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (checkingStatus || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-[#C1FF72] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#C1FF72]/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step} of {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#C1FF72] to-[#A8E063] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {steps.map((s) => (
              <div
                key={s.number}
                className={cn(
                  "text-xs font-medium transition-colors",
                  step >= s.number ? "text-gray-900 font-semibold" : "text-muted-foreground"
                )}
              >
                {s.title}
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-gray-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <CardTitle className="text-center text-3xl font-bold text-gray-900">
              {step === 1 && "Welcome to Trackify! 🎉"}
              {step === 2 && "What are your goals?"}
              {step === 3 && "You're All Set! ✨"}
            </CardTitle>
            <CardDescription className="text-center mt-2 text-gray-600">
              {step === 1 && "Let's get you started with your financial journey"}
              {step === 2 && "Select all that apply (you can change these later)"}
              {step === 3 && "Ready to take control of your finances"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8 pb-8">
            {/* Step 1 - Profile */}
            {step === 1 && (
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  {user?.imageUrl ? (
                    <div className="relative">
                      <Image
                        src={user.imageUrl}
                        alt="Profile"
                        width={120}
                        height={120}
                        className="rounded-full border-4 border-[#C1FF72] shadow-lg"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-[#C1FF72] rounded-full p-2 shadow-lg">
                        <User className="h-5 w-5 text-gray-900" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-[#C1FF72] to-[#A8E063] flex items-center justify-center shadow-lg">
                      <User className="h-16 w-16 text-white" />
                    </div>
                  )}
                </div>
                <div className="w-full max-w-md space-y-2">
                  <label className="text-sm font-medium text-gray-900">Your Name</label>
                  <Input
                    placeholder="Enter your name"
                    value={name || user?.fullName || ""}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && name.trim()) {
                        handleNext();
                      }
                    }}
                    className="h-12 text-lg"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    We'll personalize your experience with this name
                  </p>
                </div>
              </div>
            )}

            {/* Step 2 - Goals */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {goals.map((goal) => {
                    const Icon = goal.icon;
                    const isSelected = selectedGoals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={cn(
                          "relative p-5 rounded-xl border-2 transition-all text-left group",
                          "hover:shadow-lg hover:scale-[1.02]",
                          isSelected
                            ? "border-[#C1FF72] bg-gradient-to-br from-[#C1FF72]/20 to-[#A8E063]/10 shadow-md"
                            : "border-gray-200 hover:border-[#C1FF72]/50 bg-white"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-[#C1FF72] flex items-center justify-center">
                            <Check className="h-4 w-4 text-gray-900" />
                          </div>
                        )}
                        <div className={cn(
                          "h-12 w-12 rounded-lg flex items-center justify-center mb-3 transition-colors",
                          isSelected
                            ? "bg-[#C1FF72]"
                            : "bg-gray-100 group-hover:bg-[#C1FF72]/20"
                        )}>
                          <Icon className={cn(
                            "h-6 w-6",
                            isSelected ? "text-gray-900" : "text-gray-600"
                          )} />
                        </div>
                        <h3 className={cn(
                          "font-semibold text-base mb-1",
                          isSelected ? "text-gray-900" : "text-gray-700"
                        )}>
                          {goal.label}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {goal.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {selectedGoals.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center italic">
                    Select at least one goal to continue (optional)
                  </p>
                )}
              </div>
            )}

            {/* Step 3 - Confirmation */}
            {step === 3 && (
              <div className="flex flex-col items-center space-y-6">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#C1FF72] to-[#A8E063] flex items-center justify-center shadow-lg animate-pulse">
                  <Check className="h-12 w-12 text-white" strokeWidth={3} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-gray-900">
                    Welcome, <span className="text-gray-900">{name || user?.firstName}</span>! 🎊
                  </p>
                  <p className="text-gray-600">
                    You're ready to start managing your finances
                  </p>
                </div>
                {selectedGoals.length > 0 && (
                  <div className="w-full max-w-md p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">Your selected goals:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedGoals.map((goalId) => {
                        const goal = goals.find((g) => g.id === goalId);
                        return goal ? (
                          <span
                            key={goalId}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#C1FF72] text-gray-900 text-xs font-medium rounded-full"
                          >
                            {goal.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  You can update your preferences anytime in settings
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1 || loading}
                className="min-w-[100px]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={loading || (step === 1 && !name.trim())}
                className="min-w-[140px] bg-gradient-to-r from-[#C1FF72] to-[#A8E063] hover:from-[#A8E063] hover:to-[#C1FF72] text-gray-900 font-semibold shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2" />
                    Setting up...
                  </>
                ) : step < 3 ? (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skip link (only on step 1) */}
        {step === 1 && (
          <p className="text-center text-sm text-muted-foreground">
            <button
              onClick={async () => {
                try {
                  // Complete onboarding with minimal data
                  await completeOnboarding({
                    name: user?.firstName || user?.fullName || "User",
                    preferences: [],
                  });
                  router.replace("/dashboard");
                } catch (error) {
                  console.error("Error skipping onboarding:", error);
                  toast.error("Could not skip onboarding. Please complete the form.");
                }
              }}
              className="hover:text-gray-900 transition-colors underline"
            >
              Skip onboarding for now
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
