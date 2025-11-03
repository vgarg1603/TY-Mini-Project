import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { syncUser } from "../lib/api.js";

const SignupPage = () => {
  const [form, setForm] = useState({ email: "", fullName: "", password: "" });
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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { fullName: form.fullName },
          emailRedirectTo: window.location.origin + "/welcome",
        },
      });
      if (signUpError) throw signUpError;

      const supaUser = data.user;

      // Supabase quirk: duplicates may come back as user with empty identities
      if (
        supaUser &&
        Array.isArray(supaUser.identities) &&
        supaUser.identities.length === 0
      ) {
        setError("An account with this email already exists. Please log in.");
        return;
      }

      await syncUser({
        supabaseId: supaUser?.id,
        email: form.email,
        fullName: form.fullName,
      });

      alert(
        "Signup successful! Please check your email to verify your account."
      );
      setForm({ email: "", fullName: "", password: "" });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to sign up");
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
    <main className="bg-gradient-to-br from-slate-50 to-blue-50/30 font-sans min-h-screen">
      {/* Spacer so content isn't cramped under the sticky navbar */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pt-12 md:pt-16 pb-20">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-950 tracking-tight">
            Invest in the founders you believe in
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-700 my-5 font-normal font-stretch-115%">
            Join over 1 million investors who are funding the future
          </h2>
          <p className="mt-4 text-base text-gray-600 font-stretch-110%">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold relative group">
              <span className="">Log in</span>
              <span className="absolute -bottom-0.5 left-0 border-b-2 border-blue-600 w-full group-hover:border-blue-700 transition-colors"></span>
            </Link>
          </p>
        </div>

        {/* Content */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Vertical divider (desktop) */}
          <div
            className="hidden md:block absolute left-1/2 top-8 bottom-8 w-px bg-gray-200"
            aria-hidden="true"
          />
          {/* Left: Social logins */}
          <div className="flex justify-center items-center h-full ">
            <button
              type="button"
              onClick={onGoogleLogin}
              className="w-full inline-flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl px-6 py-4 text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all duration-200 shadow-sm hover:shadow-md"
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
          <form className="space-y-5" onSubmit={onSubmit}>
            <label className="block">
              <span className="sr-only">Email</span>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={onChange}
                className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-200"
                required
              />
            </label>

            <label className="block">
              <span className="sr-only">Full Name</span>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={onChange}
                className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-200"
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
                className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-200"
                required
              />
            </label>
            {error && <p className="text-red-600 text-sm font-medium bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl py-4 transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40"
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default SignupPage;
