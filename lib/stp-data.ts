// STP data processing utilities and real data integration

export interface STPPlantData {
  id: string
  date: string
  inflow: number
  outflow: number
  pH: number
  turbidity: number
  tds: number // Total Dissolved Solids
  cod: number // Chemical Oxygen Demand
  bod: number // Biological Oxygen Demand
  tss: number // Total Suspended Solids
  dissolvedOxygen: number
  totalColiforms: number
  operationalStatus: "Normal" | "Warning" | "Critical" | "Maintenance"
  chemicalUsage: Record<string, number> // Chemical name -> amount in kg
  energyConsumption: number // kWh
  equipmentStatus: Record<string, string> // Equipment name -> status
  maintenanceLog?: {
    date: string
    description: string
    technician: string
    status: "Scheduled" | "In Progress" | "Completed"
  }[]
}

export interface STPEquipment {
  id: string
  name: string
  type: string
  location: string
  installationDate: string
  lastMaintenance: string
  nextMaintenance: string
  status: "Operational" | "Warning" | "Fault" | "Maintenance" | "Offline"
  runtime: number // Hours
  efficiency: number // Percentage
  manufacturer: string
  model: string
  alerts: string[]
}

export interface STPZone {
  id: string
  name: string
  type: "Primary" | "Secondary" | "Tertiary" | "Disinfection" | "Sludge" | "Other"
  status: "Operational" | "Warning" | "Fault" | "Maintenance" | "Offline"
  equipment: string[] // References to equipment IDs
  parameters: Record<string, number>
  flowRate: number
  retention: number // Hours
}

export interface STPChemical {
  id: string
  name: string
  currentStock: number
  unit: string
  reorderLevel: number
  usageRate: number // per day
  lastDelivery: string
  supplier: string
  cost: number
}

export interface STPAlarm {
  id: string
  timestamp: string
  type: "Warning" | "Critical" | "Information"
  message: string
  location: string
  parameter: string
  value: number
  threshold: number
  acknowledged: boolean
  resolvedAt?: string
}

export interface STPCompliance {
  id: string
  date: string
  parameter: string
  measured: number
  limit: number
  unit: string
  status: "Compliant" | "Non-compliant"
  notes?: string
}

// Sample data generation for STP Plant
export const getSTPHistoricalData = (): STPPlantData[] => {
  const data: STPPlantData[] = []
  const now = new Date()

  // Generate 30 days of data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Base values that will be varied slightly
    const baseInflow = 350 // m³/day
    const baseOutflow = 330 // m³/day
    const basePH = 7.2
    const baseTurbidity = 2.5 // NTU
    const baseTDS = 650 // mg/L
    const baseCOD = 30 // mg/L
    const baseBOD = 10 // mg/L
    const baseTSS = 15 // mg/L
    const baseDO = 6.5 // mg/L
    const baseColiforms = 200 // CFU/100mL
    const baseEnergy = 450 // kWh

    // Random variation between 0.8 and 1.2 of base value
    const variation = () => 0.8 + Math.random() * 0.4

    // Occasional spikes (about 10% of the time)
    const spike = () => (Math.random() > 0.9 ? 1.5 + Math.random() : 1)

    // Generate status based on parameters
    const getStatus = (cod: number, tss: number, ph: number) => {
      if (cod > 45 || tss > 25 || ph < 6.5 || ph > 8) return "Critical"
      if (cod > 35 || tss > 20 || ph < 6.8 || ph > 7.8) return "Warning"
      if (i % 15 === 0) return "Maintenance" // Scheduled maintenance every 15 days
      return "Normal"
    }

    // Calculate daily values with random variations
    const inflow = Math.round(baseInflow * variation() * spike())
    const outflow = Math.round(Math.min(inflow * 0.95, baseOutflow * variation()))
    const pH = Number((basePH * variation()).toFixed(1))
    const turbidity = Number((baseTurbidity * variation() * spike()).toFixed(1))
    const tds = Math.round(baseTDS * variation())
    const cod = Math.round(baseCOD * variation() * spike())
    const bod = Math.round(baseBOD * variation() * spike())
    const tss = Math.round(baseTSS * variation() * spike())
    const dissolvedOxygen = Number((baseDO * variation()).toFixed(1))
    const totalColiforms = Math.round(baseColiforms * variation() * spike())
    const energyConsumption = Math.round(baseEnergy * variation())

    const status = getStatus(cod, tss, pH)

    // Generate maintenance logs for maintenance days
    const maintenanceLog =
      status === "Maintenance"
        ? [
            {
              date: date.toISOString().split("T")[0],
              description: "Routine maintenance and inspection",
              technician: ["Ali", "Mohammed", "Khalid", "Sara"][Math.floor(Math.random() * 4)],
              status: ["Scheduled", "In Progress", "Completed"][Math.floor(Math.random() * 3)] as
                | "Scheduled"
                | "In Progress"
                | "Completed",
            },
          ]
        : undefined

    data.push({
      id: `STP-${date.toISOString().split("T")[0]}`,
      date: date.toISOString().split("T")[0],
      inflow,
      outflow,
      pH,
      turbidity,
      tds,
      cod,
      bod,
      tss,
      dissolvedOxygen,
      totalColiforms,
      operationalStatus: status as "Normal" | "Warning" | "Critical" | "Maintenance",
      chemicalUsage: {
        Chlorine: Math.round(inflow * 0.0015 * variation()),
        Polymer: Math.round(inflow * 0.0005 * variation()),
        Alum: Math.round(inflow * 0.002 * variation()),
        "Caustic Soda": Math.round(inflow * 0.0008 * variation()),
      },
      energyConsumption,
      equipmentStatus: {
        "Primary Pump": Math.random() > 0.95 ? "Warning" : "Operational",
        "Aeration Blower": Math.random() > 0.97 ? "Fault" : "Operational",
        "UV Disinfection": Math.random() > 0.98 ? "Maintenance" : "Operational",
        "Sludge Pump": Math.random() > 0.96 ? "Warning" : "Operational",
        "Chemical Dosing": Math.random() > 0.99 ? "Fault" : "Operational",
      },
      maintenanceLog,
    })
  }

  return data
}

