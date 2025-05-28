// Water data processing utilities and real data integration

export interface WaterDataRow {
  meterLabel: string
  acctNumber: string
  zone: string
  type: string
  parentMeter: string
  label: string
  monthlyData: Record<string, number>
  totalConsumption: number
}

export interface MonthlyTrend {
  month: string
  A: number // L1 Main Bulk
  B: number // L2 + DC
  C: number // L3 + DC
  lossStage1: number // A - B
  lossStage2: number // B - C
  totalLoss: number // A - C
  efficiency: number
}

export interface ZoneAnalysis {
  zone: string
  L1: number
  L2: number
  L3: number
  loss1: number
  loss2: number
  totalLoss: number
  lossPercentage: number
}

// Add new interfaces for zone-specific analysis
export interface ZoneDetailedAnalysis {
  zone: string
  bulkMeter: string
  bulkConsumption: number
  individualConsumption: number
  totalConsumption: number
  individualMeters: Array<{
    meterLabel: string
    acctNumber: string
    type: string
    consumption: number
    parentMeter: string
  }>
  typeBreakdown: Array<{
    type: string
    consumption: number
    percentage: number
    meterCount: number
  }>
  lossAnalysis: {
    bulkToIndividual: number
    lossPercentage: number
  }
}

// Real CSV data URL
export const WATER_DATA_CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Master%20WA%20DB%20Table-Master%20WA%2024%20-%2025%20Apr-WSylWz2cSSj09lJXfyEhiFFidvT5UT.csv"

// Available months from the CSV
export const AVAILABLE_MONTHS = [
  "Jan-24",
  "Feb-24",
  "Mar-24",
  "Apr-24",
  "May-24",
  "Jun-24",
  "Jul-24",
  "Aug-24",
  "Sep-24",
  "Oct-24",
  "Nov-24",
  "Dec-24",
  "Jan-25",
  "Feb-25",
  "Mar-25",
  "Apr-25",
]

// Predefined monthly data as per your specifications
export const MONTHLY_TRENDS_DATA: MonthlyTrend[] = [
  {
    month: "Jan-24",
    A: 32803,
    B: 28837,
    C: 21794,
    lossStage1: 3966,
    lossStage2: 7043,
    totalLoss: 11009,
    efficiency: (21794 / 32803) * 100,
  },
  {
    month: "Feb-24",
    A: 27996,
    B: 25146,
    C: 18951,
    lossStage1: 2850,
    lossStage2: 6195,
    totalLoss: 9045,
    efficiency: (18951 / 27996) * 100,
  },
  {
    month: "Mar-24",
    A: 23860,
    B: 23977,
    C: 17574,
    lossStage1: -117,
    lossStage2: 6403,
    totalLoss: 6286,
    efficiency: (17574 / 23860) * 100,
  },
  {
    month: "Apr-24",
    A: 31869,
    B: 28383,
    C: 21055,
    lossStage1: 3486,
    lossStage2: 7328,
    totalLoss: 10814,
    efficiency: (21055 / 31869) * 100,
  },
  {
    month: "May-24",
    A: 30737,
    B: 28125,
    C: 22213,
    lossStage1: 2612,
    lossStage2: 5912,
    totalLoss: 8524,
    efficiency: (22213 / 30737) * 100,
  },
  {
    month: "Jun-24",
    A: 41953,
    B: 30604,
    C: 25450,
    lossStage1: 11349,
    lossStage2: 5154,
    totalLoss: 16503,
    efficiency: (25450 / 41953) * 100,
  },
  {
    month: "Jul-24",
    A: 35166,
    B: 30713,
    C: 23218,
    lossStage1: 4453,
    lossStage2: 7495,
    totalLoss: 11948,
    efficiency: (23218 / 35166) * 100,
  },
  {
    month: "Aug-24",
    A: 35420,
    B: 29757,
    C: 24013,
    lossStage1: 5663,
    lossStage2: 5744,
    totalLoss: 11407,
    efficiency: (24013 / 35420) * 100,
  },
  {
    month: "Sep-24",
    A: 41341,
    B: 29947,
    C: 24219,
    lossStage1: 11394,
    lossStage2: 5728,
    totalLoss: 17122,
    efficiency: (24219 / 41341) * 100,
  },
  {
    month: "Oct-24",
    A: 31519,
    B: 35378,
    C: 29761,
    lossStage1: -3859,
    lossStage2: 5617,
    totalLoss: 1758,
    efficiency: (29761 / 31519) * 100,
  },
  {
    month: "Nov-24",
    A: 35290,
    B: 30612,
    C: 25123,
    lossStage1: 4678,
    lossStage2: 5489,
    totalLoss: 10167,
    efficiency: (25123 / 35290) * 100,
  },
  {
    month: "Dec-24",
    A: 36733,
    B: 30416,
    C: 24268,
    lossStage1: 6317,
    lossStage2: 6148,
    totalLoss: 12465,
    efficiency: (24268 / 36733) * 100,
  },
  {
    month: "Jan-25",
    A: 32580,
    B: 35250,
    C: 27601,
    lossStage1: -2670,
    lossStage2: 7649,
    totalLoss: 4979,
    efficiency: (27601 / 32580) * 100,
  },
  {
    month: "Feb-25",
    A: 44043,
    B: 35983,
    C: 28810,
    lossStage1: 8060,
    lossStage2: 7173,
    totalLoss: 15233,
    efficiency: (28810 / 44043) * 100,
  },
  {
    month: "Mar-25",
    A: 34915,
    B: 39591,
    C: 32232,
    lossStage1: -4676,
    lossStage2: 7359,
    totalLoss: 2683,
    efficiency: (32232 / 34915) * 100,
  },
  {
    month: "Apr-25",
    A: 46039,
    B: 45863,
    C: 37326,
    lossStage1: 176,
    lossStage2: 8537,
    totalLoss: 8713,
    efficiency: (37326 / 46039) * 100,
  },
]

