/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/* Guys diri ra nako gibutang ang auth logic instead of making a separate hook
 kay basin nya makaguba ko HAHAHAHA chz anyways, kamo ra bahala*/

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebase.config";
import { LoginLoadingOverlay } from "@/features/auth/components/login/LoginLoadingOverlay";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function LoginCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Add a small delay to show the loading overlay before redirecting
      // await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to dashboard on successful login
      router.push("/org-dashboard");
    } catch (error: any) {
      console.error("Login failed", error);

      // Show a more user-friendly error message
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password. Please try again.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.");
      } else {
        setError("An error occurred during sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100%] bg-white dark:bg-background relative overflow-hidden flex items-center justify-center animate-fade-in">
      {/* Show loading overlay when authenticating */}
      {isLoading && <LoginLoadingOverlay />}

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6 w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[500px]">
          {/* Mobile Image - Shows on top for mobile */}
          <div className="lg:hidden w-full flex justify-center items-center order-1 animate-fade-in-up animation-delay-200">
            <div className="w-full max-w-[1200px] flex justify-center">
              <Image
                src="/images/enhanced-logo-final.png"
                alt="SAMS Illustration"
                width={300}
                height={225}
                className="w-auto h-auto object-contain max-w-full max-h-[280px]"
                priority
              />
            </div>
          </div>

          {/* Left Side - Login Form */}
          <div className="w-full max-w-lg mx-auto lg:mx-0 lg:max-w-none flex flex-col justify-center order-2 lg:order-1">
            {/* Title and Subtitle */}
            <div className="mb-4 lg:mb-6 text-center lg:text-left animate-fade-in-up animation-delay-300">
              <h1 className="font-instrument text-3xl sm:text-4xl lg:text-[42px] font-bold text-black dark:text-foreground leading-tight mb-2 lg:mb-3">
                Sign in to CORAL
              </h1>
              <p className="font-instrument text-lg sm:text-xl lg:text-[24px] text-[#5B5B5B] dark:text-muted-foreground leading-relaxed">
                Enter your credentials to access your account
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 animate-fade-in-up animation-delay-400">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {/* Login Form Container */}
            <div className="bg-white dark:bg-card border border-[#767676] dark:border-border rounded-[30px] lg:rounded-[40px] p-6 sm:p-7 lg:p-8 w-full max-w-[520px] mx-auto lg:mx-0 shadow-lg dark:shadow-2xl animate-fade-in-up animation-delay-500">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2 animate-fade-in-up animation-delay-600">
                  <label className="block font-instrument text-xl text-[#272727] dark:text-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#696969] dark:text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-[50px] pl-11 pr-4 border border-[#696969] dark:border-border rounded-[14px] bg-white dark:bg-input font-instrument text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#008ACF] dark:focus:ring-primary focus:border-transparent transition-all"
                      required
                      disabled={isLoading}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2 animate-fade-in-up animation-delay-700">
                  <label className="block font-instrument text-xl text-[#272727] dark:text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#696969] dark:text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-[50px] pl-11 pr-4 border border-[#696969] dark:border-border rounded-[14px] bg-white dark:bg-input font-instrument text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#008ACF] dark:focus:ring-primary focus:border-transparent transition-all"
                      required
                      disabled={isLoading}
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {/* Remember Me and Forgot Password */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 pb-1 space-y-3 sm:space-y-0 animate-fade-in-up animation-delay-800">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="remember"
                        className="flex items-center cursor-pointer"
                      >
                        <div className="w-6 h-6 mr-3 relative">
                          {rememberMe ? (
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.11 21 21 20.1 21 19V5C21 3.9 20.11 3 19 3ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                                fill="currentColor"
                                className="text-[#111111] dark:text-foreground"
                              />
                            </svg>
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-400 dark:border-border rounded"></div>
                          )}
                        </div>
                        <span className="font-poppins text-base text-[#333] dark:text-foreground">
                          Remember me
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <Link
                      href="/forgot-password"
                      className="font-instrument text-base text-[#008ACF] dark:text-primary underline hover:text-[#0f73a5] dark:hover:text-primary/80 transition-colors inline-block"
                      tabIndex={isLoading ? -1 : 0}
                      aria-disabled={isLoading}
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Sign In Button */}
                <div className="pt-6 animate-fade-in-up animation-delay-900">
                  <button
                    type="submit"
                    className="w-full max-w-[200px] h-16 bg-[#008ACF] dark:bg-primary text-white dark:text-primary-foreground font-poppins text-[18px] rounded-xl hover:bg-[#0f73a5] dark:hover:bg-primary/90 transition-all duration-200 mx-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Illustration (Desktop only) */}
          <div className="hidden lg:flex justify-center items-center order-3 lg:order-2 animate-fade-in-left animation-delay-400">
            <div className="w-full max-w-[450px] flex justify-center">
              <Image
                src="/images/enhanced-logo-final.png"
                alt="SAMS Illustration"
                width={450}
                height={340}
                className="w-auto h-auto object-contain max-w-full max-h-[380px]"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