// Get STP equipment data
export const getSTPEquipment = (): STPEquipment[] => {
  return [
    {
      id: "EQ-001",
      name: "Primary Influent Pump P-101",
      type: "Submersible Pump",
      location: "Inlet Works",
      installationDate: "2022-03-15",
      lastMaintenance: "2024-02-10",
      nextMaintenance: "2024-05-10",
      status: "Operational",
      runtime: 8760,
      efficiency: 92,
      manufacturer: "Grundfos",
      model: "SE1.50.65.11",
      alerts: [],
    },
    {
      id: "EQ-002",
      name: "Primary Influent Pump P-102",
      type: "Submersible Pump",
      location: "Inlet Works",
      installationDate: "2022-03-15",
      lastMaintenance: "2024-01-15",
      nextMaintenance: "2024-04-15",
      status: "Operational",
      runtime: 6240,
      efficiency: 89,
      manufacturer: "Grundfos",
      model: "SE1.50.65.11",
      alerts: [],
    },
    {
      id: "EQ-003",
      name: "Fine Screen SC-101",
      type: "Mechanical Screen",
      location: "Inlet Works",
      installationDate: "2022-03-20",
      lastMaintenance: "2024-03-05",
      nextMaintenance: "2024-06-05",
      status: "Warning",
      runtime: 8760,
      efficiency: 78,
      manufacturer: "Huber",
      model: "STEP SCREEN SSF",
      alerts: ["Increased differential pressure", "Scheduled maintenance due"],
    },
    {
      id: "EQ-004",
      name: "Aeration Blower B-201",
      type: "Rotary Lobe Blower",
      location: "Aeration Basin",
      installationDate: "2022-04-10",
      lastMaintenance: "2024-02-22",
      nextMaintenance: "2024-05-22",
      status: "Operational",
      runtime: 8500,
      efficiency: 95,
      manufacturer: "Aerzen",
      model: "GM 25S",
      alerts: [],
    },
    {
      id: "EQ-005",
      name: "Aeration Blower B-202",
      type: "Rotary Lobe Blower",
      location: "Aeration Basin",
      installationDate: "2022-04-10",
      lastMaintenance: "2023-12-15",
      nextMaintenance: "2024-06-15",
      status: "Maintenance",
      runtime: 7800,
      efficiency: 86,
      manufacturer: "Aerzen",
      model: "GM 25S",
      alerts: ["Scheduled maintenance in progress", "Vibration above threshold"],
    },
    {
      id: "EQ-006",
      name: "RAS Pump P-301",
      type: "Centrifugal Pump",
      location: "Secondary Clarifier",
      installationDate: "2022-04-25",
      lastMaintenance: "2024-01-30",
      nextMaintenance: "2024-04-30",
      status: "Operational",
      runtime: 7300,
      efficiency: 91,
      manufacturer: "Flygt",
      model: "N-3153",
      alerts: [],
    },
    {
      id: "EQ-007",
      name: "WAS Pump P-302",
      type: "Progressive Cavity Pump",
      location: "Secondary Clarifier",
      installationDate: "2022-04-25",
      lastMaintenance: "2024-03-18",
      nextMaintenance: "2024-06-18",
      status: "Operational",
      runtime: 5200,
      efficiency: 93,
      manufacturer: "Seepex",
      model: "BN 10-6L",
      alerts: [],
    },
    {
      id: "EQ-008",
      name: "UV Disinfection System UV-401",
      type: "Low Pressure UV",
      location: "Disinfection Basin",
      installationDate: "2022-05-10",
      lastMaintenance: "2024-02-05",
      nextMaintenance: "2024-05-05",
      status: "Warning",
      runtime: 8760,
      efficiency: 82,
      manufacturer: "Trojan",
      model: "UV3000Plus",
      alerts: ["4 lamps need replacement", "UV transmittance below optimal"],
    },
    {
      id: "EQ-009",
      name: "Chlorine Dosing Pump D-401",
      type: "Diaphragm Pump",
      location: "Disinfection Basin",
      installationDate: "2022-05-15",
      lastMaintenance: "2024-03-12",
      nextMaintenance: "2024-06-12",
      status: "Operational",
      runtime: 8300,
      efficiency: 96,
      manufacturer: "ProMinent",
      model: "Gamma X",
      alerts: [],
    },
    {
      id: "EQ-010",
      name: "Sludge Dewatering Centrifuge C-501",
      type: "Decanter Centrifuge",
      location: "Sludge Handling",
      installationDate: "2022-06-01",
      lastMaintenance: "2024-01-10",
      nextMaintenance: "2024-05-10",
      status: "Fault",
      runtime: 4200,
      efficiency: 65,
      manufacturer: "Andritz",
      model: "D4L",
      alerts: ["Bearing temperature high", "Vibration threshold exceeded", "Automatic shutdown initiated"],
    },
    {
      id: "EQ-011",
      name: "Polymer Dosing System D-501",
      type: "Preparation System",
      location: "Sludge Handling",
      installationDate: "2022-06-05",
      lastMaintenance: "2024-02-15",
      nextMaintenance: "2024-05-15",
      status: "Operational",
      runtime: 4100,
      efficiency: 94,
      manufacturer: "ProMinent",
      model: "PolyRex",
      alerts: [],
    },
    {
      id: "EQ-012",
      name: "Treated Water Pump P-601",
      type: "Centrifugal Pump",
      location: "Effluent Pump Station",
      installationDate: "2022-06-10",
      lastMaintenance: "2024-02-28",
      nextMaintenance: "2024-05-28",
      status: "Operational",
      runtime: 8600,
      efficiency: 97,
      manufacturer: "Grundfos",
      model: "NB 65-200/219",
      alerts: [],
    },
  ]
}

