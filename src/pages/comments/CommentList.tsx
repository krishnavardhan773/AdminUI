import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ExternalLink, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useFetch, useDelete } from '../../hooks/useFetch';
import { Comment, Blog } from '../../types';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';

const CommentList: React.FC = () => {
  const navigate = useNavigate();
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const [blogFilter, setBlogFilter] = useState<string>('');
  
  const { data: blogs } = useFetch<Blog[]>(
    ['blogs'], 
    '/blogs/'
  );
  
  const { data: comments, isLoading, error } = useFetch<Comment[]>(
    ['comments', { blog: blogFilter }], 
    '/comments/',
    blogFilter ? { blog: blogFilter } : undefined
  );
  
  const { mutate: deleteComment, isLoading: isDeleting } = useDelete(
    '/comments',
    ['comments'],
    {
      onSuccess: () => {
        toast.success('Comment deleted successfully');
        setCommentToDelete(null);
      },
      onError: (error) => {
        toast.error(`Error deleting comment: ${error.message}`);
      },
    }
  );
  
  const handleDelete = () => {
    if (commentToDelete) {
      deleteComment(commentToDelete.id);
    }
  };
  
  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (comment: Comment) => (
        <div className="font-medium text-gray-900">{comment.name}</div>
      ),
    },
    {
      key: 'content',
      header: 'Comment',
      render: (comment: Comment) => (
        <div className="truncate max-w-md">{comment.content}</div>
      ),
    },
    {
      key: 'blog',
      header: 'Blog ID',
      render: (comment: Comment) => (
        <div className="flex items-center">
          <span className="mr-2">{comment.blog}</span>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/blogs/${comment.blog}`);
            }}
          >
            <ExternalLink size={14} />
          </Button>
        </div>
      ),
      className: 'w-32',
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (comment: Comment) => new Date(comment.created_at).toLocaleDateString(),
      className: 'w-32',
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-24',
      render: (comment: Comment) => (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setCommentToDelete(comment);
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
          <h3 className="text-lg font-medium text-gray-900">Error Loading Comments</h3>
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
  
  const blogOptions = [
    { value: '', label: 'All Blogs' },
    ...(blogs || []).map(blog => ({
      value: blog.id.toString(),
      label: `ID: ${blog.id} - ${blog.title}`,
    })),
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Comments</h1>
      </div>
      
      <Card>
        <Card.Header className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <Card.Title>All Comments</Card.Title>
          <div className="flex items-center">
            <Filter size={16} className="mr-2 text-gray-500" />
            <Select
              options={blogOptions}
              value={blogFilter}
              onChange={(e) => setBlogFilter(e.target.value)}
              className="w-full sm:w-60"
            />
          </div>
        </Card.Header>
        <Card.Content className="p-0">
          <Table
            data={comments || []}
            columns={columns}
            keyExtractor={(comment) => `comment-${comment.id}`}
            isLoading={isLoading}
            emptyMessage={blogFilter ? "No comments found for this blog" : "No comments found"}
          />
        </Card.Content>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        title="Delete Comment"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this comment? This action cannot be undone.
          </p>
          {commentToDelete && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="font-medium text-gray-900">From: {commentToDelete.name}</p>
              <p className="mt-1 text-gray-700">{commentToDelete.content}</p>
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setCommentToDelete(null)}
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

export default CommentList;