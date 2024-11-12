"use client";
import { useState, useEffect } from 'react';
import { Table, Spinner, Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import subjectsApi from '@/app/api/subjectApi';
import standardsApi from '@/app/api/standardApi';
import boardsApi from '@/app/api/boardsApi';
import toast from 'react-hot-toast';
import SubjectModal from './SubjectModal';

interface Subject {
  _id: string;
  name: string;
  standard: string;
  standardName?: string;
  boardName?: string;
  imageUrl?: string;
  price: number;
}

interface Standard {
  _id: string;
  grade: string;
  boardName: string;
  board: string;
  image?: string;
  imageUrl?: string;
  totalSubjects: number;
  createdAt?: string;
  updatedAt?: string;
}

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // First get all boards
        const boardsResponse = await boardsApi.getBoards();
        if (!boardsResponse.success || !boardsResponse.data) {
          throw new Error('Failed to fetch boards');
        }

        // Then get standards for each board
        const allStandards = [];
        for (const board of boardsResponse.data) {
          const standardsResponse = await standardsApi.getStandards(board._id);
          if (standardsResponse.success && standardsResponse.data) {
            const standardsWithBoard = standardsResponse.data.map(standard => ({
              ...standard,
              boardName: board.name,
              board: board._id
            }));
            allStandards.push(...standardsWithBoard);
          }
        }
        
        setStandards(allStandards);
        
        // Now fetch subjects for each standard
        const allSubjects = [];
        for (const standard of allStandards) {
          const subjectsResponse = await subjectsApi.getSubjects(standard._id);
          if (subjectsResponse.success && subjectsResponse.data) {
            const subjectsWithDetails = subjectsResponse.data.map((subject: Subject) => ({
              ...subject,
              standardName: standard.grade,
              boardName: standard.boardName,
              standard: standard._id
            }));
            allSubjects.push(...subjectsWithDetails);
          }
        }
        setSubjects(allSubjects);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

const handleSubmit = async (formData: FormData) => {
  try {
    let response;
    if (editingSubject?._id) {
      // For editing, we need to ensure we're sending the correct standard ID
      formData.append('id', editingSubject._id);
      response = await subjectsApi.updateSubject(editingSubject._id, formData);
    } else {
      // For creating new subject
      const standardId = formData.get('standardId') as string;
      response = await subjectsApi.createSubject(standardId, formData);
    }

    if (response.success) {
      toast.success(editingSubject ? 'Subject updated successfully' : 'Subject created successfully');
      handleCloseModal();
      refreshData();
    } else {
      toast.error(response.error || 'Operation failed');
    }
  } catch (error) {
    console.error('Error saving subject:', error);
    toast.error('Failed to save subject');
  }
};

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const allSubjects = [];
      for (const standard of standards) {
        const response = await subjectsApi.getSubjects(standard._id);
        if (response.success && response.data) {
          const subjectsWithDetails = response.data.map(subject => ({
            ...subject,
            standardName: standard.grade,
            boardName: standard.boardName
          }));
          allSubjects.push(...subjectsWithDetails);
        }
      }
      setSubjects(allSubjects);
    } catch (error) {
      toast.error('Failed to refresh subjects');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        const response = await subjectsApi.deleteSubject(id);
        if (response.success) {
          toast.success('Subject deleted successfully');
          refreshData();
        } else {
          toast.error(response.error || 'Failed to delete subject');
        }
      } catch (error) {
        toast.error('Failed to delete subject');
      }
    }
  };

  const handleCloseModal = () => {
    setEditingSubject(null);
    setIsModalOpen(false);
  };

  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.standardName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.boardName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rounded-lg shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-xl font-semibold text-dark dark:text-white">
          Subjects Management
        </h5>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
        >
          <Icon icon="solar:add-circle-outline" className="text-xl" />
          Add New Subject
        </button>
      </div>

      {/* Search Section */}
      <div className="mb-4">
        <div className="relative">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search subjects..."
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
          <div className="flex justify-center items-center h-64">
            <Spinner size="xl" />
          </div>
        ) : (
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="p-4">Image</Table.HeadCell>
              <Table.HeadCell>Subject Name</Table.HeadCell>
              <Table.HeadCell>Standard</Table.HeadCell>
              <Table.HeadCell>Board</Table.HeadCell>
              <Table.HeadCell>Price</Table.HeadCell>
              <Table.HeadCell className="w-24">Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {filteredSubjects.map((subject) => (
                <Table.Row key={subject._id} className="bg-white dark:border-darkborder dark:bg-darkgray">
                  <Table.Cell className="p-4 w-24">
                    {subject.imageUrl ? (
                      <div className="relative h-16 w-16">
                        <img
                          src={subject.imageUrl}
                          alt={subject.name}
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
                  <Table.Cell className="font-medium">{subject.name}</Table.Cell>
                  <Table.Cell>{subject.standardName}</Table.Cell>
                  <Table.Cell>{subject.boardName}</Table.Cell>
                  <Table.Cell>₹{subject.price}</Table.Cell>
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
          onClick={() => {
            setEditingSubject(subject);
            setIsModalOpen(true);
          }}
          className="hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <div className="flex items-center gap-2 px-4 py-2">
            <Icon icon="solar:pen-new-square-broken" />
            <span>Edit</span>
          </div>
        </Dropdown.Item>
        <Dropdown.Item 
          onClick={() => handleDelete(subject._id)}
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
              {filteredSubjects.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={6} className="text-center py-4">
                    No subjects found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-500">
          Showing {filteredSubjects.length} {filteredSubjects.length === 1 ? 'subject' : 'subjects'}
        </p>
      </div>

      {/* Modal */}
      <SubjectModal
        isEdit={!!editingSubject}
        subjectData={{
          ...editingSubject,
          standardId: editingSubject?.standard
        }}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isModalOpen={isModalOpen}
        standards={standards}
      />
    </div>
  );
};

export default SubjectsPage;