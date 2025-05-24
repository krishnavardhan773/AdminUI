import React, { useState } from 'react';
import { Trash2, CheckCircle, XCircle, SortAsc, SortDesc, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useFetch, useDelete, useUpdate } from '../../hooks/useFetch';
import { Story } from '../../types';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

type SortOrder = 'asc' | 'desc';

const StoryList: React.FC = () => {
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
  const [storyToView, setStoryToView] = useState<Story | null>(null);
  const [publishFilter, setPublishFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  const { data: stories, isLoading, error } = useFetch<Story[]>(
    ['stories'], 
    '/stories/'
  );
  
  const { mutate: deleteStory, isLoading: isDeleting } = useDelete(
    '/stories',
    ['stories'],
    {
      onSuccess: () => {
        toast.success('Story deleted successfully');
        setStoryToDelete(null);
      },
      onError: (error) => {
        toast.error(`Error deleting story: ${error.message}`);
      },
    }
  );
  
  const { mutate: updateStory, isLoading: isUpdating } = useUpdate<Story>(
    '/stories',
    ['stories'],
    {
      onSuccess: () => {
        toast.success('Story updated successfully');
      },
      onError: (error) => {
        toast.error(`Error updating story: ${error.message}`);
      },
    }
  );
  
  const handleDelete = () => {
    if (storyToDelete) {
      deleteStory(storyToDelete.id);
    }
  };
  
  const handleTogglePublish = (story: Story) => {
    updateStory({
      id: story.id,
      data: { allow_publish: !story.allow_publish },
    });
  };
  
  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const filteredAndSortedStories = React.useMemo(() => {
    if (!stories) return [];
    
    let filtered = [...stories];
    
    if (publishFilter === 'approved') {
      filtered = filtered.filter(story => story.allow_publish);
    } else if (publishFilter === 'pending') {
      filtered = filtered.filter(story => !story.allow_publish);
    }
    
    return filtered.sort((a, b) => {
      return sortOrder === 'asc'
        ? new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
        : new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    });
  }, [stories, publishFilter, sortOrder]);
  
  const columns = [
    {
      key: 'story_text',
      header: 'Story Preview',
      render: (item: Story) => (
        <div 
          className="truncate max-w-md cursor-pointer text-primary-700 hover:underline"
          onClick={() => setStoryToView(item)}
        >
          {item.story_text.substring(0, 100)}...
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Story) => (
        <Badge
          variant={item.allow_publish ? 'success' : 'warning'}
        >
          {item.allow_publish ? 'Approved' : 'Pending'}
        </Badge>
      ),
      className: 'w-32',
    },
    {
      key: 'submitted_at',
      header: () => (
        <button 
          className="flex items-center focus:outline-none" 
          onClick={toggleSort}
        >
          <span className="mr-1">Submitted</span>
          {sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
        </button>
      ),
      render: (item: Story) => new Date(item.submitted_at).toLocaleDateString(),
      className: 'w-32',
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-32',
      render: (item: Story) => (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant={item.allow_publish ? 'ghost' : 'success'}
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePublish(item);
            }}
            isLoading={isUpdating}
          >
            {item.allow_publish ? <XCircle size={16} /> : <CheckCircle size={16} />}
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setStoryToDelete(item);
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
          <h3 className="text-lg font-medium text-gray-900">Error Loading Stories</h3>
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
  
  const publishOptions = [
    { value: 'all', label: 'All Stories' },
    { value: 'approved', label: 'Approved Stories' },
    { value: 'pending', label: 'Pending Approval' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Story Submissions</h1>
      </div>
      
      <Card>
        <Card.Header className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <Card.Title>User Story Submissions</Card.Title>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                leftIcon={<Calendar size={14} />}
                onClick={toggleSort}
              >
                Date {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
            <Select
              options={publishOptions}
              value={publishFilter}
              onChange={(e) => setPublishFilter(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>
        </Card.Header>
        <Card.Content className="p-0">
          <Table
            data={filteredAndSortedStories}
            columns={columns}
            keyExtractor={(item) => `story-${item.id}`}
            isLoading={isLoading}
            onRowClick={(item) => setStoryToView(item)}
          />
        </Card.Content>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!storyToDelete}
        onClose={() => setStoryToDelete(null)}
        title="Delete Story"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this story? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setStoryToDelete(null)}
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
      
      {/* View Story Modal */}
      <Modal
        isOpen={!!storyToView}
        onClose={() => setStoryToView(null)}
        title="Story Details"
        size="lg"
      >
        {storyToView && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Badge
                variant={storyToView.allow_publish ? 'success' : 'warning'}
                size="lg"
              >
                {storyToView.allow_publish ? 'Approved for Publishing' : 'Pending Approval'}
              </Badge>
              <span className="text-sm text-gray-500">
                Submitted: {new Date(storyToView.submitted_at).toLocaleString()}
              </span>
            </div>
            
            <div className="border-t border-b border-gray-200 py-4 my-4">
              <p className="whitespace-pre-line text-gray-800">{storyToView.story_text}</p>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStoryToView(null)}
              >
                Close
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  variant={storyToView.allow_publish ? 'outline' : 'success'}
                  leftIcon={<CheckCircle size={16} />}
                  onClick={() => {
                    if (!storyToView.allow_publish) {
                      handleTogglePublish(storyToView);
                      setStoryToView({
                        ...storyToView,
                        allow_publish: true,
                      });
                    }
                  }}
                  disabled={storyToView.allow_publish}
                >
                  Approve
                </Button>
                <Button
                  variant={!storyToView.allow_publish ? 'outline' : 'warning'}
                  leftIcon={<XCircle size={16} />}
                  onClick={() => {
                    if (storyToView.allow_publish) {
                      handleTogglePublish(storyToView);
                      setStoryToView({
                        ...storyToView,
                        allow_publish: false,
                      });
                    }
                  }}
                  disabled={!storyToView.allow_publish}
                >
                  Unapprove
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StoryList;