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

    const handlePrintTrigger = useReactToPrint({
        content: () => printRef.current,
    });

    const handlePrint = async (bill) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/purchase/${bill.id}`);
            setSelectedBill(res.data);
            setTimeout(handlePrintTrigger, 100);
        } catch (e) {
            console.error(e);
            alert("Could not load bill details for printing");
        }
    };

    const handleDownloadPdf = async (bill) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/purchase/${bill.id}`);
            setSelectedBill(res.data);

            // Wait for render
            setTimeout(async () => {
                const element = printRef.current;
                const canvas = await (await import('html2canvas')).default(element, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const jsPDF = (await import('jspdf')).default;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Purchase_${bill.bill_no}.pdf`);
            }, 500);
        } catch (e) {
            console.error(e);
            alert("Download failed");
        }
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-print" rounded text severity="secondary" aria-label="Print" onClick={() => handlePrint(rowData)} tooltip="Print" />
                <Button icon="pi pi-download" rounded text severity="success" aria-label="Download PDF" onClick={() => handleDownloadPdf(rowData)} tooltip="Download PDF" />
            </div>
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
