import React, { useEffect, useState } from 'react';
import { getItems, getAccounts, getSales } from '../services/api';
import { Users, Package, FileText, TrendingUp } from 'lucide-react';

const StatCard = ({ title, count, icon: Icon, color }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', minWidth: 200, flex: 1, margin: '0 10px 0 0' }}>
        <div style={{ backgroundColor: color + '20', padding: 15, borderRadius: '50%', marginRight: 15 }}>
            <Icon size={24} color={color} />
        </div>
        <div>
            <div style={{ fontSize: 13, color: '#666' }}>{title}</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{count}</div>
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
            <h2>Dashboard</h2>
            <div style={{ display: 'flex', marginTop: 20, marginBottom: 20 }}>
                <StatCard title="Total Parties" count={counts.accounts} icon={Users} color="#0078d4" />
                <StatCard title="Total Products" count={counts.items} icon={Package} color="#107c10" />
                <StatCard title="Total Invoices" count={counts.sales} icon={FileText} color="#d83b01" />
                <StatCard title="Total Revenue" count={`₹${counts.totalRevenue.toFixed(0)}`} icon={TrendingUp} color="#8764b8" />
            </div>

            <div className="card">
                <h3>Quick Actions</h3>
                <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                    <a href="/sales" className="btn btn-primary">New Sales Bill</a>
                    <a href="/parties" className="btn btn-primary" style={{ background: '#107c10' }}>Add Customer</a>
                    <a href="/items" className="btn btn-primary" style={{ background: '#d83b01' }}>Add Product</a>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