// Get STP process zones
export const getSTPZones = (): STPZone[] => {
  return [
    {
      id: "Z-001",
      name: "Inlet Works",
      type: "Primary",
      status: "Operational",
      equipment: ["EQ-001", "EQ-002", "EQ-003"],
      parameters: {
        "Influent Flow": 350,
        "Screening Removal": 0.45,
        "Grit Removal": 0.32,
      },
      flowRate: 350,
      retention: 0.5,
    },
    {
      id: "Z-002",
      name: "Primary Treatment",
      type: "Primary",
      status: "Operational",
      equipment: [],
      parameters: {
        "BOD Removal": 30,
        "TSS Removal": 60,
        "Sludge Production": 2.5,
      },
      flowRate: 345,
      retention: 2.5,
    },
    {
      id: "Z-003",
      name: "Aeration Basin",
      type: "Secondary",
      status: "Operational",
      equipment: ["EQ-004", "EQ-005"],
      parameters: {
        MLSS: 3500,
        DO: 2.8,
        SVI: 120,
        "F/M Ratio": 0.15,
      },
      flowRate: 340,
      retention: 8,
    },
    {
      id: "Z-004",
      name: "Secondary Clarifier",
      type: "Secondary",
      status: "Warning",
      equipment: ["EQ-006", "EQ-007"],
      parameters: {
        SLR: 5.2,
        "Clarifier Blanket": 1.8,
        "RAS Rate": 50,
        "WAS Rate": 12,
      },
      flowRate: 338,
      retention: 4,
    },
    {
      id: "Z-005",
      name: "Disinfection System",
      type: "Disinfection",
      status: "Warning",
      equipment: ["EQ-008", "EQ-009"],
      parameters: {
        "UV Transmittance": 65,
        "Chlorine Residual": 0.8,
        "Contact Time": 30,
      },
      flowRate: 335,
      retention: 0.5,
    },
    {
      id: "Z-006",
      name: "Sludge Handling",
      type: "Sludge",
      status: "Fault",
      equipment: ["EQ-010", "EQ-011"],
      parameters: {
        "Feed Solids": 2.2,
        "Cake Solids": 18.5,
        "Polymer Dosage": 8.5,
        "Capture Rate": 92,
      },
      flowRate: 15,
      retention: 24,
    },
    {
      id: "Z-007",
      name: "Effluent Pump Station",
      type: "Tertiary",
      status: "Operational",
      equipment: ["EQ-012"],
      parameters: {
        "Final BOD": 8,
        "Final TSS": 12,
        "Final Turbidity": 2.1,
      },
      flowRate: 330,
      retention: 0.25,
    },
  ]
}

