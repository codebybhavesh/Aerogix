import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle, XCircle, Clock, Loader2, PackageOpen, MapPin, Phone } from "lucide-react";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ChemistOrder } from "@/lib/types";

const MOCK_ORDERS = [
    {
        id: "ORD-9823",
        patient: "Rahul Sharma",
        date: "2026-03-14",
        status: "pending",
        items: ["Paracetamol 500mg x2", "Cough Syrup 100ml x1"],
        total: "₹250",
        prescriptionUrl: "#"
    },
    {
        id: "ORD-9824",
        patient: "Priya Patel",
        date: "2026-03-14",
        status: "completed",
        items: ["Amoxicillin 250mg x1"],
        total: "₹120",
        prescriptionUrl: "#"
    },
    {
        id: "ORD-9825",
        patient: "Amit Kumar",
        date: "2026-03-13",
        status: "rejected",
        items: ["Ibuprofen 400mg x3"],
        total: "₹240",
        prescriptionUrl: "#"
    }
];

const OrderManagement = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState<ChemistOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        // Fetch all pending orders OR orders specifically accepted by this chemist
        const q = query(
            collection(db, "chemist_orders")
            // Ideally we'd use an 'or' query, but we'll fetch all and filter client side for simplicity
            // or we just fetch where status == 'pending' and another query for chemistId == user.uid
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ChemistOrder));
            
            // Filter: Show if it's pending (open for grab) OR if it belongs to this chemist
            const relevantOrders = items.filter(order => 
                order.status === 'pending' || order.chemistId === user.uid
            ).sort((a, b) => {
                // simple sort logic - put pending at top, then by timestamp
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                
                const tA = a.createdAt?.toDate?.()?.getTime?.() || 0;
                const tB = b.createdAt?.toDate?.()?.getTime?.() || 0;
                return tB - tA; // descending
            });

            setOrders(relevantOrders);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            toast({ variant: "destructive", title: "Error loading orders", description: error.message });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, toast]);

    const handleUpdateStatus = async (orderId: string, newStatus: "accepted" | "rejected") => {
        if (!user) return;
        setProcessingId(orderId);
        
        try {
            const orderRef = doc(db, "chemist_orders", orderId);
            await updateDoc(orderRef, {
                status: newStatus,
                chemistId: newStatus === "accepted" ? user.uid : null,
                updatedAt: serverTimestamp()
            });
            toast({ 
                title: newStatus === "accepted" ? "Order Accepted" : "Order Rejected", 
                description: `Order has been marked as ${newStatus}.` 
            });
        } catch (error: any) {
            console.error("Error updating order:", error);
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        } finally {
            setProcessingId(null);
        }
    };
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Orders & Prescriptions</h1>
                <p className="text-slate-500 mt-2">Verify prescriptions and manage patient orders.</p>
            </div>

            <div className="grid gap-6">
                {loading ? (
                    <div className="py-24 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : orders.length > 0 ? (
                    orders.map((order) => (
                        <Card key={order.id} className="shadow-sm border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle className="text-lg">Order {order.id.slice(-6).toUpperCase()}</CardTitle>
                                    <CardDescription>{order.patientName} • {order.date}</CardDescription>
                                </div>
                                <Badge 
                                    variant={order.status === 'completed' ? 'default' : order.status === 'rejected' ? 'destructive' : 'secondary'}
                                    className={
                                        order.status === 'completed' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                                        order.status === 'accepted' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                                        order.status === 'pending' ? 'bg-amber-500 text-white hover:bg-amber-600' : ''
                                    }
                                >
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900 mb-2">Requested Items</h4>
                                        <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                            {order.items && order.items.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                            {(!order.items || order.items.length === 0) && (
                                                <li className="text-slate-400 italic list-none">No items specified.</li>
                                            )}
                                        </ul>
                                    </div>
                                    
                                    {(order.address || order.phone) && (
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm space-y-2 mt-2">
                                            <h4 className="font-semibold text-slate-900 mb-1">Delivery Details</h4>
                                            {order.address && (
                                                <div className="flex items-start gap-2 text-slate-600 font-medium">
                                                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                                    <span>{order.address}</span>
                                                </div>
                                            )}
                                            {order.phone && (
                                                <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                                    <span>{order.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div className="font-semibold text-slate-900">
                                            Total: ₹{order.total}
                                        </div>
                                        <div className="flex gap-2">
                                            {order.status === 'pending' && (
                                                <>
                                                    <Button 
                                                        variant="destructive" 
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(order.id, "rejected")}
                                                        disabled={processingId === order.id}
                                                    >
                                                        {processingId === order.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                                                        Reject
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        className="bg-emerald-500 hover:bg-emerald-600"
                                                        onClick={() => handleUpdateStatus(order.id, "accepted")}
                                                        disabled={processingId === order.id}
                                                    >
                                                        {processingId === order.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                                        Verify & Accept
                                                    </Button>
                                                </>
                                            )}
                                            {order.status === 'accepted' && (
                                                <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    Mark as Completed
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="py-24 bg-white rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-500 text-center shadow-sm">
                        <PackageOpen className="w-12 h-12 mb-4 text-slate-300" />
                        <p className="font-medium text-slate-900">No prescriptions yet</p>
                        <p className="text-sm mt-1">Pending patient orders will appear here automatically.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderManagement;
