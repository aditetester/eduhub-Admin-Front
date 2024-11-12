"use client";
import { useState, useEffect } from 'react';
import BoardModal from './BoardModal';
import { Dropdown, Table, Spinner } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import boardsApi from '@/app/api/boardsApi';
import toast from 'react-hot-toast';

interface Board {
  id?: string;
  _id: string;
  name: string;
  imageUrl?: string;
  totalStandards?: number;
  totalSubjects?: number;
}

const PopularProducts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | undefined>(undefined);
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    setIsLoading(true);
    try {
      const response = await boardsApi.getBoards();
      if (response.error) throw new Error(response.error);
      setBoards(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch boards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      if (editingBoard?._id) {
        const response = await boardsApi.updateBoard(editingBoard._id, formData);
        if (response.error) throw new Error(response.error);
        toast.success('Board updated successfully');
      } else {
        const response = await boardsApi.createBoard(formData);
        if (response.error) throw new Error(response.error);
        toast.success('Board created successfully');
      }
      
      handleCloseModal();
      fetchBoards();
    } catch (error) {
      toast.error(editingBoard ? 'Failed to update board' : 'Failed to create board');
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!id) {
        toast.error('Invalid board ID');
        return;
      }

      if (!window.confirm('Are you sure you want to delete this board?')) {
        return;
      }

      const response = await boardsApi.deleteBoard(id);
      if (response.error) {
        throw new Error(response.error);
      }

      toast.success('Board deleted successfully');
      fetchBoards();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete board');
    }
  };

  const handleOpenModal = (board?: Board) => {
    setEditingBoard(board);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingBoard(undefined);
    setIsModalOpen(false);
  };

  const filteredBoards = boards.filter(board => 
    board.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rounded-lg shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-xl font-semibold text-dark dark:text-white">
          Boards Management
        </h5>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
        >
          <Icon icon="solar:add-circle-outline" className="text-xl" />
          Add New Board
        </button>
      </div>

      {/* Search Section */}
      <div className="mb-4">
        <div className="relative">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search boards..."
            className="w-full p-2.5 pl-10 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-darkgray dark:border-darkborder dark:text-white"
          />
          <Icon 
            icon="solar:search-outline" 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-visible">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="xl" />
          </div>
        ) : (
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="p-4">Image</Table.HeadCell>
              <Table.HeadCell className="p-4">Board Name</Table.HeadCell>
              <Table.HeadCell>Total Standards</Table.HeadCell>
              <Table.HeadCell>Total Subjects</Table.HeadCell>
              <Table.HeadCell className="w-24">Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {filteredBoards.map((board) => (
                <Table.Row key={board._id} className="bg-white dark:border-darkborder dark:bg-darkgray">
                  <Table.Cell className="p-4 w-24">
  {board.imageUrl ? (
    <div className="relative h-16 w-16">
      <img
        src={board.imageUrl}
        alt={board.name}
        className="object-cover rounded-lg w-full h-full"
        onError={(e) => {
          e.currentTarget.src = '/placeholder-image.png'; // Add a placeholder image
          console.error('Image failed to load:', board.imageUrl);
        }}
      />
    </div>
  ) : (
    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
      <Icon icon="solar:image-broken" className="text-gray-400 text-xl" />
    </div>
  )}
</Table.Cell>
                  <Table.Cell className="p-4">
                    <p className="font-semibold text-dark dark:text-white">{board.name}</p>
                  </Table.Cell>
                  <Table.Cell>{board.totalStandards || 0}</Table.Cell>
                  <Table.Cell>{board.totalSubjects || 0}</Table.Cell>
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
                            onClick={() => handleOpenModal(board)}
                            className="hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <div className="flex items-center gap-2 px-4 py-2">
                              <Icon icon="solar:pen-new-square-broken" />
                              <span>Edit</span>
                            </div>
                          </Dropdown.Item>
                          <Dropdown.Item 
                            onClick={() => handleDelete(board._id)}
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
              {filteredBoards.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center py-4">
                    No boards found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-500">
          Showing {filteredBoards.length} {filteredBoards.length === 1 ? 'board' : 'boards'}
        </p>
      </div>

      {/* Modal */}
      <BoardModal 
        isEdit={!!editingBoard}
        boardData={{
          id: editingBoard?._id,
          name: editingBoard?.name,
          imageUrl: editingBoard?.imageUrl
        }}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isModalOpen={isModalOpen}
      />
    </div>
  );
};

export default PopularProducts;