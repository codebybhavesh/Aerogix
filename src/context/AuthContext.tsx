import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, onSnapshot, DocumentSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    role: "doctor" | "patient" | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<"doctor" | "patient" | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc: (() => void) | null = null;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        // Fallback timeout to ensure loading doesn't hang forever
        timeoutId = setTimeout(() => {
            console.warn("Auth loading timeout - forcing loading to false");
            setLoading(false);
        }, 3000); // 3 second timeout - should be enough for Firebase to initialize

        // Ensure auth is initialized
        if (!auth) {
            console.error("Firebase auth is not initialized");
            setLoading(false);
            return () => {
                if (timeoutId) clearTimeout(timeoutId);
            };
        }

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            console.log("Auth state change - User:", user?.uid || "None");
            
            // Clear timeout since auth state changed
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }

            setUser(user);

            // Cleanup previous doc listener
            if (unsubscribeDoc) {
                unsubscribeDoc();
                unsubscribeDoc = null;
            }

            if (user) {
                setLoading(true);
                console.log("Setting up snapshot listener for UID:", user.uid);

                // Set a timeout for the Firestore snapshot
                const snapshotTimeout = setTimeout(() => {
                    console.warn("Firestore snapshot timeout - defaulting to patient role");
                    setRole("patient");
                    setLoading(false);
                }, 5000); // 5 second timeout for Firestore

                unsubscribeDoc = onSnapshot(doc(db, "users", user.uid),
                    (userDoc: DocumentSnapshot) => {
                        clearTimeout(snapshotTimeout);
                        
                        if (userDoc.exists()) {
                            const data = userDoc.data();
                            const rawRole = data.role?.toString().toLowerCase();

                            if (rawRole === "doctor" || rawRole === "patient") {
                                console.log("Role updated from snapshot:", rawRole);
                                setRole(rawRole as "doctor" | "patient");
                            } else {
                                console.warn("Unexpected role in Firestore:", data.role);
                                setRole("patient");
                            }
                        } else {
                            console.warn("User document does not exist yet for UID:", user.uid);
                            // Default to patient if document doesn't exist
                            setRole("patient");
                        }
                        setLoading(false);
                    },
                    (error: any) => {
                        clearTimeout(snapshotTimeout);
                        console.error("Snapshot error for user role:", error);
                        // Default to patient on error and stop loading
                        setRole("patient");
                        setLoading(false);
                    }
                );
            } else {
                setRole(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, role, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
