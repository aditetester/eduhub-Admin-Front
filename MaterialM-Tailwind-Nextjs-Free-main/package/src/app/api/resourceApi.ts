import { ApiResponse, Resource } from '@/types/resource';

const API_URL = 'http://localhost:3000/admin'; // Base API URL

export const resourcesApi = {
getResources: async (boardId?: string, standardId?: string, subjectId?: string) => {
  try {
    const params = new URLSearchParams();
    if (boardId) params.append('boardId', boardId);
    if (standardId) params.append('standardId', standardId);
    if (subjectId) params.append('subjectId', subjectId);

    const url = `${API_URL}/resources${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('Fetching from URL:', url);

    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw API response:', data);

    if (!data || !data.data) {
      console.error('Invalid response structure:', data);
      return {
        success: false,
        error: 'Invalid response format'
      };
    }

    return {
      success: true,
      data: Array.isArray(data.data) ? data.data : []
    };
  } catch (error) {
    console.error('Get resources error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch resources'
    };
  }
},

  createResource: async (formData: FormData): Promise<ApiResponse<Resource>> => {
    try {
      const subjectId = formData.get('subject_id');
      
      if (!subjectId) {
        throw new Error('Subject ID is required');
      }

      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await fetch(`${API_URL}/${subjectId}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Create resource error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create resource'
      };
    }
  },

   updateResource: async (id: string, formData: FormData): Promise<ApiResponse<Resource>> => {
    if (!id) {
      return {
        success: false,
        error: 'Resource ID is required'
      };
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error updating resource:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update resource'
      };
    }
  },


getResourceById: async (id: string) => {
    try {
      console.log('Fetching resource with ID:', id);
      const response = await fetch(`${API_URL}/resources/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any auth headers if needed
        },
        credentials: 'include', // if using cookies
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Resource data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching resource:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch resource'
      };
    }
  },

  deleteResource: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete resource'
      };
    }
  },
};