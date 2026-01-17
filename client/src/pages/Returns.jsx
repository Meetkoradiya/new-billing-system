import React from 'react';

const Returns = () => {
    return (
        <div className="card">
            <h2>Returns</h2>
            <p>Sales Return and Purchase Return functionality will be implemented here.</p>
            {/* We can expand this later with similar logic to Sales/Purchase */}
            <div style={{ marginTop: 20 }}>
                <button className="btn btn-primary" style={{ marginRight: 10 }}>Sales Return</button>
                <button className="btn btn-primary">Purchase Return</button>
            </div>
        </div>
    );
};

export default Returns;
