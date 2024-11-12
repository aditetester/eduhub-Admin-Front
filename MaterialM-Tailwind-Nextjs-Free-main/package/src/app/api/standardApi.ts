interface Standard {
  _id: string;
  grade: string;
  board: string;
  boardName?: string;
  image?: string;
  imageUrl?: string;
  totalSubjects: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper function to add full URL to image paths
const addImageUrl = (standard: any) => {
  if (!standard) return standard;
  return {
    ...standard,
    imageUrl: standard.image ? `${API_URL}/${standard.image}` : null
  };
};

const standardsApi = {
  // Get standards by board ID
  getStandards: async (boardId: string): Promise<ApiResponse<Standard[]>> => {
    try {
      if (!boardId) {
        throw new Error('Board ID is required');
      }

      const response = await fetch(`${API_URL}/admin/boards/${boardId}/standards`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        ...data,
        data: data.data?.map(addImageUrl)
      };
    } catch (error) {
      console.error('Error fetching standards:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch standards'
      };
    }
  },

  // Create new standard
createStandard: async (boardId: string, formData: FormData): Promise<ApiResponse<Standard>> => {
    try {
      // Log FormData contents
      Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(key, value);
      });

      const response = await fetch(`${API_URL}/admin/boards/${boardId}/standards`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      
      // Log the response
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        ...data,
        data: addImageUrl(data.data)
      };
    } catch (error) {
      console.error('Error creating standard:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create standard'
      };
    }
},

updateStandard: async (id: string, formData: FormData): Promise<ApiResponse<Standard>> => {
    try {
      // Validate required fields
      const grade = formData.get('grade');
      const price = formData.get('price');
      const boardId = formData.get('boardId');

      if (!grade || !price || !boardId) {
        throw new Error('Grade, price, and board ID are required');
      }

      const response = await fetch(`${API_URL}/admin/standards/${id}`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        ...data,
        data: addImageUrl(data.data)
      };
    } catch (error) {
      console.error('Error updating standard:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update standard'
      };
    }
},

  // Delete standard
  deleteStandard: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_URL}/admin/standards/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete standard');
      }

      return {
        success: true,
        message: 'Standard deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting standard:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete standard'
      };
    }
  },

  // Get single standard
  getStandard: async (id: string): Promise<ApiResponse<Standard>> => {
    try {
      const response = await fetch(`${API_URL}/admin/standards/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        ...data,
        data: addImageUrl(data.data)
      };
    } catch (error) {
      console.error('Error fetching standard:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch standard'
      };
    }
  }
};

export default standardsApi;