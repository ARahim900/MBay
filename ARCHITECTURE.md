# MBay System Architecture & Maintenance Guide

## 📁 **New Organized File Structure**

```
MBay/
├── lib/
│   ├── types/
│   │   └── index.ts              # Global TypeScript type definitions
│   ├── config/
│   │   └── modules.ts            # Module configuration & settings
│   ├── constants.ts              # Global constants (colors, etc.)
│   ├── utils.ts                  # Utility functions
│   └── [module]-data.ts          # Module-specific data files
├── components/
│   ├── shared/
│   │   └── index.tsx             # Reusable components across modules
│   ├── layout/
│   │   ├── sidebar.tsx           # Enhanced sidebar component
│   │   └── header.tsx            # Enhanced header component
│   ├── modules/
│   │   ├── [module]-v2.tsx       # New organized module components
│   │   └── [module].tsx          # Legacy module components
│   ├── ui/                       # shadcn/ui components
│   └── muscat-bay-dashboard-v2.tsx # New main dashboard
├── hooks/
│   └── index.ts                  # Custom React hooks
├── app/
│   ├── page.tsx                  # Main page entry point
│   └── layout.tsx                # Root layout
└── README.md                     # Updated documentation
```

---

## 🏗️ **Architecture Overview**

### **1. Configuration-Driven Architecture**

The new system uses a **centralized configuration** approach where all modules are defined in `lib/config/modules.ts`:

```typescript
export const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  electricity: {
    id: "electricity",
    name: "Electricity System", 
    icon: "Zap",
    description: "Power infrastructure monitoring and management",
    color: COLORS.warning,
    enabled: true,
    permissions: ["read", "write", "manage"],
    routes: ["/electricity"]
  },
  // ... other modules
}
```

**Benefits:**
- ✅ Single source of truth for all module configurations
- ✅ Easy to enable/disable modules
- ✅ Consistent routing and permissions
- ✅ Dynamic sidebar generation

### **2. Shared Component System**

All modules now use **standardized shared components** from `components/shared/index.tsx`:

- **MetricCard**: Consistent metric display across modules
- **ModuleHeader**: Standardized module headers with actions
- **FilterBar**: Advanced filtering and search functionality  
- **StatusBadge**: Consistent status indication
- **LoadingSkeleton**: Loading states
- **EmptyState**: No-data states

### **3. Custom Hooks Architecture**

Centralized state management through custom hooks in `hooks/index.ts`:

- **useDataFetching**: Generic data fetching with auto-refresh
- **usePagination**: Consistent pagination across modules
- **useSearchAndFilter**: Advanced search and filtering
- **useSorting**: Table sorting functionality
- **useDarkMode**: Theme management
- **useNotifications**: Global notification system

### **4. TypeScript Type Safety**

Comprehensive type definitions in `lib/types/index.ts` ensure:
- ✅ Type safety across all components
- ✅ Consistent data structures  
- ✅ Better IntelliSense and error catching
- ✅ Self-documenting code

---

## 🔧 **How to Maintain & Extend**

### **Adding a New Module**

1. **Define Module Configuration** in `lib/config/modules.ts`:
```typescript
newModule: {
  id: "newModule",
  name: "New Module",
  icon: "IconName", // from lucide-react
  description: "Module description",
  color: COLORS.primary,
  enabled: true,
  permissions: ["read", "write"],
  routes: ["/new-module"]
},
```

2. **Add Icon Mapping** in the same file:
```typescript
export const ICON_MAP = {
  // ... existing icons
  IconName
}
```

3. **Create Module Component** in `components/modules/new-module.tsx`:
```typescript
"use client"

import React from "react"
import { ModuleHeader, FilterBar } from "@/components/shared"
import { useDataFetching, usePagination } from "@/hooks"

export const NewModuleComponent: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode }) => {
  // Use shared hooks and components
  const { data, loading, error } = useDataFetching('/api/new-module', 'newModule')
  
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="New Module"
        description="Module description"
        isDarkMode={isDarkMode}
      />
      {/* Module content */}
    </div>
  )
}

export default NewModuleComponent
```

4. **Add to Main Dashboard** in `components/muscat-bay-dashboard-v2.tsx`:
```typescript
const NewModuleComponent = lazy(() => import("@/components/modules/new-module"))

// In renderMainContent():
case "newModule":
  return <NewModuleComponent isDarkMode={isDarkMode} />
```

### **Updating Existing Modules**

1. **Use the New Template**: Copy the structure from `electricity-system-v2.tsx`
2. **Replace Data Fetching**: Use `useDataFetching` hook instead of direct state
3. **Use Shared Components**: Replace custom components with shared ones
4. **Add TypeScript Types**: Define proper types in `lib/types/index.ts`

### **Customizing Shared Components**

Edit `components/shared/index.tsx` to modify shared components. Changes will automatically apply to all modules using them.

### **Managing Configuration**

