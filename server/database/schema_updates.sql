-- ===============================
-- DATABASE
-- ===============================
DROP DATABASE IF EXISTS agro_billing;
CREATE DATABASE IF NOT EXISTS agro_billing;
USE agro_billing;

-- ===============================
-- ACCOUNTS (PARTY / LEDGER MASTER)
-- ===============================
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    group_id INT DEFAULT 1 COMMENT '1=Farmer, 2=Supplier',
    mobile VARCHAR(15),
    address TEXT,
    city VARCHAR(100),
    gst_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===============================
-- ITEMS (PRODUCT MASTER)
-- ===============================
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) DEFAULT 'Pesticide',
    code VARCHAR(50),
    unit VARCHAR(20),
    purchase_rate DECIMAL(15,2) DEFAULT 0.00,
    sales_rate DECIMAL(15,2) DEFAULT 0.00,
    gst_percent DECIMAL(5,2) DEFAULT 0.00,
    stock DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===============================
-- PURCHASE BILL HEADER
-- ===============================
CREATE TABLE purchase_head (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_no VARCHAR(20) NOT NULL UNIQUE,
    bill_date DATE NOT NULL,
    account_id INT NOT NULL,
    sub_total DECIMAL(15,2) DEFAULT 0.00,
    grand_total DECIMAL(15,2) DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_purchase_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ===============================
-- PURCHASE BILL DETAILS
-- ===============================
CREATE TABLE purchase_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    item_id INT NOT NULL,
    qty DECIMAL(15,2) NOT NULL,
    rate DECIMAL(15,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,

    CONSTRAINT fk_purchase_detail_head
        FOREIGN KEY (purchase_id)
        REFERENCES purchase_head(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_purchase_detail_item
        FOREIGN KEY (item_id)
        REFERENCES items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ===============================
-- SALES RETURN HEADER
-- ===============================
CREATE TABLE sales_return_head (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_no VARCHAR(20) NOT NULL UNIQUE,
    return_date DATE NOT NULL,
    account_id INT NOT NULL,
    grand_total DECIMAL(15,2) DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sales_return_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ===============================
-- SALES RETURN DETAILS
-- ===============================
CREATE TABLE sales_return_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_id INT NOT NULL,
    item_id INT NOT NULL,
    qty DECIMAL(15,2) NOT NULL,
    rate DECIMAL(15,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,

    CONSTRAINT fk_sales_return_detail_head
        FOREIGN KEY (return_id)
        REFERENCES sales_return_head(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_sales_return_detail_item
        FOREIGN KEY (item_id)
        REFERENCES items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ===============================
-- PURCHASE RETURN HEADER
-- ===============================
CREATE TABLE purchase_return_head (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_no VARCHAR(20) NOT NULL UNIQUE,
    return_date DATE NOT NULL,
    account_id INT NOT NULL,
    grand_total DECIMAL(15,2) DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_purchase_return_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ===============================
-- PURCHASE RETURN DETAILS
-- ===============================
CREATE TABLE purchase_return_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_id INT NOT NULL,
    item_id INT NOT NULL,
    qty DECIMAL(15,2) NOT NULL,
    rate DECIMAL(15,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,

    CONSTRAINT fk_purchase_return_detail_head
        FOREIGN KEY (return_id)
        REFERENCES purchase_return_head(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_purchase_return_detail_item
        FOREIGN KEY (item_id)
        REFERENCES items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ===============================
-- INDEXES (PERFORMANCE)
-- ===============================
CREATE INDEX idx_purchase_date ON purchase_head(bill_date);
CREATE INDEX idx_purchase_account ON purchase_head(account_id);

CREATE INDEX idx_sales_return_date ON sales_return_head(return_date);
CREATE INDEX idx_purchase_return_date ON purchase_return_head(return_date);

-- ===============================
-- USERS (AUTHENTICATION)
-- ===============================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Default Admin User (Password: admin123)
-- In a real app, use bcrypt. For now, simple text or we can use SHA2 helper if available, but simple text for MVP as requested.
INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin');
