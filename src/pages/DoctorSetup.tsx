import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, Loader2 } from "lucide-react";

const DoctorSetup = () => {
    const [specialization, setSpecialization] = useState("");
    const [experience, setExperience] = useState("");
    const [consultationFee, setConsultationFee] = useState("");
    const [availability, setAvailability] = useState("");
    const [rating, setRating] = useState("5.0"); // Default rating
    const [loading, setLoading] = useState(false);

    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!auth.currentUser) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "You must be logged in to complete setup.",
            });
            return;
        }

        setLoading(true);

        try {
            // Fetch the user's name from the users collection, which was set during sign up
            const userDocRef = doc(db, "users", auth.currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            const userName = userDocSnap.exists() ? userDocSnap.data().name : "Unknown Doctor";

            await setDoc(doc(db, "doctors", auth.currentUser.uid), {
                name: userName,
                specialization,
                experience,
                consultationFee: Number(consultationFee),
                availability,
                rating: Number(rating),
                createdAt: new Date().toISOString(),
            });

            toast({
                title: "Setup Complete",
                description: "Your doctor profile has been created successfully.",
            });

            navigate("/doctor");
        } catch (error: any) {
            console.error("Setup error:", error);
            toast({
                variant: "destructive",
                title: "Setup Failed",
                description: error.message || "Failed to save profile. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
            <Card className="w-full max-w-lg shadow-xl border-slate-200">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 rounded-xl gradient-vitality flex items-center justify-center shadow-lg shadow-primary/20">
                            <Stethoscope className="text-white w-6 h-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Complete Your Profile</CardTitle>
                    <CardDescription>
                        Please provide details to set up your doctor account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="specialization">Specialization</Label>
                                <Input
                                    id="specialization"
                                    type="text"
                                    placeholder="Cardiologist"
                                    required
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="experience">Experience (Years)</Label>
                                <Input
                                    id="experience"
                                    type="text"
                                    placeholder="10"
                                    required
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fee">Consultation Fee (₹)</Label>
                                <Input
                                    id="fee"
                                    type="number"
                                    placeholder="500"
                                    required
                                    value={consultationFee}
                                    onChange={(e) => setConsultationFee(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rating">Rating (e.g. 4.8)</Label>
                                <Input
                                    id="rating"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    placeholder="5.0"
                                    required
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="availability">Availability</Label>
                            <Input
                                id="availability"
                                type="text"
                                placeholder="Mon - Fri, 09:00 AM - 05:00 PM"
                                required
                                value={availability}
                                onChange={(e) => setAvailability(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full gradient-vitality h-11 rounded-xl text-white font-semibold mt-6 transition-all hover:opacity-90 active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving Profile...
                                </>
                            ) : (
                                "Complete Setup"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default DoctorSetup;
