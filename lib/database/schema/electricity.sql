-- ===============================
-- ELECTRICITY SYSTEM DATABASE SCHEMA
-- ===============================

-- 1. Electricity Units Table
CREATE TABLE IF NOT EXISTS electricity_units (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sl_no INT NOT NULL UNIQUE,
    zone VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    muscat_bay_number VARCHAR(100),
    unit_number VARCHAR(200), -- Municipality unit number
    unit_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    meter_account_no VARCHAR(100),
    total_consumption DECIMAL(12, 2) DEFAULT 0.00,
    average_consumption DECIMAL(12, 2) DEFAULT 0.00,
    peak_consumption DECIMAL(12, 2) DEFAULT 0.00,
    lowest_consumption DECIMAL(12, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_reading_date TIMESTAMP NULL,
    
    -- Indexes for better performance
    INDEX idx_zone (zone),
    INDEX idx_type (type),
    INDEX idx_category (category),
    INDEX idx_meter_account (meter_account_no),
    INDEX idx_unit_name (unit_name),
    INDEX idx_active_status (is_active),
    INDEX idx_consumption_total (total_consumption),
    
    -- Unique constraints
    UNIQUE KEY uk_meter_account (meter_account_no),
    UNIQUE KEY uk_unit_name_zone (unit_name, zone)
);

-- 2. Consumption Records Table
CREATE TABLE IF NOT EXISTS consumption_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    unit_id BIGINT NOT NULL,
    month VARCHAR(20) NOT NULL, -- Format: 'YYYY-MM' or 'Month-YY'
    year INT NOT NULL,
    consumption DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    cost DECIMAL(12, 2) DEFAULT 0.00,
    billing_date DATE NULL,
    reading_date DATE NULL,
    meter_reading DECIMAL(12, 2) NULL,
    previous_reading DECIMAL(12, 2) NULL,
    is_estimated BOOLEAN DEFAULT FALSE,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (unit_id) REFERENCES electricity_units(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_unit_month (unit_id, month),
    INDEX idx_month_year (month, year),
    INDEX idx_consumption_amount (consumption),
    INDEX idx_billing_date (billing_date),
    INDEX idx_reading_date (reading_date),
    INDEX idx_year (year),
    
    -- Unique constraint for unit-month combination
    UNIQUE KEY uk_unit_month_year (unit_id, month, year)
);

-- 3. Categories Table (Reference table)
CREATE TABLE IF NOT EXISTS electricity_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    color_code VARCHAR(7) DEFAULT '#4E4456', -- Hex color for UI
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active_categories (is_active),
    INDEX idx_display_order (display_order)
);

-- 4. Zones Table (Reference table)
CREATE TABLE IF NOT EXISTS electricity_zones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    zone_code VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_zone_code (zone_code),
    INDEX idx_active_zones (is_active)
);

-- 5. Unit Types Table (Reference table)
CREATE TABLE IF NOT EXISTS electricity_unit_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20),
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type_code (code),
    INDEX idx_active_types (is_active)
);

-- 6. Consumption Summary Table (For faster analytics)
CREATE TABLE IF NOT EXISTS consumption_summary (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    unit_id BIGINT NOT NULL,
    year INT NOT NULL,
    month VARCHAR(20) NOT NULL,
    total_consumption DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_cost DECIMAL(12, 2) DEFAULT 0.00,
    unit_count INT DEFAULT 1,
    average_consumption DECIMAL(12, 2) DEFAULT 0.00,
    peak_consumption DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (unit_id) REFERENCES electricity_units(id) ON DELETE CASCADE,
    
    INDEX idx_summary_year_month (year, month),
    INDEX idx_summary_unit (unit_id),
    INDEX idx_summary_consumption (total_consumption),
    
    UNIQUE KEY uk_unit_year_month (unit_id, year, month)
);

