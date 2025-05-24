import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useFetch, useDelete } from '../../hooks/useFetch';
import { Blog } from '../../types';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const BlogList: React.FC = () => {
  const navigate = useNavigate();
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  
  const { data: blogs, isLoading, error } = useFetch<Blog[]>(
    ['blogs'], 
    '/api/blogs/'
  );
  
  const { mutate: deleteBlog, isLoading: isDeleting } = useDelete(
    '/api/public/blogs',
    ['blogs'],
    {
      onSuccess: () => {
        toast.success('Blog deleted successfully');
        setBlogToDelete(null);
      },
      onError: (error) => {
        toast.error(`Error deleting blog: ${error.message}`);
      },
    }
  );
  
  const handleDelete = () => {
    if (blogToDelete) {
      deleteBlog(blogToDelete.id);
    }
  };
  
  const columns = [
    {
      key: 'id',
      header: 'ID',
      className: 'w-16',
    },
    {
      key: 'title',
      header: 'Title',
      render: (blog: Blog) => (
        <div>
          <p className="font-medium text-gray-900">{blog.title}</p>
          <p className="text-sm text-gray-500 truncate">{blog.subheading}</p>
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      className: 'w-32',
    },
    {
      key: 'estimated_read_time',
      header: 'Read Time',
      render: (blog: Blog) => `${blog.estimated_read_time} min`,
      className: 'w-24',
    },
    {
      key: 'created_at',
      header: 'Created At',
      render: (blog: Blog) => new Date(blog.created_at).toLocaleDateString(),
      className: 'w-32',
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-24',
      render: (blog: Blog) => (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/blogs/${blog.id}/edit`);
            }}
          >
            <Edit3 size={16} />
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setBlogToDelete(blog);
            }}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];
  
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Error Loading Blogs</h3>
          <p className="mt-1 text-sm text-gray-500">{error.message}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <Button 
          variant="primary" 
          leftIcon={<Plus size={16} />}
          onClick={() => navigate('/blogs/new')}
        >
          New Blog
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          data={blogs || []}
          columns={columns}
          keyExtractor={(blog) => `blog-${blog.id}`}
          isLoading={isLoading}
          onRowClick={(blog) => navigate(`/blogs/${blog.id}`)}
        />
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!blogToDelete}
        onClose={() => setBlogToDelete(null)}
        title="Delete Blog"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this blog? This action cannot be undone.
          </p>
          {blogToDelete && (
            <p className="font-medium text-gray-900">"{blogToDelete.title}"</p>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setBlogToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BlogList;