// subjectApi.ts
interface Subject {
  _id: string;
  name: string;
  standard: string;
  standardName?: string;
  boardName?: string;
  image?: string;
  imageUrl?: string;
  price: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper function to add image URL
const addImageUrl = (subject: any) => {
  if (!subject) return subject;
  return {
    ...subject,
    imageUrl: subject.image ? `${API_URL}/${subject.image}` : null
  };
};

const subjectsApi = {
  getSubjects: async (standardId: string): Promise<ApiResponse<Subject[]>> => {
    try {
      const response = await fetch(`${API_URL}/admin/standards/${standardId}/subjects`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        ...data,
        data: data.data?.map(addImageUrl)
      };
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch subjects'
      };
    }
  },

  createSubject: async (standardId: string, formData: FormData): Promise<ApiResponse<Subject>> => {
    try {
      // Validate required fields
      const name = formData.get('name');
      const price = formData.get('price');

      if (!name || !price) {
        throw new Error('Subject name and price are required');
      }

      const response = await fetch(`${API_URL}/admin/standards/${standardId}/subjects`, {
        method: 'POST',
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
      console.error('Error creating subject:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create subject'
      };
    }
  },

  getSubjectsByStandard: async (standardId: string): Promise<ApiResponse<Subject[]>> => {
    try {
        const url = `${API_URL}/admin/standards/${standardId}/subjects`;
      console.log('Fetching subjects by standard:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Subjects response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching subjects by standard:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch subjects'
      };
    }
  },


 updateSubject: async (id: string, formData: FormData): Promise<ApiResponse<Subject>> => {
  try {
    const response = await fetch(`${API_URL}/admin/subjects/${id}`, {
      method: 'PATCH',
      // Don't set Content-Type header when sending FormData
      credentials: 'include',
      body: formData
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
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update subject'
    };
  }
  },

  deleteSubject: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_URL}/admin/subjects/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete subject');
      }

      return {
        success: true,
        message: 'Subject deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting subject:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete subject'
      };
    }
  }
};

export default subjectsApi;