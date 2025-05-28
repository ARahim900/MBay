// Data integration script for loading CSV data into Water Analysis system
// This script processes the provided CSV data and formats it for the application
// IMPORTANT: Automatically excludes meters 4300336 & 4300338 as requested

import { parseWaterConsumptionData, filterWaterData } from './water-analysis'

// Complete CSV data from the provided documents - Zone 03(A), 03(B), 05, 08, FM, VS, Main Bulk
export const RAW_WATER_DATA = [
  // Zone 03(A) data - COMPLETE DATASET
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
  {
    "Meter Label": "Z3-49(3) (Building)",
    "Acct #": "4300004",
    "Zone": "Zone_03_(A)",
    "Type": "Residential (Apart)",
    "Parent Meter": "D-49 Building Bulk Meter",
    "Label": "L3",
    "Jan-24": 1, "Feb-24": 1, "Mar-24": 22, "Apr-24": 30, "May-24": 18, "Jun-24": 6,
    "Jul-24": 7, "Aug-24": 11, "Sep-24": 7, "Oct-24": 10, "Nov-24": 9, "Dec-24": 5,
    "Jan-25": 10, "Feb-25": 15, "Mar-25": 11, "Apr-25": 13
  },
  {
    "Meter Label": "Z3-38 (Villa)",
    "Acct #": "4300005",
    "Zone": "Zone_03_(A)",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 3A (BULK ZONE 3A)",
    "Label": "L3",
    "Jan-24": 0, "Feb-24": 0, "Mar-24": 0, "Apr-24": 0, "May-24": 0, "Jun-24": 3,
    "Jul-24": 0, "Aug-24": 4, "Sep-24": 30, "Oct-24": 2, "Nov-24": 12, "Dec-24": 11,
    "Jan-25": 10, "Feb-25": 7, "Mar-25": 7, "Apr-25": 7
  },
  {
    "Meter Label": "Z3-75(4) (Building)",
    "Acct #": "4300006",
    "Zone": "Zone_03_(A)",
    "Type": "Residential (Apart)",
    "Parent Meter": "D-75 Building Bulk Meter",
    "Label": "L3",
    "Jan-24": 0, "Feb-24": 14, "Mar-24": 3, "Apr-24": 0, "May-24": 0, "Jun-24": 0,
    "Jul-24": 0, "Aug-24": 0, "Sep-24": 0, "Oct-24": 0, "Nov-24": 7, "Dec-24": 6,
    "Jan-25": 0, "Feb-25": 0, "Mar-25": 0, "Apr-25": 0
  },
  {
    "Meter Label": "Z3-31 (Villa)",
    "Acct #": "4300052",
    "Zone": "Zone_03_(A)",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 3A (BULK ZONE 3A)",
    "Label": "L3",
    "Jan-24": 115, "Feb-24": 105, "Mar-24": 86, "Apr-24": 81, "May-24": 140, "Jun-24": 135,
    "Jul-24": 151, "Aug-24": 258, "Sep-24": 222, "Oct-24": 37, "Nov-24": 164, "Dec-24": 176,
    "Jan-25": 165, "Feb-25": 133, "Mar-25": 30, "Apr-25": 306
  },
  {
    "Meter Label": "Z3-43 (Villa)",
    "Acct #": "4300050",
    "Zone": "Zone_03_(A)",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 3A (BULK ZONE 3A)",
    "Label": "L3",
    "Jan-24": 79, "Feb-24": 67, "Mar-24": 50, "Apr-24": 62, "May-24": 72, "Jun-24": 75,
    "Jul-24": 49, "Aug-24": 83, "Sep-24": 76, "Oct-24": 91, "Nov-24": 77, "Dec-24": 70,
    "Jan-25": 70, "Feb-25": 68, "Mar-25": 46, "Apr-25": 52
  },
  {
    "Meter Label": "Z3-35 (Villa)",
    "Acct #": "4300075",
    "Zone": "Zone_03_(A)",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 3A (BULK ZONE 3A)",
    "Label": "L3",
    "Jan-24": 82, "Feb-24": 78, "Mar-24": 77, "Apr-24": 67, "May-24": 91, "Jun-24": 54,
    "Jul-24": 58, "Aug-24": 70, "Sep-24": 78, "Oct-24": 92, "Nov-24": 83, "Dec-24": 69,
    "Jan-25": 65, "Feb-25": 61, "Mar-25": 52, "Apr-25": 74
  },
  {
    "Meter Label": "Z3-40 (Villa)",
    "Acct #": "4300079",
    "Zone": "Zone_03_(A)",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 3A (BULK ZONE 3A)",
    "Label": "L3",
    "Jan-24": 26, "Feb-24": 18, "Mar-24": 25, "Apr-24": 19, "May-24": 26, "Jun-24": 19,
    "Jul-24": 12, "Aug-24": 10, "Sep-24": 12, "Oct-24": 36, "Nov-24": 20, "Dec-24": 20,
    "Jan-25": 18, "Feb-25": 23, "Mar-25": 37, "Apr-25": 37
  },
  {
    "Meter Label": "Z3-36 (Villa)",
    "Acct #": "4300084",
    "Zone": "Zone_03_(A)",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 3A (BULK ZONE 3A)",
    "Label": "L3",
    "Jan-24": 13, "Feb-24": 11, "Mar-24": 22, "Apr-24": 44, "May-24": 85, "Jun-24": 68,
    "Jul-24": 61, "Aug-24": 58, "Sep-24": 72, "Oct-24": 102, "Nov-24": 115, "Dec-24": 93,
    "Jan-25": 81, "Feb-25": 83, "Mar-25": 69, "Apr-25": 83
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

  // Zone 03(B) data - COMPLETE DATASET
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
  {
    "Meter Label": "Z3-21 (Villa)",
    "Acct #": "4300009",
    "Zone": "Zone_03_(B)",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 3B (BULK ZONE 3B)",
    "Label": "L3",
    "Jan-24": 37, "Feb-24": 38, "Mar-24": 24, "Apr-24": 20, "May-24": 31, "Jun-24": 41,
    "Jul-24": 9, "Aug-24": 54, "Sep-24": 263, "Oct-24": 68, "Nov-24": 45, "Dec-24": 43,
    "Jan-25": 41, "Feb-25": 53, "Mar-25": 42, "Apr-25": 48
  },
  {
    "Meter Label": "Z3-12 (Villa)",
    "Acct #": "4300076",
    "Zone": "Zone_03_(B)",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 3B (BULK ZONE 3B)",
    "Label": "L3",
    "Jan-24": 52, "Feb-24": 95, "Mar-24": 258, "Apr-24": 55, "May-24": 67, "Jun-24": 111,
    "Jul-24": 93, "Aug-24": 120, "Sep-24": 118, "Oct-24": 178, "Nov-24": 55, "Dec-24": 67,
    "Jan-25": 73, "Feb-25": 59, "Mar-25": 54, "Apr-25": 181
  },
  {
    "Meter Label": "Z3-4 (Villa)",
    "Acct #": "4300078",
    "Zone": "Zone_03_(B)",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 3B (BULK ZONE 3B)",
    "Label": "L3",
    "Jan-24": 105, "Feb-24": 90, "Mar-24": 96, "Apr-24": 106, "May-24": 126, "Jun-24": 122,
    "Jul-24": 156, "Aug-24": 150, "Sep-24": 97, "Oct-24": 171, "Nov-24": 56, "Dec-24": 111,
    "Jan-25": 90, "Feb-25": 55, "Mar-25": 22, "Apr-25": 23
  },
  {
    "Meter Label": "Z3-3 (Villa)",
    "Acct #": "4300088",
    "Zone": "Zone_03_(B)",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 3B (BULK ZONE 3B)",
    "Label": "L3",
    "Jan-24": 78, "Feb-24": 66, "Mar-24": 80, "Apr-24": 91, "May-24": 84, "Jun-24": 84,
    "Jul-24": 83, "Aug-24": 61, "Sep-24": 67, "Oct-24": 78, "Nov-24": 69, "Dec-24": 86,
    "Jan-25": 66, "Feb-25": 59, "Mar-25": 63, "Apr-25": 73
  },
  {
    "Meter Label": "Z3-8 (Villa)",
    "Acct #": "4300105",
    "Zone": "Zone_03_(B)",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 3B (BULK ZONE 3B)",
    "Label": "L3",
    "Jan-24": 56, "Feb-24": 32, "Mar-24": 19, "Apr-24": 15, "May-24": 49, "Jun-24": 40,
    "Jul-24": 38, "Aug-24": 25, "Sep-24": 49, "Oct-24": 68, "Nov-24": 181, "Dec-24": 290,
    "Jan-25": 83, "Feb-25": 106, "Mar-25": 196, "Apr-25": 358
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

  // Zone 05 data - COMPLETE DATASET
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
  {
    "Meter Label": "Z5-13",
    "Acct #": "4300058",
    "Zone": "Zone_05",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 5 (Bulk Zone 5)",
    "Label": "L3",
    "Jan-24": 78, "Feb-24": 73, "Mar-24": 9, "Apr-24": 46, "May-24": 17, "Jun-24": 83,
    "Jul-24": 40, "Aug-24": 80, "Sep-24": 61, "Oct-24": 56, "Nov-24": 68, "Dec-24": 85,
    "Jan-25": 72, "Feb-25": 106, "Mar-25": 89, "Apr-25": 120
  },
  {
    "Meter Label": "Z5-14",
    "Acct #": "4300059",
    "Zone": "Zone_05",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 5 (Bulk Zone 5)",
    "Label": "L3",
    "Jan-24": 68, "Feb-24": 56, "Mar-24": 52, "Apr-24": 250, "May-24": 128, "Jun-24": 100,
    "Jul-24": 12, "Aug-24": 20, "Sep-24": 22, "Oct-24": 22, "Nov-24": 62, "Dec-24": 72,
    "Jan-25": 71, "Feb-25": 93, "Mar-25": 77, "Apr-25": 93
  },
  {
    "Meter Label": "Z5-4",
    "Acct #": "4300150",
    "Zone": "Zone_05",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 5 (Bulk Zone 5)",
    "Label": "L3",
    "Jan-24": 54, "Feb-24": 40, "Mar-24": 98, "Apr-24": 36, "May-24": 30, "Jun-24": 52,
    "Jul-24": 110, "Aug-24": 85, "Sep-24": 32, "Oct-24": 38, "Nov-24": 86, "Dec-24": 100,
    "Jan-25": 81, "Feb-25": 98, "Mar-25": 35, "Apr-25": 49
  },
  {
    "Meter Label": "Z5-9",
    "Acct #": "4300155",
    "Zone": "Zone_05",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 5 (Bulk Zone 5)",
    "Label": "L3",
    "Jan-24": 72, "Feb-24": 97, "Mar-24": 84, "Apr-24": 96, "May-24": 158, "Jun-24": 82,
    "Jul-24": 70, "Aug-24": 74, "Sep-24": 95, "Oct-24": 134, "Nov-24": 94, "Dec-24": 56,
    "Jan-25": 38, "Feb-25": 49, "Mar-25": 40, "Apr-25": 56
  },
  {
    "Meter Label": "Z5-12",
    "Acct #": "4300166",
    "Zone": "Zone_05",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 5 (Bulk Zone 5)",
    "Label": "L3",
    "Jan-24": 59, "Feb-24": 78, "Mar-24": 49, "Apr-24": 39, "May-24": 89, "Jun-24": 105,
    "Jul-24": 90, "Aug-24": 90, "Sep-24": 84, "Oct-24": 112, "Nov-24": 89, "Dec-24": 71,
    "Jan-25": 44, "Feb-25": 47, "Mar-25": 40, "Apr-25": 66
  },
  {
    "Meter Label": "Z5-22",
    "Acct #": "4300163",
    "Zone": "Zone_05",
    "Type": "Residential (Villa)",
    "Parent Meter": "ZONE 5 (Bulk Zone 5)",
    "Label": "L3",
    "Jan-24": 89, "Feb-24": 32, "Mar-24": 38, "Apr-24": 10, "May-24": 36, "Jun-24": 17,
    "Jul-24": 21, "Aug-24": 39, "Sep-24": 0, "Oct-24": 18, "Nov-24": 25, "Dec-24": 28,
    "Jan-25": 15, "Feb-25": 40, "Mar-25": 186, "Apr-25": 243
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

  // Zone 08 data - COMPLETE DATASET
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
  {
    "Meter Label": "Z8-13",
    "Acct #": "4300024",
    "Zone": "Zone_08",
    "Type": "Residential (Villa)",
    "Parent Meter": "BULK ZONE 8",
    "Label": "L3",
    "Jan-24": 6, "Feb-24": 2, "Mar-24": 1, "Apr-24": 1, "May-24": 0, "Jun-24": 1,
    "Jul-24": 5, "Aug-24": 0, "Sep-24": 0, "Oct-24": 0, "Nov-24": 3, "Dec-24": 2,
    "Jan-25": 1, "Feb-25": 0, "Mar-25": 0, "Apr-25": 0
  },
  {
    "Meter Label": "Z8-12",
    "Acct #": "4300196",
    "Zone": "Zone_08",
    "Type": "Residential (Villa)",
    "Parent Meter": "BULK ZONE 8",
    "Label": "L3",
    "Jan-24": 109, "Feb-24": 148, "Mar-24": 169, "Apr-24": 235, "May-24": 180, "Jun-24": 235,
    "Jul-24": 237, "Aug-24": 442, "Sep-24": 661, "Oct-24": 417, "Nov-24": 223, "Dec-24": 287,
    "Jan-25": 236, "Feb-25": 192, "Mar-25": 249, "Apr-25": 267
  },
  {
    "Meter Label": "Z8-15",
    "Acct #": "4300198",
    "Zone": "Zone_08",
    "Type": "Residential (Villa)",
    "Parent Meter": "BULK ZONE 8",
    "Label": "L3",
    "Jan-24": 227, "Feb-24": 74, "Mar-24": 90, "Apr-24": 145, "May-24": 179, "Jun-24": 100,
    "Jul-24": 136, "Aug-24": 152, "Sep-24": 144, "Oct-24": 87, "Nov-24": 100, "Dec-24": 99,
    "Jan-25": 61, "Feb-25": 70, "Mar-25": 125, "Apr-25": 0
  },
  {
    "Meter Label": "Z8-5",
    "Acct #": "4300287",
    "Zone": "Zone_08",
    "Type": "Residential (Villa)",
    "Parent Meter": "BULK ZONE 8",
    "Label": "L3",
    "Jan-24": 131, "Feb-24": 117, "Mar-24": 131, "Apr-24": 142, "May-24": 208, "Jun-24": 247,
    "Jul-24": 272, "Aug-24": 344, "Sep-24": 236, "Oct-24": 280, "Nov-24": 309, "Dec-24": 314,
    "Jan-25": 208, "Feb-25": 341, "Mar-25": 313, "Apr-25": 336
  },
  {
    "Meter Label": "Z8-22",
    "Acct #": "4300293",
    "Zone": "Zone_08",
    "Type": "Residential (Villa)",
    "Parent Meter": "BULK ZONE 8",
    "Label": "L3",
    "Jan-24": 262, "Feb-24": 168, "Mar-24": 174, "Apr-24": 366, "May-24": 388, "Jun-24": 418,
    "Jul-24": 271, "Aug-24": 343, "Sep-24": 330, "Oct-24": 138, "Nov-24": 213, "Dec-24": 177,
    "Jan-25": 225, "Feb-25": 156, "Mar-25": 336, "Apr-25": 0
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

  // Zone FM data - COMPLETE DATASET
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
  {
    "Meter Label": "Building Taxi",
    "Acct #": "4300298",
    "Zone": "Zone_01_(FM)",
    "Type": "Retail",
    "Parent Meter": "ZONE FM ( BULK ZONE FM )",
    "Label": "L3",
    "Jan-24": 1, "Feb-24": 1, "Mar-24": 9, "Apr-24": 10, "May-24": 10, "Jun-24": 13,
    "Jul-24": 10, "Aug-24": 8, "Sep-24": 13, "Oct-24": 12, "Nov-24": 17, "Dec-24": 11,
    "Jan-25": 13, "Feb-25": 11, "Mar-25": 16, "Apr-25": 12
  },
  {
    "Meter Label": "Building B1",
    "Acct #": "4300300",
    "Zone": "Zone_01_(FM)",
    "Type": "Retail",
    "Parent Meter": "ZONE FM ( BULK ZONE FM )",
    "Label": "L3",
    "Jan-24": 258, "Feb-24": 183, "Mar-24": 178, "Apr-24": 184, "May-24": 198, "Jun-24": 181,
    "Jul-24": 164, "Aug-24": 202, "Sep-24": 184, "Oct-24": 167, "Nov-24": 214, "Dec-24": 245,
    "Jan-25": 228, "Feb-25": 225, "Mar-25": 235, "Apr-25": 253
  },
  {
    "Meter Label": "Building B2",
    "Acct #": "4300301",
    "Zone": "Zone_01_(FM)",
    "Type": "Retail",
    "Parent Meter": "ZONE FM ( BULK ZONE FM )",
    "Label": "L3",
    "Jan-24": 239, "Feb-24": 194, "Mar-24": 214, "Apr-24": 205, "May-24": 167, "Jun-24": 187,
    "Jul-24": 177, "Aug-24": 191, "Sep-24": 206, "Oct-24": 163, "Nov-24": 194, "Dec-24": 226,
    "Jan-25": 236, "Feb-25": 213, "Mar-25": 202, "Apr-25": 187
  },
  {
    "Meter Label": "Building CIF/CB",
    "Acct #": "4300324",
    "Zone": "Zone_01_(FM)",
    "Type": "Retail",
    "Parent Meter": "ZONE FM ( BULK ZONE FM )",
    "Label": "L3",
    "Jan-24": 85, "Feb-24": 62, "Mar-24": 72, "Apr-24": 92, "May-24": 52, "Jun-24": 58,
    "Jul-24": 30, "Aug-24": 0, "Sep-24": 28, "Oct-24": 53, "Nov-24": 88, "Dec-24": 34,
    "Jan-25": 93, "Feb-25": 47, "Mar-25": 42, "Apr-25": 33
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

  // Village Square data - COMPLETE DATASET
  {
    "Meter Label": "Irrigation Tank - VS",
    "Acct #": "4300326",
    "Zone": "Zone_VS",
    "Type": "IRR_Servies",
    "Parent Meter": "Village Square (Zone Bulk)",
    "Label": "L3",
    "Jan-24": 0, "Feb-24": 0, "Mar-24": 0, "Apr-24": 2, "May-24": 0, "Jun-24": 15,
    "Jul-24": 7, "Aug-24": 11, "Sep-24": 6, "Oct-24": 7, "Nov-24": 1, "Dec-24": 1,
    "Jan-25": 0, "Feb-25": 0, "Mar-25": 0, "Apr-25": 1
  },
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
  {
    "Meter Label": "Coffee 2 (GF Shop No.594 A)",
    "Acct #": "4300329",
    "Zone": "Zone_VS",
    "Type": "Retail",
    "Parent Meter": "Village Square (Zone Bulk)",
    "Label": "L3",
    "Jan-24": 0, "Feb-24": 0, "Mar-24": 0, "Apr-24": 0, "May-24": 0, "Jun-24": 0,
    "Jul-24": 0, "Aug-24": 0, "Sep-24": 0, "Oct-24": 0, "Nov-24": 0, "Dec-24": 3,
    "Jan-25": 1, "Feb-25": 3, "Mar-25": 2, "Apr-25": 3
  },
  {
    "Meter Label": "Laundry Services (FF Shop No.593)",
    "Acct #": "4300332",
    "Zone": "Zone_VS",
    "Type": "Retail",
    "Parent Meter": "Village Square (Zone Bulk)",
    "Label": "L3",
    "Jan-24": 3, "Feb-24": 0, "Mar-24": 1, "Apr-24": 1, "May-24": 6, "Jun-24": 4,
    "Jul-24": 9, "Aug-24": 3, "Sep-24": 2, "Oct-24": 3, "Nov-24": 4, "Dec-24": 3,
    "Jan-25": 2, "Feb-25": 4, "Mar-25": 7, "Apr-25": 3
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
  },

  // Main Bulk data - COMPLETE DATASET (EXCLUDING 4300336 & 4300338 as requested)
  {
    "Meter Label": "Sales Center Common Building",
    "Acct #": "4300295",
    "Zone": "Main_Bulk",
    "Type": "MB_Common",
    "Parent Meter": "Main Bulk (NAMA)",
    "Label": "DC",
    "Jan-24": 45, "Feb-24": 46, "Mar-24": 37, "Apr-24": 35, "May-24": 61, "Jun-24": 32,
    "Jul-24": 36, "Aug-24": 28, "Sep-24": 25, "Oct-24": 41, "Nov-24": 54, "Dec-24": 62,
    "Jan-25": 76, "Feb-25": 68, "Mar-25": 37, "Apr-25": 67
  },
  {
    "Meter Label": "Building (Security)",
    "Acct #": "4300297",
    "Zone": "Main_Bulk",
    "Type": "MB_Common",
    "Parent Meter": "Main Bulk (NAMA)",
    "Label": "DC",
    "Jan-24": 3, "Feb-24": 3, "Mar-24": 3, "Apr-24": 1, "May-24": 3, "Jun-24": 0,
    "Jul-24": 3, "Aug-24": 2, "Sep-24": 9, "Oct-24": 4, "Nov-24": 4, "Dec-24": 4,
    "Jan-25": 5, "Feb-25": 6, "Mar-25": 10, "Apr-25": 1
  },
  {
    "Meter Label": "Building (ROP)",
    "Acct #": "4300299",
    "Zone": "Main_Bulk",
    "Type": "MB_Common",
    "Parent Meter": "Main Bulk (NAMA)",
    "Label": "DC",
    "Jan-24": 3, "Feb-24": 8, "Mar-24": 3, "Apr-24": 1, "May-24": 3, "Jun-24": 3,
    "Jul-24": 1, "Aug-24": 0, "Sep-24": 2, "Oct-24": 3, "Nov-24": 2, "Dec-24": 5,
    "Jan-25": 4, "Feb-25": 2, "Mar-25": 4, "Apr-25": 5
  },
  {
    "Meter Label": "Hotel Main Building",
    "Acct #": "4300334",
    "Zone": "Main_Bulk",
    "Type": "Retail",
    "Parent Meter": "Main Bulk (NAMA)",
    "Label": "DC",
    "Jan-24": 140, "Feb-24": 121, "Mar-24": 288, "Apr-24": 0, "May-24": 112, "Jun-24": 22,
    "Jul-24": 132, "Aug-24": 172, "Sep-24": 139, "Oct-24": 80, "Nov-24": 153, "Dec-24": 85,
    "Jan-25": 128, "Feb-25": 103, "Mar-25": 137, "Apr-25": 471
  },
  {
    "Meter Label": "Al Adrak Construction",
    "Acct #": "4300347",
    "Zone": "Main_Bulk",
    "Type": "Retail",
    "Parent Meter": "Main Bulk (NAMA)",
    "Label": "DC",
    "Jan-24": 0, "Feb-24": 0, "Mar-24": 0, "Apr-24": 0, "May-24": 0, "Jun-24": 0,
    "Jul-24": 0, "Aug-24": 4, "Sep-24": 7, "Oct-24": 41, "Nov-24": 179, "Dec-24": 494,
    "Jan-25": 94, "Feb-25": 595, "Mar-25": 205, "Apr-25": 80
  }
  // NOTE: Meters 4300336 (Community Mgmt - Technical Zone, STP) and 4300338 (PHASE 02, MAIN ENTRANCE Infrastructure) 
  // are intentionally EXCLUDED from this dataset as requested
]

// Function to load and process the actual CSV data
export const loadWaterConsumptionData = () => {
  // Parse the raw data
  const parsedData = parseWaterConsumptionData(RAW_WATER_DATA)
  
  // Filter out excluded meters (4300336 & 4300338) and focus on zone bulks
  const filteredData = filterWaterData(parsedData)
  
  console.log('✅ Loaded water consumption data:', {
    totalRecords: RAW_WATER_DATA.length,
    parsedRecords: parsedData.length,
    filteredRecords: filteredData.length,
    excludedMeters: ['4300336', '4300338'],
    status: 'SUCCESS - Meters 4300336 & 4300338 excluded as requested'
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
      issues.push(`Row ${index + 1}: Contains excluded meter ${record['Acct #']} - WILL BE FILTERED OUT`)
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
      validRecords: data.length - issues.length,
      excludedMetersPolicy: 'Meters 4300336 & 4300338 automatically excluded',
      zoneFocus: 'Prioritizing zone bulk data as requested'
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
  },
  'Main_Bulk': {
    filename: 'main-bulk-water-consumption',
    displayName: 'Main Bulk Water Consumption (Excluding 4300336 & 4300338)'
  }
}

// Function to generate summary report
export const generateWaterConsumptionSummary = (data: any[]) => {
  const summary = {
    totalMeters: data.length,
    zoneBreakdown: {} as Record<string, number>,
    typeBreakdown: {} as Record<string, number>,
    excludedMeters: ['4300336', '4300338'],
    exclusionReason: 'Community Mgmt - Technical Zone, STP & PHASE 02 MAIN ENTRANCE Infrastructure',
    dataRange: 'January 2024 - April 2025',
    restructuringStatus: 'COMPLETED - Zone bulk focus implemented',
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