// Parse CSV data with DC (Domestic Consumption) calculations
export function parseCSVData(csvText: string): WaterDataRow[] {
  const lines = csvText.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

  const rawData: any[] = []

  // First pass: Parse all raw data
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
    if (values.length >= headers.length) {
      const monthlyData: Record<string, number> = {}

      // Extract monthly data
      AVAILABLE_MONTHS.forEach((month) => {
        const monthIndex = headers.indexOf(month)
        if (monthIndex !== -1) {
          const value = Number.parseFloat(values[monthIndex]) || 0
          monthlyData[month] = value
        }
      })

      const row = {
        meterLabel: values[0] || "",
        acctNumber: values[1] || "",
        zone: values[2] || "",
        type: values[3] || "",
        parentMeter: values[4] || "",
        label: values[5] || "",
        monthlyData,
      }

      rawData.push(row)
    }
  }

  // Second pass: Calculate DC values and adjust L2/L3
  const dcData: Record<string, Record<string, number>> = {}

  // Find all DC (Domestic Consumption) entries
  rawData.forEach((row) => {
    if (row.label === "DC") {
      const zone = row.zone
      if (!dcData[zone]) {
        dcData[zone] = {}
      }

      AVAILABLE_MONTHS.forEach((month) => {
        dcData[zone][month] = (dcData[zone][month] || 0) + (row.monthlyData[month] || 0)
      })
    }
  })

  // Third pass: Create final data with adjusted L2 and L3 values
  const finalData: WaterDataRow[] = []

  rawData.forEach((row) => {
    const adjustedMonthlyData: Record<string, number> = { ...row.monthlyData }
    let totalConsumption = 0

    // Apply DC adjustments for L2 and L3
    if (row.label === "L2" || row.label === "L3") {
      const zone = row.zone
      const zoneDC = dcData[zone] || {}

      AVAILABLE_MONTHS.forEach((month) => {
        const originalValue = row.monthlyData[month] || 0
        const dcValue = zoneDC[month] || 0
        adjustedMonthlyData[month] = originalValue + dcValue
        totalConsumption += adjustedMonthlyData[month]
      })
    } else {
      // For non-L2/L3 entries, keep original values
      AVAILABLE_MONTHS.forEach((month) => {
        totalConsumption += adjustedMonthlyData[month] || 0
      })
    }

    const finalRow: WaterDataRow = {
      meterLabel: row.meterLabel,
      acctNumber: row.acctNumber,
      zone: row.zone,
      type: row.type,
      parentMeter: row.parentMeter,
      label: row.label,
      monthlyData: adjustedMonthlyData,
      totalConsumption,
    }

    finalData.push(finalRow)
  })

  return finalData
}

// Calculate monthly trends using predefined data
export function calculateMonthlyTrends(data: WaterDataRow[]): MonthlyTrend[] {
  return MONTHLY_TRENDS_DATA
}

// Calculate zone analysis for a specific month
export function calculateZoneAnalysis(data: WaterDataRow[], month: string): ZoneAnalysis[] {
  const zoneMap: Record<string, { L1: number; L2: number; L3: number }> = {}

  data.forEach((row) => {
    const zone = row.zone
    const label = row.label
    const value = row.monthlyData[month] || 0

    if (!zoneMap[zone]) {
      zoneMap[zone] = { L1: 0, L2: 0, L3: 0 }
    }

    if (["L1", "L2", "L3"].includes(label)) {
      zoneMap[zone][label as "L1" | "L2" | "L3"] += value
    }
  })

  return Object.entries(zoneMap)
    .map(([zone, values]) => {
      const loss1 = values.L1 - values.L2
      const loss2 = values.L2 - values.L3
      const totalLoss = loss1 + loss2
      const lossPercentage = values.L2 > 0 ? (loss2 / values.L2) * 100 : 0

      return {
        zone,
        L1: values.L1,
        L2: values.L2,
        L3: values.L3,
        loss1,
        loss2,
        totalLoss,
        lossPercentage,
      }
    })
    .filter((analysis) => analysis.zone && analysis.zone !== "")
}

