"use client";
import React, { useState, useRef, useEffect } from "react";
import { Modal, TextInput, Button, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";

interface BoardModalProps {
  isEdit: boolean;
  boardData?: {
    id?: string;
    name?: string;
    imageUrl?: string;
  };
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  isModalOpen: boolean;
}

const BoardModal = ({ isEdit, boardData, onClose, onSubmit, isModalOpen }: BoardModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isModalOpen && boardData?.imageUrl) {
      setImagePreview(boardData.imageUrl);
    } else {
      setImagePreview(null);
    }
  }, [isModalOpen, boardData]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={isModalOpen} onClose={onClose}>
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
        {isEdit ? 'Edit Board' : 'Add New Board'}
      </Modal.Header>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Board Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Board Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={boardData?.name || ''}
              required
              className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-darkgray dark:border-darkborder dark:text-white"
              disabled={isSubmitting}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Board Image
            </label>
            <div 
              onClick={handleImageClick}
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors duration-200"
            >
              <div className="space-y-1 text-center">
                <input
                  type="file"
                  name="image"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative h-32 w-32 mx-auto">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Icon 
                      icon="solar:upload-minimalistic-broken" 
                      className="h-12 w-12 text-gray-400"
                    />
                    <p className="text-sm text-gray-500">
                      Click to upload image
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md flex items-center gap-2"
            >
              {isSubmitting && <Spinner size="sm" />}
              {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Board' : 'Create Board')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BoardModal;