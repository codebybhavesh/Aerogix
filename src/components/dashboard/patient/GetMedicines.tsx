import * as React from "react";
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ChemistMedicine } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Search, PackageSearch, Loader2, Building2 } from "lucide-react";

export default function GetMedicines() {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [medicines, setMedicines] = useState<ChemistMedicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [cart, setCart] = useState<{ item: ChemistMedicine; quantity: number }[]>([]);
    const [patientName, setPatientName] = useState("Patient");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Delivery Details
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        if (!user) return;

        // Fetch patient details
        const fetchPatient = async () => {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                setPatientName(userDoc.data().name || "Patient");
            }
        };
        fetchPatient();

        // Fetch all inventory. Optionally we could group by chemist, but for simplicity
        // in this portal, we'll list all available medicines.
        const q = query(collection(db, "chemist_inventory"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ChemistMedicine));
            
            // Only show items with stock > 0
            setMedicines(items.filter(item => item.stock > 0));
            setLoading(false);
        }, (err) => {
            console.error("Error fetching inventory:", err);
            toast({ variant: "destructive", title: "Error", description: "Failed to load medicines." });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, toast]);

    const handleAddToCart = (medicine: ChemistMedicine) => {
        setCart(prev => {
            const existing = prev.find(c => c.item.id === medicine.id);
            if (existing) {
                if (existing.quantity >= medicine.stock) {
                    toast({ title: "Max Stock Reached", description: `Only ${medicine.stock} available.`, variant: "destructive" });
                    return prev;
                }
                return prev.map(c => 
                    c.item.id === medicine.id ? { ...c, quantity: c.quantity + 1 } : c
                );
            }
            return [...prev, { item: medicine, quantity: 1 }];
        });
    };

    const handleRemoveFromCart = (medicineId: string) => {
        setCart(prev => {
            const existing = prev.find(c => c.item.id === medicineId);
            if (existing && existing.quantity > 1) {
                return prev.map(c => 
                    c.item.id === medicineId ? { ...c, quantity: c.quantity - 1 } : c
                );
            }
            return prev.filter(c => c.item.id !== medicineId);
        });
    };

    const cartTotal = cart.reduce((sum, current) => {
        const itemPrice = typeof current.item.price === 'string' ? parseFloat(current.item.price) : current.item.price;
        return sum + (itemPrice * current.quantity);
    }, 0);

    const handleCheckout = async () => {
        if (!user || cart.length === 0) return;
        
        if (!address.trim() || !phone.trim()) {
            toast({
                title: "Missing Delivery Details",
                description: "Please provide both your delivery address and phone number.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Create an order string summarizing items, e.g., "Paracetamol x2, Amoxicillin x1"
            const itemsStringArray = cart.map(c => `${c.item.name} x${c.quantity}`);

            // Submit order
            await addDoc(collection(db, "chemist_orders"), {
                patientId: user.uid,
                patientName: patientName,
                items: itemsStringArray,
                total: cartTotal.toFixed(2),
                status: "pending", // Chemist will see this and grab it
                date: new Date().toISOString().split('T')[0],
                createdAt: serverTimestamp(),
                chemistId: null, // Unassigned
                address: address.trim(),
                phone: phone.trim()
            });

            toast({
                title: "Order Placed Successfully",
                description: "Your order has been sent to our registered chemists.",
            });
            setCart([]); // Clear cart
            setAddress("");
            setPhone("");
        } catch (error: any) {
            console.error("Error submitting order:", error);
            toast({ variant: "destructive", title: "Checkout Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredMedicines = medicines.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Find Medicines</h2>
                    <p className="text-slate-500 mt-1">Search and order medicines directly from verified chemists.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by medicine name or category..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {filteredMedicines.map(medicine => (
                            <Card key={medicine.id} className="border-slate-200 shadow-sm flex flex-col">
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg text-slate-900">{medicine.name}</CardTitle>
                                            <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                                                <Building2 className="w-3 h-3" />
                                                Available at Clinic Pharmacy
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                                            General
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2 flex-1 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4 mt-2">
                                        <span className="text-xl font-bold text-slate-900">₹{medicine.price}</span>
                                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-medium">In Stock</span>
                                    </div>
                                    <Button 
                                        onClick={() => handleAddToCart(medicine)}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add to Cart
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}

                        {filteredMedicines.length === 0 && (
                            <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-slate-200">
                                <PackageSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No medicines found matching "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Shopping Cart Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6 border-slate-200 shadow-md">
                        <CardHeader className="bg-slate-50 rounded-t-xl border-b border-slate-100">
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-teal-600" />
                                Your Cart
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {cart.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    Your cart is empty.
                                </div>
                            ) : (
                                <div className="flex flex-col h-full">
                                    <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                                        {cart.map(item => (
                                            <div key={item.item.id} className="flex justify-between items-center group">
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <h4 className="font-medium text-sm text-slate-900 truncate">{item.item.name}</h4>
                                                    <p className="text-xs text-slate-500">₹{item.item.price} each</p>
                                                </div>
                                                <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-200">
                                                    <button 
                                                        onClick={() => handleRemoveFromCart(item.item.id)}
                                                        className="p-1 hover:bg-white rounded shadow-sm text-slate-600"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => handleAddToCart(item.item)}
                                                        className="p-1 hover:bg-white rounded shadow-sm text-slate-600"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl space-y-4">
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-slate-900 text-sm">Delivery Details</h4>
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Complete Delivery Address"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm rounded border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="tel"
                                                    placeholder="Contact Phone Number"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm rounded border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                                            <span>Order Total</span>
                                            <span>₹{cartTotal.toFixed(2)}</span>
                                        </div>
                                        <Button 
                                            className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 text-lg font-medium" 
                                            onClick={handleCheckout}
                                            disabled={isSubmitting || cart.length === 0}
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            ) : (
                                                "Place Order"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
