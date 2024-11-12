"use client";
import { Table } from "flowbite-react";
import { Icon } from "@iconify/react";
import { Resource } from '@/types/resource';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';

interface ResourcesTableProps {
  resources: Resource[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onView: (resource: Resource) => void;
  type: 'PDF' | 'VIDEO';
}

const ResourcesTable = ({ 
  resources, 
  isLoading, 
  onDelete, 
  onView, 
  type 
}: ResourcesTableProps) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const getThumbnailUrl = (thumbnailUrl: string) => {
    if (!thumbnailUrl) return '';
    const cleanPath = thumbnailUrl.startsWith('/') ? thumbnailUrl.slice(1) : thumbnailUrl;
    return `${API_URL}/${cleanPath}`;
  };

  const formatFileSize = (size: string | number | undefined) => {
    if (!size) return 'N/A';
    
    // Add console.log to see the incoming size value
    console.log('Raw size value:', size);
    
    // Convert string to number if needed
    const bytes = typeof size === 'string' ? parseFloat(size) : size;
    console.log('Converted bytes:', bytes);
    
    // Handle invalid numbers
    if (isNaN(bytes) || bytes === 0) return 'N/A';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let fileSize = bytes;

    // Calculate appropriate unit
    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }

    // If size is less than 1 MB, show in KB with 2 decimal places
    if (unitIndex < 2) {
      // Convert to KB if in bytes
      if (unitIndex === 0) {
        fileSize = fileSize / 1024;
      }
      return `${fileSize.toFixed(2)} KB`;
    }

    // For MB and GB, show 2 decimal places
    return `${fileSize.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatDuration = (duration: string) => {
    if (!duration) return 'N/A';
    // Add your duration formatting logic here
    return duration;
  };

  useEffect(() => {
    console.log('ResourcesTable rendered with:', {
      resourceCount: resources.length,
      resources,
      type
    });
  }, [resources, type]);

  useEffect(() => {
    console.log('Resources in table:', resources);
  }, [resources]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-52"></div>
          <div className="h-4 bg-gray-200 rounded w-72"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-8">
        <Icon icon="solar:empty-file-outline" className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No resources found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new resource.
        </p>
        <div className="mt-6">
          <Link
            href="/ui/resources/create"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            <Icon icon="solar:add-circle-outline" className="mr-2" />
            New Resource
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell className="p-4">Thumbnail</Table.HeadCell>
          <Table.HeadCell>Title</Table.HeadCell>
          <Table.HeadCell>Board</Table.HeadCell>
          <Table.HeadCell>Standard</Table.HeadCell>
          <Table.HeadCell>Subject</Table.HeadCell>
          {type === 'PDF' && <Table.HeadCell>Size</Table.HeadCell>}
          {type === 'VIDEO' && <Table.HeadCell>Duration</Table.HeadCell>}
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {resources.map((resource) => (
            <Table.Row key={resource._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell className="p-4 w-24">
                {resource.thumbnailUrl && (
                  <div className="relative w-16 h-16">
                    <Image
                      src={getThumbnailUrl(resource.thumbnailUrl)}
                      alt={resource.name}
                      fill
                      className="object-cover rounded-lg"
                      onError={(e: any) => {
                        e.target.src = '/placeholder-image.jpg'; // Add a placeholder image
                        console.error('Failed to load image:', resource.thumbnailUrl);
                      }}
                    />
                  </div>
                )}
              </Table.Cell>
              <Table.Cell className="font-medium">
                <div className="max-w-xs">
                  <p className="truncate" title={resource.name}>{resource.name}</p>
                  
                </div>
              </Table.Cell>
              <Table.Cell>{resource.board}</Table.Cell>
              <Table.Cell>{resource.standard}</Table.Cell>
              <Table.Cell>{resource.subject}</Table.Cell>
              {type === 'PDF' && (
                <Table.Cell>
                  {formatFileSize(resource.size)}
                </Table.Cell>
              )}
              {type === 'VIDEO' && (
                <Table.Cell>{formatDuration(resource.duration || '')}</Table.Cell>
              )}
              <Table.Cell>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView(resource)}
                    className="p-2 hover:bg-blue-50 rounded-full text-blue-600 transition-colors duration-200"
                    title="View Resource"
                  >
                    <Icon icon="solar:eye-outline" className="h-5 w-5" />
                  </button>
                  <Link
                    href={`/ui/resources/edit/${resource._id}`}
                    className="p-2 hover:bg-blue-50 rounded-full text-blue-600 transition-colors duration-200"
                    title="Edit Resource"
                  >
                    <Icon icon="solar:pen-new-square-broken" className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => onDelete(resource._id)}
                    className="p-2 hover:bg-red-50 rounded-full text-red-600 transition-colors duration-200"
                    title="Delete Resource"
                  >
                    <Icon icon="solar:trash-bin-trash-broken" className="h-5 w-5" />
                  </button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default ResourcesTable;