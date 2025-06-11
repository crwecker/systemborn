import { useState, useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import { requestMagicLink } from "../services/auth";

type ViewMode = "form" | "success";

export function SignUp() {
  const search = useSearch({ strict: false }) as {
    email?: string;
    fromSignin?: string;
  };
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("form");
  const [successMessage, setSuccessMessage] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [fromSignin, setFromSignin] = useState(false);

  useEffect(() => {
    // Check if we came from signin with an email
    if (search.email) {
      setEmail(search.email);
    }
    if (search.fromSignin === "true") {
      setFromSignin(true);
      setMessage({
        type: "error",
        text: "No account found with this email. Please sign up to create an account.",
      });
    }
  }, [search.email, search.fromSignin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await requestMagicLink(email, firstName, lastName);
      if (response.success) {
        // Check if this was an existing user
        setIsExistingUser(!!response.isExistingUser);

        if (response.isExistingUser) {
          // User already had an account
          if (response.verifyUrl) {
            setSuccessMessage(
              `Magic link created! Click here to verify: ${response.verifyUrl}`
            );
          } else {
            setSuccessMessage(
              "Magic link sent to your email."
            );
          }
        } else {
          // New user
          if (response.verifyUrl) {
            setSuccessMessage(
              `Magic link created! Click here to verify: ${response.verifyUrl}`
            );
          } else {
            setSuccessMessage(
              "Welcome! Check your email for the magic link to complete your registration."
            );
          }
        }
        setViewMode("success");
      } else {
        setMessage({
          type: "error",
          text: response.error || "Failed to create account",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setViewMode("form");
    setEmail("");
    setFirstName("");
    setLastName("");
    setMessage(null);
    setSuccessMessage("");
    setIsExistingUser(false);
  };

  const getTitle = () => {
    if (viewMode === "success") {
      return isExistingUser ? "Welcome Back!" : "Check Your Email";
    }
    return fromSignin ? "Create Your Account" : "Sign Up";
  };

  const getDescription = () => {
    if (viewMode === "success") {
      return isExistingUser ? "Looks like you already have an account!" : "";
    }
    return fromSignin
      ? "Please complete the form below to create your account."
      : "Join LitRPG Academy to discover your next great read!";
  };

  return (
    <div className="min-h-screen bg-dark-blue text-white p-8 pt-32">
      <div className="max-w-md mx-auto bg-slate p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-copper">{getTitle()}</h1>
        <p className="text-light-gray mb-6">{getDescription()}</p>

        {message && (
          <div
            className={`p-4 mb-6 rounded ${
              message.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {message.text}
          </div>
        )}

        {viewMode === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper"
                autoFocus
                required
              />
            </div>

            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium mb-1"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper"
                required
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium mb-1"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded bg-copper text-dark-blue font-medium transition-colors
                ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-light-gray"
                }`}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        {viewMode === "success" && (
          <div className="text-center space-y-6">
            <div className="p-6 bg-green-600/20 border border-green-600/30 rounded-lg">
              <p className="text-lg">{successMessage}</p>
            </div>

            <p className="text-light-gray">
              Didn't receive the email? Check your spam folder or try again with
              a different email address.
            </p>

            <button
              onClick={handleStartOver}
              className="w-full py-2 px-4 rounded border border-medium-gray text-light-gray hover:bg-medium-gray transition-colors"
            >
              Use Different Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
