// Fallback clsx implementation if the package is not available
function clsxFallback(...args: any[]): string {
  return args
    .filter(Boolean)
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'object' && arg !== null) {
        return Object.keys(arg)
          .filter(key => arg[key])
          .join(' ');
      }
      return '';
    })
    .join(' ');
}

// Fallback twMerge implementation
function twMergeFallback(classes: string): string {
  return classes
    .split(' ')
    .filter(Boolean)
    .join(' ');
}

let clsx: (...args: any[]) => string;
let twMerge: (classes: string) => string;

try {
  // Try to import clsx and tailwind-merge
  clsx = require('clsx').clsx || require('clsx').default || require('clsx');
  twMerge = require('tailwind-merge').twMerge;
} catch (error) {
  console.warn('clsx or tailwind-merge not found, using fallback implementations');
  clsx = clsxFallback;
  twMerge = twMergeFallback;
}

export function cn(...inputs: any[]): string {
  return twMerge(clsx(...inputs));
}
