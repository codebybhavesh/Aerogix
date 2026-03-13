import * as React from "react";
import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRole?: "doctor" | "patient";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
    const { user, role, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If role hasn't loaded yet, show loading message
    if (role === null) {
        return <div className="flex items-center justify-center h-screen">Loading your profile...</div>;
    }

    // Check if user has permission for this route
    if (allowedRole && role !== allowedRole) {
        // Redirect to the user's own dashboard, not to the one they tried to access
        const dashboardRoute = role === "doctor" ? "/doctor" : "/patient";
        // Only redirect if they're not already on their own dashboard
        if (location.pathname !== dashboardRoute) {
            return <Navigate to={dashboardRoute} replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
