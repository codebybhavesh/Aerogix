import * as React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, Stethoscope, User, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"doctor" | "patient">("patient");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store user role in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name,
                email,
                role,
                createdAt: new Date().toISOString(),
            });

            toast({
                title: "Registration Successful",
                description: `Welcome! You have registered as a ${role}.`,
            });

            navigate(role === "doctor" ? "/doctor/setup" : "/patient");
        } catch (error: any) {
            console.error("Registration error:", error);
            let errorMessage = error.message;

            if (error.code === "auth/operation-not-allowed") {
                errorMessage = "Email/Password sign-in is not enabled in Firebase Console. Please enable it in the Authentication settings.";
            } else if (error.code === "auth/configuration-not-found") {
                errorMessage = "Firebase Auth configuration not found. Please ensure the Authentication service is initialized and Email/Password provider is enabled in the Firebase Console.";
            } else if (error.code === "auth/email-already-in-use") {
                errorMessage = "This email is already registered. Please try logging in.";
            } else if (error.code === "auth/weak-password") {
                errorMessage = "Password should be at least 6 characters.";
            }

            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
            <Card className="w-full max-w-md shadow-xl border-slate-200">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 rounded-xl gradient-vitality flex items-center justify-center shadow-lg shadow-primary/20">
                            <Heart className="text-white w-6 h-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
                    <CardDescription>
                        Join Arogix and bridge the healthcare gap.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <Label>I am a...</Label>
                            <RadioGroup
                                value={role}
                                onValueChange={(val: any) => setRole(val)}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div>
                                    <RadioGroupItem value="patient" id="patient" className="peer sr-only" />
                                    <Label
                                        htmlFor="patient"
                                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                                    >
                                        <User className="mb-2 h-6 w-6" />
                                        <span className="font-semibold">Patient</span>
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="doctor" id="doctor" className="peer sr-only" />
                                    <Label
                                        htmlFor="doctor"
                                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                                    >
                                        <Stethoscope className="mb-2 h-6 w-6" />
                                        <span className="font-semibold">Doctor</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <Button
                            type="submit"
                            className="w-full gradient-vitality h-11 rounded-xl text-white font-semibold mt-6 transition-all hover:opacity-90 active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Register Now"}
                            {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col items-center space-y-2">
                    <div className="text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register;
