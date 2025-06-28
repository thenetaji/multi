import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "685e713e30d7310366d0b78f", 
  requiresAuth: true // Ensure authentication is required for all operations
});
