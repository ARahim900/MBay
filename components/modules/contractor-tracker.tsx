"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Users,
  Search,
  AlertTriangle,
  BarChart4,
  RefreshCw,
  ChevronDown,
  X,
  Plus,
  Download,
  Printer,
  Calendar,
  FileCheck,
} from "lucide-react"
import { COLORS } from "@/lib/constants"
import {
  type Contract,
  ContractStatus,
  getContracts,
  getContractStatusSummary,
  getContractTypeSummary,
  getContractsExpiringInNextMonths,
  getDaysRemaining,
  formatDate,
  getContractsByStatus,
  calculateTotalActiveContractValue,
  getServiceCategories,
} from "@/lib/contractor-data"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Helper function to format currency
const formatCurrency = (value: string): string => {
  if (!value) return "N/A"
  return value
}

// Helper function to get status color
const getStatusColor = (status: ContractStatus): string => {
  switch (status) {
    case ContractStatus.Active:
      return COLORS.success
    case ContractStatus.Pending:
      return COLORS.info
    case ContractStatus.Expired:
      return "#6c757d" // Gray
    case ContractStatus.Terminated:
      return COLORS.error
    default:
      return COLORS.primary
  }
}

// Contract Status Badge Component
const ContractStatusBadge = ({ status }: { status: ContractStatus }) => {
  return (
    <Badge
      style={{
        backgroundColor: getStatusColor(status),
        color: "white",
      }}
    >
      {status}
    </Badge>
  )
}

// Contract Type Badge Component
const ContractTypeBadge = ({ type }: { type: "Contract" | "PO" }) => {
  return (
    <Badge
      variant="outline"
      style={{
        borderColor: type === "Contract" ? COLORS.primary : COLORS.info,
        color: type === "Contract" ? COLORS.primary : COLORS.info,
      }}
    >
      {type}
    </Badge>
  )
}

