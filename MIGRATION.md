# 🚀 MBay System Migration Guide

This guide will help you migrate from the old MBay system to the new organized architecture.

## 📋 **Quick Start Migration**

### **Step 1: Switch to New Dashboard**

Update your main page to use the new dashboard:

```typescript
// app/page.tsx
import MuscatBayDashboard from "@/components/muscat-bay-dashboard-v2"  // ← New version

export default function Home() {
  return <MuscatBayDashboard />
}
```

### **Step 2: Verify New Architecture**

Check that all new files are properly imported:

```typescript
// Verify these imports work:
import { MetricCard, ModuleHeader } from "@/components/shared"
import { useDataFetching, usePagination } from "@/hooks"
import { MODULE_CONFIGS } from "@/lib/config/modules"
import { ElectricityData } from "@/lib/types"
```

## 🔄 **Module-by-Module Migration**

### **Electricity System** ✅
- **Status**: Sample migrated (`electricity-system-v2.tsx`)
- **Features**: Uses new shared components, hooks, and types
- **Next**: Test and refine based on your data

### **Water Analysis** 🔄
**Current Issues to Address:**
1. Replace custom components with shared ones
2. Add proper TypeScript types
3. Implement standard hooks for data fetching

**Migration Steps:**
```typescript
// Before (old way):
const [data, setData] = useState([])
const [loading, setLoading] = useState(false)

// After (new way):
const { data, loading, error } = useDataFetching<WaterQualityData>('/api/water', 'water')
```

### **STP Plant** 🔄
**Current Issues:**
1. Large file size (74KB) - needs component splitting
2. Missing standardized metrics display
3. No consistent error handling

**Recommended Approach:**
1. Split into smaller components
2. Use `ModuleHeader` for consistent header
3. Add `StatusBadge` for plant status
4. Implement `FilterBar` for data filtering

### **Contractor Tracker** 🔄
**Migration Priority:** High (good candidate for quick migration)

**Steps:**
1. Add contractor types to `lib/types/index.ts`
2. Use `useSearchAndFilter` for contractor search
3. Implement `usePagination` for contractor list
4. Add `StatusBadge` for contractor status

## 🛠️ **Technical Migration Steps**

### **1. Data Layer Migration**

**Old Way:**
```typescript
// Direct state management
const [electricityData, setElectricityData] = useState([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  // Manual fetch logic
}, [])
```

**New Way:**
```typescript
// Using custom hook
const { data: electricityData, loading, error, refetch } = useDataFetching<ElectricityData>(
  '/api/electricity', 
  'electricity',
  { autoRefresh: true }
)
```

### **2. Component Structure Migration**

**Old Way:**
```typescript
// Custom header implementation
<div className="flex justify-between">
  <h1>Module Title</h1>
  <button>Action</button>
</div>
```

**New Way:**
```typescript
// Standardized header
<ModuleHeader
  title="Module Title"
  description="Module description"
  actions={<button>Action</button>}
  metrics={metrics}
  isDarkMode={isDarkMode}
/>
```

### **3. Styling Migration**

