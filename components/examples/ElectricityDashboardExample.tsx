'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Building, 
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Import our new database service and types
import { electricityService } from '@/lib/services/electricity-service';
import { ElectricityUnit, ElectricityFilters } from '@/lib/types/electricity';
import { 
  prepareMonthlyTrendData, 
  prepareCategoryData, 
  prepareTopConsumersData, 
  formatCurrency, 
  formatConsumption 
} from '@/lib/utils/electricity-db';

// Import our comprehensive data
import { 
  comprehensiveElectricityData,
  electricityCategories,
  electricityZones,
  electricitySummary
} from '@/lib/data/comprehensive-electricity-data';

/**
 * Enhanced Electricity Dashboard Component
 * Demonstrates full integration with the new database system
 */
const ElectricityDashboardExample: React.FC = () => {
  // State management
  const [units, setUnits] = useState<ElectricityUnit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<ElectricityUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedZone, setSelectedZone] = useState<string>('All Zones');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Initialize data
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      // In a real app, this would come from the service
      const response = await electricityService.getUnits({
        page: 1,
        limit: 100,
        filters: {},
        sortBy: { field: 'totalConsumption', direction: 'desc' }
      });
      
      setUnits(response.data);
      setFilteredUnits(response.data);
    } catch (error) {
      console.error('Failed to load electricity data:', error);
      // Fallback to static data
      setUnits(comprehensiveElectricityData);
      setFilteredUnits(comprehensiveElectricityData);
    }
    setLoading(false);
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...units];

    // Apply category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(unit => unit.category === selectedCategory);
    }

    // Apply zone filter
    if (selectedZone !== 'All Zones') {
      filtered = filtered.filter(unit => unit.zone === selectedZone);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(unit =>
        unit.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.meterAccountNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUnits(filtered);
    setCurrentPage(1);
  }, [units, selectedCategory, selectedZone, searchTerm]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalConsumption = filteredUnits.reduce((sum, unit) => sum + unit.totalConsumption, 0);
    const totalCost = totalConsumption * 0.025;
    const averageConsumption = filteredUnits.length > 0 ? totalConsumption / filteredUnits.length : 0;
    const activeUnits = filteredUnits.filter(unit => unit.totalConsumption > 0).length;

    return {
      totalConsumption,
      totalCost,
      averageConsumption,
      activeUnits,
      totalUnits: filteredUnits.length
    };
  }, [filteredUnits]);

  // Prepare chart data
  const monthlyTrendData = useMemo(() => prepareMonthlyTrendData(filteredUnits), [filteredUnits]);
  const categoryData = useMemo(() => prepareCategoryData(filteredUnits), [filteredUnits]);
  const topConsumersData = useMemo(() => prepareTopConsumersData(filteredUnits, 5), [filteredUnits]);

  // Pagination
  const paginatedUnits = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUnits.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUnits, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);

  // Event handlers
  const handleExportData = async () => {
    try {
      const csvData = await electricityService.exportData('csv');
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'electricity-data.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const resetFilters = () => {
    setSelectedCategory('All Categories');
    setSelectedZone('All Zones');
    setSearchTerm('');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2 text-lg">Loading electricity data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🔌 Electricity Management Dashboard
        </h1>
        <p className="text-gray-600">
          Comprehensive electricity consumption analysis powered by the new database system
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Units</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, meter, category..."
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Categories">All Categories</option>
              {electricityCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Zones">All Zones</option>
              {electricityZones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={resetFilters}
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Reset
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Consumption</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatConsumption(summaryStats.totalConsumption)}
              </p>
            </div>
            <Zap className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summaryStats.totalCost)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average/Unit</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatConsumption(summaryStats.averageConsumption)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Units</p>
              <p className="text-2xl font-bold text-gray-900">
                {summaryStats.activeUnits} / {summaryStats.totalUnits}
              </p>
            </div>
            <Building className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Consumption Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [formatConsumption(Number(value)), 'Consumption']} />
              <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Consumption by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData.slice(0, 5)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
              >
                {categoryData.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatConsumption(Number(value)), 'Consumption']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Consumers */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Electricity Consumers</h3>
        <div className="space-y-3">
          {topConsumersData.map((consumer, index) => (
            <div key={consumer.unitId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{consumer.unitName}</p>
                  <p className="text-sm text-gray-600">{consumer.zone} • {consumer.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{formatConsumption(consumer.consumption)}</p>
                <p className="text-sm text-gray-600">{formatCurrency(consumer.cost)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Electricity Units</h3>
          <span className="text-sm text-gray-600">
            Showing {paginatedUnits.length} of {filteredUnits.length} units
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meter Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Consumption
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {unit.unitName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {unit.zone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {unit.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {unit.meterAccountNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatConsumption(unit.totalConsumption)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {unit.totalConsumption > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectricityDashboardExample;
