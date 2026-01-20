import React, { forwardRef } from 'react';
import '../index.css';

const SalesPrint = forwardRef(({ data }, ref) => {
    if (!data) return null;

    const {
        bill_no,
        bill_date,
        party_name,
        party_mobile,
        party_city,
        items,
        sub_total,
        grand_total,
        payment_mode
    } = data;

    // Number to words conversion
    const numToWords = (n) => {
        const num = Math.floor(n);
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const inWords = (num) => {
            if ((num = num.toString()).length > 9) return 'overflow';
            let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
            if (!n) return '';
            let str = '';
            str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
            str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
            str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
            str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
            str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only' : 'Only';
            return str;
        };
        return inWords(num);
    };

    const separatorStyle = { borderBottom: '1px dashed #000', margin: '10px 0' };

    return (
        <div ref={ref} className="p-4" style={{ fontFamily: '"Courier New", Courier, monospace', color: '#000', backgroundColor: '#fff', fontSize: '14px', maxWidth: '100%' }}>
            {/* Header */}
            <div className="text-center mb-2">
                <h1 className="m-0 text-3xl font-bold mb-1">PURUSARTH AGRO CENTER</h1>
                <p className="m-0 font-bold mb-1" style={{ fontSize: '15px' }}>Sellers of Pesticides, Seeds & Pump Spare Parts</p>
                <p className="m-0 mb-1">Opp. Kirti Pan, Ranjit Sagar Road, Jamnagar</p>
                <p className="m-0 font-bold">Mo : 99252 59667</p>
            </div>

            <div style={separatorStyle}></div>

            {/* Customer & Bill Details */}
            <div className="flex justify-content-between">
                <div style={{ width: '60%' }}>
                    <div className="flex mb-1">
                        <span style={{ width: '100px' }}>Bill No</span>
                        <span>: {bill_no}</span>
                    </div>
                    <div className="flex mb-1">
                        <span style={{ width: '100px' }}>Name</span>
                        <span className="font-bold">: {party_name}</span>
                    </div>
                    <div className="flex mb-1">
                        <span style={{ width: '100px' }}>Place</span>
                        <span>: {party_city || ''}</span>
                    </div>
                </div>
                <div style={{ width: '40%' }}>
                    <div className="flex mb-1">
                        <span style={{ width: '80px' }}>Date</span>
                        <span>: {new Date(bill_date).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex mb-1">
                        <span style={{ width: '80px' }}>Mobile</span>
                        <span>: {party_mobile || ''}</span>
                    </div>
                </div>
            </div>

            <div style={separatorStyle}></div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px dashed #000' }}>
                        <th className="text-left p-1" style={{ width: '5%' }}>#</th>
                        <th className="text-left p-1" style={{ width: '50%' }}>Item Name</th>
                        <th className="text-right p-1" style={{ width: '10%' }}>Qty</th>
                        <th className="text-right p-1" style={{ width: '15%' }}>Rate</th>
                        <th className="text-right p-1" style={{ width: '20%' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td className="p-1 valign-top">{index + 1}</td>
                            <td className="p-1 valign-top">{item.item_name}</td>
                            <td className="p-1 text-right valign-top">{item.qty} {item.unit}</td>
                            <td className="p-1 text-right valign-top">{parseFloat(item.rate).toFixed(2)}</td>
                            <td className="p-1 text-right valign-top">{parseFloat(item.amount).toFixed(2)}</td>
                        </tr>
                    ))}
                    {/* Fill empty rows for min-height look if needed, but not strictly asked */}
                </tbody>
            </table>

            <div style={separatorStyle}></div>

            {/* Totals */}
            <div className="flex flex-column align-items-end">
                <div className="flex justify-content-between mb-1" style={{ width: '250px' }}>
                    <span>Sub Total :</span>
                    <span>{parseFloat(sub_total).toFixed(2)}</span>
                </div>
                <div className="flex justify-content-between mb-1" style={{ width: '250px' }}>
                    <span>Discount :</span>
                    <span>0.00</span>
                </div>
                <div style={{ borderBottom: '1px dashed #000', width: '250px', margin: '5px 0' }}></div>
                <div className="flex justify-content-between mb-1 font-bold" style={{ width: '250px' }}>
                    <span>Net Total :</span>
                    <span>{parseFloat(grand_total).toFixed(2)}</span>
                </div>
            </div>

            <div style={separatorStyle}></div>

            {/* Payment & Footer */}
            <div className="flex justify-content-between align-items-start">
                <div>
                    <p className="m-0 mb-1">Pay Mode : {payment_mode}</p>
                    <p className="m-0 mt-3 font-italic font-bold">In Words: {numToWords(grand_total)}</p>
                </div>
                <div className="text-right">
                    <div className="flex justify-content-between mb-1" style={{ width: '250px' }}>
                        <span>Paid Amount :</span>
                        <span>{parseFloat(grand_total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-content-between mb-1" style={{ width: '250px' }}>
                        <span>Balance :</span>
                        <span>0.00</span>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div className="text-center">
                    <p style={{ borderTop: '1px solid #000', paddingTop: '5px', width: '200px' }}>Receiver's Signature</p>
                </div>
                <div className="text-center">
                    <p className="mb-6 font-bold">For, PURUSARTH AGRO CENTER</p>
                    <p style={{ borderTop: '1px solid #000', paddingTop: '5px', width: '200px', marginLeft: 'auto' }}>Authorized Signatory</p>
                </div>
            </div>
        </div>
    );
});

export default SalesPrint;
