'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { PropertyCountry } from '@/types/property';

interface CountryToggleProps {
  value: PropertyCountry;
  onChange: (value: PropertyCountry) => void;
}

export const CountryToggle: React.FC<CountryToggleProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center space-x-2 bg-white p-1 rounded-lg shadow-lg border border-slate-200">
      <button
        onClick={() => onChange('ZW')}
                  className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            value === 'ZW'
              ? 'text-emerald-700'
              : 'text-slate-600 hover:text-slate-900'
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
            className="absolute inset-0 bg-emerald-100 rounded-md"
            initial={false}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </button>

      <button
        onClick={() => onChange('SA')}
        className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          value === 'SA'
            ? 'text-emerald-700'
            : 'text-slate-600 hover:text-slate-900'
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
            className="absolute inset-0 bg-emerald-100 rounded-md"
            initial={false}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </button>

      <div className="w-px h-6 bg-slate-200" />

      <button
        onClick={() => onChange(value === 'ZW' ? 'SA' : 'ZW')}
        className="p-2 rounded-md text-slate-600 hover:text-slate-900"
        title="Switch Country"
      >
        <Globe className="w-4 h-4" />
      </button>
    </div>
  );
}; 