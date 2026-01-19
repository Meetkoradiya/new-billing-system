import React, { useState, useEffect, useRef } from 'react';
import { getAccounts, getItems, createSale, createItem } from '../services/api';
import { useReactToPrint } from 'react-to-print';
import SalesPrint from '../components/SalesPrint';

// PrimeReact Imports
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
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
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [remarks, setRemarks] = useState('');

    // Print Data
    const [printData, setPrintData] = useState(null);
    const printRef = useRef();
    const toast = useRef(null);

    // Quick Add Item State
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', unit: 'Nos', sales_rate: 0, purchase_rate: 0, stock: 0 });
    const [activeRowIndex, setActiveRowIndex] = useState(null);

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
            if (Array.isArray(accRes.data)) {
                setParties(accRes.data);
            } else {
                console.warn("Accounts API response format invalid:", accRes.data);
            }
        } catch (error) {
            console.error('Error loading parties', error);
            // toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load farmers' });
        }

        try {
            const itemRes = await getItems();
            console.log("Items API Response (Full Data):", JSON.stringify(itemRes.data, null, 2));
            if (Array.isArray(itemRes.data)) {
                setProductList(itemRes.data);
                if (itemRes.data.length === 0) {
                    toast.current.show({ severity: 'warn', summary: 'Data Check', detail: '0 Items found in database' });
                }
            } else {
                console.error("Items data is not an array:", itemRes.data);
                toast.current.show({ severity: 'error', summary: 'API Error', detail: 'Invalid item data received' });
                setProductList([]);
            }
        } catch (error) {
            console.error('Error loading items', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load items' });
        }

        if (!billNo) setBillNo(`SB-${Math.floor(Math.random() * 10000)}`);
    };

    const handleRowChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;

        // Logic for item selection
        if (field === 'item_id') {
            const item = productList.find(p => p.id === value); // value is id here from Dropdown
            if (item) {
                // Use sales_rate if available, otherwise purchase_rate or 0
                newRows[index].rate = item.sales_rate || item.purchase_rate || 0;
                newRows[index].unit = item.unit;
                newRows[index].name = item.name;
            } else {
                // Custom Item Typed
                newRows[index].name = value;
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
                payment_mode: paymentMode,
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
                payment_mode: paymentMode,
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
                setPaymentMode('Cash');
            }, 500);

        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to save bill' });
        }
    };

    // Quick Add Logic
    const handleQuickAdd = async () => {
        if (!newItem.name) return;
        try {
            const payload = {
                ...newItem,
                code: 'QA-' + Math.floor(Math.random() * 1000), // Auto-generate code
                gst_percent: 0,
                stock: newItem.stock || 0
            };
            const response = await createItem(payload);

            // Handle different response structures
            // If axios interceptor returns response.data directly, handle that.
            const newId = response.data?.id || response.id;

            if (!newId) console.warn("New ID not found in response", response);

            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Item Added Successfully' });
            setShowQuickAdd(false);

            // Optimistically add to list
            const addedItem = { ...payload, id: newId }; // If newId is undefined, item will have no ID till reload, which is arguably safer than crashing
            setProductList(prev => [...prev, addedItem]);

            // Auto Select in First Empty Row or Add New Row
            let targetIndex = rows.findIndex(r => !r.item_id);
            let updatedRows = [...rows];

            if (targetIndex === -1) {
                targetIndex = updatedRows.length;
                updatedRows.push({ id: updatedRows.length + 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' });
            }

            const row = updatedRows[targetIndex];
            row.item_id = newId;
            row.name = addedItem.name;
            row.unit = addedItem.unit;
            row.rate = parseFloat(addedItem.sales_rate) || 0;
            row.amount = (parseFloat(row.qty) || 0) * row.rate;
            setRows(updatedRows);

            setNewItem({ name: '', unit: 'Nos', sales_rate: 0, purchase_rate: 0, stock: 0 });
            // Background refresh to ensure consistency
            loadMasters();
        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to add item' });
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
                itemTemplate={(option) => <div><span className="font-bold mr-2">[{option.code}]</span>{option.name} <span className="text-secondary text-sm ml-2">(Stock: {option.stock || 0})</span></div>}
                onChange={(e) => handleRowChange(rowIndex, 'item_id', e.value)}
                placeholder="Select Item"
                filter
                filterBy="name,code"
                className="w-full"
                appendTo={document.body}
                emptyMessage="કોઈ આઈટમ મળી નથી"
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
            <div className="flex align-items-center justify-content-between mb-4">
                <h2 className="text-2xl font-bold m-0">Sales Invoice</h2>
                <Button icon="pi pi-refresh" rounded text onClick={loadMasters} tooltip="Refresh Items" />
            </div>

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
                        editable
                        filter
                    />
                </div>
                <div className="col-12 md:col-4">
                    <label className="block mb-2 font-bold">Payment Mode</label>
                    <Dropdown
                        value={paymentMode}
                        options={['Cash', 'Debit']}
                        onChange={(e) => setPaymentMode(e.value)}
                        placeholder="Select Payment Mode"
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

            <div className="flex justify-content-start mt-3 gap-2">
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

            {/* Quick Add Dialog */}
            <Dialog header="Quick Add Item" visible={showQuickAdd} onHide={() => setShowQuickAdd(false)} style={{ width: '400px' }}>
                <div className="flex flex-column gap-3">
                    <div className="flex flex-column gap-2">
                        <label>Item Name</label>
                        <InputText value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} autoFocus />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label>Unit</label>
                        <Dropdown value={newItem.unit} options={['Nos', 'Kg', 'Ltr', 'Box', 'Bag']} onChange={(e) => setNewItem({ ...newItem, unit: e.value })} />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label>Sales Rate</label>
                        <InputNumber value={newItem.sales_rate} onValueChange={(e) => setNewItem({ ...newItem, sales_rate: e.value })} mode="decimal" minFractionDigits={2} />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label>Opening Stock</label>
                        <InputNumber value={newItem.stock} onValueChange={(e) => setNewItem({ ...newItem, stock: e.value })} mode="decimal" minFractionDigits={2} />
                    </div>
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button label="Cancel" icon="pi pi-times" onClick={() => setShowQuickAdd(false)} className="p-button-text" />
                        <Button label="Save Item" icon="pi pi-check" onClick={handleQuickAdd} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default SalesBill;
