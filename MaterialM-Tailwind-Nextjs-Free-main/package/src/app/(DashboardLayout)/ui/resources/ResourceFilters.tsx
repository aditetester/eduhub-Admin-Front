"use client";
import { Select, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import boardsApi from '@/app/api/boardsApi';
import standardsApi from '@/app/api/standardApi';
import subjectsApi from '@/app/api/subjectApi';

interface ResourceFiltersProps {
  filters: {
    board: string;
    standard: string;
    subject: string;
    search: string;
  };
  onFilterChange: (filters: any) => void;
}

const ResourceFilters = ({ filters, onFilterChange }: ResourceFiltersProps) => {
  const [boards, setBoards] = useState([]);
  const [standards, setStandards] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchBoards();
  }, []);

  useEffect(() => {
    if (filters.board) {
      fetchStandards(filters.board);
    }
  }, [filters.board]);

  useEffect(() => {
    if (filters.standard) {
      fetchSubjects(filters.standard);
    }
  }, [filters.standard]);

  const fetchBoards = async () => {
    try {
      const response = await boardsApi.getBoards();
      if (response.success) {
        setBoards(response.data);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
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
    }
  };

  const handleChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset dependent fields
    if (key === 'board') {
      newFilters.standard = '';
      newFilters.subject = '';
    } else if (key === 'standard') {
      newFilters.subject = '';
    }
    
    onFilterChange(newFilters);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <Select
          value={filters.board}
          onChange={(e) => handleChange('board', e.target.value)}
        >
          <option value="">All Boards</option>
          {boards.map((board: any) => (
            <option key={board._id} value={board._id}>
              {board.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Select
          value={filters.standard}
          onChange={(e) => handleChange('standard', e.target.value)}
          disabled={!filters.board}
        >
          <option value="">All Standards</option>
          {standards.map((standard: any) => (
            <option key={standard._id} value={standard._id}>
              {standard.grade}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Select
          value={filters.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          disabled={!filters.standard}
        >
          <option value="">All Subjects</option>
          {subjects.map((subject: any) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <div className="relative">
          <TextInput
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search resources..."
            icon={() => (
              <Icon
                icon="solar:search-outline"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default ResourceFilters;