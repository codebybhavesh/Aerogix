import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorSetup from "./pages/DoctorSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
    const { user, role, loading } = useAuth();

    if (loading) return <div className="flex items-center justify-center h-screen">Loading authentication...</div>;

    // Always show landing page at "/" - don't auto-redirect logged-in users
    // They'll be redirected to dashboard only after explicit login action
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                path="/doctor"
                element={
                    <ProtectedRoute allowedRole="doctor">
                        <DoctorDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/doctor/setup"
                element={
                    <ProtectedRoute allowedRole="doctor">
                        <DoctorSetup />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient"
                element={
                    <ProtectedRoute allowedRole="patient">
                        <PatientDashboard />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<NotFound />} />
        </Routes>
    );

};

const App = () => (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <AppRoutes />
                </BrowserRouter>
            </TooltipProvider>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;