All system configuration is centralized in `lib/config/modules.ts`:
- **Enable/disable modules**: Change `enabled: false`
- **Update permissions**: Modify `permissions` array
- **Change colors/icons**: Update `color` and `icon` properties
- **Adjust refresh rates**: Modify `REFRESH_INTERVALS`

---

## 🎯 **Best Practices**

### **1. Component Structure**
```typescript
// ✅ Good: Use shared components and hooks
const MyModule = ({ isDarkMode }) => {
  const { data, loading } = useDataFetching('/api/endpoint', 'module')
  
  return (
    <div className="space-y-6">
      <ModuleHeader title="My Module" isDarkMode={isDarkMode} />
      {/* Content */}
    </div>
  )
}

// ❌ Bad: Custom implementations
const MyModule = ({ isDarkMode }) => {
  const [data, setData] = useState([])
  // Custom header, custom loading, etc.
}
```

### **2. Type Safety**
```typescript
// ✅ Good: Use defined types
const data: ElectricityData[] = useDataFetching<ElectricityData>('/api/electricity', 'electricity')

// ❌ Bad: Any types
const data: any = useDataFetching('/api/electricity', 'electricity')
```

### **3. Error Handling**
```typescript
// ✅ Good: Use error boundaries and loading states
<ModuleErrorBoundary>
  <Suspense fallback={<LoadingSkeleton />}>
    <Module />
  </Suspense>
</ModuleErrorBoundary>

// ❌ Bad: No error handling
<Module />
```

### **4. State Management**
```typescript
// ✅ Good: Use custom hooks
const { searchTerm, setSearchTerm, filteredData } = useSearchAndFilter(data, ['name'])

// ❌ Bad: Manual state management
const [searchTerm, setSearchTerm] = useState('')
const filteredData = data.filter(item => item.name.includes(searchTerm))
```

---

## 🚀 **Migration Strategy**

### **Phase 1: Immediate (This Week)**
1. ✅ **Setup new architecture** (completed)
2. ✅ **Create shared components** (completed)
3. ✅ **Add custom hooks** (completed)

### **Phase 2: Module Migration (Next 1-2 Weeks)**
1. 🔄 **Migrate Electricity module** to new architecture (sample completed)
2. 🔄 **Migrate Water Analysis module**
3. 🔄 **Migrate STP Plant module** 
4. 🔄 **Migrate Contractor Tracker module**

### **Phase 3: Enhancement (Following Weeks)**
1. 📱 **Add responsive design improvements**
2. 🔔 **Implement notification system**
3. 📊 **Add advanced analytics**
4. 🔐 **Add authentication & permissions**

---

## 🔍 **Testing Your Changes**

### **1. Development Server**
```bash
npm run dev
# or
pnpm dev
```

### **2. Type Checking**
```bash
npx tsc --noEmit
```

### **3. Linting**
```bash
npm run lint
```

### **4. Building**
```bash
npm run build
```

---

## 📊 **Performance Optimizations**

The new architecture includes several performance improvements:

1. **Lazy Loading**: Modules are loaded only when needed
2. **Code Splitting**: Each module is a separate chunk
3. **Memoization**: Expensive calculations are memoized
4. **Error Boundaries**: Prevent crashes from affecting other modules
5. **Suspense**: Better loading states

---

## 🔒 **Security Considerations**

1. **Type Safety**: Prevents many runtime errors
2. **Input Validation**: All forms use Zod validation
3. **Permission System**: Role-based access control ready
4. **Error Boundaries**: Prevent information leakage

---

## 📝 **Code Examples**

### **Creating a New Data Hook**
```typescript
// In hooks/index.ts
export function useNewModuleData() {
  return useDataFetching<NewModuleData>('/api/new-module', 'newModule', {
    autoRefresh: true,
    refreshInterval: 60000
  })
}
```

### **Adding a New Shared Component**
```typescript
// In components/shared/index.tsx
export const NewSharedComponent: React.FC<Props> = ({ ...props }) => {
  return (
    <Card className={isDarkMode ? 'bg-slate-800' : 'bg-white'}>
      {/* Component content */}
    </Card>
  )
}
```

### **Configuring Module Permissions**
```typescript
// In lib/config/modules.ts
export const MODULE_PERMISSIONS = {
  electricity: {
    read: ['admin', 'operator', 'viewer'],
    write: ['admin', 'operator'],
    manage: ['admin']
  }
}
```

---

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Module not loading**: Check lazy import path and ensure export
2. **Types not found**: Verify import paths and type definitions
3. **Hooks not working**: Ensure hooks are called at component top-level
4. **Styling issues**: Check Tailwind classes and dark mode conditionals

### **Debug Tools:**
- React Developer Tools
- Browser DevTools Console
- TypeScript compiler errors
- Next.js error overlay

---

## 📚 **Next Steps**

1. **Switch to v2 components** by updating your main page import
2. **Migrate existing modules** one by one using the new template
3. **Add new features** using the shared component system
4. **Customize** the configuration to match your specific needs

The new architecture provides a solid foundation for scaling your MBay application while maintaining clean, organized, and maintainable code!
