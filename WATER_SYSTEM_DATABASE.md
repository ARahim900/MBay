# 💧 Muscat Bay Water System Database

## 🎯 Overview

The Muscat Bay Water System Database is a comprehensive PostgreSQL database designed to manage water meter data, consumption tracking, quality monitoring, and analytics for the Muscat Bay development. This database provides a solid foundation for the Water Analysis Module in your operations management system.

## 📊 Database Architecture

### **Core Components**

1. **Water Zones** - Geographic/functional water supply zones
2. **Water Meter Types** - Classification of different meter types with billing rates  
3. **Water Parent Meters** - Hierarchical meter relationships
4. **Water Meters** - Individual meter installations
5. **Monthly Consumption** - Time-series consumption data
6. **Quality Monitoring** - Water quality test results
7. **Alerts & Maintenance** - System alerts and maintenance tracking

### **Key Features**

✅ **Normalized Database Design** - Proper relational structure for data integrity  
✅ **Time-Series Data** - Optimized for monthly consumption tracking  
✅ **Hierarchical Meters** - Support for zone bulk and sub-meter relationships  
✅ **Automatic Cost Calculation** - Triggers calculate costs based on meter type  
✅ **Performance Optimized** - Proper indexes for fast queries  
✅ **Built-in Analytics** - Views and functions for reporting  
✅ **Quality Monitoring** - Water quality parameter tracking  
✅ **Alert System** - Maintenance and performance alerts  

---

## 🚀 Quick Start

### **1. Database Setup**

```bash
# Create PostgreSQL database
createdb muscat_bay_water

# Run the schema creation
psql muscat_bay_water < lib/database/schema/water-system.sql

# Populate with sample data
psql muscat_bay_water < lib/database/water-data-population.sql
```

### **2. Verify Installation**

```sql
-- Check tables created
\dt

-- Verify data
SELECT COUNT(*) FROM water_meters;
SELECT COUNT(*) FROM water_monthly_consumption;

-- Test views
SELECT * FROM water_zone_summary;
```

---

## 📋 Database Schema Details

### **1. Water Zones Table**

Stores geographic and functional water supply zones.

```sql
CREATE TABLE water_zones (
    zone_id SERIAL PRIMARY KEY,
    zone_code VARCHAR(50) UNIQUE NOT NULL,
    zone_name VARCHAR(200) NOT NULL,
    zone_type VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);
```

**Sample Data:**
- `Zone_01_(FM)` - Facilities Management Zone
- `Zone_03_(A)` - Zone 3A Residential  
- `Zone_03_(B)` - Zone 3B Residential
- `Zone_05` - Zone 5 Residential
- `Zone_08` - Zone 8 Residential
- `Zone_VS` - Village Square Commercial

### **2. Water Meter Types Table**

Defines meter types with their billing rates.

```sql
CREATE TABLE water_meter_types (
    type_id SERIAL PRIMARY KEY,
    type_code VARCHAR(50) UNIQUE NOT NULL,
    type_name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    billing_rate DECIMAL(10,4)
);
```

**Billing Rates:**
- Residential Villa: 0.025 OMR/m³
- Residential Apartment: 0.025 OMR/m³  
- Commercial/Retail: 0.040 OMR/m³
- Zone Bulk: 0.015 OMR/m³
- Irrigation: 0.020 OMR/m³

### **3. Water Meters Table**

Main table for individual water meters.

```sql
CREATE TABLE water_meters (
    meter_id SERIAL PRIMARY KEY,
    meter_label VARCHAR(300) NOT NULL,
    account_number VARCHAR(50) UNIQUE,
    zone_id INTEGER REFERENCES water_zones(zone_id),
    meter_type_id INTEGER REFERENCES water_meter_types(type_id),
    parent_meter_id INTEGER REFERENCES water_parent_meters(parent_meter_id),
    meter_level VARCHAR(10) DEFAULT 'L3',
    status VARCHAR(50) DEFAULT 'OPERATIONAL'
);
```

**Meter Levels:**
- `L1` - Main Bulk (NAMA supply)
- `L2` - Zone Bulk meters
- `L3` - Individual consumer meters
- `DC` - Direct Connection

### **4. Monthly Consumption Table**

Time-series data for water consumption tracking.

```sql
CREATE TABLE water_monthly_consumption (
    consumption_id SERIAL PRIMARY KEY,
    meter_id INTEGER REFERENCES water_meters(meter_id),
    reading_year INTEGER NOT NULL,
    reading_month INTEGER NOT NULL CHECK (reading_month BETWEEN 1 AND 12),
    consumption_m3 DECIMAL(12,2) DEFAULT 0,
    consumption_cost DECIMAL(12,2), -- Auto-calculated
    reading_date DATE,
    CONSTRAINT unique_monthly_reading UNIQUE(meter_id, reading_year, reading_month)
);
```

