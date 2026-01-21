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

    return (
        <div ref={ref} className="print-container" style={{
            fontFamily: 'Arial, sans-serif',
            color: '#1f2937',
            backgroundColor: '#fff',
            fontSize: '14px',
            width: '210mm',
            minHeight: '297mm',
            margin: '0 auto',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            {/* Main Outer Border Box */}
            <div style={{ border: '2px solid #1f2937', height: '100%', position: 'relative' }}>

                {/* Header Section */}
                <div style={{ textAlign: 'center', padding: '30px 20px', borderBottom: '2px solid #1f2937' }}>
                    <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: '900', color: '#111827', textTransform: 'uppercase', letterSpacing: '1px' }}>PURUSARTH AGRO CENTER</h1>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SELLERS OF PESTICIDES, SEEDS & PUMP SPARE PARTS</p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#374151' }}>Opp. Kirti Pan, Ranjit Sagar Road, Jamnagar</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111827' }}>Mo: 99252 59667</p>
                </div>

                {/* Bill Info Section (Split) */}
                <div style={{ display: 'flex', borderBottom: '2px solid #1f2937' }}>
                    {/* Left: Billed To */}
                    <div style={{ flex: '1', padding: '20px', borderRight: '2px solid #1f2937' }}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>BILLED TO:</p>
                        <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '800', color: '#111827' }}>{party_name}</h2>
                        {party_city && <p style={{ margin: '0', fontSize: '14px', color: '#374151', lineHeight: '1.4' }}>{party_city}</p>}
                        {party_mobile && <p style={{ margin: '0', fontSize: '14px', color: '#374151' }}>Mo: {party_mobile}</p>}
                    </div>

                    {/* Right: Invoice No & Date */}
                    <div style={{ width: '35%', padding: '20px', backgroundColor: '#f9fafb' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ margin: '0 0 2px 0', fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>INVOICE NO.</p>
                            <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{bill_no}</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 2px 0', fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>DATE</p>
                            <p style={{ margin: 0, fontSize: '16px', color: '#111827' }}>{new Date(bill_date).toLocaleDateString('en-IN')}</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#4b5563', textTransform: 'uppercase', width: '8%' }}>NO.</th>
                            <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#4b5563', textTransform: 'uppercase', width: '45%' }}>ITEM DESCRIPTION</th>
                            <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#4b5563', textTransform: 'uppercase', width: '15%' }}>QTY</th>
                            <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#4b5563', textTransform: 'uppercase', width: '15%' }}>RATE</th>
                            <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#4b5563', textTransform: 'uppercase', width: '17%' }}>AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '12px 15px', fontSize: '14px', color: '#6b7280' }}>{index + 1}</td>
                                <td style={{ padding: '12px 15px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>{item.item_name}</td>
                                <td style={{ padding: '12px 15px', fontSize: '14px', textAlign: 'right', color: '#374151' }}>{item.qty} {item.unit}</td>
                                <td style={{ padding: '12px 15px', fontSize: '14px', textAlign: 'right', color: '#374151' }}>{parseFloat(item.rate).toFixed(2)}</td>
                                <td style={{ padding: '12px 15px', fontSize: '14px', textAlign: 'right', fontWeight: '700', color: '#111827' }}>{parseFloat(item.amount).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals Section at Bottom */}
                <div style={{ padding: '20px 30px', borderTop: '2px solid #1f2937', marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#fff' }}>
                    <div style={{ width: '250px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>Sub Total</span>
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>{parseFloat(sub_total).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '16px', fontWeight: '800', color: '#111827' }}>Total</span>
                            <span style={{ fontSize: '20px', fontWeight: '900', color: '#111827' }}>₹{parseFloat(grand_total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Signatures & Footer (Absolute bottom of the border box) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 30px 30px 30px', marginTop: '40px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ borderBottom: '1px solid #9ca3af', width: '150px', marginBottom: '8px' }}></div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Receiver's Signature</p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '12px', fontWeight: '700', color: '#111827' }}>For, PURUSARTH AGRO CENTER</p>
                        <div style={{ borderBottom: '1px solid #9ca3af', width: '150px', marginBottom: '8px' }}></div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Authorized Signatory</p>
                    </div>
                </div>

            </div>
        </div>
    );
});

export default SalesPrint;