// Add function to get detailed zone analysis
export function getDetailedZoneAnalysis(data: WaterDataRow[], month: string): ZoneDetailedAnalysis[] {
  const zoneMap: Record<string, any> = {}

  // Process all data to group by zones
  data.forEach((row) => {
    const zone = row.zone
    const label = row.label
    const value = row.monthlyData[month] || 0

    if (!zoneMap[zone]) {
      zoneMap[zone] = {
        zone,
        bulkMeter: "",
        bulkConsumption: 0,
        individualConsumption: 0,
        individualMeters: [],
        typeBreakdown: {},
      }
    }

    if (label === "L2") {
      // This is the bulk meter for the zone
      zoneMap[zone].bulkMeter = row.meterLabel
      zoneMap[zone].bulkConsumption = value
    } else if (label === "L3") {
      // Individual meters
      zoneMap[zone].individualConsumption += value
      zoneMap[zone].individualMeters.push({
        meterLabel: row.meterLabel,
        acctNumber: row.acctNumber,
        type: row.type,
        consumption: value,
        parentMeter: row.parentMeter,
      })

      // Type breakdown
      const type = row.type || "Unknown"
      if (!zoneMap[zone].typeBreakdown[type]) {
        zoneMap[zone].typeBreakdown[type] = {
          consumption: 0,
          meterCount: 0,
        }
      }
      zoneMap[zone].typeBreakdown[type].consumption += value
      zoneMap[zone].typeBreakdown[type].meterCount += 1
    }
  })

  // Convert to final format
  return Object.values(zoneMap)
    .map((zoneData: any) => {
      const totalConsumption = zoneData.bulkConsumption
      const individualTotal = zoneData.individualConsumption
      const loss = zoneData.bulkConsumption - zoneData.individualConsumption
      const lossPercentage = zoneData.bulkConsumption > 0 ? (loss / zoneData.bulkConsumption) * 100 : 0

      // Convert type breakdown to array
      const typeBreakdown = Object.entries(zoneData.typeBreakdown).map(([type, data]: [string, any]) => ({
        type,
        consumption: data.consumption,
        percentage: individualTotal > 0 ? (data.consumption / individualTotal) * 100 : 0,
        meterCount: data.meterCount,
      }))

      return {
        zone: zoneData.zone,
        bulkMeter: zoneData.bulkMeter,
        bulkConsumption: zoneData.bulkConsumption,
        individualConsumption: zoneData.individualConsumption,
        totalConsumption,
        individualMeters: zoneData.individualMeters.sort((a, b) => b.consumption - a.consumption),
        typeBreakdown: typeBreakdown.sort((a, b) => b.consumption - a.consumption),
        lossAnalysis: {
          bulkToIndividual: loss,
          lossPercentage,
        },
      }
    })
    .filter((zone) => zone.zone && zone.zone !== "" && zone.bulkConsumption > 0)
    .sort((a, b) => b.bulkConsumption - a.bulkConsumption)
}

// Add function to get zone meter hierarchy
export function getZoneMeterHierarchy(
  data: WaterDataRow[],
  zone: string,
  month: string,
): {
  bulkMeter: any
  buildingMeters: Array<{
    meterLabel: string
    acctNumber: string
    consumption: number
    individualMeters: Array<{
      meterLabel: string
      acctNumber: string
      type: string
      consumption: number
    }>
  }>
  directMeters: Array<{
    meterLabel: string
    acctNumber: string
    type: string
    consumption: number
  }>
} {
  const zoneData = data.filter((row) => row.zone === zone)

  // Find bulk meter
  const bulkMeter = zoneData.find((row) => row.label === "L2")

  // Group individual meters by parent meter
  const meterGroups: Record<string, any> = {}
  const directMeters: any[] = []

  zoneData
    .filter((row) => row.label === "L3")
    .forEach((row) => {
      const consumption = row.monthlyData[month] || 0
      const parentMeter = row.parentMeter

      if (parentMeter && parentMeter !== bulkMeter?.meterLabel) {
        // This is connected to a building meter
        if (!meterGroups[parentMeter]) {
          meterGroups[parentMeter] = {
            meterLabel: parentMeter,
            acctNumber: "",
            consumption: 0,
            individualMeters: [],
          }
        }

        meterGroups[parentMeter].individualMeters.push({
          meterLabel: row.meterLabel,
          acctNumber: row.acctNumber,
          type: row.type,
          consumption,
        })
        meterGroups[parentMeter].consumption += consumption
      } else {
        // Direct connection to bulk meter
        directMeters.push({
          meterLabel: row.meterLabel,
          acctNumber: row.acctNumber,
          type: row.type,
          consumption,
        })
      }
    })

  return {
    bulkMeter: bulkMeter
      ? {
          meterLabel: bulkMeter.meterLabel,
          acctNumber: bulkMeter.acctNumber,
          consumption: bulkMeter.monthlyData[month] || 0,
        }
      : null,
    buildingMeters: Object.values(meterGroups).sort((a: any, b: any) => b.consumption - a.consumption),
    directMeters: directMeters.sort((a, b) => b.consumption - a.consumption),
  }
}

