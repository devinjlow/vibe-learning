'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepIndicator } from "@/components/ui/step-indicator";
import { BackgroundPills } from "@/components/ui/background-pills";
import { Github } from "lucide-react";
import { Loader2 } from "lucide-react";

const STEPS = [
  "User Details",
  "Background",
  "Experience",
  "Interests",
  "Profile Picture"
];

const BACKGROUND_OPTIONS = [
  "Student",
  "Engineering Professional",
  "Self-taught Developer",
  "Bootcamp Graduate",
  "Other"
];

const EXPERIENCE_OPTIONS = [
  "< 1 year",
  "1 - 3 years",
  "4 - 7 years",
  "8+ years"
];

const INTEREST_OPTIONS = [
  "Business",
  "Finance",
  "Engineering",
  "Health & Wellness",
  "Education",
  "Entertainment",
  "Social Impact",
  "Technology"
];

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  background?: string;
  experience?: string;
  interests?: string;
  profilePicture?: string;
}

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    background: null as string | null,
    experience: null as string | null,
    interests: [] as string[],
    profilePicture: null as File | null
  });

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        if (!formData.username) {
          newErrors.username = "Username is required";
        } else if (formData.username.length < 3) {
          newErrors.username = "Username must be at least 3 characters";
        }
        if (!formData.email) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Invalid email format";
        }
        if (!formData.password) {
          newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        }
        break;
      case 2:
        if (!formData.background) {
          newErrors.background = "Please select your background";
        }
        break;
      case 3:
        if (!formData.experience) {
          newErrors.experience = "Please select your experience level";
        }
        break;
      case 4:
        if (formData.interests.length === 0) {
          newErrors.interests = "Please select at least one interest";
        }
        break;
      case 5:
        if (!formData.profilePicture) {
          newErrors.profilePicture = "Please upload a profile picture";
        } else {
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (formData.profilePicture.size > maxSize) {
            newErrors.profilePicture = "Image size must be less than 5MB";
          }
          const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
          if (!validTypes.includes(formData.profilePicture.type)) {
            newErrors.profilePicture = "Please upload a valid image file (JPEG, PNG, or GIF)";
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      // TODO: Implement actual form submission
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated API call
      console.log('Form submitted:', formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackgroundSelect = (background: string) => {
    setFormData(prev => ({ ...prev, background }));
  };

  const handleExperienceSelect = (experience: string) => {
    setFormData(prev => ({ ...prev, experience }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, profilePicture: file }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <Button variant="outline" className="w-full">
              <Github className="mr-2 h-4 w-4" />
              Continue with GitHub
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="johndoe"
                className={errors.username ? "border-destructive" : ""}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="m@example.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <Label>What best describes your background?</Label>
            <BackgroundPills
              options={BACKGROUND_OPTIONS}
              selected={formData.background}
              onSelect={handleBackgroundSelect}
            />
            {errors.background && (
              <p className="text-sm text-destructive">{errors.background}</p>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <Label>How long have you been coding?</Label>
            <BackgroundPills
              options={EXPERIENCE_OPTIONS}
              selected={formData.experience}
              onSelect={handleExperienceSelect}
            />
            {errors.experience && (
              <p className="text-sm text-destructive">{errors.experience}</p>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <Label>Select your interests (choose multiple)</Label>
            <BackgroundPills
              options={INTEREST_OPTIONS}
              selected={null}
              onSelect={handleInterestToggle}
            />
            <div className="mt-4">
              <Label>Selected interests:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.interests.map(interest => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
            {errors.interests && (
              <p className="text-sm text-destructive">{errors.interests}</p>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <Label>Upload your profile picture</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                {formData.profilePicture ? (
                  <img
                    src={URL.createObjectURL(formData.profilePicture)}
                    alt="Profile preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground">No image</span>
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className={errors.profilePicture ? "border-destructive" : ""}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Recommended: Square image, at least 400x400px
                </p>
                {errors.profilePicture && (
                  <p className="text-sm text-destructive mt-2">{errors.profilePicture}</p>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-8">
      <StepIndicator
        currentStep={currentStep}
        totalSteps={STEPS.length}
        steps={STEPS}
      />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{STEPS[currentStep - 1]}</CardTitle>
          <CardDescription className="text-center">
            {currentStep === 1
              ? "Create your account to get started"
              : `Step ${currentStep} of ${STEPS.length}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
          >
            Back
          </Button>
          <Button
            onClick={currentStep === STEPS.length ? handleSubmit : handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {currentStep === STEPS.length ? "Creating Account..." : "Loading..."}
              </>
            ) : (
              currentStep === STEPS.length ? "Create Account" : "Next"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 