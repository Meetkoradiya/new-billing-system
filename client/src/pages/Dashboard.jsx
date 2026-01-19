import React, { useEffect, useState } from 'react';
import { getItems, getAccounts, getSales } from '../services/api';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const StatCard = ({ title, count, icon, color }) => (
    <div className="surface-card shadow-2 p-3 border-round h-full flex align-items-center">
        <div className="flex align-items-center justify-content-center border-circle mr-3" style={{ width: '3rem', height: '3rem', backgroundColor: color + '20' }}>
            <i className={`pi ${icon} text-xl`} style={{ color: color }}></i>
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
    const [recentSales, setRecentSales] = useState([]);

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

            const salesData = sale.data || [];
            const revenue = salesData.reduce((sum, s) => sum + parseFloat(s.grand_total || 0), 0);

            setCounts({
                accounts: acc.data.length,
                items: item.data.length,
                sales: salesData.length,
                totalRevenue: revenue
            });

            // Sort by ID desc (assuming higher ID is newer) and take top 5
            const sortedSales = [...salesData].sort((a, b) => b.id - a.id).slice(0, 5);
            setRecentSales(sortedSales);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="surface-ground">
            <div className="grid">
                <div className="col-12 md:col-6 lg:col-3">
                    <StatCard title="Total Parties" count={counts.accounts} icon="pi-users" color="#0078d4" />
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <StatCard title="Total Products" count={counts.items} icon="pi-box" color="#107c10" />
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <StatCard title="Total Invoices" count={counts.sales} icon="pi-file" color="#d83b01" />
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <StatCard title="Total Revenue" count={`₹${counts.totalRevenue.toLocaleString('en-IN')}`} icon="pi-chart-line" color="#8764b8" />
                </div>
            </div>

            <div className="surface-card shadow-2 p-4 border-round mt-4">
                <h3 className="text-xl font-medium mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <Link to="/sales">
                        <Button label="New Sales Bill" icon="pi pi-plus" size="large" />
                    </Link>
                    <Link to="/parties">
                        <Button label="Add Farmer/Company" icon="pi pi-user-plus" severity="success" size="large" />
                    </Link>
                    <Link to="/items">
                        <Button label="Add Product" icon="pi pi-box" severity="warning" size="large" />
                    </Link>
                    <Link to="/purchase">
                        <Button label="Purchase Entry" icon="pi pi-shopping-cart" severity="help" size="large" />
                    </Link>
                </div>
            </div>
            <div className="surface-card shadow-2 p-4 border-round mt-4">
                <div className="flex align-items-center justify-content-between mb-3">
                    <h3 className="text-xl font-medium m-0">Recent Sales</h3>
                    <Link to="/sales-list"> {/* Assuming there might be a list page or just reusing sales link */}
                        <Button label="View All" icon="pi pi-arrow-right" text />
                    </Link>
                </div>
                <DataTable value={recentSales} responsiveLayout="scroll" size="small" stripedRows>
                    <Column field="bill_no" header="Bill No"></Column>
                    <Column field="bill_date" header="Date" body={(rowData) => new Date(rowData.bill_date).toLocaleDateString()}></Column>
                    <Column field="party_name" header="Party Name"></Column>
                    <Column field="payment_mode" header="Mode"></Column>
                    <Column field="grand_total" header="Amount" body={(rowData) => `₹${parseFloat(rowData.grand_total).toFixed(2)}`} className="font-bold text-right"></Column>
                </DataTable>
            </div>
        </div>
    );
};

export default Dashboard;
