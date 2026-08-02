import * as React from "react";
import { useState } from "react";
import ChemistSidebar from "@/components/dashboard/chemist/ChemistSidebar";
import ChemistOverview from "@/components/dashboard/chemist/ChemistOverview";
import InventoryManagement from "@/components/dashboard/chemist/InventoryManagement";
import OrderManagement from "@/components/dashboard/chemist/OrderManagement";

const ChemistDashboard = () => {
    const [currentView, setCurrentView] = useState<"overview" | "inventory" | "orders">("overview");

    const renderView = () => {
        switch (currentView) {
            case "overview":
                return <ChemistOverview />;
            case "inventory":
                return <InventoryManagement />;
            case "orders":
                return <OrderManagement />;
            default:
                return <ChemistOverview />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50/50">
            <ChemistSidebar currentView={currentView} onNavigate={setCurrentView} />
            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-6xl mx-auto">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

export default ChemistDashboard;
