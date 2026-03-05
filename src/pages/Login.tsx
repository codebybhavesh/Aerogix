import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Heart, ArrowRight, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, role } = useAuth();

    // Redirect to dashboard after role is loaded (either after login or if already logged in)
    useEffect(() => {
        if (user && role) {
            const from = location.state?.from?.pathname;
            if (from && (from === "/doctor" || from === "/patient")) {
                navigate(from, { replace: true });
            } else {
                const dashboardRoute = role === "doctor" ? "/doctor" : "/patient";
                navigate(dashboardRoute, { replace: true });
            }
        }
    }, [user, role, navigate, location.state]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);

            toast({
                title: "Login Successful",
                description: "Welcome back! Redirecting to your dashboard.",
            });

            // Don't navigate here - let useEffect handle redirect after role loads
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message,
            });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-12">
            <div className="w-full max-w-md mb-4">
                <Link
                    to="/"
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors group"
                >
                    <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                    Back to Home
                </Link>
            </div>
            <Card className="w-full max-w-md shadow-xl border-slate-200">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 rounded-xl gradient-vitality flex items-center justify-center shadow-lg shadow-primary/20">
                            <Heart className="text-white w-6 h-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                    <CardDescription>
                        Sign in to your account to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="rounded-xl focus-visible:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="rounded-xl focus-visible:ring-primary"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full gradient-vitality h-11 rounded-xl text-white font-semibold mt-6 transition-all hover:opacity-90 active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Continue"}
                            {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col items-center space-y-2">
                    <div className="text-sm text-slate-500">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-primary font-semibold hover:underline">
                            Create an account
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
