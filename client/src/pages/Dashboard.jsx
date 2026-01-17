import React, { useEffect, useState } from 'react';
import { getItems, getAccounts, getSales } from '../services/api';
import { Users, Package, FileText, TrendingUp } from 'lucide-react';

const StatCard = ({ title, count, icon: Icon, color }) => (
    <div className="surface-card shadow-2 p-3 border-round h-full flex align-items-center">
        <div className="flex align-items-center justify-content-center border-circle mr-3" style={{ width: '3rem', height: '3rem', backgroundColor: color + '20' }}>
            <Icon size={24} color={color} />
        </div>
        <div>
            <div className="text-500 font-medium mb-1">{title}</div>
            <div className="text-900 font-bold text-2xl">{count}</div>
        </div>
    </div>
);

const Dashboard = () => {
    const [counts, setCounts] = useState({
        accounts: 0,
        items: 0,
        sales: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [acc, item, sale] = await Promise.all([
                getAccounts(),
                getItems(),
                getSales()
            ]);

            const revenue = sale.data.reduce((sum, s) => sum + parseFloat(s.grand_total || 0), 0);

            setCounts({
                accounts: acc.data.length,
                items: item.data.length,
                sales: sale.data.length,
                totalRevenue: revenue
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <div className="grid">
                <div className="col-12 md:col-6 lg:col-3">
                    <StatCard title="Total Parties" count={counts.accounts} icon={Users} color="#0078d4" />
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <StatCard title="Total Products" count={counts.items} icon={Package} color="#107c10" />
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <StatCard title="Total Invoices" count={counts.sales} icon={FileText} color="#d83b01" />
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <StatCard title="Total Revenue" count={`₹${counts.totalRevenue.toFixed(0)}`} icon={TrendingUp} color="#8764b8" />
                </div>
            </div>

            <div className="surface-card shadow-2 p-4 border-round mt-4">
                <h3 className="text-xl font-medium mb-3">Quick Actions</h3>
                <div className="flex gap-2">
                    <a href="/sales" className="p-button p-component no-underline">
                        <span className="p-button-label p-c">New Sales Bill</span>
                    </a>
                    <a href="/parties" className="p-button p-component p-button-success no-underline">
                        <span className="p-button-label p-c">Add Customer</span>
                    </a>
                    <a href="/items" className="p-button p-component p-button-warning no-underline">
                        <span className="p-button-label p-c">Add Product</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