**Consistent Styling Pattern:**
```typescript
// Use consistent dark mode pattern
<Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
  <CardContent>
    <h3 className={`${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      Title
    </h3>
  </CardContent>
</Card>
```

## 📊 **Migration Checklist**

### **For Each Module:**

#### **Phase 1: Structure** ✅
- [ ] Add TypeScript types to `lib/types/index.ts`
- [ ] Update module configuration in `lib/config/modules.ts`
- [ ] Create new component file with `-v2` suffix

#### **Phase 2: Components** 🔄
- [ ] Replace custom header with `ModuleHeader`
- [ ] Add `FilterBar` for search/filtering
- [ ] Use `StatusBadge` for status indicators
- [ ] Implement `LoadingSkeleton` for loading states
- [ ] Add `EmptyState` for no-data scenarios

#### **Phase 3: Logic** 🔄
- [ ] Replace manual data fetching with `useDataFetching`
- [ ] Add `useSearchAndFilter` for filtering
- [ ] Implement `usePagination` for large datasets
- [ ] Use `useSorting` for table sorting
- [ ] Add `useNotifications` for alerts

#### **Phase 4: Polish** ⏳
- [ ] Add error boundaries
- [ ] Implement lazy loading
- [ ] Add proper loading states
- [ ] Test responsive design
- [ ] Verify dark mode support

## ⚡ **Quick Fixes**

### **Fix Import Errors**
```bash
# If you get import errors, check these common issues:

# 1. Missing file extensions
import { Component } from "@/components/shared"  # ✅ Correct
import { Component } from "@/components/shared/index"  # ❌ Wrong

# 2. Incorrect paths
import { COLORS } from "../../lib/constants"  # ❌ Wrong  
import { COLORS } from "@/lib/constants"  # ✅ Correct

# 3. Missing dependencies
npm install lucide-react  # If icons don't work
```

### **Fix Type Errors**
```typescript
// Add proper types
interface Props {
  isDarkMode?: boolean  // Make optional with default
  data: YourDataType[]   // Use specific types
}

// Use type assertions carefully
const data = response as YourDataType[]  // Only when necessary
```

### **Fix Styling Issues**
```typescript
// Ensure consistent spacing
<div className="space-y-6">  {/* Use space-y for vertical spacing */}
  <ModuleHeader />
  <FilterBar />
  <Card />
</div>

// Use proper responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```

## 🧪 **Testing Migration**

### **1. Visual Testing**
- [ ] Check all modules load without errors
- [ ] Verify dark mode toggle works
- [ ] Test responsive design on mobile
- [ ] Confirm all icons display correctly

### **2. Functionality Testing**
- [ ] Test search and filtering
- [ ] Verify pagination works
- [ ] Check sorting functionality
- [ ] Test notifications system

### **3. Performance Testing**
- [ ] Check bundle size hasn't increased significantly
- [ ] Verify lazy loading works
- [ ] Test loading states
- [ ] Confirm error boundaries catch errors

## 🚨 **Common Migration Issues**

### **Issue 1: Import Errors**
```typescript
// Error: Cannot find module '@/components/shared'
// Solution: Check if the file exists and path is correct
import { MetricCard } from "@/components/shared/index"  // ✅
```

### **Issue 2: Type Errors**
```typescript
// Error: Property 'isDarkMode' does not exist
// Solution: Add proper interface
interface ModuleProps {
  isDarkMode?: boolean
}
```

### **Issue 3: Hook Errors**
```typescript
// Error: Hook called outside component
// Solution: Ensure hooks are at top level
export const MyModule = () => {
  const { data } = useDataFetching(...)  // ✅ Top level
  
  const handleClick = () => {
    // const { data } = useDataFetching(...)  // ❌ Inside function
  }
}
```

## 📈 **Rollback Plan**

If you encounter issues, you can easily rollback:

### **Quick Rollback:**
```typescript
// app/page.tsx
import MuscatBayDashboard from "@/components/muscat-bay-dashboard"  // ← Original version
```

### **Gradual Migration:**
Keep both versions and migrate one module at a time:

```typescript
// In dashboard component
switch (activeMainSection) {
  case "ElectricitySystem":
    return USE_NEW_VERSION ? <ElectricitySystemModuleV2 /> : <ElectricitySystemModule />
  // ... other modules
}
```

## 🎯 **Success Metrics**

After migration, you should see:

### **Code Quality:**
- ✅ Reduced code duplication
- ✅ Better TypeScript coverage
- ✅ Consistent component patterns
- ✅ Improved error handling

### **Developer Experience:**
- ✅ Faster development of new features
- ✅ Easier maintenance and updates
- ✅ Better IntelliSense support
- ✅ Clearer code organization

### **User Experience:**
- ✅ Better loading states
- ✅ Consistent UI patterns
- ✅ Improved error messages
- ✅ Better responsive design

---

## 🆘 **Need Help?**

If you encounter issues during migration:

1. **Check the ARCHITECTURE.md** for detailed explanations
2. **Review the sample** electricity-system-v2.tsx for patterns  
3. **Test incrementally** - migrate one piece at a time
4. **Use TypeScript errors** as guidance for fixes

The new architecture is designed to be **incrementally adoptable** - you can migrate one module at a time without breaking the existing system!

---

**Ready to migrate? Start with the Quick Start section above! 🚀**
