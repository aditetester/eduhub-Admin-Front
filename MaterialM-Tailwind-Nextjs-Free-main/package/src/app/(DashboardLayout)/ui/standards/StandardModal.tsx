"use client";
import { useState, useEffect, useRef } from "react";
import { Modal, Button, Label, TextInput, Select, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import boardsApi from '@/app/api/boardsApi';
import toast from 'react-hot-toast';

interface Board {
  _id: string;
  name: string;
}

interface Standard {
  _id: string;
  grade: string;
  board: string | Board;
  price: number;
  imageUrl?: string;
}

interface StandardModalProps {
  isEdit: boolean;
  standardData?: Standard;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  isModalOpen: boolean;
}

const StandardModal = ({ isEdit, standardData, onClose, onSubmit, isModalOpen }: StandardModalProps) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [standardName, setStandardName] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await boardsApi.getBoards();
        if (response.success && response.data) {
          console.log('Loaded boards:', response.data);
          setBoards(response.data);
        }
      } catch (err) {
        console.error('Error fetching boards:', err);
        toast.error('Failed to load boards');
      }
    };
    fetchBoards();
  }, []);

  useEffect(() => {
    if (standardData && isEdit) {
      console.log('Loading standard data:', standardData);
      setStandardName(standardData.grade || '');
      
      // Handle board ID based on whether it's a string or object
      const boardId = typeof standardData.board === 'string' 
        ? standardData.board 
        : standardData.board._id;
      
      console.log('Setting board ID:', boardId);
      setSelectedBoard(boardId);
      
      setImagePreview(standardData.imageUrl || null);
      setPrice(standardData.price?.toString() || '');
    } else {
      // Reset form for new standard
      setStandardName('');
      setSelectedBoard('');
      setImagePreview(null);
      setPrice('');
    }
  }, [standardData, isEdit]);

  const validateForm = () => {
    if (!standardName.trim()) {
      throw new Error('Grade is required');
    }
    if (!selectedBoard) {
      throw new Error('Board is required');
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      throw new Error('Valid price is required');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      validateForm();

      const formData = new FormData();
      
      if (isEdit && standardData?._id) {
        formData.append('_id', standardData._id);
      }
      
      formData.append('grade', standardName.trim());
      formData.append('board', selectedBoard);
      formData.append('price', price);

      console.log('Submitting form data:', {
        id: isEdit ? standardData?._id : undefined,
        grade: standardName.trim(),
        board: selectedBoard,
        price: price
      });

      const imageFile = fileInputRef.current?.files?.[0];
      if (imageFile) {
        if (imageFile.size > 5 * 1024 * 1024) {
          throw new Error('Image size should be less than 5MB');
        }
        formData.append('image', imageFile);
      }

      await onSubmit(formData);
      toast.success(isEdit ? 'Standard updated successfully' : 'Standard created successfully');
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  return (
    <Modal show={isModalOpen} onClose={onClose} size="md">
      <Modal.Header>
        {isEdit ? 'Edit Standard' : 'Add New Standard'}
      </Modal.Header>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <Modal.Body>
          <div className="space-y-6">
            {/* Board Selection */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="board" className="required">Board</Label>
              </div>
              <Select
                id="board"
                required
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className={!selectedBoard ? 'border-red-500' : ''}
              >
                <option value="">Select a board</option>
                {boards.map((board) => (
                  <option key={board._id} value={board._id}>
                    {board.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Grade Input */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="grade" className="required">Grade</Label>
              </div>
              <TextInput
                id="grade"
                required
                value={standardName}
                onChange={(e) => setStandardName(e.target.value)}
                placeholder="Enter grade (e.g., 1st, 2nd)"
                className={!standardName ? 'border-red-500' : ''}
              />
            </div>

            {/* Price Input */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="price" className="required">Price</Label>
              </div>
              <TextInput
                id="price"
                required
                type="number"
                min="0"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                className={!price ? 'border-red-500' : ''}
              />
            </div>

            {/* Image Upload */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="image">Standard Image</Label>
              </div>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
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
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-end gap-2 w-full">
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedBoard || !standardName || !price}
              color="primary"
            >
              {isSubmitting ? (
                <><Spinner size="sm" className="mr-2" />{isEdit ? 'Updating...' : 'Creating...'}</>
              ) : (
                <>{isEdit ? 'Update' : 'Create'} Standard</>
              )}
            </Button>
            <Button color="gray" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default StandardModal;