// Get STP chemical inventory
export const getSTPChemicals = (): STPChemical[] => {
  return [
    {
      id: "CH-001",
      name: "Chlorine",
      currentStock: 650,
      unit: "kg",
      reorderLevel: 300,
      usageRate: 12,
      lastDelivery: "2024-03-10",
      supplier: "Gulf Chemical Supply",
      cost: 2.5,
    },
    {
      id: "CH-002",
      name: "Polymer",
      currentStock: 180,
      unit: "kg",
      reorderLevel: 100,
      usageRate: 5,
      lastDelivery: "2024-03-05",
      supplier: "ChemTech Solutions",
      cost: 8.2,
    },
    {
      id: "CH-003",
      name: "Alum",
      currentStock: 420,
      unit: "kg",
      reorderLevel: 250,
      usageRate: 15,
      lastDelivery: "2024-02-20",
      supplier: "Gulf Chemical Supply",
      cost: 1.8,
    },
    {
      id: "CH-004",
      name: "Caustic Soda",
      currentStock: 280,
      unit: "kg",
      reorderLevel: 150,
      usageRate: 8,
      lastDelivery: "2024-02-28",
      supplier: "Oman Chemical Industries",
      cost: 3.5,
    },
    {
      id: "CH-005",
      name: "Sodium Bisulfite",
      currentStock: 120,
      unit: "kg",
      reorderLevel: 75,
      usageRate: 3,
      lastDelivery: "2024-03-15",
      supplier: "ChemTech Solutions",
      cost: 4.2,
    },
  ]
}

