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

interface ResourceItem {
  id: number;
  title: string;
  description: string;
  videoUrl?: string;
  duration?: string;
  pdfFile?: File | null;
  thumbnailFile?: File | null;
  thumbnailPreview?: string;
}

interface PDFResource extends ResourceItem {
  pdfFile: File | null;
}

interface VideoResource extends ResourceItem {
  videoUrl: string;
  duration: string;
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

const CreateResourcePage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<'PDF' | 'VIDEO'>('PDF');

  // Separate states for PDF and Video resources
  const [pdfResources, setPdfResources] = useState<PDFResource[]>([{
    id: 1,
    title: '',
    description: '',
    pdfFile: null,
    thumbnailFile: null,
    thumbnailPreview: '',
  }]);

  const [videoResources, setVideoResources] = useState<VideoResource[]>([{
    id: 1,
    title: '',
    description: '',
    videoUrl: '',
    duration: '',
    thumbnailFile: null,
    thumbnailPreview: '',
  }]);

  // Get current resources based on type
  const currentResources = type === 'PDF' ? pdfResources : videoResources;

    // Dropdown data states
  const [boards, setBoards] = useState<Board[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Selected values
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [selectedStandardId, setSelectedStandardId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  useEffect(() => {
    fetchBoards();
    return () => {
      // Cleanup thumbnail preview URLs when component unmounts
      [...pdfResources, ...videoResources].forEach(resource => {
        if (resource.thumbnailPreview?.startsWith('blob:')) {
          URL.revokeObjectURL(resource.thumbnailPreview);
        }
      });
    };
  }, []);

  const validateDuration = (duration: string): boolean => {
  // Only allow positive numbers
  if (!/^\d*$/.test(duration)) {
    return false;
  }
  return true;
};

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

  const fetchBoards = async () => {
    try {
      const response = await boardsApi.getBoards();
      if (response.success) {
        setBoards(response.data);
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
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    }
  };

    const handleTypeChange = (newType: 'PDF' | 'VIDEO') => {
    setType(newType);
  };

  const handleBoardChange = async (boardId: string) => {
    setSelectedBoardId(boardId);
    setSelectedStandardId('');
    setSelectedSubjectId('');
    setStandards([]);
    setSubjects([]);
    if (boardId) {
      await fetchStandards(boardId);
    }
  };

  const handleStandardChange = async (standardId: string) => {
    setSelectedStandardId(standardId);
    setSelectedSubjectId('');
    setSubjects([]);
    if (standardId) {
      await fetchSubjects(standardId);
    }
  };

  const handleAddMore = () => {
    const newId = currentResources.length + 1;
    if (type === 'PDF') {
      setPdfResources([...pdfResources, {
        id: newId,
        title: '',
        description: '',
        pdfFile: null,
        thumbnailFile: null,
        thumbnailPreview: '',
      }]);
    } else {
      setVideoResources([...videoResources, {
        id: newId,
        title: '',
        description: '',
        videoUrl: '',
        duration: '',
        thumbnailFile: null,
        thumbnailPreview: '',
      }]);
    }
  };

  const handleRemove = (id: number) => {
    if (currentResources.length > 1) {
      if (type === 'PDF') {
        setPdfResources(pdfResources.filter(r => {
          if (r.id === id && r.thumbnailPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(r.thumbnailPreview);
          }
          return r.id !== id;
        }));
      } else {
        setVideoResources(videoResources.filter(r => {
          if (r.id === id && r.thumbnailPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(r.thumbnailPreview);
          }
          return r.id !== id;
        }));
      }
    }
  };

  const handleResourceChange = (id: number, field: keyof ResourceItem, value: any) => {
    if (type === 'PDF') {
      setPdfResources(pdfResources.map(resource => {
        if (resource.id === id) {
          if (field === 'thumbnailFile' && value instanceof File) {
            if (resource.thumbnailPreview?.startsWith('blob:')) {
              URL.revokeObjectURL(resource.thumbnailPreview);
            }
            return {
              ...resource,
              [field]: value,
              thumbnailPreview: URL.createObjectURL(value)
            };
          }
          if (field === 'pdfFile' && value instanceof File) {
            return {
              ...resource,
              [field]: value
            };
          }
          return { ...resource, [field]: value };
        }
        return resource;
      }));
    } else {
      setVideoResources(videoResources.map(resource => {
        if (resource.id === id) {
          if (field === 'thumbnailFile' && value instanceof File) {
            if (resource.thumbnailPreview?.startsWith('blob:')) {
              URL.revokeObjectURL(resource.thumbnailPreview);
            }
            return {
              ...resource,
              [field]: value,
              thumbnailPreview: URL.createObjectURL(value)
            };
          }
             if (field === 'duration') {
          // Only allow numbers
          const numericValue = value.replace(/[^\d]/g, '');
          return { ...resource, duration: numericValue };
        }
          return { ...resource, [field]: value };
        }
        return resource;
      }));
    }
  };

const convertMinutesToMMSS = (minutes: number): string => {
  const mins = Math.floor(minutes);
  return `${mins.toString().padStart(2, '0')}:00`;
};

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!selectedBoardId || !selectedStandardId || !selectedSubjectId) {
        toast.error("Please select board, standard and subject");
        return;
      }

      const resourcesToSubmit = type === 'PDF' ? pdfResources : videoResources;
      
      const uploadPromises = resourcesToSubmit.map(async (resource) => {
        const formData = new FormData();
        
        // Common fields
        formData.append('subject_id', selectedSubjectId);
        formData.append('board', selectedBoardId);
        formData.append('standard', selectedStandardId);
        formData.append('type', type);
        formData.append('name', resource.title);
        formData.append('description', resource.description);

        // Type-specific fields
        if (type === 'PDF') {
          if (!(resource as PDFResource).pdfFile) {
            throw new Error('PDF file is required');
          }
          formData.append('file', (resource as PDFResource).pdfFile);
        } else {
          // Video specific validations
          const videoResource = resource as VideoResource;
          if (!videoResource.videoUrl) {
            throw new Error('Video URL is required');
          }
          if (!videoResource.duration) {
            throw new Error('Duration is required for video resources');
          }
         const durationNumber = parseInt(videoResource.duration);
  if (isNaN(durationNumber) || durationNumber <= 0) {
    throw new Error('Duration must be a positive number');
  }
  const durationMMSS = convertMinutesToMMSS(durationNumber);
  
  formData.append('videoUrl', videoResource.videoUrl);
  formData.append('duration', durationMMSS);  
}

        // Add thumbnail if present
        if (resource.thumbnailFile) {
          formData.append('thumbnail', resource.thumbnailFile);
        }

        return resourcesApi.createResource(formData);
      });

      const results = await Promise.all(uploadPromises);
      
      if (results.every(result => result.success)) {
        toast.success('Resources created successfully');
         router.push(`/ui/resources?type=${type.toUpperCase()}`);
      } else {
        throw new Error('Some resources failed to upload');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create resources');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg shadow-md bg-white dark:bg-darkgray p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-xl font-semibold text-dark dark:text-white">
          Create New Resource
        </h5>
        <Button color="gray" onClick={() => router.push('/ui/resources')}>
          <Icon icon="solar:arrow-left-outline" className="mr-2" />
          Back to Resources
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Board, Standard, Subject Selection */}
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

        {/* Resource Type Selection */}
        <div>
          <Label>Resource Type</Label>
          <div className="flex gap-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="pdf"
                value="PDF"
                checked={type === 'PDF'}
                onChange={() => handleTypeChange('PDF')}
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
                onChange={() => handleTypeChange('VIDEO')}
                className="mr-2"
              />
              <Label htmlFor="video">YouTube Video</Label>
            </div>
          </div>
        </div>

        {/* Resource Forms */}
        {currentResources.map((resource, index) => (
          <div key={resource.id} className="border rounded-lg p-4 space-y-4">
            {/* Resource Header */}
            <div className="flex justify-between items-center">
              <h6 className="text-lg font-medium">Resource #{index + 1}</h6>
              {currentResources.length > 1 && (
                <Button
                  color="gray"
                  size="sm"
                  onClick={() => handleRemove(resource.id)}
                  className="!p-2 hover:bg-red-50"
                >
                  <Icon icon="solar:trash-bin-trash-broken" className="w-5 h-5 text-red-600" />
                </Button>
              )}
            </div>

            {/* Title Input */}
            <div>
              <Label htmlFor={`title-${resource.id}`}>Title</Label>
              <TextInput
                id={`title-${resource.id}`}
                value={resource.title}
                onChange={(e) => handleResourceChange(resource.id, 'title', e.target.value)}
                required
              />
            </div>

            {/* Description Input */}
            <div>
              <Label htmlFor={`description-${resource.id}`}>Description</Label>
              <Textarea
                id={`description-${resource.id}`}
                value={resource.description}
                onChange={(e) => handleResourceChange(resource.id, 'description', e.target.value)}
                required
              />
            </div>

                        {/* PDF/Video Input */}
            {type === 'PDF' ? (
              <div>
                <Label htmlFor={`pdf-${resource.id}`}>PDF File</Label>
                {(resource as PDFResource).pdfFile && (
                  <p className="text-sm text-gray-500 mb-2">
                    Selected file: {(resource as PDFResource).pdfFile?.name}
                  </p>
                )}
                <input
                  type="file"
                  id={`pdf-${resource.id}`}
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && validatePdfFile(file)) {
                      handleResourceChange(resource.id, 'pdfFile', file);
                    }
                    e.target.value = ''; // Reset input
                  }}
                  required={!(resource as PDFResource).pdfFile}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor={`video-${resource.id}`}>YouTube URL</Label>
                  <TextInput
                    id={`video-${resource.id}`}
                    value={(resource as VideoResource).videoUrl || ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      if (!url || validateYouTubeUrl(url)) {
                        handleResourceChange(resource.id, 'videoUrl', url);
                      }
                    }}
                    required
                  />
                </div>
                
                <div>
  <Label htmlFor={`duration-${resource.id}`}>Duration (in minutes)</Label>
  <TextInput
    id={`duration-${resource.id}`}
    type="number"
    min="1"
    value={(resource as VideoResource).duration || ''}
    onChange={(e) => {
      handleResourceChange(resource.id, 'duration', e.target.value);
    }}
    placeholder="Enter duration in minutes (e.g., 45)"
    required
  />
  <p className="mt-1 text-xs text-gray-500">
    Enter the video duration in minutes (e.g., 45 for 45 minutes)
  </p>
</div>
              </>
            )}

            {/* Thumbnail Input */}
            <div>
              <Label htmlFor={`thumbnail-${resource.id}`}>Thumbnail</Label>
              {resource.thumbnailPreview && (
                <div className="mb-2">
                  <img
                    src={resource.thumbnailPreview}
                    alt="Thumbnail preview"
                    className="h-20 w-20 object-cover rounded"
                  />
                </div>
              )}
              <input
                type="file"
                id={`thumbnail-${resource.id}`}
                accept="image/jpeg,image/png,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && validateThumbnail(file)) {
                    handleResourceChange(resource.id, 'thumbnailFile', file);
                  }
                  e.target.value = ''; // Reset input
                }}
                required={!resource.thumbnailFile}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              />
            </div>
          </div>
        ))}

                {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            type="button"
            onClick={handleAddMore}
            color="gray"
            className="w-full"
          >
            <Icon icon="solar:add-circle-outline" className="mr-2" />
            Add More Resources
          </Button>

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
                  Creating...
                </>
              ) : (
                'Create Resource'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateResourcePage;