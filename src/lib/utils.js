import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * A utility function for making fetch requests with proper error handling
 * @param {string} url - The URL to fetch from
 * @param {Object} options - Fetch options (optional)
 * @returns {Promise<any>} - The parsed response data
 * @throws {Error} - If the request fails
 */
export async function fetchWithErrorHandling(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError') {
      // Network error or CORS issue
      throw new Error('Network error: Please check your connection');
    }
    throw error; // Re-throw other errors
  }
} 