// Contract Card Component
const ContractCard = ({ contract }: { contract: Contract }) => {
  const daysRemaining = contract.endDate ? getDaysRemaining(contract.endDate) : 0

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{contract.contractor}</CardTitle>
          <ContractStatusBadge status={contract.status} />
        </div>
        <CardDescription className="line-clamp-2">{contract.serviceProvided}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Type:</span>
            <ContractTypeBadge type={contract.contractType} />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Value/Month:</span>
            <span className="font-medium">{formatCurrency(contract.monthlyValue)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Value/Year:</span>
            <span className="font-medium">{formatCurrency(contract.yearlyValue)}</span>
          </div>
          {contract.startDate && contract.endDate && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">
                {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="w-full">
          {contract.notes && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{contract.notes}</p>}
          {contract.endDate && (
            <div className="text-sm text-right">
              {daysRemaining > 0 ? (
                <span className={daysRemaining < 30 ? "text-amber-500 font-medium" : ""}>
                  {daysRemaining} days left
                </span>
              ) : (
                <span className="text-red-500 font-medium">Expired</span>
              )}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

// Contract Detail Dialog Component
const ContractDetailDialog = ({ contract }: { contract: Contract }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{contract.contractor}</DialogTitle>
          <DialogDescription>{contract.serviceProvided}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Contract Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Status:</div>
                <div>
                  <ContractStatusBadge status={contract.status} />
                </div>
                <div className="text-muted-foreground">Type:</div>
                <div>
                  <ContractTypeBadge type={contract.contractType} />
                </div>
                <div className="text-muted-foreground">Start Date:</div>
                <div>{formatDate(contract.startDate)}</div>
                <div className="text-muted-foreground">End Date:</div>
                <div>{formatDate(contract.endDate)}</div>
                <div className="text-muted-foreground">Value/Month:</div>
                <div>{formatCurrency(contract.monthlyValue)}</div>
                <div className="text-muted-foreground">Value/Year:</div>
                <div>{formatCurrency(contract.yearlyValue)}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Notes</h4>
              <p className="text-sm">{contract.notes || "No notes available"}</p>
            </div>
          </div>

          <div className="space-y-4">
            {contract.endDate && (
              <div>
                <h4 className="text-sm font-medium mb-1">Contract Timeline</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">
                      {contract.status === ContractStatus.Active
                        ? "Active Contract"
                        : "Contract Status: " + contract.status}
                    </span>
                    {getDaysRemaining(contract.endDate) > 0 ? (
                      <span className="text-sm">{getDaysRemaining(contract.endDate)} days remaining</span>
                    ) : (
                      <span className="text-sm text-red-500">Expired</span>
                    )}
                  </div>
                  {contract.startDate && (
                    <Progress
                      value={calculateProgressPercentage(contract.startDate, contract.endDate)}
                      className="h-2"
                    />
                  )}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium mb-1">Key Dates</h4>
              <div className="space-y-2">
                {contract.startDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{formatDate(contract.startDate)}</span>
                  </div>
                )}
                {contract.endDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground">End Date:</span>
                    <span>{formatDate(contract.endDate)}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Actions</h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <FileCheck className="mr-2 h-4 w-4" />
                  Update Status
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Extend Contract
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <RefreshCw className="mr-2 h-4 w-4" />
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to calculate progress percentage
function calculateProgressPercentage(startDate: Date | null, endDate: Date | null): number {
  if (!startDate || !endDate) return 0

  const start = startDate.getTime()
  const end = endDate.getTime()
  const now = new Date().getTime()

  if (now <= start) return 0
  if (now >= end) return 100

  return Math.round(((now - start) / (end - start)) * 100)
}

// Main Contractor Tracker Module
export const ContractorTrackerModule = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [contracts, setContracts] = useState<Contract[]>([])
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  // Load contract data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const data = getContracts()
        setContracts(data)
        setFilteredContracts(data)
      } catch (error) {
        console.error("Error loading contract data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Apply filters when search term or filters change
  useEffect(() => {
    let results = contracts

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (contract) =>
          contract.contractor.toLowerCase().includes(term) ||
          contract.serviceProvided.toLowerCase().includes(term) ||
          (contract.notes && contract.notes.toLowerCase().includes(term)),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter((contract) => contract.status === statusFilter)
    }

    // Apply type filter
    if (typeFilter !== "all") {
      results = results.filter((contract) => contract.contractType === typeFilter)
    }

    setFilteredContracts(results)
  }, [searchTerm, statusFilter, typeFilter, contracts])

  // Get contracts expiring soon
  const expiringContracts = getContractsExpiringInNextMonths(contracts, 3)

  // Get contract status summary
  const statusSummary = getContractStatusSummary(contracts)

  // Get contract type summary
  const typeSummary = getContractTypeSummary(contracts)

  // Get active contracts
  const activeContracts = getContractsByStatus(contracts, ContractStatus.Active)

  // Get service categories
  const serviceCategories = getServiceCategories(contracts)

  // Calculate total active contract value
  const totalActiveContractValue = calculateTotalActiveContractValue(contracts)

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTypeFilter("all")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>
            Contractor Tracker
          </h1>
          <p className="text-muted-foreground">Manage and monitor all contracts and contractor relationships</p>
        </div>

        <div className="flex items-center gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Contract
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Print Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="contractors">Contractors</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contracts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">{activeContracts.length} active contracts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Contract Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{typeSummary["Contract"] || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Contracts and {typeSummary["PO"] || 0} Purchase Orders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Contract Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalActiveContractValue.toLocaleString()} OMR</div>
                <p className="text-xs text-muted-foreground mt-1">Estimated annual value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expiringContracts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Contracts expiring in next 90 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Contracts Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Active Contracts</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab("contracts")
                  setStatusFilter(ContractStatus.Active)
                }}
              >
                View All
              </Button>
            </div>

            {activeContracts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeContracts.slice(0, 3).map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-6 text-center">
                  <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                  <p>No active contracts found</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Expiring Contracts Section */}
          {expiringContracts.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Contracts Expiring Soon</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expiringContracts.slice(0, 3).map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            </div>
          )}

          {/* Contract Status Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contract Status Summary</CardTitle>
                <CardDescription>Overview of contracts by current status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(statusSummary)
                    .filter(([_, count]) => count > 0)
                    .map(([status, count]) => (
                      <div key={status} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getStatusColor(status as ContractStatus) }}
                        />
                        <div className="flex-1 flex justify-between items-center">
                          <span>{status}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="w-1/3 ml-4">
                          <Progress
                            value={(count / contracts.length) * 100}
                            className="h-2"
                            style={
                              {
                                "--progress-background": getStatusColor(status as ContractStatus),
                              } as React.CSSProperties
                            }
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contract Types</CardTitle>
                <CardDescription>Distribution of contracts by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Contracts</span>
                      <span className="font-medium">{typeSummary["Contract"] || 0}</span>
                    </div>
                    <Progress
                      value={(typeSummary["Contract"] / contracts.length) * 100}
                      className="h-2"
                      style={
                        {
                          "--progress-background": COLORS.primary,
                        } as React.CSSProperties
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Purchase Orders (PO)</span>
                      <span className="font-medium">{typeSummary["PO"] || 0}</span>
                    </div>
                    <Progress
                      value={(typeSummary["PO"] / contracts.length) * 100}
                      className="h-2"
                      style={
                        {
                          "--progress-background": COLORS.info,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search contracts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.values(ContractStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="PO">Purchase Order</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon" onClick={resetFilters}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contracts Table */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>All Contracts</CardTitle>
              <CardDescription>
                {filteredContracts.length} contracts found
                {(searchTerm || statusFilter !== "all" || typeFilter !== "all") &&
                  " (filtered from " + contracts.length + ")"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center">
                  <RefreshCw className="animate-spin h-8 w-8 mx-auto text-muted-foreground mb-4" />
                  <p>Loading contracts...</p>
                </div>
              ) : filteredContracts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contractor</TableHead>
                      <TableHead>Service Provided</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Value/Month</TableHead>
                      <TableHead>Value/Year</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.contractor}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{contract.serviceProvided}</TableCell>
                        <TableCell>
                          <ContractStatusBadge status={contract.status} />
                        </TableCell>
                        <TableCell>
                          <ContractTypeBadge type={contract.contractType} />
                        </TableCell>
                        <TableCell>{formatDate(contract.startDate)}</TableCell>
                        <TableCell>
                          {formatDate(contract.endDate)}
                          {contract.endDate &&
                            getDaysRemaining(contract.endDate) < 30 &&
                            getDaysRemaining(contract.endDate) > 0 && (
                              <div className="text-xs text-amber-500 font-medium">
                                {getDaysRemaining(contract.endDate)} days left
                              </div>
                            )}
                          {contract.endDate && getDaysRemaining(contract.endDate) <= 0 && (
                            <div className="text-xs text-red-500 font-medium">Expired</div>
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(contract.monthlyValue)}</TableCell>
                        <TableCell>{formatCurrency(contract.yearlyValue)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ContractDetailDialog contract={contract} />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit Contract</DropdownMenuItem>
                                <DropdownMenuItem>Update Status</DropdownMenuItem>
                                <DropdownMenuItem>View Documents</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500">Terminate Contract</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                  <p>No contracts found matching your filters</p>
                  <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4">
                    Reset Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contractors Tab */}
        <TabsContent value="contractors" className="space-y-6">
          <Card className="p-8 text-center">
            <Users size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Contractors Management</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              This section will allow you to manage contractor profiles, performance ratings, certifications, and
              compliance documentation.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contractor
            </Button>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="p-8 text-center">
            <BarChart4 size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Contract Reports & Analytics</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              This section will provide detailed reports and analytics on contract performance, spending trends,
              contractor evaluations, and compliance metrics.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
