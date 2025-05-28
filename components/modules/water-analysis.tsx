// ⚠️ OLD WATER ANALYSIS COMPONENT - DISABLED ⚠️
// This component has been replaced by water-analysis-v2.tsx
// The old component was showing meters 4300336 & 4300338 which should be excluded
// 
// DO NOT USE THIS COMPONENT
// Use water-analysis-v2.tsx instead which properly excludes the specified meters

import React from 'react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

const DisabledWaterAnalysisComponent = () => {
  return (
    <div className="p-8 space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>⚠️ COMPONENT DISABLED</strong>
          <br />
          This is the old water analysis component that included meters 4300336 & 4300338.
          <br />
          The system now uses <code>water-analysis-v2.tsx</code> which excludes these meters as requested.
        </AlertDescription>
      </Alert>
      
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Migration Information</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <p>✅ <strong>New Component:</strong> <code>water-analysis-v2.tsx</code></p>
          <p>✅ <strong>Excluded Meters:</strong> 4300336 & 4300338</p>
          <p>✅ <strong>Zone Focus:</strong> Prioritizes zone bulk data</p>
          <p>✅ <strong>Enhanced Features:</strong> Interactive analytics & filtering</p>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-slate-500">
          Please use the Water Analysis menu item to access the new restructured component.
        </p>
      </div>
    </div>
  )
}

export default DisabledWaterAnalysisComponent