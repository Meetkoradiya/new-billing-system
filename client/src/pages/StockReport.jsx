import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Chart } from 'primereact/chart';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { FileDown, Package, AlertTriangle, TrendingUp, DollarSign, Search } from 'lucide-react';
import { getStockSummary } from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const StockReport = () => {
    const [stockData, setStockData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [stats, setStats] = useState({
        totalItems: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        totalValue: 0
    });
    const dt = useRef(null);
    const toast = useRef(null);

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        try {
            setLoading(true);
            const res = await getStockSummary();
            const data = res.data;
            setStockData(data);
            calculateStats(data);
            prepareChartData(data);
        } catch (error) {
            console.error(error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load stock data' });
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const totalItems = data.length;
        const lowStockItems = data.filter(item => parseFloat(item.current_stock) > 0 && parseFloat(item.current_stock) < 10).length;
        const outOfStockItems = data.filter(item => parseFloat(item.current_stock) <= 0).length;
        const totalValue = data.reduce((acc, item) => acc + (parseFloat(item.stock_value) || 0), 0);

        setStats({ totalItems, lowStockItems, outOfStockItems, totalValue });
    };

    const prepareChartData = (data) => {
        // Top 5 items by Stock Value
        const sortedByValue = [...data].sort((a, b) => parseFloat(b.stock_value) - parseFloat(a.stock_value)).slice(0, 5);

        const documentStyle = getComputedStyle(document.documentElement);
        const primaryColor = documentStyle.getPropertyValue('--primary-color');
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        const chartData = {
            labels: sortedByValue.map(item => item.item_name),
            datasets: [
                {
                    label: 'Stock Value (₹)',
                    data: sortedByValue.map(item => parseFloat(item.stock_value)),
                    backgroundColor: [
                        'rgba(79, 70, 229, 0.8)',
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(129, 140, 248, 0.8)',
                        'rgba(165, 180, 252, 0.8)',
                        'rgba(199, 210, 254, 0.8)'
                    ],
                    borderColor: primaryColor,
                    borderWidth: 1,
                    borderRadius: 8,
                    barThickness: 30
                }
            ]
        };

        const chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };

        setChartData(chartData);
        setChartOptions(chartOptions);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    };

    const stockStatusBodyTemplate = (rowData) => {
        const stock = parseFloat(rowData.current_stock);
        if (stock <= 0) return <Tag severity="danger" value="Out of Stock" icon="pi pi-times-circle" rounded />;
        if (stock < 10) return <Tag severity="warning" value="Low Stock" icon="pi pi-exclamation-triangle" rounded />;
        return <Tag severity="success" value="In Stock" icon="pi pi-check-circle" rounded />;
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const exportPDF = () => {
        const input = document.getElementById('stock-export-container');
        if (input) {
            // Temporarily remove shadow for clean print
            const originalShadow = input.style.boxShadow;
            input.style.boxShadow = 'none';

            html2canvas(input, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('l', 'mm', 'a4'); // landscape
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
                pdf.save('Stock_Report.pdf');

                // Restore style
                input.style.boxShadow = originalShadow;
            });
        }
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0 text-900 font-bold text-xl">Inventory List</h4>
            <div className="flex gap-2">
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" />
                    <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search items..." className="p-inputtext-sm w-20rem" />
                </IconField>
                <Button type="button" icon={<FileDown size={18} />} label="CSV" className="p-button-outlined p-button-secondary" onClick={exportCSV} />
                <Button type="button" icon={<FileDown size={18} />} label="PDF" className="p-button-outlined p-button-danger" onClick={exportPDF} />
            </div>
        </div>
    );

    const StatCard = ({ title, value, icon: Icon, color, subText }) => (
        <div className="col-12 md:col-6 lg:col-3 p-2">
            <div className="surface-card shadow-2 p-3 border-round border-left-3 h-full" style={{ borderLeftColor: color }}>
                <div className="flex justify-content-between mb-3">
                    <div>
                        <span className="block text-500 font-medium mb-3">{title}</span>
                        <div className="text-900 font-bold text-2xl">{value}</div>
                    </div>
                    <div className="flex align-items-center justify-content-center border-round" style={{ width: '2.5rem', height: '2.5rem', backgroundColor: `${color}20` }}>
                        <Icon size={20} color={color} />
                    </div>
                </div>
                <span className="text-500 text-sm">{subText}</span>
            </div>
        </div>
    );

    return (
        <div className="grid">
            <Toast ref={toast} />

            {/* Stats Section */}
            <div className="col-12 grid grid-nogutter mb-4">
                <StatCard
                    title="Total Items"
                    value={stats.totalItems}
                    icon={Package}
                    color="#4f46e5"
                    subText="Active inventory items"
                />
                <StatCard
                    title="Total Stock Value"
                    value={formatCurrency(stats.totalValue)}
                    icon={DollarSign}
                    color="#10b981"
                    subText="Based on purchase rate"
                />
                <StatCard
                    title="Low Stock Alerts"
                    value={stats.lowStockItems}
                    icon={AlertTriangle}
                    color="#f59e0b"
                    subText="Items below 10 units"
                />
                <StatCard
                    title="Out of Stock"
                    value={stats.outOfStockItems}
                    icon={FileDown}
                    color="#ef4444"
                    subText="Items with 0 quantity"
                />
            </div>

            {/* Chart Section */}
            <div className="col-12 lg:col-4 mb-4">
                <div className="surface-card shadow-2 p-4 border-round h-full flex flex-column">
                    <div className="flex align-items-center justify-content-between mb-3">
                        <span className="text-xl font-bold text-900">Top Inventory Value</span>
                        <TrendingUp className="text-primary" size={24} />
                    </div>
                    <div className="flex-grow-1 flex align-items-center justify-content-center">
                        <Chart type="bar" data={chartData} options={chartOptions} style={{ width: '100%' }} />
                    </div>
                </div>
            </div>

            {/* Main Table Section */}
            <div className="col-12 lg:col-8 mb-4">
                <div id="stock-export-container" className="surface-card shadow-2 p-4 border-round h-full">
                    <DataTable
                        ref={dt}
                        value={stockData}
                        paginator
                        rows={8}
                        header={header}
                        globalFilter={globalFilter}
                        emptyMessage="No items found."
                        className="p-datatable-sm"
                        rowHover
                        stripedRows
                        loading={loading}
                    >
                        <Column field="item_name" header="Item Name" sortable style={{ fontWeight: '500' }}></Column>
                        <Column field="unit" header="Unit" sortable style={{ width: '10%' }}></Column>
                        <Column field="current_stock" header="Stock" sortable align="right" body={(rowData) => <span className="font-bold">{rowData.current_stock}</span>}></Column>
                        <Column field="purchase_rate" header="Buy Rate" sortable align="right" body={(rowData) => formatCurrency(rowData.purchase_rate)}></Column>
                        <Column field="stock_value" header="Total Value" sortable align="right" body={(rowData) => <span className="text-primary font-bold">{formatCurrency(rowData.stock_value)}</span>}></Column>
                        <Column field="current_stock" header="Status" body={stockStatusBodyTemplate} align="center" style={{ width: '15%' }}></Column>
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default StockReport;
