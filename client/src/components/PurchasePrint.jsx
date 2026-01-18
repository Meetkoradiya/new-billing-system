import React, { useRef } from 'react';

// A4 Print Component
const PurchasePrint = React.forwardRef(({ settings, data }, ref) => {
    if (!data) return null;

    const { bill_no, bill_date, party_name, items, remarks, grand_total } = data;

    return (
        <div ref={ref} className="print-container" style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#000', backgroundColor: '#fff' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>PURUSATH AGRO CENTER</h1>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>Main Market Yard, Shop No. 12, Amreli - 365601</p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>Mo: +91 98765 43210 | Email: contact@purusathagro.com</p>
            </div>

            {/* Bill Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div style={{ width: '60%' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', textDecoration: 'underline' }}>Supplier Details:</h3>
                    <p style={{ margin: '3px 0', fontWeight: 'bold', fontSize: '16px' }}>{party_name}</p>
                </div>
                <div style={{ width: '35%', textAlign: 'right' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', textDecoration: 'underline' }}>Bill Details:</h3>
                    <p style={{ margin: '3px 0' }}><strong>Bill No:</strong> {bill_no}</p>
                    <p style={{ margin: '3px 0' }}><strong>Date:</strong> {new Date(bill_date).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid #000', borderTop: '1px solid #000' }}>
                        <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #000' }}>#</th>
                        <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #000' }}>Item Name</th>
                        <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #000' }}>Rate</th>
                        <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #000' }}>Qty</th>
                        <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #000' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items && items.map((item, index) => (
                        <tr key={index}>
                            <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center' }}>{index + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #000' }}>{item.item_name || item.name}</td>
                            <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right' }}>{parseFloat(item.rate).toFixed(2)}</td>
                            <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right' }}>{item.qty} {item.unit}</td>
                            <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right' }}>{parseFloat(item.amount).toFixed(2)}</td>
                        </tr>
                    ))}
                    {/* Empty Rows to fill space if needed */}
                </tbody>
                <tfoot>
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                        <td colSpan="4" style={{ padding: '10px', textAlign: 'right', border: '1px solid #000' }}>Grand Total</td>
                        <td style={{ padding: '10px', textAlign: 'right', border: '1px solid #000' }}>₹{parseFloat(grand_total || 0).toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>

            {/* Footer */}
            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center' }}>
                    <p>_______________________</p>
                    <p>Receiver's Signature</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p>For, Purusath Agro Center</p>
                    <br /><br />
                    <p>_______________________</p>
                    <p>Authorised Signatory</p>
                </div>
            </div>

            <div style={{ marginTop: '30px', fontSize: '12px', textAlign: 'center', color: '#666' }}>
                <p>This is a computer generated invoice.</p>
            </div>
        </div>
    );
});

export default PurchasePrint;
