import { Modal } from 'flowbite-react';
import Image from 'next/image';

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
}

interface ViewResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
}

const ViewResourceModal: React.FC<ViewResourceModalProps> = ({ 
  isOpen, 
  onClose, 
  resource 
}) => {
  if (!isOpen || !resource) return null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3000';

const getFileUrl = (fileUrl: string | undefined) => {
    if (!fileUrl) return '';
    
    console.log('getFileUrl - Input:', fileUrl);
    
    // Get just the filename
    const filename = fileUrl.split('/').pop();
    console.log('getFileUrl - Filename:', filename);
    
    const url = `${API_URL}/uploads/resources/${filename}`;
    console.log('getFileUrl - Final URL:', url);
    
    return url;
  };

  const getThumbnailUrl = (thumbnailUrl: string | undefined) => {
    if (!thumbnailUrl) return '';
    
    console.log('getThumbnailUrl - Input:', thumbnailUrl);
    
    // Get just the filename
    const filename = thumbnailUrl.split('/').pop();
    console.log('getThumbnailUrl - Filename:', filename);
    
    const url = `${API_URL}/uploads/thumbnails/${filename}`;
    console.log('getThumbnailUrl - Final URL:', url);
    
    return url;
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="7xl">
      <Modal.Header>
        {resource.name}
      </Modal.Header>
      <Modal.Body>
        <div className="flex h-[70vh]">
          {/* Left side - Resource viewer */}
          <div className="w-2/3 h-full bg-gray-100">
            {resource.type === 'PDF' ? (
              <iframe
                
                 src={`${getFileUrl(resource.fileUrl)}#toolbar=0`}
                className="w-full h-full"
                title={resource.name}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black">
                <iframe
                  src={resource.videoUrl}
                  className="w-full h-full"
                  title={resource.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Right side - Resource details */}
          <div className="w-1/3 p-4 overflow-y-auto">
            {resource.thumbnailUrl && (
              <div className="relative w-full h-48 mb-6">
                <Image
                  src={getThumbnailUrl(resource.thumbnailUrl)}
                  alt={resource.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Board</h3>
                <p className="mt-1">{resource.board}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Standard</h3>
                <p className="mt-1">{resource.standard}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                <p className="mt-1">{resource.subject}</p>
              </div>

              {resource.type === 'PDF' ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Size</h3>
                  <p className="mt-1">{resource.size}</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                  <p className="mt-1">{resource.duration}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-sm text-gray-600">{resource.description}</p>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ViewResourceModal;