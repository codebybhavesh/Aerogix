import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, AlertCircle, ShoppingCart, TrendingUp, Loader2 } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { ChemistMedicine, ChemistOrder } from "@/lib/types";

const ChemistOverview = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalMedicines: 0,
        lowStockItems: 0,
        pendingOrders: 0,
        todayRevenue: 0
    });
    const [recentOrders, setRecentOrders] = useState<ChemistOrder[]>([]);
    const [lowStockList, setLowStockList] = useState<ChemistMedicine[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Listen to Inventory
        const inventoryQuery = query(collection(db, "chemist_inventory"), where("chemistId", "==", user.uid));
        const unsubInventory = onSnapshot(inventoryQuery, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChemistMedicine));
            
            const lowStock = items.filter(item => item.stock < 20);
            setLowStockList(lowStock.slice(0, 5)); // show top 5

            setStats(prev => ({
                ...prev,
                totalMedicines: items.length,
                lowStockItems: lowStock.length
            }));
        });

        // Listen to Orders (Pending globally or Accepted by this chemist)
        const ordersQuery = query(collection(db, "chemist_orders"));
        const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
            const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChemistOrder));
            
            const relevantOrders = allOrders.filter(order => 
                order.status === 'pending' || order.chemistId === user.uid
            ).sort((a, b) => {
                const tA = a.createdAt?.toDate?.()?.getTime?.() || 0;
                const tB = b.createdAt?.toDate?.()?.getTime?.() || 0;
                return tB - tA; // descending
            });

            // Calculate revenue for TODAY only
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const todaysRevenue = relevantOrders
                .filter(o => o.status === 'completed' && o.chemistId === user.uid)
                .filter(o => {
                    const orderDate = o.createdAt?.toDate?.();
                    return orderDate && orderDate >= today;
                })
                .reduce((sum, order) => {
                    const amount = parseFloat(order.total as string) || 0;
                    return sum + amount;
                }, 0);

            const pendingCount = relevantOrders.filter(o => o.status === 'pending').length;

            setRecentOrders(relevantOrders.slice(0, 5)); // show top 5

            setStats(prev => ({
                ...prev,
                pendingOrders: pendingCount,
                todayRevenue: todaysRevenue
            }));
            
            setLoading(false);
        });

        return () => {
            unsubInventory();
            unsubOrders();
        };
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Chemist Overview</h1>
                <p className="text-slate-500 mt-2">Monitor your pharmacy inventory and recent orders.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Medicines</CardTitle>
                        <Package className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMedicines}</div>
                        <p className="text-xs text-slate-500 mt-1">In your inventory</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Low Stock Alerts</CardTitle>
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">{stats.lowStockItems}</div>
                        <p className="text-xs text-rose-500/80 mt-1">Items need restocking</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Pending Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                        <p className="text-xs text-slate-500 mt-1">Require verification</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Today's Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">₹{stats.todayRevenue.toFixed(2)}</div>
                        <p className="text-xs text-emerald-500 font-medium mt-1">Recorded today</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-1 shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>Latest patient prescriptions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length > 0 ? (
                            <div className="space-y-4">
                                {recentOrders.map(order => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div>
                                            <p className="font-medium text-slate-900 text-sm">Order {order.id.slice(-6).toUpperCase()}</p>
                                            <p className="text-xs text-slate-500">{order.patientName}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-medium 
                                            ${order.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                                              order.status === 'accepted' ? 'bg-blue-100 text-blue-800' : 
                                              order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 
                                              'bg-slate-100 text-slate-800'}`}>
                                            {order.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 flex items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-lg">
                                No recent orders to show.
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-1 shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle>Low Stock Items</CardTitle>
                        <CardDescription>Medicines to reorder soon</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {lowStockList.length > 0 ? (
                            <div className="space-y-4">
                                {lowStockList.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div>
                                            <p className="font-medium text-slate-900 text-sm">{item.name}</p>
                                            <p className="text-xs text-rose-500 font-medium">{item.stock} left in stock</p>
                                        </div>
                                        <div className="text-sm font-medium text-slate-600">
                                            ₹{item.price}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 flex items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-lg">
                                All inventory levels normal.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ChemistOverview;
