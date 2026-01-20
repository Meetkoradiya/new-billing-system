import React, { useState, useEffect, useRef, useMemo } from 'react';
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
    const [newItem, setNewItem] = useState({ name: '', company: '', unit: 'Nos', sales_rate: 0, purchase_rate: 0, stock: 0 });

    // Grid Data
    const [rows, setRows] = useState([
        { id: 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }
    ]);

    // Derived options for dropdown
    const itemOptions = useMemo(() => productList.map(p => ({
        ...p,
        label: p.company ? `${p.name} (${p.company})` : p.name
    })), [productList]);

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
        }

        try {
            const itemRes = await getItems();
            if (Array.isArray(itemRes.data)) {
                setProductList(itemRes.data);
            } else {
                setProductList([]);
            }
        } catch (error) {
            console.error('Error loading items', error);
        }

        if (!billNo) setBillNo(`SB-${Date.now()}`);
    };

    const handleRowChange = (index, field, value) => {
        setRows(prevRows => {
            return prevRows.map((row, i) => {
                if (i !== index) return row;

                // Create a shallow copy specifically for the row being modified
                const updatedRow = { ...row };

                if (field === 'item_id') {
                    let selectedItem = null;

                    if (value && typeof value === 'object') {
                        selectedItem = value;
                    } else if (typeof value === 'string') {
                        // Try to match string to an option
                        const lowerVal = value.trim().toLowerCase();
                        if (lowerVal) {
                            selectedItem = itemOptions.find(p =>
                                p.label.toLowerCase() === lowerVal ||
                                (p.name && p.name.toLowerCase() === lowerVal) ||
                                (p.code && p.code.toLowerCase() === lowerVal)
                            );
                        }
                    }

                    if (selectedItem) {
                        // Item Selected from List (Object)
                        updatedRow.item_id = selectedItem.id;
                        updatedRow.name = selectedItem.name;
                        updatedRow.company = selectedItem.company;
                        updatedRow.unit = selectedItem.unit;
                        updatedRow.rate = selectedItem.sales_rate || selectedItem.purchase_rate || 0;
                    } else {
                        // Custom Typed Value (String), or cleared
                        updatedRow.item_id = '';
                        updatedRow.name = value || '';
                        updatedRow.company = '';
                        // Keep existing rate/qty if user is just typing name
                    }
                } else {
                    updatedRow[field] = value;
                }

                // Calc Amount
                const qty = parseFloat(updatedRow.qty) || 0;
                const rate = parseFloat(updatedRow.rate) || 0;
                updatedRow.amount = qty * rate;

                return updatedRow;
            });
        });
    };

    const addRow = () => {
        setRows(prevRows => {
            // Auto-clean: Filter out empty rows
            const cleanedRows = prevRows.filter(r => r.name || r.item_id);
            const newId = cleanedRows.length > 0 ? Math.max(...cleanedRows.map(r => r.id)) + 1 : 1;
            return [...cleanedRows, { id: newId, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }];
        });
    };

    const removeRow = (rowData) => {
        setRows(prev => {
            if (prev.length === 1) {
                return [{ id: 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }];
            }
            return prev.filter(r => r.id !== rowData.id);
        });
    };

    const calculateTotal = () => {
        return rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
    };

    const handleClear = () => {
        if (window.confirm("Are you sure you want to clear the form?")) {
            setRows([{ id: 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }]);
            setSelectedParty(null);
            setPaymentMode('Cash');
            setRemarks('');
            setBillNo(`SB-${Date.now()}`);
        }
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
            alert(`Failed to download PDF: ${error.message}`);
        }
    };

    const handleSave = async () => {
        if (!selectedParty) {
            toast.current.show({ severity: 'warn', summary: 'Missing Info', detail: 'Select Farmer / Party' });
            return;
        }

        const rowsToProcess = rows.filter(r => r.name);
        if (rowsToProcess.length === 0) {
            toast.current.show({ severity: 'warn', summary: 'Missing Info', detail: 'Add at least one item' });
            return;
        }

        try {
            // Track newly created items to prevent duplicates within the same bill
            const createdItemsMap = new Map(); // Name -> ID

            const processedItems = [];

            for (const row of rowsToProcess) {
                let finalItemId = row.item_id;

                if (!finalItemId) {
                    // Check if we already created this item in this loop
                    if (createdItemsMap.has(row.name)) {
                        finalItemId = createdItemsMap.get(row.name);
                    } else {
                        // Create new item
                        try {
                            const newItemPayload = {
                                name: row.name,
                                company: '',
                                code: 'AUTO-' + Math.floor(Math.random() * 10000),
                                sales_rate: row.rate,
                                purchase_rate: row.rate,
                                unit: 'Nos',
                                stock: 0
                            };
                            const res = await createItem(newItemPayload);
                            const newId = res.data?.id || res.id;

                            // Store in map
                            createdItemsMap.set(row.name, newId);
                            finalItemId = newId;
                        } catch (err) {
                            console.error("Failed to auto-create item", row.name, err);
                            throw new Error(`Failed to create item: ${row.name}`);
                        }
                    }
                }

                processedItems.push({
                    item_id: finalItemId,
                    qty: row.qty,
                    rate: row.rate,
                    amount: row.amount
                });
            }

            const total = calculateTotal();
            const payload = {
                bill_no: billNo,
                bill_date: billDate.toISOString().split('T')[0],
                account_id: selectedParty.id,
                payment_mode: paymentMode,
                remarks,
                items: processedItems
            };

            await createSale(payload);

            const printItems = rowsToProcess.map((r, i) => {
                return {
                    ...r,
                    item_name: r.company ? `${r.name} (${r.company})` : r.name
                };
            });

            const printPayload = {
                bill_no: billNo,
                bill_date: billDate,
                party_name: selectedParty.name,
                payment_mode: paymentMode,
                items: printItems,
                sub_total: total,
                grand_total: total,
                remarks
            };
            setPrintData(printPayload);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Sales Bill Saved!' });

            setTimeout(() => {
                const proceed = window.confirm("Bill Saved! Do you want to print?");
                if (proceed) {
                    handlePrintTrigger();
                }
                setBillNo(`SB-${Date.now()}`);
                setRows([{ id: 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }]);
                setSelectedParty(null);
                setPaymentMode('Cash');
                loadMasters();
            }, 500);

        } catch (error) {
            console.error(error);
            const msg = error.message || error.response?.data?.message || 'Failed to save bill';
            toast.current.show({ severity: 'error', summary: 'Error', detail: msg });
        }
    };

    const handleQuickAdd = async () => {
        if (!newItem.name) return;
        try {
            const payload = {
                ...newItem,
                code: 'QA-' + Math.floor(Math.random() * 1000),
                gst_percent: 0,
                stock: newItem.stock || 0
            };
            const response = await createItem(payload);
            const newId = response.data?.id || response.id;

            if (!newId) console.warn("New ID not found in response", response);

            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Item Added Successfully' });
            setShowQuickAdd(false);

            const addedItem = { ...payload, id: newId };
            setProductList(prev => [...prev, addedItem]);

            let targetIndex = rows.findIndex(r => !r.item_id);
            let updatedRows = [...rows];

            if (targetIndex === -1) {
                targetIndex = updatedRows.length;
                updatedRows.push({ id: updatedRows.length + 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' });
            }

            const row = updatedRows[targetIndex];
            row.item_id = newId;
            row.name = addedItem.name;
            row.company = addedItem.company;
            row.unit = addedItem.unit;
            row.rate = parseFloat(addedItem.sales_rate) || 0;
            row.amount = (parseFloat(row.qty) || 0) * row.rate;
            setRows(updatedRows);

            setNewItem({ name: '', company: '', unit: 'Nos', sales_rate: 0, purchase_rate: 0, stock: 0 });
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
                id={`item_${rowIndex}`}
                inputId={`item_input_${rowIndex}`}
                name={`item_${rowIndex}`}
                value={itemOptions.find(p => p.id === rowData.item_id) || rowData.name}
                options={itemOptions}
                optionLabel="label"
                itemTemplate={(option) => (
                    <div className="flex align-items-center gap-2">
                        <span className="font-semibold text-primary">[{option.code}]</span>
                        <span>{option.name}</span>
                        {option.company && <span className="text-500 text-sm">({option.company})</span>}
                        <span className="text-sm text-green-600 ml-auto font-medium">Stock: {option.stock || 0}</span>
                    </div>
                )}
                onChange={(e) => handleRowChange(rowIndex, 'item_id', e.value)}
                placeholder="Select or Type Item"
                filter
                filterBy="name,code,company,label"
                editable
                className="w-full p-inputtext-sm"
                appendTo={document.body}
                emptyMessage="આઈટમ મળી નથી. નવી આઈટમ ઉમેરવા માટે બોક્સમાં લખો."
                emptyFilterMessage="આઈટમ મળી નથી. નવી આઈટમ ઉમેરવા માટે બોક્સમાં લખો."
                tooltip="Select valid item or type new name"
            />
        );
    };

    const qtyTemplate = (rowData, { rowIndex }) => {
        return (
            <InputNumber
                id={`qty_${rowIndex}`}
                inputId={`qty_input_${rowIndex}`}
                name={`qty_${rowIndex}`}
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
                id={`rate_${rowIndex}`}
                inputId={`rate_input_${rowIndex}`}
                name={`rate_${rowIndex}`}
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

    const actionTemplate = (rowData) => (
        <Button icon="pi pi-trash" rounded text severity="danger" aria-label="Delete" onClick={() => removeRow(rowData)} />
    );

    return (
        <div className="flex flex-column gap-3 p-2 md:p-4 fadein animation-duration-500">
            <Toast ref={toast} />

            {/* Header / Top Bar */}
            <div className="flex justify-content-between align-items-center surface-0 p-3 shadow-1 border-round">
                <div className="flex align-items-center gap-3">
                    <div className="bg-primary border-round p-2">
                        <i className="pi pi-briefcase text-xl text-white"></i>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold m-0 text-900">New Sales Invoice</h1>
                        <span className="text-500 text-sm">Create a new bill for farmer/customer</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button label="Clear Form" icon="pi pi-eraser" severity="danger" text onClick={handleClear} />
                    <Button label="Refresh Masters" icon="pi pi-sync" severity="help" text onClick={loadMasters} />
                </div>
            </div>

            <div className="grid">
                {/* Left: Bill To (Farmer) */}
                <div className="col-12 md:col-7">
                    <Card className="h-full border-1 surface-border shadow-none" title="Bill To (Farmer Details)">
                        <div className="p-fluid">
                            <label className="font-bold mb-2 block text-900" htmlFor="farmer_select">Select Farmer / customer</label>
                            <Dropdown
                                inputId="farmer_select"
                                name="farmer_select"
                                value={selectedParty}
                                options={parties.filter(p => p.group_id === 1)}
                                optionLabel="name"
                                onChange={(e) => setSelectedParty(e.value)}
                                placeholder="Search & Select Farmer..."
                                filter
                                showClear
                                className="p-inputtext-lg"
                                itemTemplate={(option) => (
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-user text-primary"></i>
                                        <span className="font-medium">{option.name}</span>
                                        <span className="text-500 text-sm ml-auto">{option.mobile || ''}</span>
                                    </div>
                                )}
                            />
                            {selectedParty && (
                                <div className="mt-3 p-3 surface-50 border-round flex flex-column gap-1 text-sm">
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Mobile:</span>
                                        <span className="font-medium">{selectedParty.mobile || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">City:</span>
                                        <span className="font-medium">{selectedParty.city || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Current Balance:</span>
                                        <span className={`font-bold ${selectedParty.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                            ₹ {Math.abs(selectedParty.balance || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right: Invoice Info */}
                <div className="col-12 md:col-5">
                    <Card className="h-full border-1 surface-border shadow-none" title="Invoice Details">
                        <div className="grid p-fluid">
                            <div className="col-6">
                                <label className="font-bold mb-2 block" htmlFor="bill_no_input">Bill No</label>
                                <InputText id="bill_no_input" name="bill_no_input" value={billNo} disabled className="bg-surface-200 font-bold" />
                            </div>
                            <div className="col-6">
                                <label className="font-bold mb-2 block" htmlFor="bill_date_input">Date</label>
                                <Calendar inputId="bill_date_input" name="bill_date_input" value={billDate} onChange={(e) => setBillDate(e.value)} showIcon dateFormat="dd/mm/yy" />
                            </div>
                            <div className="col-12 mt-2">
                                <span className="font-bold mb-2 block">Payment Mode</span>
                                <div className="flex gap-2">
                                    <Button
                                        label="Cash"
                                        icon="pi pi-money-bill"
                                        severity={paymentMode === 'Cash' ? 'success' : 'secondary'}
                                        variant={paymentMode === 'Cash' ? 'filled' : 'outlined'}
                                        onClick={() => setPaymentMode('Cash')}
                                        className="flex-1"
                                    />
                                    <Button
                                        label="Debit"
                                        icon="pi pi-wallet"
                                        severity={paymentMode === 'Debit' ? 'warning' : 'secondary'}
                                        variant={paymentMode === 'Debit' ? 'filled' : 'outlined'}
                                        onClick={() => setPaymentMode('Debit')}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Items Table Section */}
            <Card className="shadow-1 border-0">
                <DataTable value={rows} dataKey="id" size="small" className="p-datatable-gridlines" showGridlines>
                    <Column header="#" body={(d, { rowIndex }) => rowIndex + 1} style={{ width: '3rem', textAlign: 'center' }} />
                    <Column header="Item Details" body={itemTemplate} style={{ minWidth: '250px' }} />
                    <Column header="Unit" field="unit" style={{ width: '80px' }} />
                    <Column header="Qty" body={qtyTemplate} style={{ width: '120px' }} />
                    <Column header="Rate (₹)" body={rateTemplate} style={{ width: '120px' }} />
                    <Column header="Amount (₹)" body={amountTemplate} className="text-right font-bold text-900 bg-blue-50" style={{ width: '150px' }} />
                    <Column body={actionTemplate} style={{ width: '4rem', textAlign: 'center' }} />
                </DataTable>

                <div className="mt-3">
                    <Button label="Add New Row" icon="pi pi-plus" onClick={addRow} outlined size="small" />
                </div>
            </Card>

            {/* Footer / Totals Section */}
            <div className="grid mt-2">
                <div className="col-12 md:col-8">
                    <Card className="shadow-none border-1 surface-border h-full">
                        <label className="font-bold block mb-2" htmlFor="remarks_input">Remarks / Notes</label>
                        <InputText id="remarks_input" name="remarks_input" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter any notes about this bill..." className="w-full" />
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <div className="surface-0 p-4 border-round shadow-2 h-full flex flex-column justify-content-between">
                        <div className="flex flex-column gap-2 mb-4">
                            <div className="flex justify-content-between text-lg">
                                <span className="text-600">Sub Total</span>
                                <span className="font-semibold">₹ {calculateTotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-content-between text-lg">
                                <span className="text-600">Tax</span>
                                <span>₹ 0.00</span>
                            </div>
                            <div className="separator border-top-1 border-300 my-2"></div>
                            <div className="flex justify-content-between text-2xl font-bold text-primary">
                                <span>Grand Total</span>
                                <span>₹ {calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex flex-column gap-2">
                            <Button label="Save & Print Bill" icon="pi pi-print" size="large" onClick={handleSave} />
                            <Button label="Download PDF Only" icon="pi pi-file-pdf" severity="secondary" outlined onClick={handleDownloadPdf} disabled={!printData} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Components */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <SalesPrint ref={printRef} data={printData} />
            </div>

            <Dialog header="Quick Create Item" visible={showQuickAdd} onHide={() => setShowQuickAdd(false)} style={{ width: '400px' }}>
                <div className="flex flex-column gap-3">
                    <div className="flex flex-column gap-2">
                        <label htmlFor="qa_name">Item Name</label>
                        <InputText id="qa_name" name="qa_name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} autoFocus />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="qa_company">Company</label>
                        <InputText id="qa_company" name="qa_company" value={newItem.company} onChange={(e) => setNewItem({ ...newItem, company: e.target.value })} />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="qa_unit">Unit</label>
                        <Dropdown inputId="qa_unit" name="qa_unit" value={newItem.unit} options={['Nos', 'Kg', 'Box']} onChange={(e) => setNewItem({ ...newItem, unit: e.value })} />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="qa_rate">Rate</label>
                        <InputNumber inputId="qa_rate" name="qa_rate" value={newItem.sales_rate} onValueChange={(e) => setNewItem({ ...newItem, sales_rate: e.value })} />
                    </div>
                    <Button label="Save" onClick={handleQuickAdd} />
                </div>
            </Dialog>
        </div>
    );
};

export default SalesBill;
