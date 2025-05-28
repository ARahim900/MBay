"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Droplets, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface WaterAnalysisDebugProps {
  isDarkMode?: boolean
}

export const WaterAnalysisDebug: React.FC<WaterAnalysisDebugProps> = ({ isDarkMode = false }) => {
  // Test if we can import the water analysis utilities
  let canImportUtils = false
  let canImportTypes = false
  let canImportIntegration = false
  let errorMessage = ""

  try {
    // Try to import the utilities
    require("@/lib/utils/water-analysis")
    canImportUtils = true
  } catch (error) {
    errorMessage += `Utils import error: ${error}; `
  }

  try {
    // Try to import the types
    require("@/lib/types/water-analysis")
    canImportTypes = true
  } catch (error) {
    errorMessage += `Types import error: ${error}; `
  }

  try {
    // Try to import the integration
    require("@/lib/utils/water-data-integration")
    canImportIntegration = true
  } catch (error) {
    errorMessage += `Integration import error: ${error}; `
  }

  const allImportsWorking = canImportUtils && canImportTypes && canImportIntegration

  return (
    <div className="space-y-6">
      <Card className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
        <CardHeader>
          <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Droplets className="h-5 w-5" />
            <span>Water Analysis v2 - Debug Mode</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Dependency Check
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                {canImportUtils ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Water Utils
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {canImportTypes ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Water Types
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {canImportIntegration ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Data Integration
                </span>
              </div>
            </div>
          </div>

          {!allImportsWorking && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="font-semibold text-red-700">Import Errors Detected</span>
              </div>
              <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
            </div>
          )}

          {allImportsWorking && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-green-700">All Dependencies Working!</span>
              </div>
              <p className="text-sm text-green-600 mt-2">
                ✅ Water Analysis v2 is ready to load
                <br />
                ✅ Meters 4300336 & 4300338 will be excluded
                <br />
                ✅ Zone bulk data will be processed
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Current Status
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Using water-analysis-v2.tsx</Badge>
              <Badge variant="destructive">Excluding 4300336</Badge>
              <Badge variant="destructive">Excluding 4300338</Badge>
              <Badge variant="default">Zone Bulk Focus</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Instructions
            </h3>
            <div className={`text-sm space-y-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <p>1. If all dependencies are ✅, the new Water Analysis should work</p>
              <p>2. Clear your browser cache and hard refresh (Ctrl+F5)</p>
              <p>3. Check browser console for any error messages</p>
              <p>4. Make sure you're using the latest code from the repository</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WaterAnalysisDebug
