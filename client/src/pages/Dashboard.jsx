import React, { useEffect, useState, useRef } from 'react';
import { getItems, getAccounts, getSales } from '../services/api';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Chart from 'chart.js/auto';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, Package, FileText, CreditCard } from 'lucide-react';

const StatCard = ({ title, count, icon: Icon, color, trend, trendValue, subText }) => (
    <div className="surface-card p-4 h-full border-1 border-200 hover:shadow-4 transition-all transition-duration-300">
        <div className="flex justify-content-between align-items-start mb-3">
            <div>
                <span className="text-500 font-medium text-sm uppercase tracking-wide">{title}</span>
                <div className="text-900 font-bold text-3xl mt-2">{count}</div>
            </div>
            <div className={`flex align-items-center justify-content-center border-round-2xl p-2`} style={{ backgroundColor: `${color}15` }}>
                <Icon size={24} style={{ color: color }} />
            </div>
        </div>
        <div className="flex align-items-center gap-2">
            {trend === 'up' ? (
                <span className="text-green-500 font-medium text-sm flex align-items-center gap-1 bg-green-50 px-2 py-0.5 border-round-xl">
                    <ArrowUpRight size={14} /> {trendValue}
                </span>
            ) : (
                <span className="text-red-500 font-medium text-sm flex align-items-center gap-1 bg-red-50 px-2 py-0.5 border-round-xl">
                    <ArrowDownRight size={14} /> {trendValue}
                </span>
            )}
            <span className="text-500 text-xs">{subText}</span>
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
    const [loading, setLoading] = useState(true);
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        loadStats();
        // Live Refresh every 30 seconds
        const interval = setInterval(loadStats, 30000);
        return () => clearInterval(interval);
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

            const sortedSales = [...salesData].sort((a, b) => b.id - a.id).slice(0, 5);
            setRecentSales(sortedSales);

            initChart(salesData);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const initChart = (salesData) => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');

            // Simple aggregation by date for the chart
            const salesByDate = {};
            salesData.slice(-10).forEach(sale => { // Last 10 sales
                const date = new Date(sale.bill_date).toLocaleDateString();
                salesByDate[date] = (salesByDate[date] || 0) + parseFloat(sale.grand_total);
            });

            const labels = Object.keys(salesByDate);
            const data = Object.values(salesByDate);

            chartInstance.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Revenue',
                        data: data,
                        borderColor: '#3b82f6',
                        backgroundColor: (context) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
                            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
                            return gradient;
                        },
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            titleColor: '#1e293b',
                            bodyColor: '#475569',
                            borderColor: '#e2e8f0',
                            borderWidth: 1,
                            padding: 10,
                            displayColors: false
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { color: '#94a3b8' }
                        },
                        y: {
                            grid: { color: '#f1f5f9' },
                            ticks: { color: '#94a3b8', callback: (val) => '₹' + val }
                        }
                    }
                }
            });
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="flex flex-column gap-5">
            {/* Header */}
            <div className="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
                    <p className="text-500 m-0">Welcome back, here is what's happening today.</p>
                </div>
                <div className="flex align-items-center gap-2 mt-3 sm:mt-0">
                    <span className="text-sm bg-white border-1 border-200 px-3 py-2 border-round text-600 font-medium shadow-sm">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid">
                <div className="col-12 md:col-6 lg:col-3">
                    <StatCard
                        title="Total Revenue"
                        count={formatCurrency(counts.totalRevenue)}
                        icon={TrendingUp}
                        color="#3b82f6"
                        trend="up"
                        trendValue="12.5%"
                        subText="vs last month"
                    />
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <StatCard
                        title="Active Farmers"
                        count={counts.accounts}
                        icon={Users}
                        color="#10b981"
                        trend="up"
                        trendValue="4.2%"
                        subText="new verified"
                    />
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <StatCard
                        title="Products In Stock"
                        count={counts.items}
                        icon={Package}
                        color="#f59e0b"
                        trend="down"
                        trendValue="1.8%"
                        subText="low stock alerts"
                    />
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <StatCard
                        title="Sales Invoices"
                        count={counts.sales}
                        icon={FileText}
                        color="#8b5cf6"
                        trend="up"
                        trendValue="8.4%"
                        subText="processed"
                    />
                </div>
            </div>

            <div className="grid">
                {/* Main Content: Chart & Table */}
                <div className="col-12 lg:col-8 flex flex-column gap-4">
                    {/* Revenue Chart */}
                    <div className="surface-card p-4 border-round shadow-sm border-1 border-200">
                        <div className="flex align-items-center justify-content-between mb-4">
                            <h3 className="text-xl font-bold m-0">Revenue Analytics</h3>
                            <Button icon="pi pi-ellipsis-h" className="p-button-text p-button-secondary p-button-rounded text-500" />
                        </div>
                        <div className="h-20rem w-full relative">
                            <canvas ref={chartRef}></canvas>
                        </div>
                    </div>

                    {/* Recent Sales Table */}
                    <div className="surface-card p-4 border-round shadow-sm border-1 border-200">
                        <div className="flex align-items-center justify-content-between mb-3">
                            <h3 className="text-xl font-bold m-0">Recent Transactions</h3>
                            <Link to="/sales">
                                <Button label="View All" icon="pi pi-arrow-right" className="p-button-text p-button-sm font-medium" />
                            </Link>
                        </div>
                        <DataTable value={recentSales} responsiveLayout="scroll" size="small" stripedRows rowHover>
                            <Column field="bill_no" header="Bill No" body={(d) => <span className="font-medium text-primary">#{d.bill_no}</span>}></Column>
                            <Column field="party_name" header="Party"></Column>
                            <Column field="bill_date" header="Date" body={(d) => new Date(d.bill_date).toLocaleDateString()}></Column>
                            <Column field="payment_mode" header="Status" body={(d) => (
                                <span className={`text-xs font-bold px-2 py-1 border-round ${d.payment_mode === 'Cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {d.payment_mode || 'Credit'}
                                </span>
                            )}></Column>
                            <Column field="grand_total" header="Amount" body={(d) => <span className="font-bold text-900">{formatCurrency(d.grand_total)}</span>} className="text-right"></Column>
                        </DataTable>
                    </div>
                </div>

                {/* Sidebar: Quick Actions & Notifications */}
                <div className="col-12 lg:col-4 flex flex-column gap-4">
                    <div className="surface-card p-4 border-round shadow-sm border-1 border-200">
                        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                        <div className="flex flex-column gap-3">
                            <Link to="/sales" className="no-underline">
                                <Button className="w-full text-left justify-content-between p-3" severity="primary">
                                    <span className="flex align-items-center gap-2 font-medium">
                                        <FileText size={18} /> New Sales Invoice
                                    </span>
                                    <i className="pi pi-angle-right" />
                                </Button>
                            </Link>
                            <Link to="/parties" className="no-underline">
                                <Button className="w-full text-left justify-content-between p-3 p-button-outlined p-button-secondary">
                                    <span className="flex align-items-center gap-2 font-medium text-900">
                                        <Users size={18} /> Add New Farmer
                                    </span>
                                    <i className="pi pi-angle-right" />
                                </Button>
                            </Link>
                            <Link to="/items" className="no-underline">
                                <Button className="w-full text-left justify-content-between p-3 p-button-outlined p-button-secondary">
                                    <span className="flex align-items-center gap-2 font-medium text-900">
                                        <Package size={18} /> Add Product
                                    </span>
                                    <i className="pi pi-angle-right" />
                                </Button>
                            </Link>
                            <Link to="/purchase" className="no-underline">
                                <Button className="w-full text-left justify-content-between p-3 p-button-outlined p-button-secondary">
                                    <span className="flex align-items-center gap-2 font-medium text-900">
                                        <CreditCard size={18} /> Purchase Entry
                                    </span>
                                    <i className="pi pi-angle-right" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
