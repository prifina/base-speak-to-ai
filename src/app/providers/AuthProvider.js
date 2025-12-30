"use client";

import { createContext, useState, useEffect } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { configureAmplify } from "@/lib/amplify";
import useStore from "@/lib/sessionStore";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const setKnowledgebaseId = useStore((state) => state.setKnowledgebaseId);

  useEffect(() => {
    configureAmplify();

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        const response = await fetch("/api/auth/get-knowledgebase-id");
        const data = await response.json();
        if (data.knowledgebaseId) {
          setKnowledgebaseId(data.knowledgebaseId);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoaded(true);
      }
    }

    loadUser();
  }, [setKnowledgebaseId]);

  return (
    <AuthContext.Provider value={{ user, setUser, loaded }}>
      {children}
    </AuthContext.Provider>
  );
}
