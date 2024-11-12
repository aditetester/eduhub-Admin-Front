"use client";
import { useState, useEffect } from "react";
import { Modal, Button, Label, TextInput, Select, Textarea, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import boardsApi from '@/app/api/boardsApi';
import standardsApi from '@/app/api/standardApi';
import subjectsApi from '@/app/api/subjectApi';
import toast from 'react-hot-toast';
import { resourcesApi } from '@/app/api/resourceApi';

interface ResourceModalProps {
  isEdit: boolean;
  resourceData?: any;
  onClose: () => void;
  onResourceCreated?: () => void;
  isModalOpen: boolean;
  defaultType: 'PDF' | 'VIDEO';
}

const ResourceModal = ({ 
  isEdit, 
  resourceData, 
  onClose, 
  onResourceCreated,
  isModalOpen,
  defaultType 
}: ResourceModalProps) => {
  const [resources, setResources] = useState<any[]>([{ id: 1 }]);
  const [boards, setBoards] = useState([]);
  const [standards, setStandards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedStandard, setSelectedStandard] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<'PDF' | 'VIDEO'>(defaultType);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [selectedStandardId, setSelectedStandardId] = useState<string>('');

  const fetchBoards = async () => {
    try {
      const response = await boardsApi.getBoards();
      setBoards(response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
      toast.error('Failed to fetch boards');
    }
  };

  const fetchStandards = async (boardId: string) => {
    try {
      const response = await standardsApi.getStandards(boardId);
      setStandards(response.data);
    } catch (error) {
      console.error('Error fetching standards:', error);
      toast.error('Failed to fetch standards');
    }
  };

  const fetchSubjects = async (standardId: string) => {
    try {
      const response = await subjectsApi.getSubjectsByStandard(standardId);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    }
  };

  useEffect(() => {
    fetchBoards();
    if (isEdit && resourceData) {
      initializeEditData();
    }
  }, []);

  useEffect(() => {
    if (selectedBoard) {
      fetchStandards(selectedBoard);
      setSelectedStandard('');
      setSelectedSubject('');
    }
  }, [selectedBoard]);

  useEffect(() => {
    if (selectedStandard) {
      fetchSubjects(selectedStandard);
      setSelectedSubject('');
    }
  }, [selectedStandard]);

  const initializeEditData = () => {
    setSelectedBoard(resourceData.board);
    setSelectedStandard(resourceData.standard);
    setSelectedSubject(resourceData.subject);
    setType(resourceData.type);
    setResources([{
      id: 1,
      title: resourceData.name,
      description: resourceData.description,
      thumbnailPreview: resourceData.thumbnailUrl,
      fileUrl: resourceData.fileUrl || resourceData.videoUrl
    }]);
  };

  const handleAddMore = () => {
    setResources([...resources, { 
      id: resources.length + 1 
    }]);
  };

  const handleRemove = (id: number) => {
    if (resources.length > 1) {
      setResources(resources.filter(r => r.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!selectedBoardId || !selectedStandardId || !selectedSubject) {
        toast.error("Please select board, standard and subject");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      const resource = resources[0]; // Get the first resource

      // Append basic form fields
      formData.append('subject_id', selectedSubject);
      formData.append('board', selectedBoardId);
      formData.append('standard', selectedStandardId);
      formData.append('type', type);
      formData.append('name', resource.title || '');
      formData.append('description', resource.description || '');

      // Handle thumbnail
      if (resource.thumbnailFile instanceof File) {
        formData.append('thumbnail', resource.thumbnailFile);
      } else {
        toast.error('Thumbnail is required');
        setIsSubmitting(false);
        return;
      }

      // Handle PDF or Video URL based on type
      if (type === 'PDF') {
        if (!resource.pdfFile) {
          toast.error('PDF file is required');
          setIsSubmitting(false);
          return;
        }
        formData.append('file', resource.pdfFile);
      } else {
        if (!resource.videoUrl) {
          toast.error('Video URL is required');
          setIsSubmitting(false);
          return;
        }
        formData.append('videoUrl', resource.videoUrl);
      }

      const response = isEdit 
        ? await resourcesApi.updateResource(resourceData._id, formData)
        : await resourcesApi.createResource(formData);

      if (response.success) {
        toast.success(isEdit ? 'Resource updated successfully' : 'Resource created successfully');
        onClose();
        if (onResourceCreated) {
          onResourceCreated();
        }
      } else {
        throw new Error(response.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validImageTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPG, PNG, or GIF)');
        e.target.value = '';
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        e.target.value = '';
        return;
      }

      setResources(current => [{
        ...current[0],
        thumbnailFile: file
      }]);
    }
  };

  const handleBoardChange = async (boardId: string) => {
    setSelectedBoardId(boardId);
    if (boardId) {
      const response = await standardsApi.getStandards(boardId);
      if (response.success && response.data) {
        setStandards(response.data);
      }
    } else {
      setStandards([]);
    }
    setSelectedStandardId('');
    setSubjects([]);
  };

  const handleStandardChange = async (standardId: string) => {
    setSelectedStandardId(standardId);
    if (standardId) {
      const response = await subjectsApi.getSubjects(standardId);
      if (response.success && response.data) {
        setSubjects(response.data);
      }
    } else {
      setSubjects([]);
    }
  };

  return (
    <Modal show={isModalOpen} onClose={onClose} size="xl">
      <Modal.Header>
        {isEdit ? 'Edit Resource' : 'Add New Resources'}
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-6">
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
                  {boards.map((board: any) => (
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
                  {standards.map((standard: any) => (
                    <option key={standard._id} value={standard._id}>{standard.grade}</option>
                  ))}
                </Select>
              </div>
              
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select
                  id="subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  required
                  disabled={!selectedStandardId}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject: any) => (
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
                    onChange={(e) => setType(e.target.value as 'PDF' | 'VIDEO')}
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
                    onChange={(e) => setType(e.target.value as 'PDF' | 'VIDEO')}
                    className="mr-2"
                  />
                  <Label htmlFor="video">YouTube Video</Label>
                </div>
              </div>
            </div>

            {resources.map((resource, index) => (
              <div key={resource.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">Resource {index + 1}</h4>
                  {resources.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemove(resource.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Icon icon="solar:trash-bin-trash-broken" className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`title-${resource.id}`}>Title</Label>
                    <TextInput
                      id={`title-${resource.id}`}
                      value={resource.title || ''}
                      onChange={(e) => {
                        const newResources = [...resources];
                        newResources[index].title = e.target.value;
                        setResources(newResources);
                      }}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`description-${resource.id}`}>Description</Label>
                    <Textarea
                      id={`description-${resource.id}`}
                      value={resource.description || ''}
                      onChange={(e) => {
                        const newResources = [...resources];
                        newResources[index].description = e.target.value;
                        setResources(newResources);
                      }}
                      required
                    />
                  </div>

                  {type === 'PDF' ? (
                    <div>
                      <Label htmlFor={`file-${resource.id}`}>PDF File</Label>
                      <input
                        type="file"
                        id={`file-${resource.id}`}
                        accept=".pdf"
                        onChange={(e) => {
                          const newResources = [...resources];
                          newResources[index].pdfFile = e.target.files?.[0];
                          setResources(newResources);
                        }}
                        required={!isEdit}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor={`video-${resource.id}`}>YouTube URL</Label>
                      <TextInput
                        id={`video-${resource.id}`}
                        value={resource.videoUrl || ''}
                        onChange={(e) => {
                          const newResources = [...resources];
                          newResources[index].videoUrl = e.target.value;
                          setResources(newResources);
                        }}
                        required
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <Label htmlFor="thumbnail" value="Thumbnail" />
                    <input
                      id="thumbnail"
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleThumbnailChange}
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Accepted formats: JPG, PNG, GIF (max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {!isEdit && (
              <Button
                type="button"
                onClick={handleAddMore}
                color="gray"
                className="w-full"
              >
                <Icon icon="solar:add-circle-outline" className="mr-2" />
                Add More Resources
              </Button>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{isEdit ? 'Update' : 'Create'} Resource</>
            )}
          </Button>
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default ResourceModal;