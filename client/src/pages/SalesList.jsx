import React, { useState, useEffect, useRef } from 'react';
import { getSales, getSaleById } from '../services/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SalesPrint from '../components/SalesPrint';

const SalesList = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [printData, setPrintData] = useState(null);
    const toast = useRef(null);
    const printRef = useRef(null);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const response = await getSales();
            setSales(response.data);
        } catch (error) {
            console.error('Error fetching sales:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch sales history' });
        } finally {
            setLoading(false);
        }
    };

    const generatePdf = async (saleId) => {
        try {
            // 1. Fetch full details
            const response = await getSaleById(saleId);
            const saleDetails = response.data;

            // 2. Set data for the print component
            setPrintData(saleDetails);

            // 3. Wait for state update and render (using simple timeout for safety)
            setTimeout(async () => {
                try {
                    const element = printRef.current;
                    if (!element) {
                        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Print element not ready' });
                        return;
                    }

                    const canvas = await html2canvas(element, {
                        scale: 2,
                        logging: false,
                        useCORS: true
                    });
                    const imgData = canvas.toDataURL('image/png');

                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`SalesBill_${saleDetails.bill_no}.pdf`);

                    toast.current.show({ severity: 'success', summary: 'Success', detail: 'PDF Downloaded' });
                    setPrintData(null); // Clear after download
                } catch (err) {
                    console.error('PDF Generation Error:', err);
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to generate PDF' });
                }
            }, 500);

        } catch (error) {
            console.error('Error getting sale details:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load bill details' });
        }
    };

    const dateTemplate = (rowData) => {
        return new Date(rowData.bill_date).toLocaleDateString('en-IN');
    };

    const amountTemplate = (rowData) => {
        return `₹${parseFloat(rowData.grand_total).toFixed(2)}`;
    };

    const actionTemplate = (rowData) => {
        return (
            <Button
                icon="pi pi-file-pdf"
                rounded
                severity="danger"
                tooltip="Download PDF"
                onClick={() => generatePdf(rowData.id)}
            />
        );
    };

    return (
        <div className="surface-card p-4 shadow-2 border-round">
            <Toast ref={toast} />
            <div className="flex justify-content-between align-items-center mb-4">
                <h2 className="text-xl font-bold m-0 font-heading">Sales History</h2>
                <Button icon="pi pi-refresh" rounded text onClick={fetchSales} tooltip="Reload" />
            </div>

            <DataTable value={sales} loading={loading} paginator rows={10} stripedRows showGridlines tableStyle={{ minWidth: '50rem' }} sortField="bill_date" sortOrder={-1}>
                <Column field="bill_no" header="Bill No" sortable></Column>
                <Column field="bill_date" header="Date" body={dateTemplate} sortable></Column>
                <Column field="party_name" header="Farmer Name" sortable></Column>
                <Column field="payment_mode" header="Mode" sortable></Column>
                <Column field="grand_total" header="Amount" body={amountTemplate} sortable className="font-bold text-right"></Column>
                <Column body={actionTemplate} exportable={false} style={{ minWidth: '4rem', textAlign: 'center' }}></Column>
            </DataTable>

            {/* Hidden Print Component */}
            <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -1000, opacity: 0, pointerEvents: 'none' }}>
                <SalesPrint ref={printRef} data={printData} />
            </div>
        </div>
    );
};

export default SalesList;
