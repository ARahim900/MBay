# Muscat Bay Assets & Operation Dashboard

A modern, comprehensive SaaS-style web application for monitoring and managing operational data at Muscat Bay. Built with Next.js, TypeScript, and Tailwind CSS.

## 🌟 Features

### Core Modules
- **🔌 Electricity System**: Comprehensive electricity consumption analysis and monitoring
- **💧 Water Analysis**: Water quality and flow analysis
- **🏭 STP Plant**: Sewage treatment plant monitoring
- **👥 Contractor Tracker**: Contractor and project management

### Key Capabilities
- **Real-time Dashboard**: Live operational metrics and KPIs
- **Advanced Analytics**: AI-powered consumption analysis
- **Interactive Charts**: Beautiful, responsive data visualizations
- **Filtering & Search**: Advanced filtering by month, category, and unit
- **Modern UI**: Clean, professional interface with dark mode support
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modular Architecture**: Clean, maintainable code structure

## 🏗️ Architecture

### Project Structure
```
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── layout/             # Layout components
│   │   ├── header.tsx      # Top navigation bar
│   │   └── sidebar.tsx     # Side navigation
│   ├── modules/            # Feature modules
│   │   ├── electricity-system-v3.tsx
│   │   ├── water-analysis-v2.tsx
│   │   ├── stp-plant.tsx
│   │   └── contractor-tracker.tsx
│   ├── shared/             # Shared UI components
│   │   └── ui-components.tsx
│   └── muscat-bay-dashboard-v3.tsx  # Main dashboard
├── lib/
│   ├── constants.ts        # Application constants
│   ├── types.ts           # TypeScript type definitions
│   ├── utils.ts           # Utility functions
│   └── data/              # Data files
│       └── electricity-data.ts
└── hooks/                 # Custom React hooks
```

### Design System

#### Color Palette
- **Primary**: `#4E4456` - Main brand color (Deep purple-gray)
- **Primary Light**: `#7E708A` - Hover states
- **Primary Dark**: `#3B3241` - Active states
- **Accent**: `#6A5ACD` - Highlights
- **Success**: `#10B981` - Positive metrics
- **Warning**: `#F59E0B` - Warnings
- **Info**: `#3B82F6` - Information
- **Error**: `#EF4444` - Errors

#### Typography
- Font Family: Inter (system font fallback)
- Consistent sizing scale using Tailwind CSS classes

#### Components
- Modular, reusable components
- Consistent spacing and styling
- Accessibility considerations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (preferred) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ARahim900/MBay.git
   cd MBay
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Data Management

### Electricity Data
- Raw data is stored in `lib/data/electricity-data.ts`
- Parsed automatically using utility functions
- Supports multiple months of consumption data
- Categories: Pumping Station, Apartment, Street Light, etc.

### Adding New Data
1. Update the raw data string in `electricity-data.ts`
2. The parsing functions will automatically process the new data
3. Charts and KPIs will update automatically

## 🔧 Development

### Adding New Modules

1. **Create the module component**
   ```typescript
   // components/modules/your-module.tsx
   export const YourModule: React.FC = () => {
     return (
       <div>Your module content</div>
     );
   };
   ```

2. **Add to navigation**
   ```typescript
   // lib/constants.ts
   export const MAIN_SECTIONS = [
     // ... existing sections
     { 
       name: 'Your Module', 
       id: 'YourModule', 
       icon: 'YourIcon',
       description: 'Your module description'
     },
   ];
   ```

3. **Update main dashboard**
   ```typescript
   // components/muscat-bay-dashboard-v3.tsx
   import { YourModule } from '@/components/modules/your-module';
   
   const renderMainContent = () => {
     switch(activeMainSection) {
       // ... existing cases
       case 'YourModule': 
         return <YourModule />;
     }
   };
   ```

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow the established color palette
- Maintain consistent spacing (using the scale: 1, 2, 3, 4, 6, 8, 12, 16, 24)
- Use the shared UI components when possible

### TypeScript
- All components are fully typed
- Types are defined in `lib/types.ts`
- Use interfaces for props and data structures
- Leverage TypeScript's strict mode for better code quality

## 🎨 UI Components

### Shared Components
- `SummaryCard`: KPI display cards
- `ChartWrapper`: Container for charts with title and actions
- `StyledSelect`: Consistent dropdown styling
- `LoadingSpinner`: Loading indicator
- `StatusBadge`: Status indicators
- `ProgressBar`: Progress visualization
- `MetricCard`: Metric display with change indicators
- `EmptyState`: Empty state placeholder

### Usage Example
```typescript
import { SummaryCard } from '@/components/shared/ui-components';

<SummaryCard 
  title="Total Consumption" 
  value="1,250" 
  unit="kWh" 
  icon={Zap} 
  trend="↑ 5% from last month" 
  trendColor="text-green-600" 
  iconBgColor="#4E4456"
/>
```

## 📈 Analytics Features

### AI-Powered Analysis
- Consumption pattern analysis
- Anomaly detection suggestions
- Optimization recommendations
- Trend insights

### Interactive Charts
- Line charts for trends
- Pie charts for distributions
- Bar charts for comparisons
- Area charts for cumulative data

### Filtering & Search
- Month-based filtering
- Category filtering
- Unit-specific views
- Reset functionality

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for environment-specific settings:

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME="Muscat Bay Assets & Operation"
NEXT_PUBLIC_APP_VERSION="2.0.0"

# API Configuration (when implemented)
NEXT_PUBLIC_API_BASE_URL="https://api.muscatbay.com"
```

### Constants
Modify `lib/constants.ts` to adjust:
- Color scheme
- OMR per kWh rate
- Navigation sections
- API endpoints

## 🚀 Deployment

### Build for Production
```bash
pnpm build
# or
npm run build
```

### Deployment Options
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Docker**
- **Self-hosted**

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 Monitoring & Analytics

### Performance Monitoring
- Built-in Next.js analytics
- Web Vitals tracking
- Real User Monitoring (RUM)

### Error Tracking
- Consider integrating Sentry or similar
- Console error monitoring
- Performance bottleneck identification

## 📱 Mobile Responsiveness

- **Responsive Grid System**: Uses CSS Grid and Flexbox
- **Mobile-First Design**: Tailwind's responsive utilities
- **Touch-Friendly Interface**: Appropriate touch targets
- **Optimized Charts**: Responsive chart containers

## 🔐 Security Considerations

- **Environment Variables**: Sensitive data in env files
- **Input Validation**: Type checking and validation
- **XSS Protection**: React's built-in protection
- **Content Security Policy**: Configure for production

## 🧪 Testing

### Setup Testing (Future)
```bash
# Install testing dependencies
pnpm add -D @testing-library/react @testing-library/jest-dom jest

# Add test scripts to package.json
"test": "jest",
"test:watch": "jest --watch"
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for Muscat Bay operations.

## 🤝 Support

For support, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for Muscat Bay Operations**
