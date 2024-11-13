const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: "student";
}

interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
}

export const studentApi = {
  // Get all students
  getAllStudents: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch students');
      }

      // Filter only students from the response
      const students = data.filter((user: any) => user.role === 'student');
      return { success: true, data: students };
    } catch (error) {
      console.error('Error fetching students:', error);
      return { success: false, error: 'Failed to fetch students' };
    }
  },

  // Get student by ID
  getStudentById: async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/user/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch student');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching student:', error);
      return { success: false, error: 'Failed to fetch student' };
    }
  },

  // Create new student
  createStudent: async (formData: FormData) => {
    try {
      const userData: CreateUserData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        role: 'student'
      };

      const response = await fetch(`${API_URL}/admin/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create student');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error creating student:', error);
      return { success: false, error: 'Failed to create student' };
    }
  },

  // Update student
  updateStudent: async (id: string, formData: FormData) => {
    try {
      const updateData: UpdateUserData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string
      };

      // Only include password if it's provided
      const password = formData.get('password') as string;
      if (password) {
        updateData.password = password;
      }

      const response = await fetch(`${API_URL}/admin/user/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update student');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error updating student:', error);
      return { success: false, error: 'Failed to update student' };
    }
  },

  // Delete student
  deleteStudent: async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/user/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete student');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error deleting student:', error);
      return { success: false, error: 'Failed to delete student' };
    }
  }
}; 