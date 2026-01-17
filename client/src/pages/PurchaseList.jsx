import React, { useEffect, useState, useRef } from 'react';
import { getPurchases } from '../services/api';
import { useReactToPrint } from 'react-to-print';
import PurchasePrint from '../components/PurchasePrint';
import axios from 'axios';

// PrimeReact Imports
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

const PurchaseList = () => {
    const [purchases, setPurchases] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const printRef = useRef();

    useEffect(() => {
        loadPurchases();
    }, []);

    const loadPurchases = async () => {
        try {
            const res = await getPurchases();
            setPurchases(res.data);
        } catch (error) {
            console.error('Error loading purchases', error);
        }
    };

    const handlePrint = async (bill) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/purchase/${bill.id}`);
            setSelectedBill(res.data);

            // Allow state update then print
            setTimeout(handlePrintTrigger, 100);
        } catch (e) {
            console.error(e);
            alert("Could not load bill details for printing");
        }
    };

    const handlePrintTrigger = useReactToPrint({
        content: () => printRef.current,
    });

    const actionBodyTemplate = (rowData) => {
        return (
            <Button icon="pi pi-print" rounded text severity="secondary" aria-label="Print" onClick={() => handlePrint(rowData)} />
        );
    };

    const dateBodyTemplate = (rowData) => {
        return new Date(rowData.bill_date).toLocaleDateString();
    };

    const amountBodyTemplate = (rowData) => {
        return parseFloat(rowData.grand_total).toFixed(2);
    };

    return (
        <div className="surface-card p-4 shadow-2 border-round">
            <h2 className="text-xl font-bold mb-4">Purchase History (Company Purchases)</h2>

            <DataTable value={purchases} paginator rows={10} stripedRows tableStyle={{ minWidth: '50rem' }}>
                <Column field="bill_date" header="Date" body={dateBodyTemplate} sortable></Column>
                <Column field="bill_no" header="Bill No" sortable></Column>
                <Column field="party_name" header="Supplier / Company" sortable></Column>
                <Column field="grand_total" header="Total Amount" body={amountBodyTemplate} sortable className="text-right"></Column>
                <Column body={actionBodyTemplate} header="Action" className="text-center" style={{ width: '10%' }}></Column>
            </DataTable>

            {/* Hidden Print Component */}
            <div style={{ display: 'none' }}>
                <PurchasePrint ref={printRef} data={selectedBill} />
            </div>
        </div>
    );
};

export default PurchaseList;
