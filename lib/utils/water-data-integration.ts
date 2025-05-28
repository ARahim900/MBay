// Data integration script for loading CSV data into Water Analysis system
// This script processes the provided CSV data and formats it for the application

import { parseWaterConsumptionData, filterWaterData } from './water-analysis'

// Raw CSV data from the documents provided
export const RAW_WATER_DATA = [
  // Zone 03(A) data
  {
    "Meter Label": "Z3-42 (Villa)",
    "Acct #": "4300002",
    "Zone": "Zone_03_(A)",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 3A (BULK ZONE 3A)",
    "Label": "L3",
    "Jan-24": 61, "Feb-24": 33, "Mar-24": 36, "Apr-24": 47, "May-24": 39, "Jun-24": 42,
    "Jul-24": 25, "Aug-24": 20, "Sep-24": 44, "Oct-24": 57, "Nov-24": 51, "Dec-24": 75,
    "Jan-25": 32, "Feb-25": 46, "Mar-25": 19, "Apr-25": 62
  },
  {
    "Meter Label": "Z3-46(5) (Building)",
    "Acct #": "4300003",
    "Zone": "Zone_03_(A)",
    "Type": "Residential (Apart)",
    "Parent Meter": "D-46 Building Bulk Meter",
    "Label": "L3",
    "Jan-24": 0, "Feb-24": 0, "Mar-24": 0, "Apr-24": 0, "May-24": 0, "Jun-24": 0,
    "Jul-24": 0, "Aug-24": 0, "Sep-24": 0, "Oct-24": 0, "Nov-24": 0, "Dec-24": 0,
    "Jan-25": 5, "Feb-25": 0, "Mar-25": 0, "Apr-25": 0
  },
  // Zone 03(A) Bulk
  {
    "Meter Label": "ZONE 3A (Bulk Zone 3A)",
    "Acct #": "4300343",
    "Zone": "Zone_03_(A)",
    "Type": "Zone Bulk",
    "Parent Meter": "Main Bulk (NAMA)",
    "Label": "L2",
    "Jan-24": 1234, "Feb-24": 1099, "Mar-24": 1297, "Apr-24": 1892, "May-24": 2254, "Jun-24": 2227,
    "Jul-24": 3313, "Aug-24": 3172, "Sep-24": 2698, "Oct-24": 3715, "Nov-24": 3501, "Dec-24": 3796,
    "Jan-25": 4235, "Feb-25": 4273, "Mar-25": 3591, "Apr-25": 4041
  },
  
  // Zone 03(B) data
  {
    "Meter Label": "Z3-52(6) (Building)",
    "Acct #": "4300008",
    "Zone": "Zone_03_(B)",
    "Type": "Residential (Apart)",
    "Parent Meter": "D-52 Building Bulk Meter",
    "Label": "L3",
    "Jan-24": 27, "Feb-24": 22, "Mar-24": 19, "Apr-24": 28, "May-24": 27, "Jun-24": 27,
    "Jul-24": 298, "Aug-24": 58, "Sep-24": 14, "Oct-24": 18, "Nov-24": 17, "Dec-24": 8,
    "Jan-25": 10, "Feb-25": 9, "Mar-25": 9, "Apr-25": 14
  },
  // Zone 03(B) Bulk
  {
    "Meter Label": "ZONE 3B (Bulk Zone 3B)",
    "Acct #": "4300344",
    "Zone": "Zone_03_(B)",
    "Type": "Zone Bulk",
    "Parent Meter": "Main Bulk (NAMA)",
    "Label": "L2",
    "Jan-24": 2653, "Feb-24": 2169, "Mar-24": 2315, "Apr-24": 2381, "May-24": 2634, "Jun-24": 2932,
    "Jul-24": 3369, "Aug-24": 3458, "Sep-24": 3742, "Oct-24": 2906, "Nov-24": 2695, "Dec-24": 3583,
    "Jan-25": 3256, "Feb-25": 2962, "Mar-25": 3331, "Apr-25": 2157
  },

  // Zone 05 data
  {
    "Meter Label": "Z5-17",
    "Acct #": "4300001",
    "Zone": "Zone_05",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 5 (Bulk Zone 5)",
    "Label": "L3",
    "Jan-24": 99, "Feb-24": 51, "Mar-24": 53, "Apr-24": 62, "May-24": 135, "Jun-24": 140,
    "Jul-24": 34, "Aug-24": 132, "Sep-24": 63, "Oct-24": 103, "Nov-24": 54, "Dec-24": 148,
    "Jan-25": 112, "Feb-25": 80, "Mar-25": 81, "Apr-25": 90
  },
  // Zone 05 Bulk
  {
    "Meter Label": "ZONE 5 (Bulk Zone 5)",
    "Acct #": "4300345",
    "Zone": "Zone_05",
    "Type": "Zone Bulk",
    "Parent Meter": "Main Bulk (NAMA)",
    "Label": "L2",
    "Jan-24": 4286, "Feb-24": 3897, "Mar-24": 4127, "Apr-24": 4911, "May-24": 2639, "Jun-24": 4992,
    "Jul-24": 5305, "Aug-24": 4039, "Sep-24": 2736, "Oct-24": 3383, "Nov-24": 1438, "Dec-24": 3788,
    "Jan-25": 4267, "Feb-25": 4231, "Mar-25": 3862, "Apr-25": 3737
  },

  // Zone 08 data
  {
    "Meter Label": "Z8-11",
    "Acct #": "4300023",
    "Zone": "Zone_08",
    "Type": "Residential (Villa)",
    "Parent Meter": "BULK ZONE 8",
    "Label": "L3",
    "Jan-24": 0, "Feb-24": 1, "Mar-24": 0, "Apr-24": 0, "May-24": 1, "Jun-24": 2,
    "Jul-24": 3, "Aug-24": 2, "Sep-24": 2, "Oct-24": 1, "Nov-24": 1, "Dec-24": 2,
    "Jan-25": 0, "Feb-25": 0, "Mar-25": 1, "Apr-25": 0
  },
  // Zone 08 Bulk
  {
    "Meter Label": "ZONE 8 (Bulk Zone 8)",
    "Acct #": "4300342",
    "Zone": "Zone_08",
    "Type": "Zone Bulk",
    "Parent Meter": "Main Bulk (NAMA)",
    "Label": "L2",
    "Jan-24": 2170, "Feb-24": 1825, "Mar-24": 2021, "Apr-24": 2753, "May-24": 2722, "Jun-24": 3193,
    "Jul-24": 3639, "Aug-24": 3957, "Sep-24": 3947, "Oct-24": 4296, "Nov-24": 3569, "Dec-24": 3018,
    "Jan-25": 1547, "Feb-25": 1498, "Mar-25": 2605, "Apr-25": 3203
  },

  // Zone FM data
  {
    "Meter Label": "Building FM",
    "Acct #": "4300296",
    "Zone": "Zone_01_(FM)",
    "Type": "MB_Common",
    "Parent Meter": "ZONE FM ( BULK ZONE FM )",
    "Label": "L3",
    "Jan-24": 3, "Feb-24": 4, "Mar-24": 4, "Apr-24": 3, "May-24": 2, "Jun-24": 2,
    "Jul-24": 1, "Aug-24": 8, "Sep-24": 2, "Oct-24": 7, "Nov-24": 2, "Dec-24": 3,
    "Jan-25": 2, "Feb-25": 3, "Mar-25": 7, "Apr-25": 3
  },
  // Zone FM Bulk
  {
    "Meter Label": "ZONE FM ( BULK ZONE FM )",
    "Acct #": "4300346",
    "Zone": "Zone_01_(FM)",
    "Type": "Zone Bulk",
    "Parent Meter": "Main Bulk (NAMA)",
    "Label": "L2",
    "Jan-24": 1595, "Feb-24": 1283, "Mar-24": 1255, "Apr-24": 1383, "May-24": 1411, "Jun-24": 2078,
    "Jul-24": 2601, "Aug-24": 1638, "Sep-24": 1550, "Oct-24": 2098, "Nov-24": 1808, "Dec-24": 1946,
    "Jan-25": 2008, "Feb-25": 1740, "Mar-25": 1880, "Apr-25": 1880
  },

  // Village Square data
  {
    "Meter Label": "Coffee 1 (GF Shop No.591)",
    "Acct #": "4300327",
    "Zone": "Zone_VS",
    "Type": "Retail",
    "Parent Meter": "Village Square (Zone Bulk)",
    "Label": "L3",
    "Jan-24": 0, "Feb-24": 0, "Mar-24": 0, "Apr-24": 0, "May-24": 0, "Jun-24": 0,
    "Jul-24": 0, "Aug-24": 0, "Sep-24": 0, "Oct-24": 0, "Nov-24": 0, "Dec-24": 0,
    "Jan-25": 0, "Feb-25": 0, "Mar-25": 3, "Apr-25": 3
  },
  // Village Square Bulk
  {
    "Meter Label": "Village Square (Zone Bulk)",
    "Acct #": "4300335",
    "Zone": "Zone_VS",
    "Type": "Zone Bulk",
    "Parent Meter": "Main Bulk (NAMA)",
    "Label": "L2",
    "Jan-24": 26, "Feb-24": 19, "Mar-24": 72, "Apr-24": 60, "May-24": 125, "Jun-24": 277,
    "Jul-24": 143, "Aug-24": 137, "Sep-24": 145, "Oct-24": 63, "Nov-24": 34, "Dec-24": 17,
    "Jan-25": 14, "Feb-25": 12, "Mar-25": 21, "Apr-25": 13
  }
]

