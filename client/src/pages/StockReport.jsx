import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const StockReport = () => {
    const [stockData, setStockData] = useState([]);

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports/stock`);
            setStockData(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="surface-card p-4 shadow-2 border-round">
            <h2 className="text-xl font-bold mb-4">Stock Status Report</h2>

            <DataTable value={stockData} paginator rows={10} stripedRows tableStyle={{ minWidth: '50rem' }}>
                <Column field="item_name" header="Item Name" sortable></Column>
                <Column field="unit" header="Unit" sortable></Column>
                <Column field="total_purchased" header="Total Purchased" sortable className="text-right font-medium"></Column>
                <Column field="total_sold" header="Total Sold" sortable className="text-right font-medium"></Column>
                <Column field="current_stock" header="Available Stock" sortable className="text-right font-bold text-primary"></Column>
            </DataTable>
        </div>
    );
};

export default StockReport;
