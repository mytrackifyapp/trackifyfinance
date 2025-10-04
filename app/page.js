"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Example preferences
const goals = [
  { id: "budgeting", label: "Budgeting" },
  { id: "savings", label: "Savings Growth" },
  { id: "crypto", label: "Crypto Tracking" },
  { id: "investments", label: "Investments" },
  { id: "Ai", label: "Financial Insights" },
];

export default function OnboardingPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form state
  const [name, setName] = useState("");
  const [selectedGoals, setSelectedGoals] = useState([]);

  useEffect(() => {
    if (isSignedIn) {
      // If user already finished onboarding, redirect directly
      // For now, let’s always show onboarding when hitting `/`
      // router.replace("/dashboard")
    }
  }, [isSignedIn, router]);

  const toggleGoal = (goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else router.push("/dashboard"); // final redirect
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            {step === 1 && "Welcome to Trackify 🎉"}
            {step === 2 && "Choose Your Goals"}
            {step === 3 && "You're All Set!"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Step 1 - Profile */}
          {step === 1 && (
            <div className="flex flex-col items-center space-y-4">
              {user?.imageUrl && (
                <Image
                  src={user.imageUrl}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full border"
                />
              )}
              <Input
                placeholder="Enter your name"
                value={name || user?.fullName || ""}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-sm text-gray-500 text-center">
                We’ll personalize your experience using your profile.
              </p>
            </div>
          )}

          {/* Step 2 - Goals */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-center text-gray-600">
                Select the areas you want Trackify to help you with:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {goals.map((goal) => (
                  <Button
                    key={goal.id}
                    variant={selectedGoals.includes(goal.id) ? "default" : "outline"}
                    className={cn(
                      "w-full",
                      selectedGoals.includes(goal.id) && "bg-blue-600 text-white"
                    )}
                    onClick={() => toggleGoal(goal.id)}
                  >
                    {goal.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 - Confirmation */}
          {step === 3 && (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-lg text-gray-700 text-center">
                Thanks, <span className="font-semibold">{name || user?.firstName}</span> 🎊
              </p>
              <p className="text-gray-600 text-center">
                You’ve chosen:{" "}
                {selectedGoals.length > 0
                  ? selectedGoals.join(", ")
                  : "No preferences yet"}
              </p>
              <p className="text-sm text-gray-500">
                You can update this later in your settings.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex justify-between">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button onClick={handleNext}>
              {step < 3 ? "Next" : "Go to Dashboard"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
