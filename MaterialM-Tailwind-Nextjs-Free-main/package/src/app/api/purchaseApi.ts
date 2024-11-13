// First, create a new file for API endpoints
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const purchaseApi = {
  getUserPurchases: async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/purchases/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      throw new Error('Failed to fetch purchases');
    }
  },

  updatePurchaseStatus: async (purchaseId: string, status: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/purchases/${purchaseId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      return await response.json();
    } catch (error) {
      throw new Error('Failed to update status');
    }
  }
}; 