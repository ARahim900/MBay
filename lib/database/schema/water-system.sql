-- =====================================================
-- Muscat Bay Water System Database Schema
-- =====================================================
-- Created: 2025-01-31
-- Purpose: Comprehensive water meter and consumption tracking
-- Version: 1.0
-- =====================================================

-- Drop existing tables if they exist (for clean recreation)
DROP TABLE IF EXISTS water_monthly_consumption CASCADE;
DROP TABLE IF EXISTS water_meters CASCADE;
DROP TABLE IF EXISTS water_zones CASCADE;
DROP TABLE IF EXISTS water_meter_types CASCADE;
DROP TABLE IF EXISTS water_parent_meters CASCADE;

-- =====================================================
-- 1. WATER ZONES TABLE
-- =====================================================
CREATE TABLE water_zones (
    zone_id SERIAL PRIMARY KEY,
    zone_code VARCHAR(50) UNIQUE NOT NULL,
    zone_name VARCHAR(200) NOT NULL,
    zone_type VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert zone data
INSERT INTO water_zones (zone_code, zone_name, zone_type, description) VALUES
('Zone_01_(FM)', 'Zone 01 - FM (Facilities Management)', 'FACILITIES', 'Facilities Management Zone with retail and commercial units'),
('Zone_03_(A)', 'Zone 03A - Residential', 'RESIDENTIAL', 'Zone 3A residential area with villas and apartments'),
('Zone_03_(B)', 'Zone 03B - Residential', 'RESIDENTIAL', 'Zone 3B residential area with villas and apartments'),
('Zone_05', 'Zone 05 - Residential', 'RESIDENTIAL', 'Zone 5 residential area primarily villas'),
('Zone_08', 'Zone 08 - Residential', 'RESIDENTIAL', 'Zone 8 residential area with villas'),
('Zone_VS', 'Village Square', 'COMMERCIAL', 'Village Square commercial and retail area'),
('Zone_SC', 'Sales Center', 'COMMERCIAL', 'Sales Center and administrative area'),
('Direct Connection', 'Direct Connection to Main', 'INFRASTRUCTURE', 'Direct connection to main bulk supply'),
('Main Bulk', 'Main Bulk Supply', 'MAIN_SUPPLY', 'Primary water supply point from NAMA');

-- =====================================================
-- 2. WATER METER TYPES TABLE
-- =====================================================
CREATE TABLE water_meter_types (
    type_id SERIAL PRIMARY KEY,
    type_code VARCHAR(50) UNIQUE NOT NULL,
    type_name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    billing_rate DECIMAL(10,4),
    is_active BOOLEAN DEFAULT true
);

-- Insert meter type data
INSERT INTO water_meter_types (type_code, type_name, category, description, billing_rate) VALUES
('Residential (Villa)', 'Residential Villa Meter', 'RESIDENTIAL', 'Individual villa water meters', 0.025),
('Residential (Apart)', 'Residential Apartment Meter', 'RESIDENTIAL', 'Individual apartment water meters', 0.025),
('Retail', 'Retail/Commercial Meter', 'COMMERCIAL', 'Commercial and retail establishment meters', 0.040),
('Zone Bulk', 'Zone Bulk Meter', 'BULK', 'Zone-level bulk water meters', 0.015),
('Main BULK', 'Main Bulk Supply Meter', 'MAIN', 'Primary bulk supply meters', 0.010),
('MB_Common', 'Main Building Common Areas', 'COMMON', 'Common area meters for buildings', 0.030),
('D_Building_Common', 'D-Building Common Areas', 'COMMON', 'Common area meters for D-series buildings', 0.030),
('IRR_Services', 'Irrigation Services', 'IRRIGATION', 'Irrigation and landscaping water meters', 0.020);

-- =====================================================
-- 3. WATER PARENT METERS TABLE
-- =====================================================
CREATE TABLE water_parent_meters (
    parent_meter_id SERIAL PRIMARY KEY,
    parent_meter_name VARCHAR(300) UNIQUE NOT NULL,
    zone_id INTEGER REFERENCES water_zones(zone_id),
    meter_type VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert parent meter data
INSERT INTO water_parent_meters (parent_meter_name, zone_id, meter_type) VALUES
('Main Bulk (NAMA)', 9, 'Main BULK'),
('ZONE FM ( BULK ZONE FM )', 1, 'Zone Bulk'),
('ZONE 3A (BULK ZONE 3A)', 2, 'Zone Bulk'),
('ZONE 3B (BULK ZONE 3B)', 3, 'Zone Bulk'),
('ZONE 5 (Bulk Zone 5)', 4, 'Zone Bulk'),
('BULK ZONE 8', 5, 'Zone Bulk'),
('Village Square (Zone Bulk)', 6, 'Zone Bulk'),
('Sale Centre (Zone Bulk)', 7, 'Zone Bulk'),
('D-44 Building Bulk Meter', 2, 'D_Building_Common'),
('D-45 Building Bulk Meter', 2, 'D_Building_Common'),
('D-46 Building Bulk Meter', 2, 'D_Building_Common'),
('D-47  Building Bulk Meter', 2, 'D_Building_Common'),
('D-48 Building Bulk Meter', 2, 'D_Building_Common'),
('D-49 Building Bulk Meter', 2, 'D_Building_Common'),
('D-50 Building Bulk Meter', 2, 'D_Building_Common'),
('D-51 Building Bulk Meter', 2, 'D_Building_Common'),
('D-52 Building Bulk Meter', 3, 'D_Building_Common'),
('D-53 Building Bulk Meter', 3, 'D_Building_Common'),
('D-54 Building Bulk Meter', 3, 'D_Building_Common'),
('D-55 Building Bulk Meter', 3, 'D_Building_Common'),
('D-56 Building Bulk Meter', 3, 'D_Building_Common'),
('D-57 Building Bulk Meter', 3, 'D_Building_Common'),
('D-58 Building Bulk Meter', 3, 'D_Building_Common'),
('D-59 Building Bulk Meter', 3, 'D_Building_Common'),
('D-60 Building Bulk Meter', 3, 'D_Building_Common'),
('D-61 Building Bulk Meter', 3, 'D_Building_Common'),
('D-62 Building Bulk Meter', 3, 'D_Building_Common'),
('D-74 Building Bulk Meter', 2, 'D_Building_Common'),
('D-75 Building Bulk Meter', 2, 'D_Building_Common');

-- =====================================================
-- 4. WATER METERS TABLE
-- =====================================================
CREATE TABLE water_meters (
    meter_id SERIAL PRIMARY KEY,
    meter_label VARCHAR(300) NOT NULL,
    account_number VARCHAR(50) UNIQUE,
    zone_id INTEGER REFERENCES water_zones(zone_id),
    meter_type_id INTEGER REFERENCES water_meter_types(type_id),
    parent_meter_id INTEGER REFERENCES water_parent_meters(parent_meter_id),
    meter_level VARCHAR(10) DEFAULT 'L3',
    location_description TEXT,
    installation_date DATE,
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'OPERATIONAL',
    last_reading_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Add indexes for better performance
    CONSTRAINT unique_meter_account UNIQUE(account_number)
);

-- Add indexes for better query performance
CREATE INDEX idx_water_meters_zone ON water_meters(zone_id);
CREATE INDEX idx_water_meters_type ON water_meters(meter_type_id);
CREATE INDEX idx_water_meters_parent ON water_meters(parent_meter_id);
CREATE INDEX idx_water_meters_account ON water_meters(account_number);
CREATE INDEX idx_water_meters_label ON water_meters(meter_label);

-- =====================================================
-- 5. WATER MONTHLY CONSUMPTION TABLE
-- =====================================================
CREATE TABLE water_monthly_consumption (
    consumption_id SERIAL PRIMARY KEY,
    meter_id INTEGER REFERENCES water_meters(meter_id) ON DELETE CASCADE,
    reading_year INTEGER NOT NULL,
    reading_month INTEGER NOT NULL CHECK (reading_month BETWEEN 1 AND 12),
    consumption_m3 DECIMAL(12,2) DEFAULT 0,
    consumption_cost DECIMAL(12,2),
    reading_date DATE,
    reading_type VARCHAR(50) DEFAULT 'MONTHLY',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one reading per meter per month
    CONSTRAINT unique_monthly_reading UNIQUE(meter_id, reading_year, reading_month)
);

-- Add indexes for time-series queries
CREATE INDEX idx_consumption_meter_date ON water_monthly_consumption(meter_id, reading_year, reading_month);
CREATE INDEX idx_consumption_year_month ON water_monthly_consumption(reading_year, reading_month);
CREATE INDEX idx_consumption_meter ON water_monthly_consumption(meter_id);

-- =====================================================
-- 6. WATER QUALITY MONITORING TABLE
-- =====================================================
CREATE TABLE water_quality_monitoring (
    quality_id SERIAL PRIMARY KEY,
    meter_id INTEGER REFERENCES water_meters(meter_id),
    test_date DATE NOT NULL,
    ph_level DECIMAL(4,2),
    turbidity DECIMAL(6,3),
    chlorine_level DECIMAL(6,3),
    tds_level DECIMAL(8,2),
    quality_status VARCHAR(50) DEFAULT 'PENDING',
    tested_by VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. WATER ALERTS AND MAINTENANCE TABLE
-- =====================================================
CREATE TABLE water_alerts (
    alert_id SERIAL PRIMARY KEY,
    meter_id INTEGER REFERENCES water_meters(meter_id),
    alert_type VARCHAR(100) NOT NULL,
    alert_level VARCHAR(50) DEFAULT 'MEDIUM',
    title VARCHAR(300) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_by VARCHAR(200),
    assigned_to VARCHAR(200),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. CREATE VIEWS FOR REPORTING
-- =====================================================

-- Zone summary view
CREATE OR REPLACE VIEW water_zone_summary AS
SELECT 
    z.zone_code,
    z.zone_name,
    z.zone_type,
    COUNT(m.meter_id) as total_meters,
    COUNT(CASE WHEN m.is_active = true THEN 1 END) as active_meters,
    SUM(CASE WHEN c.reading_year = 2024 THEN c.consumption_m3 ELSE 0 END) as consumption_2024,
    SUM(CASE WHEN c.reading_year = 2025 THEN c.consumption_m3 ELSE 0 END) as consumption_2025,
    AVG(c.consumption_m3) as avg_monthly_consumption
FROM water_zones z
LEFT JOIN water_meters m ON z.zone_id = m.zone_id
LEFT JOIN water_monthly_consumption c ON m.meter_id = c.meter_id
GROUP BY z.zone_id, z.zone_code, z.zone_name, z.zone_type;

-- Monthly consumption summary view
CREATE OR REPLACE VIEW water_monthly_summary AS
SELECT 
    c.reading_year,
    c.reading_month,
    z.zone_code,
    mt.type_name,
    SUM(c.consumption_m3) as total_consumption,
    COUNT(c.meter_id) as meters_count,
    AVG(c.consumption_m3) as avg_consumption,
    SUM(c.consumption_cost) as total_cost
FROM water_monthly_consumption c
JOIN water_meters m ON c.meter_id = m.meter_id
JOIN water_zones z ON m.zone_id = z.zone_id
JOIN water_meter_types mt ON m.meter_type_id = mt.type_id
GROUP BY c.reading_year, c.reading_month, z.zone_code, mt.type_name
ORDER BY c.reading_year, c.reading_month;

-- High consumption alerts view
CREATE OR REPLACE VIEW water_high_consumption_alerts AS
SELECT 
    m.meter_label,
    m.account_number,
    z.zone_name,
    mt.type_name,
    c.reading_year,
    c.reading_month,
    c.consumption_m3,
    AVG(c.consumption_m3) OVER (PARTITION BY m.meter_id) as avg_consumption,
    (c.consumption_m3 / AVG(c.consumption_m3) OVER (PARTITION BY m.meter_id)) * 100 as percentage_of_average
FROM water_monthly_consumption c
JOIN water_meters m ON c.meter_id = m.meter_id
JOIN water_zones z ON m.zone_id = z.zone_id
JOIN water_meter_types mt ON m.meter_type_id = mt.type_id
WHERE c.consumption_m3 > (
    SELECT AVG(consumption_m3) * 1.5 
    FROM water_monthly_consumption c2 
    WHERE c2.meter_id = c.meter_id
);

-- =====================================================
-- 9. CREATE FUNCTIONS FOR DATA ANALYSIS
-- =====================================================

-- Function to calculate consumption trends
CREATE OR REPLACE FUNCTION get_consumption_trend(
    p_meter_id INTEGER,
    p_months INTEGER DEFAULT 6
) RETURNS TABLE (
    trend_direction VARCHAR(20),
    trend_percentage DECIMAL(10,2),
    average_consumption DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH recent_data AS (
        SELECT consumption_m3,
               ROW_NUMBER() OVER (ORDER BY reading_year DESC, reading_month DESC) as rn
        FROM water_monthly_consumption 
        WHERE meter_id = p_meter_id 
        AND consumption_m3 > 0
        ORDER BY reading_year DESC, reading_month DESC 
        LIMIT p_months
    ),
    trend_calc AS (
        SELECT 
            AVG(consumption_m3) as avg_consumption,
            (MAX(CASE WHEN rn <= 3 THEN consumption_m3 END) - 
             MAX(CASE WHEN rn > 3 THEN consumption_m3 END)) / 
             NULLIF(MAX(CASE WHEN rn > 3 THEN consumption_m3 END), 0) * 100 as trend_pct
        FROM recent_data
    )
    SELECT 
        CASE 
            WHEN trend_pct > 10 THEN 'INCREASING'::VARCHAR(20)
            WHEN trend_pct < -10 THEN 'DECREASING'::VARCHAR(20)
            ELSE 'STABLE'::VARCHAR(20)
        END,
        COALESCE(trend_pct, 0)::DECIMAL(10,2),
        COALESCE(avg_consumption, 0)::DECIMAL(12,2)
    FROM trend_calc;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. SAMPLE TRIGGER FOR AUTOMATIC COST CALCULATION
-- =====================================================

-- Function to calculate consumption cost
CREATE OR REPLACE FUNCTION calculate_consumption_cost()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate cost based on meter type billing rate
    NEW.consumption_cost := NEW.consumption_m3 * (
        SELECT COALESCE(mt.billing_rate, 0.025)
        FROM water_meters m
        JOIN water_meter_types mt ON m.meter_type_id = mt.type_id
        WHERE m.meter_id = NEW.meter_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_calculate_cost
    BEFORE INSERT OR UPDATE ON water_monthly_consumption
    FOR EACH ROW
    EXECUTE FUNCTION calculate_consumption_cost();

-- =====================================================
-- 11. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE water_zones IS 'Water supply zones in Muscat Bay';
COMMENT ON TABLE water_meter_types IS 'Types of water meters with billing rates';
COMMENT ON TABLE water_meters IS 'Individual water meters with location and status';
COMMENT ON TABLE water_monthly_consumption IS 'Monthly water consumption readings';
COMMENT ON TABLE water_quality_monitoring IS 'Water quality test results';
COMMENT ON TABLE water_alerts IS 'Water system alerts and maintenance requests';

-- =====================================================
-- 12. GRANT PERMISSIONS (Adjust as needed)
-- =====================================================

-- Grant permissions to application user (adjust username as needed)
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- =====================================================
-- END OF WATER SYSTEM SCHEMA
-- =====================================================

-- Display completion message
SELECT 'Water System Database Schema Created Successfully' as status;
