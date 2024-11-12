"use client";
import { useState, useEffect } from 'react';
import { Table, Spinner, Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import standardsApi from '@/app/api/standardApi';
import boardsApi from '@/app/api/boardsApi';
import toast from 'react-hot-toast';
import StandardModal from './StandardModal';

interface Standard {
  _id: string;
  grade: string;
  board: {
    _id: string;
    name: string;
  } | string;
  boardName?: string;
  imageUrl?: string;
  totalSubjects: number;
  price: number;
}

interface Board {
  _id: string;
  name: string;
}

const StandardsPage = () => {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState<Standard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const boardsResponse = await boardsApi.getBoards();
      if (boardsResponse.success && boardsResponse.data) {
        setBoards(boardsResponse.data);
        await fetchAllStandards(boardsResponse.data);
      } else {
        toast.error('Failed to fetch boards');
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load initial data');
    }
  };

  const fetchAllStandards = async (boardsList: Board[]) => {
    setIsLoading(true);
    try {
      const allStandards: Standard[] = [];
      
      for (const board of boardsList) {
        const response = await standardsApi.getStandards(board._id);
        if (response.success && response.data) {
          const standardsWithBoard = response.data.map(standard => ({
            ...standard,
            boardName: board.name,
            price: standard.price || 0,
            totalSubjects: standard.totalSubjects || 0
          }));
          allStandards.push(...standardsWithBoard);
        }
      }
      
      setStandards(allStandards);
    } catch (error) {
      console.error('Error fetching standards:', error);
      toast.error('Failed to fetch standards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      let response;
      
      if (editingStandard?._id) {
        // Update existing standard
        response = await standardsApi.updateStandard(editingStandard._id, formData);
      } else {
        // Create new standard
        const boardId = formData.get('board') as string;
        response = await standardsApi.createStandard(boardId, formData);
      }

      if (response.success) {
        toast.success(editingStandard 
          ? 'Standard updated successfully' 
          : 'Standard created successfully'
        );
        handleCloseModal();
        await fetchAllStandards(boards);
      } else {
        throw new Error(response.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save standard');
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this standard?')) {
      try {
        const response = await standardsApi.deleteStandard(id);
        if (response.success) {
          toast.success('Standard deleted successfully');
          await fetchAllStandards(boards);
        } else {
          toast.error(response.error || 'Failed to delete standard');
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete standard');
      }
    }
  };

  const handleOpenModal = (standard?: Standard) => {
    setEditingStandard(standard || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingStandard(null);
    setIsModalOpen(false);
  };

  const filteredStandards = standards.filter(standard =>
    standard.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof standard.board === 'object' && 
      standard.board.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="rounded-lg shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-xl font-semibold text-dark dark:text-white">
          Standards Management
        </h5>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
        >
          <Icon icon="solar:add-circle-outline" className="text-xl" />
          Add New Standard
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search standards..."
            className="w-full p-2.5 pl-10 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-darkgray dark:border-darkborder dark:text-white"
          />
          <Icon
            icon="solar:search-outline"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-visible">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="xl" />
          </div>
        ) : (
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="p-4">Image</Table.HeadCell>
              <Table.HeadCell>Grade</Table.HeadCell>
              <Table.HeadCell>Board</Table.HeadCell>
              <Table.HeadCell>Total Subjects</Table.HeadCell>
              <Table.HeadCell>Price</Table.HeadCell>
              <Table.HeadCell className="w-24">Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {filteredStandards.map((standard) => (
                <Table.Row key={standard._id} className="bg-white dark:border-darkborder dark:bg-darkgray">
                  <Table.Cell className="p-4 w-24">
                    {standard.imageUrl ? (
                      <div className="relative h-16 w-16">
                        <img
                          src={standard.imageUrl}
                          alt={standard.grade}
                          className="object-cover rounded-lg w-full h-full"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon icon="solar:image-broken" className="text-gray-400 text-xl" />
                      </div>
                    )}
                  </Table.Cell>
                  <Table.Cell className="font-medium">{standard.grade}</Table.Cell>
                  <Table.Cell>
                    {typeof standard.board === 'object' ? standard.board.name : standard.boardName}
                  </Table.Cell>
                  <Table.Cell>{standard.totalSubjects}</Table.Cell>
                  <Table.Cell>₹{standard.price}</Table.Cell>
                  <Table.Cell>
                    <div className="relative flex justify-center">
                      <Dropdown
                        label=""
                        dismissOnClick={true}
                        renderTrigger={() => (
                          <button className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-darkgray">
                            <HiOutlineDotsVertical className="h-5 w-5" />
                          </button>
                        )}
                        className="!absolute z-50"
                      >
                        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden">
                          <Dropdown.Item
                            onClick={() => handleOpenModal(standard)}
                            className="hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <div className="flex items-center gap-2 px-4 py-2">
                              <Icon icon="solar:pen-new-square-broken" />
                              <span>Edit</span>
                            </div>
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => handleDelete(standard._id)}
                            className="hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <div className="flex items-center gap-2 px-4 py-2 text-red-500">
                              <Icon icon="solar:trash-bin-trash-broken" />
                              <span>Delete</span>
                            </div>
                          </Dropdown.Item>
                        </div>
                      </Dropdown>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
              {filteredStandards.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={6} className="text-center py-4">
                    No standards found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-500">
          Showing {filteredStandards.length} {filteredStandards.length === 1 ? 'standard' : 'standards'}
        </p>
      </div>

      {/* Modal */}
      <StandardModal
        isEdit={!!editingStandard}
        standardData={editingStandard}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isModalOpen={isModalOpen}
      />
    </div>
  );
};

export default StandardsPage;