-- 7. Audit Log Table (For tracking changes)
CREATE TABLE IF NOT EXISTS electricity_audit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(100) NOT NULL,
    record_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSON NULL,
    new_values JSON NULL,
    changed_by VARCHAR(100) DEFAULT 'system',
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    
    INDEX idx_audit_table (table_name),
    INDEX idx_audit_record (record_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_date (changed_at)
);

-- 8. Data Import Log Table (For tracking imports)
CREATE TABLE IF NOT EXISTS data_import_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    import_type VARCHAR(50) NOT NULL, -- 'electricity_consumption', 'units', etc.
    file_name VARCHAR(255) NULL,
    records_processed INT DEFAULT 0,
    records_success INT DEFAULT 0,
    records_failed INT DEFAULT 0,
    error_details JSON NULL,
    import_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    imported_by VARCHAR(100) DEFAULT 'system',
    
    INDEX idx_import_type (import_type),
    INDEX idx_import_status (import_status),
    INDEX idx_import_date (started_at)
);

-- ===============================
-- INITIAL DATA POPULATION
-- ===============================

-- Insert default categories
INSERT IGNORE INTO electricity_categories (name, description, color_code, display_order) VALUES
('Pumping Station', 'Water pumping infrastructure', '#6A5ACD', 1),
('Lifting Station', 'Water lifting infrastructure', '#20B2AA', 2),
('Irrigation Tank', 'Irrigation system infrastructure', '#32CD32', 3),
('Actuator DB', 'Actuator distribution boards', '#FF6347', 4),
('Street Light', 'Street lighting systems', '#FFD700', 5),
('Apartment', 'Residential apartment units', '#87CEEB', 6),
('Ancillary Building', 'Support buildings', '#DDA0DD', 7),
('Central Park', 'Park facilities', '#90EE90', 8),
('Village Square', 'Community areas', '#F0E68C', 9),
('Commercial (Bank)', 'Banking facilities', '#4682B4', 10),
('Commercial (Kitchen)', 'Food service facilities', '#CD853F', 11),
('Landscape Light', 'Landscape lighting', '#FFA500', 12),
('Beachwell', 'Beach water facilities', '#40E0D0', 13),
('Helipad', 'Aviation facilities', '#8B4513', 14),
('Other', 'Miscellaneous units', '#696969', 15);

-- Insert default zones
INSERT IGNORE INTO electricity_zones (name, description, zone_code) VALUES
('Infrastructure', 'Core infrastructure systems', 'INFRA'),
('Zone 3', 'Residential Zone 3', 'Z3'),
('Central Park', 'Central park area', 'CPARK'),
('Ancillary', 'Support facilities', 'ANC'),
('Commercial', 'Commercial areas', 'COMM');

-- Insert default unit types  
INSERT IGNORE INTO electricity_unit_types (name, code, description) VALUES
('MC', 'MC', 'Main Controller'),
('SBJ Common Meter', 'SBJ', 'SBJ Common Meter System'),
('Building', 'BLDG', 'Building Structure'),
('Retail', 'RTL', 'Retail Facility');

-- ===============================
-- VIEWS FOR COMMON QUERIES
-- ===============================

-- Monthly consumption summary view
CREATE OR REPLACE VIEW monthly_consumption_summary AS
SELECT 
    cr.month,
    cr.year,
    COUNT(DISTINCT cr.unit_id) as unit_count,
    SUM(cr.consumption) as total_consumption,
    AVG(cr.consumption) as average_consumption,
    MAX(cr.consumption) as peak_consumption,
    MIN(cr.consumption) as lowest_consumption,
    SUM(cr.cost) as total_cost
FROM consumption_records cr
JOIN electricity_units eu ON cr.unit_id = eu.id
WHERE eu.is_active = TRUE
GROUP BY cr.year, cr.month
ORDER BY cr.year DESC, cr.month DESC;

