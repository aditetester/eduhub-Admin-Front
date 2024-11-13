"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Label, TextInput, Select, Textarea, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import boardsApi from '@/app/api/boardsApi';
import standardsApi from '@/app/api/standardApi';
import subjectsApi from '@/app/api/subjectApi';
import { resourcesApi } from '@/app/api/resourceApi';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  pdfFile?: File | null;
  thumbnailFile?: File | null;
  thumbnailPreview?: string;
  fileUrl?: string;
}

interface Board {
  _id: string;
  name: string;
}

interface Standard {
  _id: string;
  grade: string;
}

interface Subject {
  _id: string;
  name: string;
}

const EditResourcePage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const resourceId = params.id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [type, setType] = useState<'PDF' | 'VIDEO'>('PDF');
  
  const [resource, setResource] = useState<ResourceItem>({
    id: '',
    title: '',
    description: '',
  });

  const [boards, setBoards] = useState<Board[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [selectedStandardId, setSelectedStandardId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const validatePdfFile = (file: File): boolean => {
    if (file.type !== 'application/pdf') {
      toast.error('Please select a valid PDF file');
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return false;
    }

    return true;
  };

  const validateThumbnail = (file: File): boolean => {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, or GIF)');
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return false;
    }

    return true;
  };

  const validateYouTubeUrl = (url: string): boolean => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!pattern.test(url)) {
      toast.error('Please enter a valid YouTube URL');
      return false;
    }
    return true;
  };

  const getThumbnailUrl = (path: string) => {
    if (!path) return '';
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_URL}/${cleanPath}`;
  };

  const fetchBoards = async () => {
    try {
      const response = await boardsApi.getBoards();
      if (response.success) {
        setBoards(response.data);
      } else {
        toast.error('Failed to fetch boards');
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
      toast.error('Failed to fetch boards');
    }
  };

  const fetchStandards = async (boardId: string) => {
    try {
      const response = await standardsApi.getStandards(boardId);
      if (response.success) {
        setStandards(response.data);
      } else {
        toast.error('Failed to fetch standards');
      }
    } catch (error) {
      console.error('Error fetching standards:', error);
      toast.error('Failed to fetch standards');
    }
  };

  const fetchSubjects = async (standardId: string) => {
    try {
      const response = await subjectsApi.getSubjects(standardId);
      if (response.success) {
        setSubjects(response.data);
      } else {
        toast.error('Failed to fetch subjects');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    }
  };

  const handleBoardChange = async (boardId: string) => {
    try {
      console.log('Changing board to:', boardId);
      setSelectedBoardId(boardId);
      setSelectedStandardId('');
      setSelectedSubjectId('');
      setStandards([]);
      setSubjects([]);
      
      if (boardId) {
        await fetchStandards(boardId);
      }
    } catch (error) {
      console.error('Error in handleBoardChange:', error);
      toast.error('Failed to update board selection');
    }
  };

  const handleStandardChange = async (standardId: string) => {
    try {
      console.log('Changing standard to:', standardId);
      setSelectedStandardId(standardId);
      setSelectedSubjectId('');
      setSubjects([]);
      
      if (standardId) {
        await fetchSubjects(standardId);
      }
    } catch (error) {
      console.error('Error in handleStandardChange:', error);
      toast.error('Failed to update standard selection');
    }
  };

  const fetchResourceData = async () => {
    if (!resourceId) {
      toast.error('Resource ID is missing');
      router.push('/ui/resources');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching resource:', resourceId);
      
      // Fetch resource data
      const response = await resourcesApi.getResourceById(resourceId);
      console.log('Resource response:', response);

      if (response.success && response.data) {
        const resourceData = response.data;
        
        // Update resource basic info
        setResource({
          id: resourceData._id,
          title: resourceData.name || '',
          description: resourceData.description || '',
          videoUrl: resourceData.videoUrl || '',
          thumbnailPreview: resourceData.thumbnailUrl || '',
          fileUrl: resourceData.fileUrl || ''
        });
        
        setType(resourceData.type || 'PDF');

        // First fetch all boards
        await fetchBoards();

        // Then set board and fetch standards if boardId exists
        if (resourceData.boardId) {
          console.log('Setting board:', resourceData.boardId);
          setSelectedBoardId(resourceData.boardId);
          await fetchStandards(resourceData.boardId);
        }
        
        // Then set standard and fetch subjects if standardId exists
        if (resourceData.standardId) {
          console.log('Setting standard:', resourceData.standardId);
          setSelectedStandardId(resourceData.standardId);
          await fetchSubjects(resourceData.standardId);
        }
        
        // Finally set subject if subjectId exists
        if (resourceData.subjectId) {
          console.log('Setting subject:', resourceData.subjectId);
          setSelectedSubjectId(resourceData.subjectId);
        }

        console.log('Resource data loaded successfully');
      } else {
        throw new Error(response.error || 'Failed to fetch resource');
      }
    } catch (error) {
      console.error('Error fetching resource:', error);
      toast.error('Failed to fetch resource data');
      router.push('/ui/resources');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResourceData();
  }, [resourceId]);

  useEffect(() => {
    return () => {
      // Cleanup thumbnail preview URL when component unmounts
      if (resource.thumbnailPreview && resource.thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(resource.thumbnailPreview);
      }
    };
  }, [resource.thumbnailPreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!selectedBoardId || !selectedStandardId || !selectedSubjectId) {
        toast.error("Please select board, standard and subject");
        return;
      }

      // Validate YouTube URL if type is VIDEO
      if (type === 'VIDEO' && resource.videoUrl && !validateYouTubeUrl(resource.videoUrl)) {
        return;
      }

      const formData = new FormData();
      
      // Add basic resource information
      formData.append('name', resource.title);
      formData.append('description', resource.description);
      formData.append('type', type);

      // Add board, standard, and subject IDs
      formData.append('boardId', selectedBoardId);
      formData.append('standardId', selectedStandardId);
      formData.append('subjectId', selectedSubjectId);

      // Add files based on resource type
      if (type === 'PDF' && resource.pdfFile) {
        formData.append('file', resource.pdfFile);
      } else if (type === 'VIDEO' && resource.videoUrl) {
        formData.append('videoUrl', resource.videoUrl);
      }

      // Add thumbnail if changed
      if (resource.thumbnailFile) {
        formData.append('thumbnail', resource.thumbnailFile);
      }

      console.log('Updating resource with:', {
        name: resource.title,
        description: resource.description,
        type,
        boardId: selectedBoardId,
        standardId: selectedStandardId,
        subjectId: selectedSubjectId,
        hasNewPdf: !!resource.pdfFile,
        hasNewThumbnail: !!resource.thumbnailFile,
        videoUrl: resource.videoUrl
      });

      const response = await resourcesApi.updateResource(resourceId, formData);

      if (response.success) {
        toast.success('Resource updated successfully');
        router.push('/ui/resources');
      } else {
        throw new Error(response.error || 'Failed to update resource');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-md bg-white dark:bg-darkgray p-6">
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-xl font-semibold text-dark dark:text-white">
          Edit Resource
        </h5>
        <Button color="gray" onClick={() => router.push('/ui/resources')}>
          <Icon icon="solar:arrow-left-outline" className="mr-2" />
          Back to Resources
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="board">Board</Label>
            <Select
              id="board"
              value={selectedBoardId}
              onChange={(e) => handleBoardChange(e.target.value)}
              required
            >
              <option value="">Select Board</option>
              {boards.map((board) => (
                <option key={board._id} value={board._id}>{board.name}</option>
              ))}
            </Select>
          </div>
          
          <div>
            <Label htmlFor="standard">Standard</Label>
            <Select
              id="standard"
              value={selectedStandardId}
              onChange={(e) => handleStandardChange(e.target.value)}
              required
              disabled={!selectedBoardId}
            >
              <option value="">Select Standard</option>
              {standards.map((standard) => (
                <option key={standard._id} value={standard._id}>{standard.grade}</option>
              ))}
            </Select>
          </div>
          
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Select
              id="subject"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              required
              disabled={!selectedStandardId}
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label>Resource Type</Label>
          <div className="flex gap-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="pdf"
                value="PDF"
                checked={type === 'PDF'}
                disabled
                className="mr-2"
              />
              <Label htmlFor="pdf">PDF Document</Label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="video"
                value="VIDEO"
                checked={type === 'VIDEO'}
                disabled
                className="mr-2"
              />
              <Label htmlFor="video">YouTube Video</Label>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <TextInput
              id="title"
              value={resource.title}
              onChange={(e) => setResource({ ...resource, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={resource.description}
              onChange={(e) => setResource({ ...resource, description: e.target.value })}
              required
            />
          </div>

          {type === 'PDF' ? (
            <div>
              <Label htmlFor="pdf">PDF File</Label>
              {resource.fileUrl && (
                <p className="text-sm text-gray-500 mb-2">
                  Current file: {resource.fileUrl.split('/').pop()}
                </p>
              )}
              <input
                type="file"
                id="pdf"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && validatePdfFile(file)) {
                    setResource({ ...resource, pdfFile: file });
                  }
                  e.target.value = '';
                }}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="video">YouTube URL</Label>
              <TextInput
                id="video"
                value={resource.videoUrl || ''}
                onChange={(e) => {
                  const url = e.target.value;
                  if (!url || validateYouTubeUrl(url)) {
                    setResource({ ...resource, videoUrl: url });
                  }
                }}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="thumbnail">Thumbnail</Label>
            {resource.thumbnailPreview && (
              <div className="mb-2">
                <img
                  src={getThumbnailUrl(resource.thumbnailPreview)}
                  alt="Current thumbnail"
                  className="h-20 w-20 object-cover rounded"
                />
              </div>
            )}
            <input
              type="file"
              id="thumbnail"
              accept="image/jpeg,image/png,image/gif"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && validateThumbnail(file)) {
                  setResource({ 
                    ...resource, 
                    thumbnailFile: file,
                    thumbnailPreview: URL.createObjectURL(file)
                  });
                }
                e.target.value = '';
              }}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button 
            color="gray" 
            onClick={() => router.push('/ui/resources')}
            type="button"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-primary"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Updating...
              </>
            ) : (
              'Update Resource'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditResourcePage;