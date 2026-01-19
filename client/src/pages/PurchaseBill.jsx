import React, { useState, useEffect, useRef } from 'react';
import { getAccounts, getItems, createPurchase, createItem } from '../services/api';
import { useReactToPrint } from 'react-to-print';
import PurchasePrint from '../components/PurchasePrint';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
import { Dialog } from 'primereact/dialog';

const PurchaseBill = () => {
    // Master Data
    const [parties, setParties] = useState([]);
    const [productList, setProductList] = useState([]);

    // Form Data
    const [billNo, setBillNo] = useState('');
    const [billDate, setBillDate] = useState(new Date());
    const [selectedParty, setSelectedParty] = useState(null);
    const [remarks, setRemarks] = useState('');

    // Quick Add Item
    const [showItemDialog, setShowItemDialog] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        company: '',
        category: 'Pesticide',
        code: '',
        unit: 'Nos',
        purchase_rate: 0,
        gst_percent: 0,
        stock: 0
    });

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
            if (!billNo) setBillNo(`PB-${Math.floor(Math.random() * 10000)}`);
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
                newRows[index].rate = item.purchase_rate;
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
        if (!printData) return toast.current.show({ severity: 'warn', summary: 'Missing Info', detail: 'Save the bill first' });

        try {
            const element = printRef.current;
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`PurchaseBill_${billNo}.pdf`);
        } catch (error) {
            console.error('PDF Download Error:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to download PDF' });
        }
    };

    const handleSave = async () => {
        if (!selectedParty) {
            toast.current.show({ severity: 'warn', summary: 'Missing Info', detail: 'Select Supplier / Company' });
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

            await createPurchase(payload);

            // Prepare Print Data
            const printPayload = {
                bill_no: billNo,
                bill_date: billDate,
                party_name: selectedParty.name,
                items: rows.filter(r => r.item_id).map(r => ({
                    ...r,
                    item_name: r.name
                })),
                grand_total: total,
                remarks
            };
            setPrintData(printPayload);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Purchase Bill Saved!' });

            // Wait for state to update then print
            setTimeout(() => {
                const proceed = window.confirm("Bill Saved! Do you want to print?");
                if (proceed) {
                    handlePrintTrigger();
                }
                // Reset
                setBillNo(`PB-${Math.floor(Math.random() * 10000)}`);
                setRows([{ id: 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }]);
                setSelectedParty(null);
            }, 500);

        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to save bill' });
        }
    };

    // Quick Item Save
    const handleSaveItem = async () => {
        try {
            await createItem(newItem);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Product Added Successfully' });
            setShowItemDialog(false);
            setNewItem({ name: '', company: '', category: 'Pesticide', code: '', unit: 'Nos', purchase_rate: 0, gst_percent: 0, stock: 0 });
            loadMasters(); // Refresh list
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to create item' });
        }
    };

    // Table Templates
    const itemTemplate = (rowData, { rowIndex }) => {
        return (
            <div className="flex gap-2">
                <Dropdown
                    value={rowData.item_id}
                    options={productList.filter(p => !selectedParty || !p.company || p.company.toLowerCase().includes(selectedParty.name.toLowerCase()) || selectedParty.name.toLowerCase().includes(p.company.toLowerCase()))}
                    optionLabel="name"
                    optionValue="id"
                    onChange={(e) => handleRowChange(rowIndex, 'item_id', e.value)}
                    placeholder="Select Item"
                    filter
                    className="w-full"
                />
            </div>
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

    const dialogFooter = (
        <div>
            <Button label="Cancel" icon="pi pi-times" onClick={() => setShowItemDialog(false)} className="p-button-text" />
            <Button label="Save Product" icon="pi pi-check" onClick={handleSaveItem} autoFocus />
        </div>
    );

    return (
        <div className="surface-card p-4 shadow-2 border-round">
            <Toast ref={toast} />
            <h2 className="text-2xl font-bold mb-4">Purchase Entry</h2>

            <div className="grid p-fluid">
                <div className="col-12 md:col-4">
                    <label className="block mb-2 font-bold">Purchase Bill No</label>
                    <InputText value={billNo} onChange={(e) => setBillNo(e.target.value)} />
                </div>
                <div className="col-12 md:col-4">
                    <label className="block mb-2 font-bold">Bill Date</label>
                    <Calendar value={billDate} onChange={(e) => setBillDate(e.value)} showIcon />
                </div>
                <div className="col-12 md:col-4">
                    <label className="block mb-2 font-bold">Company / Supplier</label>
                    <Dropdown
                        value={selectedParty}
                        options={parties.filter(p => p.group_id === 2)}
                        optionLabel="name"
                        onChange={(e) => setSelectedParty(e.value)}
                        placeholder="Select Company"
                        filter
                    />
                </div>
            </div>

            <DataTable value={rows} className="mt-4" stripedRows>
                <Column header="Item Name" body={itemTemplate} style={{ width: '40%' }}></Column>
                <Column field="unit" header="Unit" style={{ width: '10%' }}></Column>
                <Column header="Qty" body={qtyTemplate} style={{ width: '15%' }}></Column>
                <Column header="Rate" body={rateTemplate} style={{ width: '15%' }}></Column>
                <Column field="amount" header="Amount" body={amountTemplate} className="text-right font-bold" style={{ width: '15%' }}></Column>
                <Column body={actionTemplate} style={{ width: '5%' }}></Column>
            </DataTable>

            <div className="flex align-items-center mt-3 gap-2">
                <Button label="Add Item" icon="pi pi-plus" onClick={addRow} severity="secondary" />
                <Button label="New Product" icon="pi pi-box" onClick={() => setShowItemDialog(true)} severity="info" outlined />
            </div>

            <div className="flex justify-content-end mt-4">
                <Card className="w-12 md:w-4 surface-50">
                    <div className="flex justify-content-between pt-3 border-top-1 border-300">
                        <span className="text-xl font-bold">Grand Total:</span>
                        <span className="text-xl font-bold text-primary">{calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <Button label="Save Purchase" icon="pi pi-save" onClick={handleSave} severity="success" className="flex-1" />
                        <Button label="Download PDF" icon="pi pi-download" onClick={handleDownloadPdf} severity="secondary" className="flex-1" disabled={!printData} />
                    </div>
                </Card>
            </div>

            {/* Quick Add Dialog */}
            <Dialog header="Add New Product" visible={showItemDialog} style={{ width: '40vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }} onHide={() => setShowItemDialog(false)} footer={dialogFooter} onShow={() => {
                if (selectedParty && !newItem.company) {
                    setNewItem(prev => ({ ...prev, company: selectedParty.name }));
                }
            }}>
                <div className="col-12">
                    <label className="block mb-2 font-medium">Item Name</label>
                    <InputText value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} autoFocus />
                </div>
                <div className="col-12">
                    <label className="block mb-2 font-medium">Company / Brand</label>
                    <Dropdown
                        value={newItem.company}
                        options={parties.filter(p => p.group_id === 2)}
                        optionLabel="name"
                        optionValue="name"
                        onChange={(e) => setNewItem({ ...newItem, company: e.value })}
                        placeholder="Select Company"
                        editable
                        filter
                        className="w-full"
                    />
                </div>
                <div className="col-6">
                    <label className="block mb-2 font-medium">Category</label>
                    <Dropdown value={newItem.category} options={['Pesticide', 'Seeds']} onChange={(e) => setNewItem({ ...newItem, category: e.value })} placeholder="Select Category" />
                </div>
                <div className="col-6">
                    <label className="block mb-2 font-medium">Unit</label>
                    <Dropdown value={newItem.unit} options={['Nos', 'Kg', 'Ltr', 'Box', 'Bag']} onChange={(e) => setNewItem({ ...newItem, unit: e.value })} placeholder="Select Unit" />
                </div>
                <div className="col-12">
                    <label className="block mb-2 font-medium">Purchase Rate</label>
                    <InputNumber value={newItem.purchase_rate} onValueChange={(e) => setNewItem({ ...newItem, purchase_rate: e.value })} mode="decimal" minFractionDigits={2} />
                </div>
                <div className="col-12">
                    <label className="block mb-2 font-medium">Opening Stock</label>
                    <InputNumber value={newItem.stock} onValueChange={(e) => setNewItem({ ...newItem, stock: e.value })} mode="decimal" minFractionDigits={2} />
                </div>
            </Dialog>

            {/* Hidden Print Component */}
            <div style={{ display: 'none' }}>
                <PurchasePrint ref={printRef} data={printData} />
            </div>
        </div>
    );
};

export default PurchaseBill;
