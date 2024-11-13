const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Purchase {
  _id: string;
  user: string;
  purchaseType: string;
  standard: string;
  amount: number;
  paymentStatus?: string;
  validUntil: string;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
}

interface Standard {
  _id: string;
  name: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const dashboardApi = {
  getStats: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, error: 'Failed to fetch stats' };
    }
  },

  getBoardStats: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/dashboard/board-stats`, {
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching board stats:', error);
      return { success: false, error: 'Failed to fetch board stats' };
    }
  },

  getPopularResources: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/dashboard/popular-resources`, {
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching popular resources:', error);
      return { success: false, error: 'Failed to fetch popular resources' };
    }
  },

  getRecentPurchases: async (): Promise<ApiResponse<Purchase[]>> => {
    try {
      const url = `${API_URL}/admin/purchases`;
      console.log('Fetching purchases from:', url);
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        const text = await response.text();
        console.error('Response text:', text);
        return { success: false, error: `HTTP error! status: ${response.status}` };
      }

      const data = await response.json();
      console.log('Purchase data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching recent purchases:', error);
      return { success: false, error: error.message };
    }
  },

  getSubjectRevenue: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/dashboard/subject-revenue`, {
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching subject revenue:', error);
      return { success: false, error: 'Failed to fetch subject revenue' };
    }
  },

  getUsers: async (userIds: string[]): Promise<ApiResponse<User[]>> => {
    if (!userIds.length) {
      console.log('No user IDs provided');
      return { success: true, data: [] };
    }

    try {
      const url = `${API_URL}/admin/users`;
      console.log('Fetching users from:', url, 'with IDs:', userIds);
      
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        const text = await response.text();
        console.error('Response text:', text);
        return { success: false, error: `HTTP error! status: ${response.status}` };
      }

      const data = await response.json();
      console.log('User data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: error.message };
    }
  },

  getStandards: async (standardIds: string[]): Promise<ApiResponse<Standard[]>> => {
    if (!standardIds.length) {
      console.log('No standard IDs provided');
      return { success: true, data: [] };
    }

    try {
      const url = `${API_URL}/admin/standards`;
      console.log('Fetching standards from:', url, 'with IDs:', standardIds);
      
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ standardIds }),
      });

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        const text = await response.text();
        console.error('Response text:', text);
        return { success: false, error: `HTTP error! status: ${response.status}` };
      }

      const data = await response.json();
      console.log('Standard data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching standards:', error);
      return { success: false, error: error.message };
    }
  },
};