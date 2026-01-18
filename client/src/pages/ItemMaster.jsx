import React, { useEffect, useState } from 'react';
import { getItems, createItem, getAccounts } from '../services/api'; // getAccounts added

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';

const ItemMaster = () => {
    const [items, setItems] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        category: '',
        code: '',
        unit: 'Nos',
        purchase_rate: 0,
        gst_percent: 0
    });

    useEffect(() => {
        fetchItems();
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await getAccounts();
            // Filter only Suppliers (group_id = 2)
            const supplierList = response.data.filter(acc => acc.group_id === 2);
            setCompanies(supplierList);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const fetchItems = async () => {
        try {
            const response = await getItems();
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            await createItem(formData);
            setShowForm(false);
            setFormData({ name: '', company: '', category: '', code: '', unit: 'Nos', purchase_rate: 0, gst_percent: 0 });
            fetchItems();
        } catch (error) {
            alert('Error creating item');
        }
    };

    const dialogFooter = (
        <div>
            <Button label="Cancel" icon="pi pi-times" onClick={() => setShowForm(false)} className="p-button-text" />
            <Button label="Save" icon="pi pi-check" onClick={handleSubmit} autoFocus />
        </div>
    );

    return (
        <div className="surface-card p-4 shadow-2 border-round">
            <div className="flex justify-content-between align-items-center mb-4">
                <h2 className="text-xl font-bold m-0">Item Master</h2>
                <Button label="Add New Item" icon="pi pi-plus" onClick={() => setShowForm(true)} />
            </div>

            <DataTable value={items} paginator rows={10} stripedRows showGridlines tableStyle={{ minWidth: '50rem' }}>
                <Column field="code" header="Code" sortable></Column>
                <Column field="name" header="Item Name" sortable></Column>
                <Column field="company" header="Company" sortable></Column>
                <Column field="category" header="Category" sortable></Column>
                <Column field="unit" header="Unit" sortable></Column>
                <Column field="purchase_rate" header="Pur. Rate" sortable className="text-right"></Column>
                <Column field="gst_percent" header="GST %" sortable className="text-right" body={(rowData) => `${rowData.gst_percent}%`}></Column>
            </DataTable>

            <Dialog header="Add New Product" visible={showForm} style={{ width: '50vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }} onHide={() => setShowForm(false)} footer={dialogFooter}>
                <div className="grid p-fluid">
                    <div className="col-12 md:col-6">
                        <label className="block mb-2 font-medium">Item Name</label>
                        <InputText value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} autoFocus />
                    </div>
                    <div className="col-12 md:col-6">
                        <label className="block mb-2 font-medium">Company / Brand</label>
                        <Dropdown
                            value={formData.company}
                            options={companies}
                            optionLabel="name"
                            optionValue="name"
                            onChange={(e) => setFormData({ ...formData, company: e.value })}
                            placeholder="Select Company"
                            editable
                            filter
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <label className="block mb-2 font-medium">Category</label>
                        <Dropdown
                            value={formData.category}
                            options={['Pesticide', 'Seeds']}
                            onChange={(e) => setFormData({ ...formData, category: e.value })}
                            placeholder="Select Category"
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <label className="block mb-2 font-medium">Code / SKU</label>
                        <InputText value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                    </div>
                    <div className="col-12 md:col-4">
                        <label className="block mb-2 font-medium">Unit</label>
                        <Dropdown
                            value={formData.unit}
                            options={['Nos', 'Kg', 'Ltr', 'Box', 'Bag']}
                            onChange={(e) => setFormData({ ...formData, unit: e.value })}
                            placeholder="Select Unit"
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label className="block mb-2 font-medium">Purchase Rate</label>
                        <InputNumber value={formData.purchase_rate} onValueChange={(e) => setFormData({ ...formData, purchase_rate: e.value })} mode="decimal" minFractionDigits={2} />
                    </div>
                    <div className="col-12 md:col-6">
                        <label className="block mb-2 font-medium">GST %</label>
                        <Dropdown
                            value={formData.gst_percent}
                            options={[0, 5, 12, 18, 28]}
                            onChange={(e) => setFormData({ ...formData, gst_percent: e.value })}
                            placeholder="GST %"
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default ItemMaster;
