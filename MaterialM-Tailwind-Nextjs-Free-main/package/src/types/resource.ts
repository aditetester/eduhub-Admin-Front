// Form data interface for creating/updating resources
export interface ResourceFormData {
  id?: string;
  name: string;
  description: string;
  type: 'PDF' | 'VIDEO';
  thumbnailFile?: File;
  thumbnailPreview?: string;
  pdfFile?: File;
  videoUrl?: string;
  duration?: string;
  fileUrl?: string;
  boardId: string;
  standardId: string;
  subjectId: string;
    size?: string | number;
}

// Resource interface representing the backend data structure
export interface Resource {
  _id: string;
  name: string;
  description: string;
  type: 'PDF' | 'VIDEO';
  board: string;
  standard: string;
  subject: string;
  fileUrl?: string;
  videoUrl?: string;
  thumbnailUrl: string;
  size?: string;
  duration?: string;
  createdAt: string;
  boardId: string;
  standardId: string;
  subjectId: string;
}

// API response wrapper interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Optional: You might want to add a type for the minimum required fields when creating a resource
export interface CreateResourcePayload {
  name: string;
  description: string;
  type: 'PDF' | 'VIDEO';
  boardId: string;
  standardId: string;
  subjectId: string;
  // One of these must be provided based on type
  pdfFile?: File;
  videoUrl?: string;
}