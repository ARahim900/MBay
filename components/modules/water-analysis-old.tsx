// TEMPORARILY RENAMED TO PREVENT CONFLICTS WITH NEW water-analysis-v2.tsx
// This is the OLD water analysis component that shows meters 4300336 & 4300338
// The new component (water-analysis-v2.tsx) excludes these meters as requested

export default function OldWaterAnalysisComponent() {
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ OLD COMPONENT DISABLED</h2>
      <p className="text-gray-600">
        This is the old water analysis component that included meters 4300336 & 4300338.
        <br />
        The system now uses water-analysis-v2.tsx which excludes these meters.
      </p>
    </div>
  )
}
