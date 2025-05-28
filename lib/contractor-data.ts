// Define interfaces for contractor data
export interface Contract {
  id: string
  contractor: string
  serviceProvided: string
  status: ContractStatus
  contractType: "Contract" | "PO"
  startDate: Date | null
  endDate: Date | null
  monthlyValue: string
  yearlyValue: string
  notes: string
}

export enum ContractStatus {
  Active = "Active",
  Expired = "Expired",
  Pending = "Pending",
  Terminated = "Terminated",
}

// Function to parse CSV data into Contract objects
export function parseContractorData(data: string[][]): Contract[] {
  // Skip header row
  return data.slice(1).map((row, index) => {
    // Map CSV data to Contract object based on the provided structure
    return {
      id: `contract-${index}`,
      contractor: row[0] || "",
      serviceProvided: row[1] || "",
      status: (row[2] as ContractStatus) || ContractStatus.Expired,
      contractType: row[3] === "PO" ? "PO" : "Contract",
      startDate: row[4] ? parseDate(row[4]) : null,
      endDate: row[5] ? parseDate(row[5]) : null,
      monthlyValue: row[6] || "",
      yearlyValue: row[7] || "",
      notes: row[8] || "",
    }
  })
}

// Helper function to parse dates in various formats
function parseDate(dateString: string): Date | null {
  if (!dateString || dateString.trim() === "") return null

  // Try MM/DD/YYYY format
  const parts = dateString.split("/")
  if (parts.length === 3) {
    const month = Number.parseInt(parts[0], 10) - 1 // Months are 0-indexed in JS
    const day = Number.parseInt(parts[1], 10)
    const year = Number.parseInt(parts[2], 10)
    return new Date(year, month, day)
  }

  // If that fails, return null
  return null
}

// Function to get contracts expiring in the next X months
export function getContractsExpiringInNextMonths(contracts: Contract[], months: number): Contract[] {
  const now = new Date()
  const futureDate = new Date()
  futureDate.setMonth(now.getMonth() + months)

  return contracts.filter((contract) => {
    if (!contract.endDate) return false
    return contract.endDate > now && contract.endDate <= futureDate
  })
}

// Function to get contract status summary
export function getContractStatusSummary(contracts: Contract[]): Record<ContractStatus, number> {
  const summary = Object.values(ContractStatus).reduce(
    (acc, status) => {
      acc[status] = 0
      return acc
    },
    {} as Record<ContractStatus, number>,
  )

  contracts.forEach((contract) => {
    summary[contract.status]++
  })

  return summary
}

// Function to get contract type summary
export function getContractTypeSummary(contracts: Contract[]): Record<string, number> {
  const summary: Record<string, number> = {
    Contract: 0,
    PO: 0,
  }

  contracts.forEach((contract) => {
    summary[contract.contractType]++
  })

  return summary
}

