import React, { useEffect, useState, useRef } from 'react';
import { getAccounts, createAccount } from '../services/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';

const PartyMaster = () => {
    const [accounts, setAccounts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        group_id: 1, // Default to Farmer
        address: '',
        city: '',
        mobile: ''
    });
    const toast = useRef(null);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await getAccounts();
            setAccounts(response.data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Name is required' });
            return;
        }

        try {
            await createAccount(formData);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Account Created Successfully' });
            setShowForm(false);
            setFormData({ name: '', group_id: 1, address: '', city: '', mobile: '' });
            fetchAccounts();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error creating account';
            toast.current.show({ severity: 'error', summary: 'Error', detail: msg });
        }
    };

    const dialogFooter = (
        <div>
            <Button label="Cancel" icon="pi pi-times" onClick={() => setShowForm(false)} className="p-button-text" />
            <Button label="Save" icon="pi pi-check" onClick={handleSubmit} autoFocus />
        </div>
    );

    const typeBodyTemplate = (rowData) => {
        return rowData.group_id === 1 ?
            <Tag severity="success" value="Farmer" /> :
            <Tag severity="info" value="Company" />;
    };

    return (
        <div className="surface-card p-4 shadow-2 border-round">
            <Toast ref={toast} />
            <div className="flex justify-content-between align-items-center mb-4">
                <h2 className="text-xl font-bold m-0">Farmers / Companies List</h2>
                <div className="flex gap-2">
                    <Button label="Add Farmer" icon="pi pi-user-plus" severity="success" onClick={() => {
                        setFormData({ ...formData, group_id: 1 });
                        setShowForm(true);
                    }} />
                    <Button label="Add Company" icon="pi pi-building" severity="info" onClick={() => {
                        setFormData({ ...formData, group_id: 2 });
                        setShowForm(true);
                    }} />
                </div>
            </div>

            <DataTable value={accounts} paginator rows={10} stripedRows showGridlines tableStyle={{ minWidth: '50rem' }}>
                <Column field="id" header="ID" sortable style={{ width: '5%' }}></Column>
                <Column field="name" header="Name" sortable></Column>
                <Column field="group_id" header="Type" body={typeBodyTemplate} sortable></Column>
                <Column field="city" header="City / Village" sortable></Column>
                <Column field="mobile" header="Mobile" sortable></Column>
                <Column field="address" header="Address"></Column>
            </DataTable>

            <Dialog header={formData.group_id === 1 ? "Add New Farmer" : "Add New Company"} visible={showForm} style={{ width: '50vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }} onHide={() => setShowForm(false)} footer={dialogFooter}>
                <div className="grid p-fluid">
                    <div className="col-12 md:col-6">
                        <label className="block mb-2 font-medium">Name</label>
                        <InputText value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} autoFocus placeholder="Enter Name..." />
                    </div>
                    <div className="col-12 md:col-6">
                        <label className="block mb-2 font-medium">Type</label>
                        <Dropdown
                            value={formData.group_id}
                            options={[{ label: 'Farmer', value: 1 }, { label: 'Company / Supplier', value: 2 }]}
                            onChange={(e) => setFormData({ ...formData, group_id: e.value })}
                            placeholder="Select Type"
                            disabled
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label className="block mb-2 font-medium">City / Village</label>
                        <InputText value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                    <div className="col-12 md:col-6">
                        <label className="block mb-2 font-medium">Mobile</label>
                        <InputText keyfilter="int" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
                    </div>
                    <div className="col-12">
                        <label className="block mb-2 font-medium">Address</label>
                        <InputText value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default PartyMaster;
