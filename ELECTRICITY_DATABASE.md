# 🔌 Electricity Database System Documentation

## Overview

The Muscat Bay Electricity Database System is a comprehensive solution for managing electricity consumption data across all facilities and units in the Muscat Bay development. This system provides robust data storage, validation, analytics, and reporting capabilities for operational management.

## 📊 Database Structure

### Core Tables

#### 1. `electricity_units`
The main table storing all electricity consumption units.

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT (PK) | Unique unit identifier |
| `sl_no` | INT (UNIQUE) | Serial number from source data |
| `zone` | VARCHAR(100) | Zone location (Infrastructure, Zone 3, etc.) |
| `type` | VARCHAR(100) | Unit type (MC, SBJ Common Meter, Building) |
| `muscat_bay_number` | VARCHAR(100) | Muscat Bay reference number |
| `unit_number` | VARCHAR(200) | Municipality unit number |
| `unit_name` | VARCHAR(255) | Descriptive name of the unit |
| `category` | VARCHAR(100) | Auto-categorized type (Pumping Station, Apartment, etc.) |
| `meter_account_no` | VARCHAR(100) | Electricity meter account number |
| `total_consumption` | DECIMAL(12,2) | Calculated total consumption |
| `average_consumption` | DECIMAL(12,2) | Calculated average consumption |
| `peak_consumption` | DECIMAL(12,2) | Highest monthly consumption |
| `lowest_consumption` | DECIMAL(12,2) | Lowest monthly consumption |
| `is_active` | BOOLEAN | Unit status |
| `created_at` | TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | Last update date |
| `last_reading_date` | TIMESTAMP | Last consumption reading |

#### 2. `consumption_records`
Individual consumption readings for each unit by month.

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT (PK) | Unique record identifier |
| `unit_id` | BIGINT (FK) | Reference to electricity_units |
| `month` | VARCHAR(20) | Month identifier (e.g., "November-24") |
| `year` | INT | Year of consumption |
| `consumption` | DECIMAL(12,2) | kWh consumption for the month |
| `cost` | DECIMAL(12,2) | Calculated cost in OMR |
| `billing_date` | DATE | Billing period date |
| `reading_date` | DATE | Meter reading date |
| `meter_reading` | DECIMAL(12,2) | Actual meter reading |
| `previous_reading` | DECIMAL(12,2) | Previous meter reading |
| `is_estimated` | BOOLEAN | Whether reading is estimated |
| `notes` | TEXT | Additional notes |
| `created_at` | TIMESTAMP | Record creation |
| `updated_at` | TIMESTAMP | Last update |

### Reference Tables

#### 3. `electricity_categories`
Predefined categories for unit classification.

#### 4. `electricity_zones`
Zone reference data.

#### 5. `electricity_unit_types`
Unit type reference data.

### Analytics Tables

#### 6. `consumption_summary`
Aggregated consumption data for faster analytics.

#### 7. `electricity_audit_log`
Audit trail for all data changes.

#### 8. `data_import_log`
Import operation tracking.

## 🏗️ Data Architecture

### Current Data Structure (From Your File)

```
SL:no. | Zone | Type | Muscat Bay Number | Unit Number | Electrical Meter Account No | Nov-24 | Dec-24 | Jan-25 | Feb-25 | Mar-25 | Apr-25
-------|------|------|-------------------|-------------|---------------------------|--------|--------|--------|--------|--------|--------
1      | Infrastructure | MC | MC | Pumping Station 01 | R52330 | 1629 | 1640 | 1903 | 2095 | 3032 | 3940
...    | ...            | ...| ...| ...                | ...    | ...  | ...  | ...  | ...  | ...  | ...
```

### Enhanced Database Structure

Your data is transformed into a normalized structure:

- **Units Table**: Core unit information
- **Consumption Records**: Individual monthly readings
- **Categories**: Auto-classified unit types
- **Analytics**: Calculated statistics and trends

## 🚀 Getting Started

### 1. Installation & Setup

```bash
# Navigate to your project
cd MBay

# Install dependencies (if not already installed)
pnpm install

# Set up environment variables
cp .env.example .env
```

### 2. Environment Configuration

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=muscat_bay_db
DB_USER=your_username
DB_PASSWORD=your_password

# Application Configuration
OMR_PER_KWH=0.025
```

### 3. Database Migration

```bash
# Run complete migration
npm run migrate

# Or run specific migration steps
npm run migrate schema    # Create database schema
npm run migrate import    # Import electricity data
npm run migrate validate  # Validate imported data
npm run migrate indexes   # Create performance indexes
npm run migrate stats     # Calculate initial statistics
```

## 💻 Usage Examples

### Using the Electricity Service

```typescript
import { electricityService } from '@/lib/services/electricity-service';

// Get all units with filtering
const units = await electricityService.getUnits({
  page: 1,
  limit: 20,
  filters: {
    zone: 'Infrastructure',
    category: 'Pumping Station'
  },
  sortBy: {
    field: 'totalConsumption',
    direction: 'desc'
  }
});

// Get analytics for a specific unit
const analytics = await electricityService.getUnitAnalytics(1);

// Get summary statistics
const summary = await electricityService.getSummaryStatistics();

// Search units
const searchResults = await electricityService.searchUnits('pumping');

// Get top consumers
const topConsumers = await electricityService.getTopConsumers(10);
```

### Working with Consumption Data

```typescript
// Add new consumption record
const result = await electricityService.addConsumptionRecord({
  unitId: 1,
  month: 'May-25',
  year: 2025,
  consumption: 2450.5,
  readingDate: new Date(),
  isEstimated: false
});

