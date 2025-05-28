export const extractCategory = (unitName: string, type: string) => {
  if (!unitName && !type) return "Other"

  // Use type first for more accurate categorization
  if (type === "PS") return "Pumping Station"
  if (type === "LS") return "Lifting Station"
  if (type === "IRR") return "Irrigation Tank"
  if (type === "DB") return "Actuator DB"
  if (type === "Street Light") return "Street Light"
  if (type === "D_Building") {
    const lowerUnitName = unitName.toLowerCase()
    if (lowerUnitName.includes("d building")) return "Apartment Building"
    if (lowerUnitName.includes("guard house")) return "Guard House"
    if (lowerUnitName.includes("security building")) return "Security Building"
    if (lowerUnitName.includes("rop building")) return "ROP Building"
    if (lowerUnitName.includes("beachwell")) return "Beachwell"
    if (lowerUnitName.includes("helipad")) return "Helipad"
    if (lowerUnitName.includes("central park")) return "Central Park"
    if (lowerUnitName.includes("village square")) return "Village Square"
    return "Building"
  }
  if (type === "FP-Landscape Lights Z3") return "Landscape Light"
  if (type === "Retail") return "Commercial"

  // Fallback to name-based categorization
  const lowerUnitName = unitName.toLowerCase()
  if (lowerUnitName.includes("pumping station")) return "Pumping Station"
  if (lowerUnitName.includes("lifting station")) return "Lifting Station"
  if (lowerUnitName.includes("street light")) return "Street Light"
  if (lowerUnitName.includes("irrigation tank")) return "Irrigation Tank"
  if (lowerUnitName.includes("actuator db")) return "Actuator DB"

  return "Other"
}

export const parseData = (rawData: string) => {
  const lines = rawData.split("\n")
  const headerLine = lines[0].split("\t").map((h) => h.trim())
  const dataLines = lines.slice(1)
  const monthsHeader = headerLine.slice(3) // Skip Name, Type, Meter Account No.

  return dataLines.map((line, index) => {
    const values = line.split("\t")
    const unitName = values[0]?.trim() || "N/A"
    const type = values[1]?.trim() || "N/A"
    const meterAccountNo = values[2]?.trim() || "N/A"

    const entry = {
      id: index + 1,
      slNo: index + 1,
      unitName: unitName,
      type: type,
      category: extractCategory(unitName, type),
      meterAccountNo: meterAccountNo,
      consumption: {} as Record<string, number>,
      totalConsumption: 0,
    }

    let currentOverallTotal = 0
    monthsHeader.forEach((month, i) => {
      const consumptionValue = Number.parseFloat(values[3 + i])
      entry.consumption[month] = isNaN(consumptionValue) ? 0 : consumptionValue
      if (!isNaN(consumptionValue)) {
        currentOverallTotal += consumptionValue
      }
    })
    entry.totalConsumption = Number.parseFloat(currentOverallTotal.toFixed(2))
    return entry
  })
}
