import React, { useState, useEffect, useRef } from 'react';
import { getAccounts, getItems, createSale } from '../services/api';
import { useReactToPrint } from 'react-to-print';
import SalesPrint from '../components/SalesPrint';

// PrimeReact Imports
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';

const SalesBill = () => {
    // Master Data
    const [parties, setParties] = useState([]);
    const [productList, setProductList] = useState([]);

    // Form Data
    const [billNo, setBillNo] = useState('');
    const [billDate, setBillDate] = useState(new Date());
    const [selectedParty, setSelectedParty] = useState(null);
    const [remarks, setRemarks] = useState('');

    // Print Data
    const [printData, setPrintData] = useState(null);
    const printRef = useRef();
    const toast = useRef(null);

    // Grid Data
    const [rows, setRows] = useState([
        { id: 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }
    ]);

    useEffect(() => {
        loadMasters();
    }, []);

    const loadMasters = async () => {
        try {
            const accRes = await getAccounts();
            const itemRes = await getItems();
            setParties(accRes.data);
            setProductList(itemRes.data);
            setBillNo(`SB-${Math.floor(Math.random() * 10000)}`);
        } catch (error) {
            console.error('Error loading masters', error);
        }
    };

    const handleRowChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;

        // Logic for item selection
        if (field === 'item_id') {
            const item = productList.find(p => p.id === value); // value is id here from Dropdown
            if (item) {
                newRows[index].rate = item.sales_rate;
                newRows[index].unit = item.unit;
                newRows[index].name = item.name;
            }
        }

        // Calc Amount
        if (field === 'qty' || field === 'rate' || field === 'item_id') {
            const qty = parseFloat(newRows[index].qty) || 0;
            const rate = parseFloat(newRows[index].rate) || 0;
            newRows[index].amount = qty * rate;
        }

        setRows(newRows);
    };

    const addRow = () => {
        setRows([...rows, { id: rows.length + 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }]);
    };

    const removeRow = (rowData) => {
        const newRows = rows.filter(r => r.id !== rowData.id);
        setRows(newRows);
    };

    const calculateTotal = () => {
        return rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
    };

    const handlePrintTrigger = useReactToPrint({
        content: () => printRef.current,
    });

    const handleDownloadPdf = async () => {
        if (!printData) return alert('Save the bill first to download PDF');

        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            const element = printRef.current;
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Invoice_${billNo}.pdf`);
        } catch (error) {
            console.error('PDF Download Error:', error);
            alert('Failed to download PDF');
        }
    };

    const handleSave = async () => {
        if (!selectedParty) {
            toast.current.show({ severity: 'warn', summary: 'Missing Info', detail: 'Select Farmer / Party' });
            return;
        }
        if (rows.length === 0 || !rows[0].item_id) {
            toast.current.show({ severity: 'warn', summary: 'Missing Info', detail: 'Add at least one item' });
            return;
        }

        try {
            const total = calculateTotal();
            const payload = {
                bill_no: billNo,
                bill_date: billDate.toISOString().split('T')[0],
                account_id: selectedParty.id,
                remarks,
                items: rows.filter(r => r.item_id).map(r => ({
                    item_id: r.item_id,
                    qty: r.qty,
                    rate: r.rate,
                    amount: r.amount
                }))
            };

            await createSale(payload);

            // Prepare Print Data
            const printPayload = {
                bill_no: billNo,
                bill_date: billDate,
                party_name: selectedParty.name,
                items: rows.filter(r => r.item_id).map(r => ({
                    ...r,
                    item_name: r.name
                })),
                sub_total: total,
                grand_total: total,
                remarks
            };
            setPrintData(printPayload);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Sales Bill Saved!' });

            // Wait for state to update then print
            setTimeout(() => {
                const proceed = window.confirm("Bill Saved! Do you want to print?");
                if (proceed) {
                    handlePrintTrigger();
                }
                // Reset
                setBillNo(`SB-${Math.floor(Math.random() * 10000)}`);
                setRows([{ id: 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }]);
                setSelectedParty(null);
            }, 500);

        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to save bill' });
        }
    };

    // Table Templates
    const itemTemplate = (rowData, { rowIndex }) => {
        return (
            <Dropdown
                value={rowData.item_id}
                options={productList}
                optionLabel="name"
                optionValue="id"
                onChange={(e) => handleRowChange(rowIndex, 'item_id', e.value)}
                placeholder="Select Item"
                filter
                className="w-full"
            />
        );
    };

    const qtyTemplate = (rowData, { rowIndex }) => {
        return (
            <InputNumber
                value={rowData.qty}
                onValueChange={(e) => handleRowChange(rowIndex, 'qty', e.value)}
                min={0}
                mode="decimal"
                minFractionDigits={0}
                className="w-full"
                inputClassName="text-right"
            />
        );
    };

    const rateTemplate = (rowData, { rowIndex }) => {
        return (
            <InputNumber
                value={rowData.rate}
                onValueChange={(e) => handleRowChange(rowIndex, 'rate', e.value)}
                min={0}
                mode="decimal"
                minFractionDigits={2}
                className="w-full"
                inputClassName="text-right"
            />
        );
    };

    const amountTemplate = (rowData) => {
        return parseFloat(rowData.amount).toFixed(2);
    };

    const actionTemplate = (rowData) => {
        return <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => removeRow(rowData)} />;
    };

    return (
        <div className="surface-card p-4 shadow-2 border-round">
            <Toast ref={toast} />
            <h2 className="text-2xl font-bold mb-4">Sales Invoice</h2>

            <div className="grid p-fluid">
                <div className="col-12 md:col-4">
                    <label className="block mb-2 font-bold">Bill No</label>
                    <InputText value={billNo} disabled />
                </div>
                <div className="col-12 md:col-4">
                    <label className="block mb-2 font-bold">Bill Date</label>
                    <Calendar value={billDate} onChange={(e) => setBillDate(e.value)} showIcon />
                </div>
                <div className="col-12 md:col-4">
                    <label className="block mb-2 font-bold">Farmer Name</label>
                    <Dropdown
                        value={selectedParty}
                        options={parties.filter(p => p.group_id === 1)}
                        optionLabel="name"
                        onChange={(e) => setSelectedParty(e.value)}
                        placeholder="Select Farmer"
                        filter
                    />
                </div>
            </div>

            <DataTable value={rows} className="mt-4" stripedRows scrollable>
                <Column header="Item Name" body={itemTemplate} style={{ minWidth: '200px' }}></Column>
                <Column field="unit" header="Unit" style={{ minWidth: '80px' }}></Column>
                <Column header="Qty" body={qtyTemplate} style={{ minWidth: '100px' }}></Column>
                <Column header="Rate" body={rateTemplate} style={{ minWidth: '100px' }}></Column>
                <Column field="amount" header="Amount" body={amountTemplate} className="text-right font-bold" style={{ minWidth: '100px' }}></Column>
                <Column body={actionTemplate} style={{ width: '50px' }}></Column>
            </DataTable>

            <div className="flex justify-content-start mt-3">
                <Button label="Add Item" icon="pi pi-plus" onClick={addRow} severity="secondary" />
            </div>

            <div className="flex justify-content-end mt-4">
                <Card className="w-12 md:w-4 surface-50">
                    <div className="flex justify-content-between mb-2">
                        <span className="font-medium">Sub Total:</span>
                        <span className="font-bold">{calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-content-between mb-3">
                        <span className="font-medium">Tax:</span>
                        <span className="font-bold">0.00</span>
                    </div>
                    <div className="flex justify-content-between pt-3 border-top-1 border-300">
                        <span className="text-xl font-bold">Grand Total:</span>
                        <span className="text-xl font-bold text-primary">{calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <Button label="Save & Print" icon="pi pi-print" onClick={handleSave} className="flex-1" />
                        <Button label="Download PDF" icon="pi pi-download" onClick={handleDownloadPdf} severity="secondary" className="flex-1" disabled={!printData} />
                    </div>
                </Card>
            </div>

            {/* Hidden Print Component */}
            <div style={{ display: 'none' }}>
                <SalesPrint ref={printRef} data={printData} />
            </div>
        </div>
    );
};

export default SalesBill;
