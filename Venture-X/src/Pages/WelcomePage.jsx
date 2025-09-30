import React, { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import WelcomeNavbar from "../components/WelcomeNavbar";
import { supabase } from "../lib/supabaseClient.js";
import { syncUser } from "../lib/api.js";

const WelcomePage = () => {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (!user) return;
        if (cancelled) return;
        await syncUser({
          supabaseId: user.id,
          email: user.email,
          fullName: user.user_metadata?.fullName || "",
        });
      } catch (e) {
        // Non-blocking; just log for now
        console.error("Welcome sync failed:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <div>
      <WelcomeNavbar />
      <div className="max-w-5xl mx-auto p-6">
        <div className=" flex gap-3 flex-wrap"></div>
        <Outlet />
      </div>
    </div>
  );
};

export default WelcomePage;