// Function to load and process the actual CSV data
export const loadWaterConsumptionData = () => {
  // Parse the raw data
  const parsedData = parseWaterConsumptionData(RAW_WATER_DATA)
  
  // Filter out excluded meters (4300336 & 4300338) and focus on zone bulks
  const filteredData = filterWaterData(parsedData)
  
  console.log('Loaded water consumption data:', {
    totalRecords: RAW_WATER_DATA.length,
    parsedRecords: parsedData.length,
    filteredRecords: filteredData.length,
    excludedMeters: ['4300336', '4300338']
  })
  
  return filteredData
}

// Function to validate data integrity
export const validateWaterData = (data: any[]) => {
  const issues = []
  
  data.forEach((record, index) => {
    // Check for missing required fields
    if (!record['Meter Label']) {
      issues.push(`Row ${index + 1}: Missing Meter Label`)
    }
    
    if (!record['Acct #']) {
      issues.push(`Row ${index + 1}: Missing Account Number`)
    }
    
    if (!record.Zone) {
      issues.push(`Row ${index + 1}: Missing Zone`)
    }
    
    // Check for excluded meters
    if (record['Acct #'] === '4300336' || record['Acct #'] === '4300338') {
      issues.push(`Row ${index + 1}: Contains excluded meter ${record['Acct #']}`)
    }
    
    // Validate monthly data
    const monthlyColumns = [
      'Jan-24', 'Feb-24', 'Mar-24', 'Apr-24', 'May-24', 'Jun-24',
      'Jul-24', 'Aug-24', 'Sep-24', 'Oct-24', 'Nov-24', 'Dec-24',
      'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25'
    ]
    
    monthlyColumns.forEach(month => {
      const value = record[month]
      if (value !== undefined && (isNaN(value) || value < 0)) {
        issues.push(`Row ${index + 1}: Invalid value for ${month}: ${value}`)
      }
    })
  })
  
  return {
    isValid: issues.length === 0,
    issues,
    summary: {
      totalRecords: data.length,
      issueCount: issues.length,
      validRecords: data.length - issues.length
    }
  }
}

