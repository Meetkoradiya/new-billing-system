import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';

const PaymentReport = () => {
    const [stats, setStats] = useState({
        cash: { count: 0, total: 0 },
        debit: { count: 0, total: 0 }
    });
    const [transactions, setTransactions] = useState([]);
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        fetchPaymentStats();
        fetchTransactions();
    }, []);

    const fetchPaymentStats = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports/payments`);
            setStats(res.data);
            initChart(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/sales`);
            setTransactions(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const initChart = (data) => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        const chartData = {
            labels: ['Cash (Profit)', 'Debit (Udhar)'],
            datasets: [
                {
                    data: [data.cash.total, data.debit.total],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--green-500'),
                        documentStyle.getPropertyValue('--yellow-500')
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--green-400'),
                        documentStyle.getPropertyValue('--yellow-400')
                    ]
                }
            ]
        };

        const options = {
            cutout: '60%',
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            }
        };

        setChartData(chartData);
        setChartOptions(options);
    };

    const modeTemplate = (rowData) => {
        const mode = rowData.payment_mode || 'Cash';
        return <Tag severity={mode === 'Cash' ? 'success' : 'warning'} value={mode} />;
    };

    const amountTemplate = (rowData) => {
        return <span className="font-bold">₹{parseFloat(rowData.grand_total).toFixed(2)}</span>;
    };

    return (
        <div className="surface-ground">
            <h2 className="text-2xl font-bold mb-4">Payment Analysis (Cash vs Debit)</h2>

            <div className="grid mb-4">
                <div className="col-12 md:col-6 lg:col-6">
                    <Card title="Total Cash (In-Hand)" subTitle="Realized Profit" className="surface-0 shadow-2 border-left-3 border-green-500">
                        <div className="flex justify-content-between align-items-center">
                            <div>
                                <span className="text-3xl font-bold text-green-600">₹{stats.cash.total.toLocaleString('en-IN')}</span>
                                <div className="text-500 mt-2">{stats.cash.count} Bills</div>
                            </div>
                            <i className="pi pi-money-bill text-green-500 text-5xl"></i>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-6 lg:col-6">
                    <Card title="Total Debit (Udhar)" subTitle="Pending Payments" className="surface-0 shadow-2 border-left-3 border-yellow-500">
                        <div className="flex justify-content-between align-items-center">
                            <div>
                                <span className="text-3xl font-bold text-yellow-600">₹{stats.debit.total.toLocaleString('en-IN')}</span>
                                <div className="text-500 mt-2">{stats.debit.count} Bills</div>
                            </div>
                            <i className="pi pi-wallet text-yellow-500 text-5xl"></i>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid">
                <div className="col-12 lg:col-4">
                    <div className="surface-card shadow-2 border-round p-4 h-full">
                        <h3 className="text-xl font-medium mb-4">Ratio Analysis</h3>
                        <Chart type="doughnut" data={chartData} options={chartOptions} className="w-full" />
                    </div>
                </div>
                <div className="col-12 lg:col-8">
                    <div className="surface-card shadow-2 border-round p-4 h-full">
                        <h3 className="text-xl font-medium mb-4">Recent Transactions</h3>
                        <DataTable value={transactions} paginator rows={5} stripedRows>
                            <Column field="bill_no" header="Bill No" sortable></Column>
                            <Column field="party_name" header="Farmer Name" sortable></Column>
                            <Column field="payment_mode" header="Mode" body={modeTemplate} sortable></Column>
                            <Column field="grand_total" header="Amount" body={amountTemplate} sortable className="text-right"></Column>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentReport;
