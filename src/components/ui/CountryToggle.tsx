'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

interface CountryToggleProps {
  value: 'ZW' | 'SA';
  onChange: (value: 'ZW' | 'SA') => void;
}

export const CountryToggle: React.FC<CountryToggleProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800">
      <button
        onClick={() => onChange('ZW')}
        className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          value === 'ZW'
            ? 'text-emerald-700 dark:text-emerald-300'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
        }`}
      >
        <span className="relative z-10 flex items-center space-x-2">
          <img
            src="/flags/zw.svg"
            alt="Zimbabwe Flag"
            className="w-4 h-4 rounded-sm"
          />
          <span>Zimbabwe</span>
        </span>
        {value === 'ZW' && (
          <motion.div
            layoutId="countryToggleBg"
            className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-md"
            initial={false}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </button>

      <button
        onClick={() => onChange('SA')}
        className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          value === 'SA'
            ? 'text-emerald-700 dark:text-emerald-300'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
        }`}
      >
        <span className="relative z-10 flex items-center space-x-2">
          <img
            src="/flags/za.svg"
            alt="South Africa Flag"
            className="w-4 h-4 rounded-sm"
          />
          <span>South Africa</span>
        </span>
        {value === 'SA' && (
          <motion.div
            layoutId="countryToggleBg"
            className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-md"
            initial={false}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </button>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

      <button
        onClick={() => onChange(value === 'ZW' ? 'SA' : 'ZW')}
        className="p-2 rounded-md text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        title="Switch Country"
      >
        <Globe className="w-4 h-4" />
      </button>
    </div>
  );
}; 