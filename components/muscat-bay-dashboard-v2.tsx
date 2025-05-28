// Lazy load modules for better performance
const ElectricitySystemModule = lazy(() => import("@/components/modules/electricity-system-v2"))
const WaterAnalysisModule = lazy(() => import("@/components/modules/water-analysis-v2"))
const STPPlantModule = lazy(() => import("@/components/modules/stp-plant"))
const ContractorTrackerModule = lazy(() => import("@/components/modules/contractor-tracker"))