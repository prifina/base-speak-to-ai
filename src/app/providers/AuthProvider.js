"use client";

import { createContext, useState, useEffect } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { configureAmplify } from "@/lib/amplify";
import useStore from "@/lib/sessionStore";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  useEffect(() => {
    configureAmplify();

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        // Populate sessionStore with user data from JWT tokens
        await isLoggedIn();
      } catch (err) {
        setUser(null);
      } finally {
        setLoaded(true);
      }
    }

    loadUser();
  }, [isLoggedIn]);

  return (
    <AuthContext.Provider value={{ user, setUser, loaded }}>
      {children}
    </AuthContext.Provider>
  );
}