---

## 📊 Built-in Analytics

### **1. Zone Summary View**

```sql
SELECT * FROM water_zone_summary;
```

Provides:
- Total meters per zone
- Active meter counts
- Consumption totals for 2024/2025
- Average monthly consumption

### **2. Monthly Summary View**

```sql
SELECT * FROM water_monthly_summary 
WHERE reading_year = 2024 AND reading_month = 12;
```

Provides:
- Monthly consumption by zone and meter type
- Cost calculations
- Average consumption patterns

### **3. High Consumption Alerts**

```sql
SELECT * FROM water_high_consumption_alerts 
WHERE percentage_of_average > 150;
```

Identifies meters consuming 50%+ above their average.

### **4. Consumption Trend Analysis**

```sql
SELECT *, get_consumption_trend(meter_id, 6) as trend
FROM water_meters 
WHERE zone_id = 2;
```

Analyzes 6-month consumption trends per meter.

---

## 🔧 Integration with Muscat Bay App

### **1. Environment Setup**

Add to your `.env` file:

```env
# Water Database Configuration
WATER_DB_HOST=localhost
WATER_DB_PORT=5432
WATER_DB_NAME=muscat_bay_water
WATER_DB_USER=your_user
WATER_DB_PASSWORD=your_password
```

### **2. Database Connection**

Create `lib/database/water-connection.ts`:

```typescript
import { Pool } from 'pg';

const waterPool = new Pool({
  host: process.env.WATER_DB_HOST,
  port: parseInt(process.env.WATER_DB_PORT || '5432'),
  database: process.env.WATER_DB_NAME,
  user: process.env.WATER_DB_USER,
  password: process.env.WATER_DB_PASSWORD,
});

export { waterPool };
```

### **3. Data Service Layer**

Create `lib/services/water-service.ts`:

```typescript
import { waterPool } from '../database/water-connection';

export class WaterService {
  // Get zone summary
  static async getZoneSummary() {
    const result = await waterPool.query('SELECT * FROM water_zone_summary');
    return result.rows;
  }

  // Get monthly consumption
  static async getMonthlyConsumption(year: number, month: number) {
    const result = await waterPool.query(
      'SELECT * FROM water_monthly_summary WHERE reading_year = $1 AND reading_month = $2',
      [year, month]
    );
    return result.rows;
  }

  // Get meter details
  static async getMetersByZone(zoneId: number) {
    const result = await waterPool.query(`
      SELECT m.*, z.zone_name, mt.type_name, pm.parent_meter_name
      FROM water_meters m
      JOIN water_zones z ON m.zone_id = z.zone_id
      JOIN water_meter_types mt ON m.meter_type_id = mt.type_id
      LEFT JOIN water_parent_meters pm ON m.parent_meter_id = pm.parent_meter_id
      WHERE m.zone_id = $1
      ORDER BY m.meter_label
    `, [zoneId]);
    return result.rows;
  }

  // Insert consumption reading
  static async addConsumptionReading(
    meterId: number, 
    year: number, 
    month: number, 
    consumption: number
  ) {
    const result = await waterPool.query(`
      INSERT INTO water_monthly_consumption (meter_id, reading_year, reading_month, consumption_m3)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (meter_id, reading_year, reading_month)
      DO UPDATE SET consumption_m3 = $4, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [meterId, year, month, consumption]);
    return result.rows[0];
  }
}
```

### **4. API Endpoints**

Create API routes in `app/api/water/`:

**`app/api/water/zones/route.ts`:**
```typescript
import { NextResponse } from 'next/server';
import { WaterService } from '@/lib/services/water-service';

export async function GET() {
  try {
    const zones = await WaterService.getZoneSummary();
    return NextResponse.json(zones);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch zones' }, { status: 500 });
  }
}
```

**`app/api/water/consumption/[year]/[month]/route.ts`:**
```typescript
import { NextResponse } from 'next/server';
import { WaterService } from '@/lib/services/water-service';

export async function GET(
  request: Request,
  { params }: { params: { year: string; month: string } }
) {
  try {
    const consumption = await WaterService.getMonthlyConsumption(
      parseInt(params.year),
      parseInt(params.month)
    );
    return NextResponse.json(consumption);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch consumption' }, { status: 500 });
  }
}
```

---

## 📊 Sample Queries

### **1. Zone Performance Analysis**

```sql
-- Top consuming zones in 2024
SELECT 
    z.zone_name,
    SUM(c.consumption_m3) as total_consumption,
    SUM(c.consumption_cost) as total_cost,
    COUNT(DISTINCT m.meter_id) as meter_count
