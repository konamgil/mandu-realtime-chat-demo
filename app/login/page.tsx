"use client";

import { useEffect } from "react";
import LoginScreen from "../components/login-screen";
import { getStoredSession } from "../lib/auth";

export default function LoginPage() {
  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      window.location.replace("/");
    }
  }, []);

  return <LoginScreen />;
}
