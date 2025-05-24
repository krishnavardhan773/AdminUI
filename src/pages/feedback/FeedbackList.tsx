import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ExternalLink, SortAsc, SortDesc, Calendar, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useFetch, useDelete } from '../../hooks/useFetch';
import { Feedback, Blog } from '../../types';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';

type SortField = 'rating' | 'submitted_at';
type SortOrder = 'asc' | 'desc';

const FeedbackList: React.FC = () => {
  const navigate = useNavigate();
  const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null);
  const [blogFilter, setBlogFilter] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('submitted_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  const { data: blogs } = useFetch<Blog[]>(
    ['blogs'], 
    '/blogs/'
  );
  
  const { data: feedback, isLoading, error } = useFetch<Feedback[]>(
    ['feedback', { blog: blogFilter }], 
    '/feedback/',
    blogFilter ? { blog: blogFilter } : undefined
  );
  
  const { mutate: deleteFeedback, isLoading: isDeleting } = useDelete(
    '/feedback',
    ['feedback'],
    {
      onSuccess: () => {
        toast.success('Feedback deleted successfully');
        setFeedbackToDelete(null);
      },
      onError: (error) => {
        toast.error(`Error deleting feedback: ${error.message}`);
      },
    }
  );
  
  const handleDelete = () => {
    if (feedbackToDelete) {
      deleteFeedback(feedbackToDelete.id);
    }
  };
  
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };
  
  const sortedFeedback = React.useMemo(() => {
    if (!feedback) return [];
    
    return [...feedback].sort((a, b) => {
      if (sortField === 'rating') {
        return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
      } else {
        return sortOrder === 'asc'
          ? new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
          : new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      }
    });
  }, [feedback, sortField, sortOrder]);
  
  const columns = [
    {
      key: 'email',
      header: 'User',
      render: (item: Feedback) => (
        <div className="font-medium text-gray-900">{item.email}</div>
      ),
    },
    {
      key: 'rating',
      header: () => (
        <button 
          className="flex items-center focus:outline-none" 
          onClick={() => toggleSort('rating')}
        >
          <span className="mr-1">Rating</span>
          {sortField === 'rating' && (
            sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
          )}
        </button>
      ),
      render: (item: Feedback) => (
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-4 h-4 ${
                star <= item.rating
                  ? 'text-accent-400 fill-accent-400'
                  : 'text-gray-300 fill-gray-300'
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
      ),
      className: 'w-32',
    },
    {
      key: 'message',
      header: 'Message',
      render: (item: Feedback) => (
        <div className="truncate max-w-md">{item.message}</div>
      ),
    },
    {
      key: 'blog',
      header: 'Blog ID',
      render: (item: Feedback) => (
        <div className="flex items-center">
          <span className="mr-2">{item.blog}</span>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/blogs/${item.blog}`);
            }}
          >
            <ExternalLink size={14} />
          </Button>
        </div>
      ),
      className: 'w-32',
    },
    {
      key: 'submitted_at',
      header: () => (
        <button 
          className="flex items-center focus:outline-none" 
          onClick={() => toggleSort('submitted_at')}
        >
          <span className="mr-1">Date</span>
          {sortField === 'submitted_at' && (
            sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
          )}
        </button>
      ),
      render: (item: Feedback) => new Date(item.submitted_at).toLocaleDateString(),
      className: 'w-32',
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-24',
      render: (item: Feedback) => (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setFeedbackToDelete(item);
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
          <h3 className="text-lg font-medium text-gray-900">Error Loading Feedback</h3>
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
        <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
      </div>
      
      <Card>
        <Card.Header className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <Card.Title>All Feedback</Card.Title>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant={sortField === 'rating' ? 'primary' : 'outline'}
                leftIcon={<Star size={14} />}
                onClick={() => toggleSort('rating')}
              >
                Rating {sortField === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button 
                size="sm" 
                variant={sortField === 'submitted_at' ? 'primary' : 'outline'}
                leftIcon={<Calendar size={14} />}
                onClick={() => toggleSort('submitted_at')}
              >
                Date {sortField === 'submitted_at' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
            </div>
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
            data={sortedFeedback}
            columns={columns}
            keyExtractor={(item) => `feedback-${item.id}`}
            isLoading={isLoading}
            emptyMessage={blogFilter ? "No feedback found for this blog" : "No feedback found"}
          />
        </Card.Content>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!feedbackToDelete}
        onClose={() => setFeedbackToDelete(null)}
        title="Delete Feedback"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this feedback? This action cannot be undone.
          </p>
          {feedbackToDelete && (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between">
                <p className="font-medium text-gray-900">From: {feedbackToDelete.email}</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${
                        star <= feedbackToDelete.rating
                          ? 'text-accent-400 fill-accent-400'
                          : 'text-gray-300 fill-gray-300'
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-gray-700">{feedbackToDelete.message}</p>
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setFeedbackToDelete(null)}
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

export default FeedbackList;