// Helper function to calculate days remaining
export function getDaysRemaining(endDate: Date | null): number {
  if (!endDate) return 0

  const today = new Date()
  const diffTime = endDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Helper function to format dates
export function formatDate(date: Date | null): string {
  if (!date) return "N/A"

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

// The actual contract data from the provided table
export const contractData: string[][] = [
  [
    "Contractor",
    "Service Provided",
    "Status",
    "Contract Type",
    "Start Date",
    "End Date",
    "Contract (OMR)/Month",
    "Contract Total (OMR)/Year",
    "Note",
  ],
  [
    "KONE Assarain LLC",
    "Lift Maintenance Services",
    "Active",
    "Contract",
    "01/01/2025",
    "12/31/2025",
    "525 OMR",
    "11550 OMR (Excl VAT)",
    "",
  ],
  [
    "Oman Water Treatment Company (OWATCO)",
    "Comprehensive STP Operation and Maintenance",
    "Active",
    "Contract",
    "1/26/2024",
    "1/25/2029",
    "3,103.8 OMR",
    "37,245.4 OMR (Inc VAT)",
    "New contract due to early termination of previous Contract with Celar Company",
  ],
  [
    "Kalhat",
    "Facility Management (FM)",
    "Active",
    "Contract",
    "05/07/2024",
    "05/06/2030",
    "32,200.8 OMR",
    "386,409.718 OMR (Inc VAT)",
    "New contract overlapping with COMO",
  ],
  [
    "Future Cities S.A.O.C (Tadoom)",
    "SUPPLY AND INSTALLATION OF SMART WATER METERS, BILLING FOR WATER CONSUMPTION",
    "Active",
    "Contract",
    "9/24/2024",
    "9/23/2032",
    "2.7 Per Meter Collection",
    "184.3 OMR",
    "New contract replacing OIFC",
  ],
  [
    "Muna Noor International LLC",
    "Pest Control Services",
    "Active",
    "Contract",
    "07/01/2024",
    "6/30/2026",
    "1,400 /Month Inc VAT",
    "16,000 OMR (Inc VAT)",
    "",
  ],
  [
    "Celar Water",
    "Comprehensive STP Operation and Maintenance",
    "Expired",
    "Contract",
    "1/16/2021",
    "1/15/2025",
    "4,439 /Month",
    "",
    "Transitioned to OWATCO before contract end",
  ],
  [
    "Gulf Expert",
    "Chillers, BMS & Pressurisation Units",
    "Active",
    "Contract",
    "06/03/2024",
    "06/02/2025",
    "770 OMR",
    "9,240 OMR (Inc VAT)",
    "",
  ],
  [
    "Advanced Technology and Projects Company",
    "BMS Non-Comprehensive Annual Maintenance",
    "Expired",
    "PO",
    "3/26/2023",
    "3/25/2024",
    "3,800 /Year",
    "",
    "",
  ],
  [
    "Al Naba Services LLC",
    "Garbage Removal Services",
    "Expired",
    "Contract",
    "04/02/2023",
    "04/01/2024",
    "32 /Skip Trip",
    "",
    "",
  ],
  [
    "Bahwan Engineering Company LLC",
    "Maintenance of Fire Alarm & Fire Fighting Equipment",
    "Active",
    "Contract",
    "11/01/2024",
    "10/31/2025",
    "743.8",
    "8,925 OMR (Inc VAT)",
    "",
  ],
  [
    "Oman Pumps Manufacturing Co.",
    "Supply, Installation, and Commissioning of Pumps",
    "Expired",
    "Contract",
    "2/23/2020",
    "7/22/2025",
    "37,800 on Delivery",
    "",
    "",
  ],
  [
    "Rimal Global",
    "Provision of Services",
    "Expired",
    "Contract",
    "11/22/2021",
    "11/21/2031",
    "51,633 on Delivery",
    "",
    "",
  ],
  [
    "COMO",
    "Facility Management (FM)",
    "Expired",
    "Contract",
    "03/01/2022",
    "2/28/2025",
    "44,382 /Month",
    "",
    "Transitioned to Kalhat before contract end",
  ],
  [
    "Muscat Electronics LLC",
    "Daikin AC Chillers (Sale Center) Maintenance Services",
    "Expired",
    "Contract",
    "3/26/2023",
    "4/25/2024",
    "199.5 /Service Quarter",
    "",
    "Nearing expiration, review for renewal needed",
  ],
  ["Uni Gaz", "Gas Refilling for Flame Operation at Muscat Bay Main Entrance", "Expired", "PO", "", "", "", "", ""],
  ["Genetcoo", "York AC Chillers (Zone 01) Maintenance Services", "Expired", "Contract", "", "", "", "", ""],
  ["NMC", "Lagoon Main Two Drain Pipes Cleaning", "Active", "PO", "", "", "", "", ""],
]

// Get the parsed contracts
export const getContracts = (): Contract[] => {
  return parseContractorData(contractData)
}

// Get contracts by status
export function getContractsByStatus(contracts: Contract[], status: ContractStatus): Contract[] {
  return contracts.filter((contract) => contract.status === status)
}

// Get contracts by type
export function getContractsByType(contracts: Contract[], type: "Contract" | "PO"): Contract[] {
  return contracts.filter((contract) => contract.contractType === type)
}

// Calculate total active contract value (estimated)
export function calculateTotalActiveContractValue(contracts: Contract[]): number {
  let total = 0

  contracts.forEach((contract) => {
    if (contract.status === ContractStatus.Active && contract.yearlyValue) {
      // Extract numeric value from the yearly value string
      const match = contract.yearlyValue.match(/[\d,]+(\.\d+)?/)
      if (match) {
        const value = Number.parseFloat(match[0].replace(/,/g, ""))
        if (!isNaN(value)) {
          total += value
        }
      }
    }
  })

  return total
}

// Get service categories
export function getServiceCategories(contracts: Contract[]): string[] {
  const categories = new Set<string>()

  contracts.forEach((contract) => {
    // Extract general category from service provided
    let category = "Other"

    if (contract.serviceProvided.includes("Maintenance")) {
      category = "Maintenance"
    } else if (contract.serviceProvided.includes("STP")) {
      category = "STP"
    } else if (contract.serviceProvided.includes("Facility Management")) {
      category = "Facility Management"
    } else if (contract.serviceProvided.includes("Cleaning")) {
      category = "Cleaning"
    } else if (contract.serviceProvided.includes("Security")) {
      category = "Security"
    }

    categories.add(category)
  })

  return Array.from(categories)
}