// Bulk import consumption data
const bulkResult = await electricityService.bulkImportConsumption([
  { unitId: 1, month: 'May-25', year: 2025, consumption: 2450.5 },
  { unitId: 2, month: 'May-25', year: 2025, consumption: 1820.3 },
  // ... more records
]);
```

### Data Export

```typescript
// Export to JSON
const jsonData = await electricityService.exportData('json');

// Export to CSV
const csvData = await electricityService.exportData('csv');

// Save to file
import { writeFileSync } from 'fs';
writeFileSync('electricity-data.json', jsonData);
```

## 📈 Analytics & Reporting

### Available Analytics

1. **Consumption Analytics**
   - Total consumption per unit
   - Monthly trends
   - Peak/lowest consumption periods
   - Consumption patterns

2. **Category Analysis**
   - Consumption by category
   - Category distribution
   - Performance comparisons

3. **Zone Analysis**
   - Zone-wise consumption
   - Zone efficiency metrics
   - Comparative analysis

4. **Cost Analysis**
   - Total electricity costs
   - Cost per unit/category/zone
   - Budget tracking

### Using Analytics

```typescript
// Get monthly trends
const trends = await electricityService.getMonthlyTrends();

// Get consumption by category
const categoryData = await electricityService.getConsumptionByCategory();

// Get comprehensive analytics
const analytics = await electricityService.getConsumptionAnalytics();
```

## 🔍 Data Validation

### Built-in Validation

- **Unit Validation**: Name, zone, type requirements
- **Consumption Validation**: Positive values, realistic ranges
- **Duplicate Detection**: Serial numbers, meter accounts
- **Data Integrity**: Referential integrity, required fields

### Running Validation

```typescript
// Get validation report
const validation = await electricityService.getDataValidation();

console.log('Validation Results:', {
  duplicateSerialNumbers: validation.duplicateSerialNumbers,
  missingMeterAccounts: validation.missingMeterAccounts,
  zeroConsumptionUnits: validation.zeroConsumptionUnits
});
```

## 🏷️ Categories & Classification

### Auto-Generated Categories

Your data is automatically classified into these categories:

- **Pumping Station** (4 units)
- **Lifting Station** (4 units)
- **Irrigation Tank** (4 units)
- **Actuator DB** (6 units)
- **Street Light** (5 units)
- **Apartment** (21 units)
- **Ancillary Building** (3 units)
- **Central Park** (1 unit)
- **Village Square** (1 unit)
- **Commercial (Bank)** (1 unit)
- **Commercial (Kitchen)** (1 unit)
- **Landscape Light** (3 units)
- **Beachwell** (1 unit)
- **Helipad** (1 unit)

### Zone Distribution

- **Infrastructure**: 25 units
- **Zone 3**: 24 units
- **Central Park**: 1 unit
- **Ancillary**: 3 units
- **Commercial**: 3 units

## 📊 Performance Optimization

### Database Indexes

The system includes optimized indexes for:

- Zone-based queries
- Category filtering
- Meter account lookups
- Consumption range queries
- Date-based filtering
- Unit name searches

### Query Performance

- **Views**: Pre-calculated summaries
- **Stored Procedures**: Complex calculations
- **Triggers**: Automatic statistics updates
- **Indexing**: Optimized data access

## 🛡️ Security & Audit

### Audit Trail

All data changes are tracked in `electricity_audit_log`:

- Table and record modified
- Old and new values (JSON)
- User and timestamp
- IP address and user agent

### Data Validation

- Input sanitization
- Type validation
- Range checking
- Business rule enforcement

## 🔄 Maintenance

### Regular Tasks

1. **Statistics Refresh**
   ```sql
   CALL RefreshAllUnitStatistics();
   ```

2. **Data Backup**
   ```bash
   npm run backup-electricity-data
   ```

3. **Performance Monitoring**
   ```sql
   SELECT * FROM monthly_consumption_summary;
   ```

### Troubleshooting

#### Common Issues

1. **Missing Meter Accounts**
   - Units: Bank Muscat, CIF Kitchen
   - Status: Tracked in validation report

2. **Zero Consumption Units**
   - Units: Lifting Station 02, Helipad, Zone-3 landscape light 17
   - Reason: Inactive or not yet operational

3. **Data Import Errors**
   - Check validation results
   - Review error logs
   - Verify data format

## 🔮 Future Enhancements

### Planned Features

1. **Real-time Data Integration**
   - Direct meter readings
   - IoT sensor integration
   - Automated data collection

2. **Advanced Analytics**
   - Predictive analytics
   - Anomaly detection
   - Energy efficiency scoring

3. **Reporting Dashboard**
   - Executive dashboards
   - Automated reports
   - Alert systems

4. **Mobile Application**
   - Field data entry
   - Mobile reporting
   - Offline capability

## 📞 Support & Maintenance

### Getting Help

For issues with the electricity database system:

1. Check this documentation
2. Review error logs
3. Validate data integrity
4. Contact system administrators

### System Monitoring

Monitor these key metrics:

- Database performance
- Data validation scores
- Import success rates
- Query response times

---

## 📋 Summary

Your electricity database system now includes:

✅ **Comprehensive Schema** - 8 tables, 3 views, stored procedures
✅ **56 Electricity Units** - All your facility units organized
✅ **336 Consumption Records** - 6 months of data per unit
✅ **15 Categories** - Auto-classified for easy filtering
✅ **5 Zones** - Geographic organization
✅ **Full CRUD Operations** - Create, read, update, delete
✅ **Advanced Analytics** - Trends, summaries, comparisons
✅ **Data Validation** - Quality assurance and integrity
✅ **Performance Optimization** - Indexes and query optimization
✅ **Migration Scripts** - Easy setup and maintenance
✅ **TypeScript Support** - Full type safety

The system is production-ready and can handle your current data while being scalable for future growth! 🎉
