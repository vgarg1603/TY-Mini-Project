import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { syncUser } from "../lib/api.js";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
      if (signInError) throw signInError;

      const user = data.user;
      await syncUser({
        supabaseId: user?.id,
        email: user?.email || form.email,
        fullName: user?.user_metadata?.fullName || "",
      });

      navigate("/welcome", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setError("");
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/welcome" },
      });
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <main className="bg-white font-sans">
      {/* Spacer so content isn't cramped under the sticky navbar */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-16">
        {/* Heading */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl text-gray-900">
            Hi! Welcome back!
          </h1>
          <p className="mt-3 font-light text-gray-500 font-stretch-110%">
            New to Venture X?{" "}
            <Link to="/signup" className="hover:text-blue-400 relative">
              <span className="">Sign up</span>
              <span
                className="absolute -bottom-0.5 left-0 border-blue-300 border w-full block"
                aria-hidden="true"
              ></span>
            </Link>
          </p>
        </div>

        {/* Content */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Vertical divider (desktop) */}
          <div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200"
            aria-hidden="true"
          />
          {/* Left: Social logins */}
          <div className="flex justify-center items-center h-full ">
            <button
              type="button"
              onClick={onGoogleLogin}
              className="w-3/4 inline-flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              aria-label="Continue with Google"
            >
              {/* Google icon */}
              <span aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8-6.9 0-12.5-5.6-12.5-12.5S17.1 11 24 11c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.7 5 29.6 3 24 3 11.9 3 2 12.9 2 25s9.9 22 22 22 22-9.9 22-22c0-1.5-.2-3-.4-4.5z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.7l6.6 4.8C14.8 15.6 19 13 24 13c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.7 5 29.6 3 24 3 16 3 8.9 7.5 6.3 14.7z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 47c5.4 0 10.3-2.1 14-5.4l-6.5-5.3C29.3 37.5 26.8 38.5 24 38.5c-5.1 0-9.5-3.3-11.2-7.9l-6.6 5.1C8.8 42.6 15.8 47 24 47z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.8l6.5 5.3C40.2 36.3 44 31 44 25c0-1.5-.2-3-.4-4.5z"
                  />
                </svg>
              </span>
              <span className="font-medium">Continue with Google</span>
            </button>
          </div>

          {/* Right: Email/password form */}
          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block">
              <span className="sr-only">Email</span>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                required
              />
            </label>

            <label className="block">
              <span className="sr-only">Password</span>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                required
              />
            </label>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg py-3 transition-colors"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

            <div className="text-center">
              <a href="#" className="text-sm text-gray-600 hover:underline">
                Forgot password?
              </a>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};
export default LoginPage;