// Get STP alarms and alerts
export const getSTPAlarms = (): STPAlarm[] => {
  return [
    {
      id: "ALM-001",
      timestamp: "2024-04-10T08:15:00",
      type: "Critical",
      message: "High TSS in effluent",
      location: "Secondary Clarifier",
      parameter: "TSS",
      value: 35,
      threshold: 20,
      acknowledged: true,
      resolvedAt: "2024-04-10T10:30:00",
    },
    {
      id: "ALM-002",
      timestamp: "2024-04-12T14:22:00",
      type: "Warning",
      message: "Low dissolved oxygen",
      location: "Aeration Basin",
      parameter: "DO",
      value: 1.2,
      threshold: 2.0,
      acknowledged: true,
      resolvedAt: "2024-04-12T16:45:00",
    },
    {
      id: "ALM-003",
      timestamp: "2024-04-15T09:30:00",
      type: "Critical",
      message: "Centrifuge vibration",
      location: "Sludge Handling",
      parameter: "Vibration",
      value: 12.5,
      threshold: 8.0,
      acknowledged: false,
    },
    {
      id: "ALM-004",
      timestamp: "2024-04-16T07:45:00",
      type: "Warning",
      message: "High turbidity in effluent",
      location: "Disinfection System",
      parameter: "Turbidity",
      value: 4.8,
      threshold: 3.0,
      acknowledged: true,
      resolvedAt: "2024-04-16T11:20:00",
    },
    {
      id: "ALM-005",
      timestamp: "2024-04-18T13:10:00",
      type: "Information",
      message: "Chlorine tank level low",
      location: "Chemical Storage",
      parameter: "Chlorine Level",
      value: 25,
      threshold: 30,
      acknowledged: true,
    },
    {
      id: "ALM-006",
      timestamp: "2024-04-20T11:05:00",
      type: "Warning",
      message: "UV intensity below threshold",
      location: "Disinfection System",
      parameter: "UV Intensity",
      value: 68,
      threshold: 75,
      acknowledged: false,
    },
    {
      id: "ALM-007",
      timestamp: "2024-04-22T15:30:00",
      type: "Critical",
      message: "Blower temperature high",
      location: "Aeration Basin",
      parameter: "Temperature",
      value: 85,
      threshold: 75,
      acknowledged: true,
      resolvedAt: "2024-04-22T17:15:00",
    },
  ]
}

// Get STP compliance data
export const getSTPCompliance = (): STPCompliance[] => {
  return [
    {
      id: "CMP-001",
      date: "2024-04-01",
      parameter: "BOD",
      measured: 8,
      limit: 10,
      unit: "mg/L",
      status: "Compliant",
    },
    {
      id: "CMP-002",
      date: "2024-04-01",
      parameter: "COD",
      measured: 28,
      limit: 40,
      unit: "mg/L",
      status: "Compliant",
    },
    {
      id: "CMP-003",
      date: "2024-04-01",
      parameter: "TSS",
      measured: 12,
      limit: 15,
      unit: "mg/L",
      status: "Compliant",
    },
    {
      id: "CMP-004",
      date: "2024-04-01",
      parameter: "pH",
      measured: 7.2,
      limit: 8.5,
      unit: "pH",
      status: "Compliant",
    },
    {
      id: "CMP-005",
      date: "2024-04-01",
      parameter: "Total Coliforms",
      measured: 180,
      limit: 200,
      unit: "CFU/100mL",
      status: "Compliant",
    },
    {
      id: "CMP-006",
      date: "2024-04-08",
      parameter: "BOD",
      measured: 9,
      limit: 10,
      unit: "mg/L",
      status: "Compliant",
    },
    {
      id: "CMP-007",
      date: "2024-04-08",
      parameter: "COD",
      measured: 32,
      limit: 40,
      unit: "mg/L",
      status: "Compliant",
    },
    {
      id: "CMP-008",
      date: "2024-04-08",
      parameter: "TSS",
      measured: 16,
      limit: 15,
      unit: "mg/L",
      status: "Non-compliant",
      notes: "Minor exceedance, remedial actions taken",
    },
    {
      id: "CMP-009",
      date: "2024-04-08",
      parameter: "pH",
      measured: 7.4,
      limit: 8.5,
      unit: "pH",
      status: "Compliant",
    },
    {
      id: "CMP-010",
      date: "2024-04-08",
      parameter: "Total Coliforms",
      measured: 190,
      limit: 200,
      unit: "CFU/100mL",
      status: "Compliant",
    },
    {
      id: "CMP-011",
      date: "2024-04-15",
      parameter: "BOD",
      measured: 7,
      limit: 10,
      unit: "mg/L",
      status: "Compliant",
    },
    {
      id: "CMP-012",
      date: "2024-04-15",
      parameter: "COD",
      measured: 25,
      limit: 40,
      unit: "mg/L",
      status: "Compliant",
    },
    {
      id: "CMP-013",
      date: "2024-04-15",
      parameter: "TSS",
      measured: 11,
      limit: 15,
      unit: "mg/L",
      status: "Compliant",
    },
    {
      id: "CMP-014",
      date: "2024-04-15",
      parameter: "pH",
      measured: 7.1,
      limit: 8.5,
      unit: "pH",
      status: "Compliant",
    },
    {
      id: "CMP-015",
      date: "2024-04-15",
      parameter: "Total Coliforms",
      measured: 240,
      limit: 200,
      unit: "CFU/100mL",
      status: "Non-compliant",
      notes: "UV disinfection system issue identified and fixed",
    },
  ]
}