// Export configuration for each zone
export const ZONE_EXPORT_CONFIG = {
  'Zone_01_(FM)': {
    filename: 'zone-01-fm-water-consumption',
    displayName: 'Zone 01 (FM) Water Consumption'
  },
  'Zone_03_(A)': {
    filename: 'zone-03a-water-consumption',
    displayName: 'Zone 03(A) Water Consumption'
  },
  'Zone_03_(B)': {
    filename: 'zone-03b-water-consumption', 
    displayName: 'Zone 03(B) Water Consumption'
  },
  'Zone_05': {
    filename: 'zone-05-water-consumption',
    displayName: 'Zone 05 Water Consumption'
  },
  'Zone_08': {
    filename: 'zone-08-water-consumption',
    displayName: 'Zone 08 Water Consumption'
  },
  'Zone_VS': {
    filename: 'village-square-water-consumption',
    displayName: 'Village Square Water Consumption'
  }
}

// Function to generate summary report
export const generateWaterConsumptionSummary = (data: any[]) => {
  const summary = {
    totalMeters: data.length,
    zoneBreakdown: {} as Record<string, number>,
    typeBreakdown: {} as Record<string, number>,
    excludedMeters: ['4300336', '4300338'],
    dataRange: 'January 2024 - April 2025',
    lastUpdated: new Date().toISOString()
  }
  
  data.forEach(record => {
    // Zone breakdown
    const zone = record.Zone || 'Unknown'
    summary.zoneBreakdown[zone] = (summary.zoneBreakdown[zone] || 0) + 1
    
    // Type breakdown
    const type = record.Type || 'Unknown'
    summary.typeBreakdown[type] = (summary.typeBreakdown[type] || 0) + 1
  })
  
  return summary
}