// Get unique zones from data
export function getUniqueZones(data: WaterDataRow[]): string[] {
  return [...new Set(data.map((row) => row.zone))].filter((zone) => zone && zone !== "").sort()
}

// Get unique types from data
export function getUniqueTypes(data: WaterDataRow[]): string[] {
  return [...new Set(data.map((row) => row.type))].filter((type) => type && type !== "").sort()
}

// Filter data by zone
export function filterDataByZone(data: WaterDataRow[], zone: string): WaterDataRow[] {
  if (zone === "All Zones") return data
  return data.filter((row) => row.zone === zone)
}

// Filter data by type
export function filterDataByType(data: WaterDataRow[], type: string): WaterDataRow[] {
  if (type === "All Types") return data
  return data.filter((row) => row.type === type)
}

// Get consumption by type for a specific month
export function getConsumptionByType(
  data: WaterDataRow[],
  month: string,
): Array<{ name: string; value: number; percentage: number }> {
  const typeMap: Record<string, number> = {}
  let total = 0

  data.forEach((row) => {
    if (row.label === "L3") {
      // Only count end-user consumption
      const value = row.monthlyData[month] || 0
      const type = row.type || "Unknown"
      typeMap[type] = (typeMap[type] || 0) + value
      total += value
    }
  })

  return Object.entries(typeMap)
    .map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
}

// Get customer details for a zone
export function getCustomerDetails(
  data: WaterDataRow[],
  zone: string,
  month: string,
): Array<{
  id: string
  customer: string
  zone: string
  consumption: number
  type: string
}> {
  return data
    .filter((row) => {
      if (zone === "All Zones") return row.label === "L3"
      return row.zone === zone && row.label === "L3"
    })
    .map((row) => ({
      id: row.acctNumber,
      customer: row.meterLabel,
      zone: row.zone,
      consumption: row.monthlyData[month] || 0,
      type: row.type,
    }))
    .filter((customer) => customer.consumption > 0)
    .sort((a, b) => b.consumption - a.consumption)
}

// Get DC (Domestic Consumption) breakdown by zone
export function getDCBreakdown(
  data: WaterDataRow[],
  month: string,
): Array<{
  zone: string
  dcValue: number
  l2Original: number
  l3Original: number
  l2WithDC: number
  l3WithDC: number
}> {
  const zoneMap: Record<string, any> = {}

  data.forEach((row) => {
    const zone = row.zone
    if (!zoneMap[zone]) {
      zoneMap[zone] = {
        DC: 0,
        L2_original: 0,
        L3_original: 0,
        L2_withDC: 0,
        L3_withDC: 0,
      }
    }

    const value = row.monthlyData[month] || 0

    if (row.label === "DC") {
      zoneMap[zone].DC += value
    } else if (row.label === "L2") {
      zoneMap[zone].L2_withDC += value // This already includes DC from parseCSVData
      zoneMap[zone].L2_original = zoneMap[zone].L2_withDC - zoneMap[zone].DC
    } else if (row.label === "L3") {
      zoneMap[zone].L3_withDC += value // This already includes DC from parseCSVData
      zoneMap[zone].L3_original = zoneMap[zone].L3_withDC - zoneMap[zone].DC
    }
  })

  return Object.entries(zoneMap)
    .map(([zone, values]) => ({
      zone,
      dcValue: values.DC,
      l2Original: Math.max(0, values.L2_original),
      l3Original: Math.max(0, values.L3_original),
      l2WithDC: values.L2_withDC,
      l3WithDC: values.L3_withDC,
    }))
    .filter((item) => item.zone && item.zone !== "")
}

// Get current month data from predefined trends
export function getCurrentMonthData(month: string): MonthlyTrend | null {
  return MONTHLY_TRENDS_DATA.find((trend) => trend.month === month) || null
}
