import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely opens a resume URL in a new tab.
 * Ensures the URL is correctly formatted and uses noopener/noreferrer for security.
 */
export function openResume(url: string) {
  if (!url) return;
  
  // Ensure the URL has a protocol
  let finalUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    finalUrl = `https://${url}`;
  }

  // Use window.open with security flags
  window.open(finalUrl, '_blank', 'noopener,noreferrer');
}
