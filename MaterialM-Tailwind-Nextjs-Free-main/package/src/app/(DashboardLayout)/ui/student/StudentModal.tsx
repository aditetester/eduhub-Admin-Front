"use client";
import React, { useState } from "react";
import { Modal, Spinner } from "flowbite-react";

interface StudentModalProps {
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  isModalOpen: boolean;
}

const StudentModal = ({ onClose, onSubmit, isModalOpen }: StudentModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        Add New Student
      </Modal.Header>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Student Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-darkgray dark:border-darkborder dark:text-white"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-darkgray dark:border-darkborder dark:text-white"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-darkgray dark:border-darkborder dark:text-white"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

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
              {isSubmitting ? <Spinner size="sm" /> : null}
              {isSubmitting ? 'Creating...' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default StudentModal;