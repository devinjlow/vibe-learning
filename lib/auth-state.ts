// Shared auth state that can be used across components
export const authState = {
  isAuthenticated: false,
  isLoading: true,
  listeners: new Set<(isAuthenticated: boolean) => void>(),
  
  // Method to update the auth state
  updateAuthState(isAuthenticated: boolean) {
    this.isAuthenticated = isAuthenticated
    this.isLoading = false
    // Notify all listeners
    this.listeners.forEach(listener => listener(isAuthenticated))
  },

  // Method to set loading state
  setLoading(isLoading: boolean) {
    this.isLoading = isLoading
  }
} 