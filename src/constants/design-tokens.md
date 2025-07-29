# Mukamba FinTech Design Tokens

## Colors

- **Primary**: Vibrant red shades
  - 50: #fef2f2
  - 100: #fee2e2
  - 200: #fecaca
  - 300: #fca5a5
  - 400: #f87171
  - 500: #ef4444 (Main brand red)
  - 600: #dc2626
  - 700: #b91c1c
  - 800: #991b1b
  - 900: #7f1d1d
- **Success**: #10b981, #059669
- **Warning**: #f59e0b, #d97706
- **Gradient**: from #ef4444, via #dc2626, to #b91c1c

## Typography

- **Font Family**
  - Sans: Inter, system-ui, sans-serif
  - Display: Cal Sans, Inter, system-ui, sans-serif
- **Font Sizes**
  - display-2xl: 4.5rem / 1.1 line height / -0.02em letter spacing
  - display-xl: 3.75rem / 1.2 line height / -0.02em letter spacing
  - display-lg: 3rem / 1.2 line height / -0.02em letter spacing

## Effects & Animations

- **fade-in**: fadeIn 0.5s ease-in-out
- **slide-up**: slideUp 0.3s ease-out
- **scale-in**: scaleIn 0.2s ease-out
- **gradient**: gradient 8s ease infinite

## Glassmorphism
- `bg-white/60 dark:bg-slate-900/60` with `backdrop-blur-lg` and subtle border

## Accessibility
- All status badges and buttons use accessible contrast ratios
- Focus rings: `focus:ring-primary-500` and `focus:ring-offset-2`

## Responsive
- Mobile-first breakpoints via Tailwind's default system

---

For more, see `tailwind.config.js` and the sample design system component. 