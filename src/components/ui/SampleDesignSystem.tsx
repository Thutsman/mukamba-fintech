'use client';

import * as React from 'react';
import { GradientButton } from './GradientButton';
import { AnimatedCard } from './AnimatedCard';
import { StatusBadge } from './StatusBadge';
import { ProgressRing } from './ProgressRing';
import { GlassCard } from './GlassCard';
import { Button } from './button';
import { Label } from './label';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { Separator } from './separator';
import { Toaster } from './sonner';

export function SampleDesignSystem() {
  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
      <h1 className="text-display-xl font-display font-bold text-primary-700 dark:text-primary-400">Mukamba FinTech Design System</h1>
      {/* shadcn/ui Button */}
      <section>
        <h2 className="text-lg font-bold mb-2">shadcn/ui Button</h2>
        <div className="flex gap-4 flex-wrap">
          <Button>Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>
      {/* shadcn/ui Label & Input */}
      <section>
        <h2 className="text-lg font-bold mb-2">shadcn/ui Label</h2>
        <Label htmlFor="demo-input">Demo Input</Label>
        <input id="demo-input" className="border rounded px-2 py-1 ml-2" placeholder="Type here..." />
      </section>
      {/* shadcn/ui Avatar */}
      <section>
        <h2 className="text-lg font-bold mb-2">shadcn/ui Avatar</h2>
        <div className="flex gap-4 items-center">
          <Avatar>
            <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
            <AvatarFallback>N</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
        </div>
      </section>
      {/* shadcn/ui Separator */}
      <section>
        <h2 className="text-lg font-bold mb-2">shadcn/ui Separator</h2>
        <div className="space-y-2">
          <div>Above</div>
          <Separator />
          <div>Below</div>
        </div>
      </section>
      {/* Custom Components */}
      <section>
        <h2 className="text-lg font-bold mb-2">Custom Components</h2>
        <div className="flex flex-wrap gap-6">
          <GradientButton>Primary Gradient Button</GradientButton>
          <GradientButton gradient="from-success-500 to-success-600">Success Gradient</GradientButton>
        </div>
        <div className="flex flex-wrap gap-6">
          <StatusBadge status="success">Success</StatusBadge>
          <StatusBadge status="warning">Warning</StatusBadge>
          <StatusBadge status="error">Error</StatusBadge>
          <StatusBadge status="info">Info</StatusBadge>
        </div>
        <div className="flex flex-wrap gap-6 items-center">
          <ProgressRing value={75} color="#10b981" />
          <ProgressRing value={40} color="#f59e0b" />
          <ProgressRing value={90} color="#ef4444" />
        </div>
        <div className="flex flex-wrap gap-6">
          <AnimatedCard>
            <h3 className="text-display-lg font-display mb-2">Animated Card</h3>
            <p className="text-base text-slate-700 dark:text-slate-200">This card animates on hover and tap.</p>
          </AnimatedCard>
          <GlassCard>
            <h3 className="text-display-lg font-display mb-2">GlassCard</h3>
            <p className="text-base text-slate-700 dark:text-slate-200">Modern glassmorphism effect with dark mode support.</p>
          </GlassCard>
        </div>
      </section>
      {/* Design Tokens */}
      <section>
        <h2 className="text-xl font-bold mb-2">Design Tokens</h2>
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <li className="bg-primary-500 text-white rounded p-2">Primary 500</li>
          <li className="bg-success-500 text-white rounded p-2">Success 500</li>
          <li className="bg-warning-500 text-white rounded p-2">Warning 500</li>
          <li className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white rounded p-2">Gradient</li>
        </ul>
        <div className="mt-4 font-display text-display-lg">Display Font Example</div>
        <div className="font-sans text-lg">Sans Font Example</div>
      </section>
      {/* Toaster (Sonner) */}
      <Toaster />
    </div>
  );
} 