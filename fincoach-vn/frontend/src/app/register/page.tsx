"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wallet, Eye, EyeOff, Loader2 } from "lucide-react";
import { signUp } from "aws-amplify/auth";
import axios from "axios";

// Form validation schema
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  monthlyIncome: z.number().min(0, "Monthly income must be positive"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setEmail(data.email);

    try {
      // Sign up with Cognito
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            name: data.name,
          },
        },
      });

      if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        setVerificationStep(true);
        // Store user data temporarily for after verification
        localStorage.setItem("pendingUserData", JSON.stringify({
          email: data.email,
          name: data.name,
          monthlyIncome: data.monthlyIncome,
          cognitoUserId: userId,
        }));
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      alert(error.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    setIsLoading(true);

    try {
      // Confirm sign up
      await signUp({
        username: email,
        confirmationCode: verificationCode,
      });

      // Get stored user data
      const pendingData = JSON.parse(localStorage.getItem("pendingUserData") || "{}");
      
      // Create user in backend
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/users`, pendingData);
      
      // Clear temporary data
      localStorage.removeItem("pendingUserData");
      
      // Redirect to login
      router.push("/login?registered=true");
    } catch (error: any) {
      console.error("Verification error:", error);
      alert(error.message || "Failed to verify email");
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Wallet className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
            <p className="text-gray-600">
              We've sent a verification code to {email}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>

            <button
              onClick={handleVerification}
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Wallet className="h-8 w-8 text-indigo-600" />
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
          <p className="text-gray-600">Start your financial wellness journey</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              {...register("name")}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Nguyen Van A"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Income (VND)
            </label>
            <input
              {...register("monthlyIncome", { valueAsNumber: true })}
              type="number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="10000000"
            />
            {errors.monthlyIncome && (
              <p className="mt-1 text-sm text-red-600">{errors.monthlyIncome.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              {...register("confirmPassword")}
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-start">
            <input
              {...register("acceptTerms")}
              type="checkbox"
              className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-600">
              I accept the{" "}
              <Link href="/terms" className="text-indigo-600 hover:text-indigo-700">
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            You'll receive 100 Wisdom Points as a welcome bonus! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}