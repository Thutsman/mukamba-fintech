import * as React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EnhancedStatCardProps {
  title: string;
  value: string | number;
  change: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  trend: number[]; // For mini sparkline
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  additionalInfo?: {
    label: string;
    value: string | number;
  }[];
}

const colorMap = {
  blue: {
    gradient: 'from-[#3B82F6] to-[#1D4ED8]',
    borderGradient: 'from-[#3B82F6] via-[#2563EB] to-[#1D4ED8]',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100',
    shadow: 'shadow-blue-500/25',
    hover: 'hover:shadow-blue-500/40',
    accent: 'text-blue-400',
    glass: 'bg-blue-500/10',
    backdrop: 'backdrop-blur-md',
  },
  green: {
    gradient: 'from-[#10B981] to-[#047857]',
    borderGradient: 'from-[#10B981] via-[#059669] to-[#047857]',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    shadow: 'shadow-emerald-500/25',
    hover: 'hover:shadow-emerald-500/40',
    accent: 'text-emerald-400',
    glass: 'bg-emerald-500/10',
    backdrop: 'backdrop-blur-md',
  },
  purple: {
    gradient: 'from-[#8B5CF6] to-[#6D28D9]',
    borderGradient: 'from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9]',
    light: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-100',
    shadow: 'shadow-purple-500/25',
    hover: 'hover:shadow-purple-500/40',
    accent: 'text-purple-400',
    glass: 'bg-purple-500/10',
    backdrop: 'backdrop-blur-md',
  },
  orange: {
    gradient: 'from-[#F59E0B] to-[#D97706]',
    borderGradient: 'from-[#F59E0B] via-[#F59E0B] to-[#D97706]',
    light: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-100',
    shadow: 'shadow-orange-500/25',
    hover: 'hover:shadow-orange-500/40',
    accent: 'text-orange-400',
    glass: 'bg-orange-500/10',
    backdrop: 'backdrop-blur-md',
  },
};

// Mini Chart Component
const MiniChart: React.FC<{ data: number[]; color: string; isVisible?: boolean }> = ({ data, color, isVisible = false }) => {
  const normalizedData = React.useMemo(() => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    return data.map(value => ((value - min) / (range || 1)) * 100);
  }, [data]);

  const pathData = React.useMemo(() => {
    const points = normalizedData.map((value, index) => 
      `${(index / (normalizedData.length - 1)) * 100},${100 - value}`
    ).join(' ');
    return `M ${points}`;
  }, [normalizedData]);

     return (
     <div className="relative h-8 w-full" role="img" aria-label={`Mini chart with ${data.length} data points`}>
       <svg
         className="w-full h-full"
         viewBox="0 0 100 100"
         preserveAspectRatio="none"
         aria-hidden="true"
       >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        
        {/* Chart line with reveal animation */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isVisible ? 1 : 0 }}
          transition={{ 
            duration: 1.5, 
            ease: "easeInOut",
            delay: 0.1
          }}
        />
        
        {/* Data points with stagger animation */}
        {normalizedData.map((value, index) => (
          <motion.circle
            key={index}
            cx={`${(index / (normalizedData.length - 1)) * 100}`}
            cy={100 - value}
            r="1.5"
            fill="currentColor"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: isVisible ? 1 : 0, 
              scale: isVisible ? 1 : 0 
            }}
            transition={{ 
              duration: 0.3, 
              delay: 0.5 + (index * 0.1),
              ease: "easeOut"
            }}
            className="transition-all duration-300 opacity-0 group-hover:opacity-100"
          />
        ))}
      </svg>
    </div>
  );
};

