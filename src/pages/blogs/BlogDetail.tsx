import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, Trash2, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useFetch, useDelete } from '../../hooks/useFetch';
import { Blog, Comment, Feedback } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { data: blog, isLoading, error } = useFetch<Blog>(
    ['blog', id], 
    `/blogs/${id}/`
  );
  
  const { data: comments } = useFetch<Comment[]>(
    ['comments', { blog: id }], 
    '/comments/',
    { blog: id }
  );
  
  const { data: feedback } = useFetch<Feedback[]>(
    ['feedback', { blog: id }], 
    '/feedback/',
    { blog: id }
  );
  
  const { mutate: deleteBlog, isLoading: isDeleting } = useDelete(
    '/blogs',
    ['blogs'],
    {
      onSuccess: () => {
        toast.success('Blog deleted successfully');
        navigate('/blogs');
      },
      onError: (error) => {
        toast.error(`Error deleting blog: ${error.message}`);
      },
    }
  );
  
  const handleDelete = () => {
    if (id) {
      deleteBlog(parseInt(id));
    }
  };
  
  const calculateAverageRating = () => {
    if (!feedback || feedback.length === 0) return 0;
    const sum = feedback.reduce((acc, item) => acc + item.rating, 0);
    return (sum / feedback.length).toFixed(1);
  };
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-t-primary-500 border-r-primary-300 border-b-primary-200 border-l-primary-100 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error || !blog) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Error Loading Blog</h3>
          <p className="mt-1 text-sm text-gray-500">{error?.message || 'Blog not found'}</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/blogs')}
          >
            Back to Blogs
          </Button>
        </div>
      </div>
    );
  }
  
  const averageRating = calculateAverageRating();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blogs')} 
            leftIcon={<ArrowLeft size={16} />}
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Blog Details</h1>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            leftIcon={<Edit3 size={16} />}
            onClick={() => navigate(`/blogs/${id}/edit`)}
          >
            Edit
          </Button>
          <Button 
            variant="danger" 
            leftIcon={<Trash2 size={16} />}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Blog Content */}
          <Card>
            <Card.Content className="py-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-gray-900">{blog.title}</h2>
                  <Badge variant="primary">ID: {blog.id}</Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>{blog.estimated_read_time} min read</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.pexels.com/photos/3127880/pexels-photo-3127880.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
                    }}
                  />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800">{blog.subheading}</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">TLDR:</h4>
                  <p className="text-gray-600">{blog.tldr}</p>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <p className="whitespace-pre-line text-gray-700">{blog.content}</p>
                </div>
              </div>
            </Card.Content>
          </Card>
          
          {/* Comments */}
          <Card>
            <Card.Header>
              <Card.Title>Comments ({comments?.length || 0})</Card.Title>
              <Card.Description>User comments on this blog</Card.Description>
            </Card.Header>
            <Card.Content>
              {!comments || comments.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No comments yet</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {comments.map((comment) => (
                    <li key={comment.id} className="py-4">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{comment.name}</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Content>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Blog Stats */}
          <Card>
            <Card.Header>
              <Card.Title>Blog Stats</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Slug:</span>
                  <span className="text-sm font-medium text-gray-900">{blog.slug}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Comments:</span>
                  <span className="text-sm font-medium text-gray-900">{comments?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Feedback:</span>
                  <span className="text-sm font-medium text-gray-900">{feedback?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Avg. Rating:</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-1">{averageRating}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Number(averageRating)
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
                </div>
              </div>
            </Card.Content>
          </Card>
          
          {/* Recent Feedback */}
          <Card>
            <Card.Header>
              <Card.Title>Recent Feedback</Card.Title>
            </Card.Header>
            <Card.Content>
              {!feedback || feedback.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No feedback yet</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {feedback.slice(0, 5).map((item) => (
                    <li key={item.id} className="py-3">
                      <div className="flex justify-between">
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
                        <span className="text-xs text-gray-500">
                          {new Date(item.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-gray-900 truncate">{item.email}</p>
                      <p className="mt-1 text-sm text-gray-700">{item.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Blog"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this blog? This action cannot be undone.
          </p>
          <p className="font-medium text-gray-900">"{blog.title}"</p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
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

export default BlogDetail;