// Helper function to calculate performance indicators
export const calculateSTPPerformanceIndicators = (data: STPPlantData[]) => {
  if (!data.length) return null

  // Get latest day data
  const latestData = data[data.length - 1]

  // Get past 7 days data
  const weekData = data.slice(-7)

  // Get past 30 days data
  const monthData = data

  // Calculate averages
  const calcAverage = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

  const avgInflowWeek = calcAverage(weekData.map((d) => d.inflow))
  const avgOutflowWeek = calcAverage(weekData.map((d) => d.outflow))
  const avgInflowMonth = calcAverage(monthData.map((d) => d.inflow))
  const avgOutflowMonth = calcAverage(monthData.map((d) => d.outflow))

  // Calculate treatment efficiency
  const calcEfficiency = (inflow: number, outflow: number, parameter1: string, parameter2: string) => {
    const inParam = monthData.map((d) => d[parameter1])
    const outParam = monthData.map((d) => d[parameter2])
    const avgInParam = calcAverage(inParam as number[])
    const avgOutParam = calcAverage(outParam as number[])

    return ((avgInParam - avgOutParam) / avgInParam) * 100
  }

  // BOD removal efficiency
  const bodEfficiency = 90 // Simulated value as we don't have influent BOD

  // TSS removal efficiency
  const tssEfficiency = 92 // Simulated value as we don't have influent TSS

  // Calculate energy efficiency
  const energyEfficiency = calcAverage(weekData.map((d) => d.outflow / d.energyConsumption))

  // Count operational status
  const statusCounts = {
    Normal: monthData.filter((d) => d.operationalStatus === "Normal").length,
    Warning: monthData.filter((d) => d.operationalStatus === "Warning").length,
    Critical: monthData.filter((d) => d.operationalStatus === "Critical").length,
    Maintenance: monthData.filter((d) => d.operationalStatus === "Maintenance").length,
  }

  // Calculate uptime
  const uptime = ((statusCounts.Normal + statusCounts.Warning) / monthData.length) * 100

  // Calculate chemical usage
  const chemicalUsage = {
    Chlorine: calcAverage(monthData.map((d) => d.chemicalUsage["Chlorine"] || 0)),
    Polymer: calcAverage(monthData.map((d) => d.chemicalUsage["Polymer"] || 0)),
    Alum: calcAverage(monthData.map((d) => d.chemicalUsage["Alum"] || 0)),
    CausticSoda: calcAverage(monthData.map((d) => d.chemicalUsage["Caustic Soda"] || 0)),
  }

  return {
    latestData,
    weekData,
    monthData,
    avgInflowWeek,
    avgOutflowWeek,
    avgInflowMonth,
    avgOutflowMonth,
    bodEfficiency,
    tssEfficiency,
    energyEfficiency,
    statusCounts,
    uptime,
    chemicalUsage,
    waterRecoveryRate: (avgOutflowMonth / avgInflowMonth) * 100,
  }
}

// Helper function to get the overall plant status
export const getOverallPlantStatus = (
  plantData: STPPlantData | null,
  equipment: STPEquipment[],
  zones: STPZone[],
  alarms: STPAlarm[],
) => {
  if (!plantData) return "Unknown"

  // Check for critical equipment
  const hasCriticalEquipment = equipment.some((eq) => eq.status === "Fault")

  // Check for critical zones
  const hasCriticalZones = zones.some((zone) => zone.status === "Fault")

  // Check for unacknowledged critical alarms
  const hasUnacknowledgedCritical = alarms.some(
    (alarm) => alarm.type === "Critical" && !alarm.acknowledged && !alarm.resolvedAt,
  )

  // Check latest operational status
  const latestStatus = plantData.operationalStatus

  if (hasCriticalEquipment || hasCriticalZones || hasUnacknowledgedCritical || latestStatus === "Critical") {
    return "Critical"
  } else if (latestStatus === "Warning" || zones.some((zone) => zone.status === "Warning")) {
    return "Warning"
  } else if (latestStatus === "Maintenance") {
    return "Maintenance"
  } else {
    return "Normal"
  }
}