FROM water_zones z
JOIN water_meters m ON z.zone_id = m.zone_id
JOIN water_monthly_consumption c ON m.meter_id = c.meter_id
WHERE c.reading_year = 2024
GROUP BY z.zone_id, z.zone_name
ORDER BY total_consumption DESC;
```

### **2. Monthly Trends**

```sql
-- Monthly consumption trends
SELECT 
    c.reading_year,
    c.reading_month,
    SUM(c.consumption_m3) as total_consumption,
    AVG(c.consumption_m3) as avg_consumption,
    COUNT(c.meter_id) as active_meters
FROM water_monthly_consumption c
GROUP BY c.reading_year, c.reading_month
ORDER BY c.reading_year, c.reading_month;
```

### **3. Meter Performance**

```sql
-- Meters with highest variability
SELECT 
    m.meter_label,
    z.zone_name,
    AVG(c.consumption_m3) as avg_consumption,
    STDDEV(c.consumption_m3) as consumption_stddev,
    MIN(c.consumption_m3) as min_consumption,
    MAX(c.consumption_m3) as max_consumption
FROM water_meters m
JOIN water_zones z ON m.zone_id = z.zone_id
JOIN water_monthly_consumption c ON m.meter_id = c.meter_id
GROUP BY m.meter_id, m.meter_label, z.zone_name
HAVING COUNT(c.consumption_id) >= 12
ORDER BY consumption_stddev DESC
LIMIT 10;
```

### **4. Cost Analysis**

```sql
-- Monthly cost breakdown by meter type
SELECT 
    mt.type_name,
    c.reading_year,
    c.reading_month,
    SUM(c.consumption_m3) as total_consumption,
    SUM(c.consumption_cost) as total_cost,
    AVG(c.consumption_cost) as avg_cost_per_meter
FROM water_monthly_consumption c
JOIN water_meters m ON c.meter_id = m.meter_id
JOIN water_meter_types mt ON m.meter_type_id = mt.type_id
GROUP BY mt.type_id, mt.type_name, c.reading_year, c.reading_month
ORDER BY c.reading_year, c.reading_month, total_cost DESC;
```

---

## 🔧 Maintenance & Administration

### **1. Data Import from CSV**

```sql
-- Function to import CSV data
CREATE OR REPLACE FUNCTION import_water_data_from_csv(csv_file_path TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Implementation for CSV import
    -- This would parse your CSV files and insert into the database
    RETURN 'Data imported successfully';
END;
$$ LANGUAGE plpgsql;
```

### **2. Database Backup**

```bash
# Full database backup
pg_dump muscat_bay_water > water_backup_$(date +%Y%m%d).sql

# Schema only backup
pg_dump --schema-only muscat_bay_water > water_schema_backup.sql

# Data only backup
pg_dump --data-only muscat_bay_water > water_data_backup.sql
```

### **3. Performance Monitoring**

```sql
-- Check query performance
SELECT 
    schemaname,
    tablename,
    attname,
    inherited,
    null_frac,
    avg_width,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
AND tablename LIKE 'water_%';

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
AND tablename LIKE 'water_%';
```

---

## 🎯 Next Steps

### **1. Complete Data Migration**

1. Export all your CSV water data
2. Create migration scripts to populate all meters
3. Validate data integrity
4. Update existing Water Analysis Module to use database

### **2. Enhanced Features**

1. **Real-time Monitoring** - Add IoT meter integration
2. **Predictive Analytics** - Implement consumption forecasting
3. **Alert System** - Automated alerts for unusual patterns
4. **Mobile App Integration** - API for mobile applications
5. **Reporting Dashboard** - Advanced business intelligence

### **3. Integration Checklist**

- [ ] Database setup complete
- [ ] Sample data loaded
- [ ] API endpoints created
- [ ] Frontend integration
- [ ] Testing completed
- [ ] Production deployment
- [ ] User training
- [ ] Documentation finalized

---

## 🤝 Support

For questions or issues with the water system database:

1. Check the SQL schema files for table structures
2. Review the sample queries for common use cases  
3. Test with the sample data first
4. Verify your PostgreSQL version compatibility (12+)

The water system database is now ready to power your Muscat Bay Water Analysis Module with robust, scalable data management! 🚀

---

**Database Version:** 1.0  
**Last Updated:** 2025-01-31  
**Compatible with:** PostgreSQL 12+, Muscat Bay OMS v3.0+
