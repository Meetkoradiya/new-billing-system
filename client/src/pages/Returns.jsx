import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

const Returns = () => {
    return (
        <div className="surface-card p-4 shadow-2 border-round">
            <h2 className="text-xl font-bold mb-4">Returns Management</h2>

            <div className="grid">
                <div className="col-12 md:col-6">
                    <Card style={{ backgroundColor: '#fff4f2' }}>
                        <div className="flex align-items-center justify-content-between mb-3">
                            <span className="text-xl font-bold text-700">Sales Return</span>
                            <i className="pi pi-arrow-left text-2xl text-red-500"></i>
                        </div>
                        <p className="text-600 mb-4">Manage items returned by Farmers/Customers. Create credit notes and adjust stock.</p>
                        <Tag severity="warning" value="Coming Soon" className="mb-3" />
                        <div>
                            <Button label="Create Sales Return" icon="pi pi-file-edit" disabled className="p-button-danger w-full" />
                        </div>
                    </Card>
                </div>

                <div className="col-12 md:col-6">
                    <Card style={{ backgroundColor: '#f0f9ff' }}>
                        <div className="flex align-items-center justify-content-between mb-3">
                            <span className="text-xl font-bold text-700">Purchase Return</span>
                            <i className="pi pi-arrow-right text-2xl text-blue-500"></i>
                        </div>
                        <p className="text-600 mb-4">Manage items returned to Companies/Suppliers. Create debit notes and adjust stock.</p>
                        <Tag severity="warning" value="Coming Soon" className="mb-3" />
                        <div>
                            <Button label="Create Purchase Return" icon="pi pi-file-edit" disabled className="w-full" />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Returns;