export const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
  color,
  additionalInfo = [],
}) => {
  const colors = colorMap[color];

  // Generate a stable delay based on title to avoid hydration issues
  const animationDelay = React.useMemo(() => {
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 15) / 100; // Returns a value between 0 and 0.15
  }, [title]);

  // Number counter animation
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  
  React.useEffect(() => {
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : Number(value);
    if (!isNaN(numericValue)) {
      const controls = animate(count, numericValue, {
        duration: 2,
        delay: animationDelay + 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      });
      return controls.stop;
    }
  }, [value, count, animationDelay]);

  // Chart animation state
  const [chartVisible, setChartVisible] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setChartVisible(true), (animationDelay + 0.6) * 1000);
    return () => clearTimeout(timer);
  }, [animationDelay]);

     return (
     <motion.div
       initial={{ opacity: 0, y: 20, scale: 0.95 }}
       animate={{ opacity: 1, y: 0, scale: 1 }}
       transition={{ 
         duration: 0.4, 
         ease: [0.25, 0.46, 0.45, 0.94],
         delay: animationDelay
       }}
       whileHover={{ 
         y: -6, 
         scale: 1.02,
         transition: { duration: 0.3, ease: "easeOut" }
       }}
       className="group cursor-pointer relative"
       role="img"
       aria-label={`${title}: ${value}, ${change.type === 'increase' ? 'increased' : 'decreased'} by ${change.value}% from ${change.period}`}
       tabIndex={0}
       onKeyDown={(e) => {
         if (e.key === 'Enter' || e.key === ' ') {
           e.preventDefault();
           // Add click handler functionality here if needed
         }
       }}
     >
      {/* Gradient Border Container */}
      <motion.div 
        className={`
          relative p-[2px] rounded-2xl
          bg-gradient-to-br ${colors.borderGradient}
          shadow-lg ${colors.shadow}
          transition-all duration-300 ease-out
        `}
        whileHover={{
          boxShadow: `0 20px 40px ${colors.shadow.replace('shadow-', '').replace('/25', '')}40`,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
      >
                 {/* Main Card with Glassmorphism */}
         <motion.div
           className={`
             relative overflow-hidden border-0 rounded-2xl
             bg-gradient-to-br ${colors.gradient}
             ${colors.backdrop}
             shadow-xl shadow-black/10
             transition-all duration-300 ease-out
           `}
           whileHover={{
             boxShadow: `0 25px 50px ${colors.shadow.replace('shadow-', '').replace('/25', '')}50`,
             transition: { duration: 0.3, ease: "easeOut" }
           }}
         >
          {/* Glassmorphism Overlay */}
          <div className={`
            absolute inset-0 ${colors.glass}
            backdrop-blur-xl
            rounded-2xl
          `} />
          
          {/* Enhanced background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl transition-all duration-700 group-hover:scale-150" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl transition-all duration-700 group-hover:scale-125" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-3xl opacity-50 transition-all duration-1000 group-hover:scale-200" />
          </div>

                     <div className="relative p-4 text-white z-10">
                          {/* Card Header - Enhanced */}
             <div className="flex items-center justify-between mb-3" role="banner">
               <motion.div 
                 className={`
                   w-10 h-10 rounded-xl flex items-center justify-center
                   bg-white/20 backdrop-blur-md border border-white/30
                   shadow-lg shadow-black/20
                   transition-all duration-300 group-hover:scale-110
                 `}
                 whileHover={{ rotate: 5 }}
                 animate={{ 
                   scale: [1, 1.05, 1],
                   transition: { 
                     duration: 2, 
                     repeat: Infinity, 
                     ease: "easeInOut",
                     delay: animationDelay 
                   }
                 }}
                 aria-hidden="true"
               >
                <div className="text-white">
                  {icon}
                </div>
              </motion.div>
              
               <motion.div 
                 className="flex items-center space-x-2"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.2 }}
                 whileHover={{
                   scale: 1.05,
                   transition: { duration: 0.2, ease: "easeOut" }
                 }}
               >
                <div 
                  className={`
                    flex items-center space-x-1 px-3 py-1.5 rounded-full
                    ${change.type === 'increase' 
                      ? 'bg-emerald-500/20 border border-emerald-400/30' 
                      : 'bg-red-500/20 border border-red-400/30'
                    }
                    backdrop-blur-md
                  `}
                  role="status"
                  aria-label={`${change.type === 'increase' ? 'Increased' : 'Decreased'} by ${change.value}%`}
                >
                  {change.type === 'increase' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-300" aria-hidden="true" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-300" aria-hidden="true" />
                  )}
                  <span className={`
                    text-sm font-semibold
                    ${change.type === 'increase' ? 'text-emerald-300' : 'text-red-300'}
                  `}>
                    {change.value}%
                  </span>
                </div>
              </motion.div>
             </div>

                         {/* Card Content - Enhanced Typography with Specific Hierarchy */}
             <div className="space-y-1 mb-3" role="main">
               <motion.h3 
                 className="text-base font-semibold text-white/90 tracking-wide"
                 style={{
                   fontSize: '0.875rem', /* 14px */
                   fontWeight: 600,
                   color: 'rgba(255,255,255,0.9)',
                   marginTop: '0.25rem'
                 }}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 id={`stat-title-${title.toLowerCase().replace(/\s+/g, '-')}`}
               >
                 {title}
               </motion.h3>
               
               <motion.p 
                 className="font-extrabold tracking-tight"
                 style={{
                   fontSize: '1.75rem', /* 28px */
                   fontWeight: 800,
                   lineHeight: 1,
                   color: 'white',
                   textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                 }}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 aria-labelledby={`stat-title-${title.toLowerCase().replace(/\s+/g, '-')}`}
               >
                 {typeof value === 'string' && value.includes('%') ? value : (
                   <motion.span>{rounded}</motion.span>
                 )}
               </motion.p>
               
               <motion.p 
                 className="font-medium"
                 style={{
                   fontSize: '0.75rem', /* 12px */
                   fontWeight: 500,
                   color: 'rgba(255,255,255,0.7)',
                   marginTop: '0.125rem'
                 }}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
               >
                 vs. {change.period}
               </motion.p>
             </div>

            {/* Enhanced Mini Chart */}
            <motion.div 
              className="mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              role="img"
              aria-label={`Trend chart showing ${trend.length} data points for ${title}`}
            >
              <MiniChart data={trend} color={color} isVisible={chartVisible} />
            </motion.div>

            {/* Additional Info Section */}
            {additionalInfo.length > 0 && (
              <motion.div 
                className="pt-2 border-t border-white/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                role="complementary"
                aria-label="Additional statistics"
              >
                <div className="flex items-center justify-between text-sm">
                  {additionalInfo.map((info, index) => (
                    <div key={index} className="text-center">
                      <div className="text-white/80 font-medium" role="text">{info.label}</div>
                      <div className="text-white font-semibold" role="text">{info.value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}; 