-- Unit consumption summary view
CREATE OR REPLACE VIEW unit_consumption_summary AS
SELECT 
    eu.id,
    eu.unit_name,
    eu.zone,
    eu.category,
    eu.type,
    eu.meter_account_no,
    COUNT(cr.id) as reading_count,
    SUM(cr.consumption) as total_consumption,
    AVG(cr.consumption) as average_consumption,
    MAX(cr.consumption) as peak_consumption,
    MIN(cr.consumption) as lowest_consumption,
    SUM(cr.cost) as total_cost,
    MAX(cr.reading_date) as last_reading_date
FROM electricity_units eu
LEFT JOIN consumption_records cr ON eu.id = cr.unit_id
WHERE eu.is_active = TRUE
GROUP BY eu.id
ORDER BY total_consumption DESC;

-- Category consumption summary view
CREATE OR REPLACE VIEW category_consumption_summary AS
SELECT 
    eu.category,
    COUNT(DISTINCT eu.id) as unit_count,
    SUM(cr.consumption) as total_consumption,
    AVG(cr.consumption) as average_consumption,
    SUM(cr.cost) as total_cost,
    (SUM(cr.consumption) / (SELECT SUM(consumption) FROM consumption_records) * 100) as percentage
FROM electricity_units eu
JOIN consumption_records cr ON eu.id = cr.unit_id
WHERE eu.is_active = TRUE
GROUP BY eu.category
ORDER BY total_consumption DESC;

-- ===============================
-- STORED PROCEDURES
-- ===============================

DELIMITER //

-- Procedure to calculate unit statistics
CREATE OR REPLACE PROCEDURE CalculateUnitStatistics(IN unit_id BIGINT)
BEGIN
    DECLARE total_cons DECIMAL(12, 2) DEFAULT 0.00;
    DECLARE avg_cons DECIMAL(12, 2) DEFAULT 0.00;
    DECLARE peak_cons DECIMAL(12, 2) DEFAULT 0.00;
    DECLARE low_cons DECIMAL(12, 2) DEFAULT 0.00;
    
    SELECT 
        COALESCE(SUM(consumption), 0),
        COALESCE(AVG(consumption), 0),
        COALESCE(MAX(consumption), 0),
        COALESCE(MIN(consumption), 0)
    INTO total_cons, avg_cons, peak_cons, low_cons
    FROM consumption_records 
    WHERE unit_id = unit_id;
    
    UPDATE electricity_units 
    SET 
        total_consumption = total_cons,
        average_consumption = avg_cons,
        peak_consumption = peak_cons,
        lowest_consumption = low_cons,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = unit_id;
END //

-- Procedure to refresh all unit statistics
CREATE OR REPLACE PROCEDURE RefreshAllUnitStatistics()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE unit_id BIGINT;
    DECLARE unit_cursor CURSOR FOR 
        SELECT id FROM electricity_units WHERE is_active = TRUE;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN unit_cursor;
    
    read_loop: LOOP
        FETCH unit_cursor INTO unit_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        CALL CalculateUnitStatistics(unit_id);
    END LOOP;
    
    CLOSE unit_cursor;
END //

DELIMITER ;

-- ===============================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ===============================

DELIMITER //

-- Trigger to update unit statistics when consumption is inserted/updated
CREATE OR REPLACE TRIGGER consumption_after_insert
AFTER INSERT ON consumption_records
FOR EACH ROW
BEGIN
    CALL CalculateUnitStatistics(NEW.unit_id);
END //

CREATE OR REPLACE TRIGGER consumption_after_update
AFTER UPDATE ON consumption_records
FOR EACH ROW
BEGIN
    IF NEW.consumption != OLD.consumption THEN
        CALL CalculateUnitStatistics(NEW.unit_id);
    END IF;
END //

CREATE OR REPLACE TRIGGER consumption_after_delete
AFTER DELETE ON consumption_records
FOR EACH ROW
BEGIN
    CALL CalculateUnitStatistics(OLD.unit_id);
END //

DELIMITER ;
