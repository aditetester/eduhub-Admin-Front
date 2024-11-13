"use client";
import { useState, useEffect } from 'react';
import StudentModal from './StudentModal';
import { Dropdown, Table, Spinner } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import { studentApi } from '@/app/api/studentApi';
import toast from 'react-hot-toast';

interface Student {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const StudentsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await studentApi.getAllStudents();
      if (response.error) throw new Error(response.error);
      setStudents(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await studentApi.createStudent(formData);
      if (response.error) throw new Error(response.error);
      toast.success('Student created successfully');
      handleCloseModal();
      fetchStudents();
    } catch (error) {
      toast.error('Failed to create student');
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this student?')) {
        return;
      }

      const response = await studentApi.deleteStudent(id);
      if (response.error) throw new Error(response.error);

      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rounded-lg shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-xl font-semibold text-dark dark:text-white">
          Students Management
        </h5>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
        >
          <Icon icon="solar:add-circle-outline" className="text-xl" />
          Add New Student
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students..."
            className="w-full p-2.5 pl-10 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-darkgray dark:border-darkborder dark:text-white"
          />
          <Icon 
            icon="solar:search-outline" 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      <div className="overflow-visible">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="xl" />
          </div>
        ) : (
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Join Date</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell className="w-24">Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {filteredStudents.map((student) => (
                <Table.Row key={student._id} className="bg-white dark:border-darkborder dark:bg-darkgray">
                  <Table.Cell className="font-medium">{student.name}</Table.Cell>
                  <Table.Cell>{student.email}</Table.Cell>
                  <Table.Cell>{new Date(student.createdAt).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </Table.Cell>
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
                            onClick={() => handleDelete(student._id)}
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
              {filteredStudents.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center py-4">
                    No students found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-500">
          Showing {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
        </p>
      </div>

      <StudentModal 
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isModalOpen={isModalOpen}
      />
    </div>
  );
};

export default StudentsPage;