// Fetch and analyze the water data CSV
const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Master%20WA%20DB%20Table-Master%20WA%2024%20-%2025%20Apr-WSylWz2cSSj09lJXfyEhiFFidvT5UT.csv"

async function analyzeWaterData() {
  try {
    console.log("Fetching water data CSV...")
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    console.log("CSV Data Preview (first 1000 characters):")
    console.log(csvText.substring(0, 1000))
    console.log("\n" + "=".repeat(50) + "\n")

    // Parse CSV data
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("Headers:", headers)
    console.log("Total rows:", lines.length - 1)
    console.log("\n" + "=".repeat(50) + "\n")

    // Parse data rows
    const data = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
      if (values.length >= headers.length) {
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })
        data.push(row)
      }
    }

    console.log("Sample data rows:")
    console.log(JSON.stringify(data.slice(0, 5), null, 2))
    console.log("\n" + "=".repeat(50) + "\n")

    // Analyze unique values
    const uniqueZones = [...new Set(data.map((row) => row.Zone))].filter((z) => z)
    const uniqueTypes = [...new Set(data.map((row) => row.Type))].filter((t) => t)
    const uniqueLabels = [...new Set(data.map((row) => row.Label))].filter((l) => l)

    console.log("Unique Zones:", uniqueZones)
    console.log("Unique Types:", uniqueTypes)
    console.log("Unique Labels:", uniqueLabels)
    console.log("\n" + "=".repeat(50) + "\n")

    // Analyze monthly data structure
    const monthColumns = headers.filter((h) => h.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}$/))
    console.log("Month columns:", monthColumns)

    // Calculate totals for latest month (Apr-25)
    const latestMonth = "Apr-25"
    let totalSupply = 0
    let totalConsumption = 0

    data.forEach((row) => {
      const value = Number.parseFloat(row[latestMonth]) || 0
      if (row.Label === "L1") {
        totalSupply += value
      } else if (row.Label === "L3") {
        totalConsumption += value
      }
    })

    console.log(`Analysis for ${latestMonth}:`)
    console.log(`Total L1 (Supply): ${totalSupply.toLocaleString()}`)
    console.log(`Total L3 (Consumption): ${totalConsumption.toLocaleString()}`)
    console.log(`Total Loss: ${(totalSupply - totalConsumption).toLocaleString()}`)
    console.log(`System Efficiency: ${((totalConsumption / totalSupply) * 100).toFixed(1)}%`)

    // Analyze by zone for Apr-25
    console.log("\n" + "=".repeat(50) + "\n")
    console.log("Zone Analysis for Apr-25:")

    const zoneAnalysis = {}
    data.forEach((row) => {
      const zone = row.Zone
      const label = row.Label
      const value = Number.parseFloat(row[latestMonth]) || 0

      if (!zoneAnalysis[zone]) {
        zoneAnalysis[zone] = { L1: 0, L2: 0, L3: 0 }
      }

      if (label && ["L1", "L2", "L3"].includes(label)) {
        zoneAnalysis[zone][label] += value
      }
    })

    Object.entries(zoneAnalysis).forEach(([zone, values]) => {
      const loss = values.L2 - values.L3
      const lossPercentage = values.L2 > 0 ? ((loss / values.L2) * 100).toFixed(1) : 0
      console.log(`${zone}: L2=${values.L2}, L3=${values.L3}, Loss=${loss}, Loss%=${lossPercentage}%`)
    })

    return { data, headers, monthColumns, uniqueZones, uniqueTypes, uniqueLabels }
  } catch (error) {
    console.error("Error analyzing water data:", error)
  }
}

// Run the analysis
analyzeWaterData()
