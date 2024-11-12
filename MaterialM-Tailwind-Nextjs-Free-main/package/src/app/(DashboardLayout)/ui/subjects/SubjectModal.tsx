"use client";
import { useState, useEffect, useRef } from "react";
import { Modal, Button, Label, TextInput, Select, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import toast from 'react-hot-toast';

interface Subject {
  _id?: string;
  name: string;
  standard: string;
  standardName?: string;
  imageUrl?: string;
  price: number;
}

interface Standard {
  _id: string;
  grade: string;
  boardName: string;
  board: string;
}

interface SubjectModalProps {
  isEdit: boolean;
  subjectData: {
    _id?: string;
    name?: string;
    standard?: string;
    standardId?: string;
    imageUrl?: string;
    price?: number;
  } | null;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  isModalOpen: boolean;
  standards: Standard[];
}

const SubjectModal = ({ 
  isEdit, 
  subjectData, 
  onClose, 
  onSubmit, 
  isModalOpen,
  standards 
}: SubjectModalProps) => {
  const [selectedStandard, setSelectedStandard] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (subjectData) {
    console.log('Subject Data:', subjectData); // Debug log
    setSubjectName(subjectData.name || '');
    // Make sure we're using the correct standard ID
    setSelectedStandard(subjectData.standard || '');
    setPrice(subjectData.price?.toString() || '');
    setImagePreview(subjectData.imageUrl || null);
  } else {
    // Reset form when not editing
    setSubjectName('');
    setSelectedStandard('');
    setPrice('');
    setImagePreview(null);
  }
}, [subjectData]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);

  try {
    // Validate required fields
    if (!subjectName.trim()) {
      throw new Error('Subject name is required');
    }
    if (!selectedStandard) {
      throw new Error('Standard is required');
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      throw new Error('Valid price is required');
    }

    const formData = new FormData();
    formData.append('name', subjectName.trim());
    formData.append('standardId', selectedStandard);
    formData.append('price', price);
    
    // If editing, append the subject ID
    if (isEdit && subjectData?._id) {
      formData.append('id', subjectData._id);
    }
    
    const imageFile = fileInputRef.current?.files?.[0];
    if (imageFile) {
      formData.append('image', imageFile);
    }

    await onSubmit(formData);
    handleClose();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleClose = () => {
    setSubjectName('');
    setSelectedStandard('');
    setImagePreview(null);
    setPrice('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      show={isModalOpen}
      onClose={onClose}
    >
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
        {isEdit ? 'Edit Subject' : 'Create New Subject'}
      </Modal.Header>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Standard
            </label>
            <select
              name="standardId"
              defaultValue={subjectData?.standardId || ''}
              className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-darkgray dark:border-darkborder dark:text-white"
              required
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
            >
              <option value="">Select a standard</option>
              {standards.map((standard) => (
                <option key={standard._id} value={standard._id}>
                  {standard.grade} - {standard.boardName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Subject Name
            </label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-darkgray dark:border-darkborder dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-darkgray dark:border-darkborder dark:text-white"
              required
              min="0"
              step="any"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Subject Image
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error('Image size should be less than 5MB');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImagePreview(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              ref={fileInputRef}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-4">
              {imagePreview ? (
                <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="object-contain w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <Icon icon="mdi:close" className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div 
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-gray-400"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icon icon="solar:upload-broken" className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Click to upload image</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-4 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md"
            >
              {isEdit ? 'Update Subject' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default SubjectModal;