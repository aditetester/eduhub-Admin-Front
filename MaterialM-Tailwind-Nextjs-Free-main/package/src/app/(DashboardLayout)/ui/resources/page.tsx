"use client";
import { useState, useEffect } from 'react';
import { Tabs, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import { resourcesApi } from '@/app/api/resourceApi';
import toast from 'react-hot-toast';
import ResourcesTable from './ResourcesTable';
import ResourceFilters from './ResourceFilters';
import Link from 'next/link';
import ViewResourceModal from './ViewResourceModal';
import { useRouter, useSearchParams } from 'next/navigation';

interface Resource {
  _id: string;
  name: string;
  description: string;
  type: 'PDF' | 'VIDEO';
  subject: string;
  board: string;
  standard: string;
  fileUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  size?: string;
  duration?: string;
  url: string;
}

const ResourcesPage = () => {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
 const typeParam = searchParams.get('type');
  const [activeTab, setActiveTab] = useState<'PDF' | 'VIDEO'>(
    typeParam === 'VIDEO' ? 'VIDEO' : 'PDF'
  );
  const [filters, setFilters] = useState({
    board: '',
    standard: '',
    subject: '',
    search: ''
  });
  const [viewResource, setViewResource] = useState<Resource | null>(null);
  useEffect(() => {
      console.log('Current type param:', typeParam);
    console.log('Current active tab:', activeTab);
    const type = searchParams.get('type');
    if (type === 'VIDEO' || type === 'PDF') {
      setActiveTab(type);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchResources();
  }, [activeTab, filters]);

  const handleTabChange = (tab: any) => {
    let newTab: 'PDF' | 'VIDEO';
    if (typeof tab === 'number') {
      newTab = tab === 0 ? 'PDF' : 'VIDEO';
    } else {
      newTab = tab as 'PDF' | 'VIDEO';
    }
    
    console.log('Changing tab to:', newTab);
    setActiveTab(newTab);
    
    const newUrl = `/ui/resources?type=${newTab}`;
    router.push(newUrl);
  };

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching resources with filters:', filters);
      console.log('Current activeTab:', activeTab);
      
      const response = await resourcesApi.getResources(
        filters.board || undefined,
        filters.standard || undefined,
        filters.subject || undefined
      );
      
      console.log('Raw API response:', response);
      
      if (response.success && Array.isArray(response.data)) {
        // Filter by search term if needed
        let filteredData = response.data;
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredData = filteredData.filter(resource => 
            resource.name.toLowerCase().includes(searchTerm) ||
            resource.description.toLowerCase().includes(searchTerm)
          );
        }
        
        // Filter by active tab type (case-insensitive comparison)
        filteredData = filteredData.filter(resource => {
          const resourceType = String(resource.type).toUpperCase();
          const currentTab = String(activeTab).toUpperCase();
          console.log('Comparing resource type:', resourceType, 'with activeTab:', currentTab);
          return resourceType === currentTab;
        });
        
        console.log('Filtered resources:', filteredData);
        setResources(filteredData);
      } else {
        console.error('Invalid response format:', response);
        setResources([]);
        toast.error('Failed to fetch resources');
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
      toast.error('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        const response = await resourcesApi.deleteResource(id);
        if (response.success) {
          toast.success('Resource deleted successfully');
          fetchResources();
        } else {
          toast.error(response.error || 'Failed to delete resource');
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete resource');
      }
    }
  };

  const handleView = (resource: Resource) => {
    setViewResource(resource);
  };

  return (
    <div className="rounded-lg shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-xl font-semibold text-dark dark:text-white">
          Resources Management
        </h5>
        <Link
          href={`/ui/resources/create`}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
        >
          <Icon icon="solar:add-circle-outline" className="text-xl" />
          Add New Resource
        </Link>
      </div>

      <ResourceFilters 
        filters={filters}
        onFilterChange={setFilters}
      />

      <Tabs
        className="mt-4"
        onActiveTabChange={handleTabChange}
      >
        <Tabs.Item 
          title="PDF Resources" 
          active={activeTab === 'PDF'}
        >
          <ResourcesTable
            resources={resources.filter(r => r.type.toUpperCase() === 'PDF')}
            isLoading={isLoading}
            onEdit={(resource) => router.push(`/ui/resources/edit/${resource._id}`)}
            onDelete={handleDelete}
            onView={handleView}
            type="PDF"
          />
        </Tabs.Item>
        <Tabs.Item 
          title="Video Resources" 
          active={activeTab === 'VIDEO'}
        >
          <ResourcesTable
            resources={resources.filter(r => r.type.toUpperCase() === 'VIDEO')}
            isLoading={isLoading}
            onEdit={(resource) => router.push(`/ui/resources/edit/${resource._id}`)}
            onDelete={handleDelete}
            onView={handleView}
            type="VIDEO"
          />
        </Tabs.Item>
      </Tabs>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Spinner size="xl" />
        </div>
      )}

      <ViewResourceModal
        resource={viewResource}
        isOpen={!!viewResource}
        onClose={() => setViewResource(null)}
      />
    </div>
  );
};

export default ResourcesPage;