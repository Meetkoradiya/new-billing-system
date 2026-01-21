-- ==========================================
-- COMPLETE AGRO BILLING SYSTEM DATABASE SCHEMA
-- ==========================================

DROP DATABASE IF EXISTS agro_billing;
CREATE DATABASE IF NOT EXISTS agro_billing;
USE agro_billing;

-- 1. USERS (renamed to app_users to avoid corruption issues in dev environment)
DROP TABLE IF EXISTS app_users;
CREATE TABLE app_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO app_users (username, password, role) VALUES ('admin', 'admin123', 'admin');

-- 2. ACCOUNTS
DROP TABLE IF EXISTS accounts;
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    group_id INT DEFAULT 1 COMMENT '1=Farmer, 2=Supplier',
    mobile VARCHAR(15),
    address TEXT,
    city VARCHAR(100),
    gst_number VARCHAR(20),
    balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. ITEMS
-- Note: We are dropping this to ensure the schema is perfect (with category, stock, etc.)
DROP TABLE IF EXISTS stock_adjustments; -- Clean up potential debris
DROP TABLE IF EXISTS items;
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    company VARCHAR(100),
    category VARCHAR(50) DEFAULT 'Pesticide',
    code VARCHAR(50),
    unit VARCHAR(20) DEFAULT 'Nos',
    purchase_rate DECIMAL(15,2) DEFAULT 0.00,
    sales_rate DECIMAL(15,2) DEFAULT 0.00,
    gst_percent DECIMAL(5,2) DEFAULT 0.00,
    stock DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. SALES
DROP TABLE IF EXISTS sales_detail;
DROP TABLE IF EXISTS sales_head;

CREATE TABLE sales_head (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_no VARCHAR(20) NOT NULL UNIQUE,
    bill_date DATE NOT NULL,
    account_id INT NOT NULL,
    sub_total DECIMAL(15,2) DEFAULT 0.00,
    grand_total DECIMAL(15,2) DEFAULT 0.00,
    payment_mode VARCHAR(20) DEFAULT 'Cash',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sales_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE sales_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sales_id INT NOT NULL,
    item_id INT NOT NULL,
    qty DECIMAL(15,2) NOT NULL,
    rate DECIMAL(15,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    CONSTRAINT fk_sales_head FOREIGN KEY (sales_id) REFERENCES sales_head(id) ON DELETE CASCADE,
    CONSTRAINT fk_sales_item FOREIGN KEY (item_id) REFERENCES items(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. PURCHASE
DROP TABLE IF EXISTS purchase_detail;
DROP TABLE IF EXISTS purchase_head;

CREATE TABLE purchase_head (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_no VARCHAR(20) NOT NULL UNIQUE,
    bill_date DATE NOT NULL,
    account_id INT NOT NULL,
    sub_total DECIMAL(15,2) DEFAULT 0.00,
    grand_total DECIMAL(15,2) DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchase_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE purchase_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    item_id INT NOT NULL,
    qty DECIMAL(15,2) NOT NULL,
    rate DECIMAL(15,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    CONSTRAINT fk_purchase_head FOREIGN KEY (purchase_id) REFERENCES purchase_head(id) ON DELETE CASCADE,
    CONSTRAINT fk_purchase_item FOREIGN KEY (item_id) REFERENCES items(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. SALES RETURN
DROP TABLE IF EXISTS sales_return_detail;
DROP TABLE IF EXISTS sales_return_head;

CREATE TABLE sales_return_head (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_no VARCHAR(20) NOT NULL UNIQUE,
    return_date DATE NOT NULL,
    account_id INT NOT NULL,
    grand_total DECIMAL(15,2) DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sales_return_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE sales_return_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_id INT NOT NULL,
    item_id INT NOT NULL,
    qty DECIMAL(15,2) NOT NULL,
    rate DECIMAL(15,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    CONSTRAINT fk_sales_return_head FOREIGN KEY (return_id) REFERENCES sales_return_head(id) ON DELETE CASCADE,
    CONSTRAINT fk_sales_return_item FOREIGN KEY (item_id) REFERENCES items(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 7. PURCHASE RETURN
DROP TABLE IF EXISTS purchase_return_detail;
DROP TABLE IF EXISTS purchase_return_head;

CREATE TABLE purchase_return_head (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_no VARCHAR(20) NOT NULL UNIQUE,
    return_date DATE NOT NULL,
    account_id INT NOT NULL,
    grand_total DECIMAL(15,2) DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchase_return_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE purchase_return_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_id INT NOT NULL,
    item_id INT NOT NULL,
    qty DECIMAL(15,2) NOT NULL,
    rate DECIMAL(15,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    CONSTRAINT fk_purchase_return_head FOREIGN KEY (return_id) REFERENCES purchase_return_head(id) ON DELETE CASCADE,
    CONSTRAINT fk_purchase_return_item FOREIGN KEY (item_id) REFERENCES items(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 8. EXTENSIONS
DROP TABLE IF EXISTS payments;
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_date DATE NOT NULL,
    account_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_mode VARCHAR(20) DEFAULT 'Cash',
    type ENUM('receipt', 'payment') NOT NULL DEFAULT 'receipt',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS expenses;
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    expense_date DATE NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 9. INDEXES
CREATE INDEX idx_sales_date ON sales_head(bill_date);
CREATE INDEX idx_purchase_date ON purchase_head(bill_date);
