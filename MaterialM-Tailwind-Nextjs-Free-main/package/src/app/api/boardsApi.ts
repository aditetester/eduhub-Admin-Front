interface Board {
  _id: string;
  name: string;
  image?: string;  // This is the relative path
  imageUrl?: string;  // This will be the full URL
  totalStandards?: number;
  totalSubjects?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const addImageUrl = (board: any) => {
  if (!board) return board;
  return {
    ...board,
    imageUrl: board.image ? `${API_URL}/${board.image}` : null
  };
};

const boardsApi = {
  getBoards: async (): Promise<ApiResponse<Board[]>> => {
    try {
      const response = await fetch(`${API_URL}/admin/boards`, {
        headers: {
          'Accept': 'application/json',
        },
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
      console.error('Error fetching boards:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch boards' 
      };
    }
  },

  createBoard: async (formData: FormData): Promise<ApiResponse<Board>> => {
    try {
      const response = await fetch(`${API_URL}/admin/boards`, {
        method: 'POST',
        body: formData,
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
      console.error('Create board error:', error);
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create board' 
      };
    }
  },

  updateBoard: async (id: string, formData: FormData): Promise<ApiResponse<Board>> => {
    try {
      const response = await fetch(`${API_URL}/admin/boards/${id}`, {
        method: 'PATCH',
        body: formData,
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
      console.error('Update board error:', error);
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update board' 
      };
    }
  },


  deleteBoard: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_URL}/admin/boards/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete board');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete board error:', error);
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete board' 
      };
    }
  }
};

export default boardsApi;