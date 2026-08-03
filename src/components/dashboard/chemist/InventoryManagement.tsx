import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, PackageOpen, Loader2, Trash2 } from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ChemistMedicine } from "@/lib/types";

// Dialog components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Mock Data
const MOCK_INVENTORY = [
    { id: "1", name: "Paracetamol 500mg", stock: 154, price: 50, status: "In Stock" },
    { id: "2", name: "Amoxicillin 250mg", stock: 12, price: 120, status: "Low Stock" },
    { id: "3", name: "Ibuprofen 400mg", stock: 0, price: 80, status: "Out of Stock" },
    { id: "4", name: "Vitamin C 1000mg", stock: 85, price: 150, status: "In Stock" },
    { id: "5", name: "Cetirizine 10mg", stock: 210, price: 45, status: "In Stock" },
];

const InventoryManagement = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [inventory, setInventory] = useState<ChemistMedicine[]>([]);
    const [loading, setLoading] = useState(true);

    // Add Medicine State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newMedicine, setNewMedicine] = useState({ name: "", stock: "", price: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "chemist_inventory"), where("chemistId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ChemistMedicine));
            
            setInventory(items);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching inventory:", error);
            toast({ variant: "destructive", title: "Error loading inventory", description: error.message });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, toast]);

    const handleAddMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        const stockNum = parseInt(newMedicine.stock);
        const priceNum = parseFloat(newMedicine.price);
        
        if (isNaN(stockNum) || isNaN(priceNum) || !newMedicine.name) {
            toast({ variant: "destructive", title: "Invalid Input", description: "Please provide valid numbers for stock and price." });
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "chemist_inventory"), {
                chemistId: user.uid,
                name: newMedicine.name,
                stock: stockNum,
                price: priceNum,
                status: stockNum === 0 ? "Out of Stock" : stockNum < 20 ? "Low Stock" : "In Stock",
                createdAt: serverTimestamp()
            });
            
            toast({ title: "Medicine Added", description: `${newMedicine.name} was added to your inventory.` });
            setIsAddOpen(false);
            setNewMedicine({ name: "", stock: "", price: "" });
        } catch (error: any) {
            console.error("Error adding medicine:", error);
            toast({ variant: "destructive", title: "Failed to add medicine", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        
        try {
            await deleteDoc(doc(db, "chemist_inventory", id));
            toast({ title: "Medicine Deleted", description: `${name} has been removed.` });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Delete Failed", description: error.message });
        }
    };

    const filteredInventory = inventory.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inventory Management</h1>
                    <p className="text-slate-500 mt-2">Manage your medicines, stock levels, and pricing.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gradient-vitality text-white shadow-md">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Medicine
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Medicine</DialogTitle>
                            <DialogDescription>
                                Enter the details of the new medicine to add to your inventory.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddMedicine} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Medicine Name</Label>
                                <Input 
                                    id="name" 
                                    value={newMedicine.name} 
                                    onChange={e => setNewMedicine({...newMedicine, name: e.target.value})} 
                                    placeholder="e.g. Paracetamol 500mg" 
                                    required 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="stock">Stock Quantity</Label>
                                    <Input 
                                        id="stock" 
                                        type="number" 
                                        value={newMedicine.stock} 
                                        onChange={e => setNewMedicine({...newMedicine, stock: e.target.value})} 
                                        placeholder="0" 
                                        required 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price (₹)</Label>
                                    <Input 
                                        id="price" 
                                        type="number" 
                                        step="0.01"
                                        value={newMedicine.price} 
                                        onChange={e => setNewMedicine({...newMedicine, price: e.target.value})} 
                                        placeholder="0.00" 
                                        required 
                                    />
                                </div>
                            </div>
                            <DialogFooter className="mt-4">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Adding..." : "Add Medicine"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search medicines..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-12 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : filteredInventory.length > 0 ? (
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Medicine Name</th>
                                        <th className="px-6 py-4 font-semibold text-right">Stock</th>
                                        <th className="px-6 py-4 font-semibold text-right">Price (₹)</th>
                                        <th className="px-6 py-4 font-semibold text-center">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInventory.map((item) => (
                                        <tr key={item.id} className="bg-white border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                                            <td className="px-6 py-4 text-right font-medium">{item.stock}</td>
                                            <td className="px-6 py-4 text-right text-slate-600">₹{item.price}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                                                    ${item.status === 'In Stock' ? 'bg-emerald-100 text-emerald-800' : 
                                                      item.status === 'Low Stock' ? 'bg-amber-100 text-amber-800' : 
                                                      'bg-rose-100 text-rose-800'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 -mr-2"
                                                    onClick={() => handleDelete(item.id, item.name)}
                                                    title="Delete Medicine"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-center">
                            <PackageOpen className="w-12 h-12 mb-4 text-slate-300" />
                            <p className="font-medium text-slate-900">No medicines found</p>
                            <p className="text-sm mt-1">Add items to your inventory to start managing them here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default InventoryManagement;
