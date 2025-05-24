import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  MessageSquare, 
  Star, 
  BookText, 
  TrendingUp,
  Edit3
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { Blog, Comment, Feedback, Story } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: blogs, isLoading: blogsLoading } = useFetch<Blog[]>(
    ['blogs'], 
    '/blogs/',
    undefined,
    { staleTime: 1000 * 60 * 5 } // 5 minutes
  );
  
  const { data: comments, isLoading: commentsLoading } = useFetch<Comment[]>(
    ['comments'], 
    '/comments/',
    undefined,
    { staleTime: 1000 * 60 * 5 }
  );
  
  const { data: feedback, isLoading: feedbackLoading } = useFetch<Feedback[]>(
    ['feedback'], 
    '/feedback/',
    undefined,
    { staleTime: 1000 * 60 * 5 }
  );
  
  const { data: stories, isLoading: storiesLoading } = useFetch<Story[]>(
    ['stories'], 
    '/stories/',
    undefined,
    { staleTime: 1000 * 60 * 5 }
  );
  
  // Calculate stats
  const blogCount = blogs?.length || 0;
  const commentCount = comments?.length || 0;
  const averageRating = feedback?.length 
    ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length
    : 0;
  const pendingStories = stories?.filter(story => !story.allow_publish).length || 0;
  
  // Get recent blogs
  const recentBlogs = blogs?.slice(0, 5) || [];
  
  // Get recent comments
  const recentComments = comments?.slice(0, 5) || [];
  
  const statCards = [
    { 
      title: 'Blogs', 
      value: blogCount, 
      icon: <BookOpen className="h-8 w-8 text-primary-500" />,
      onClick: () => navigate('/blogs')
    },
    { 
      title: 'Comments', 
      value: commentCount, 
      icon: <MessageSquare className="h-8 w-8 text-secondary-500" />,
      onClick: () => navigate('/comments')
    },
    { 
      title: 'Avg. Rating', 
      value: averageRating.toFixed(1), 
      icon: <Star className="h-8 w-8 text-accent-500" />,
      onClick: () => navigate('/feedback')
    },
    { 
      title: 'Pending Stories', 
      value: pendingStories, 
      icon: <BookText className="h-8 w-8 text-success-500" />,
      onClick: () => navigate('/stories')
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button 
          variant="primary" 
          leftIcon={<Edit3 size={16} />}
          onClick={() => navigate('/blogs/new')}
        >
          New Blog
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <Card 
            key={index} 
            className="transition-all duration-200 hover:translate-y-[-4px]"
            onClick={card.onClick}
            hoverable
          >
            <div className="p-6 flex justify-between items-center">
              <div>
                <p className="text-lg font-medium text-gray-500">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div>{card.icon}</div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Blogs */}
        <Card>
          <Card.Header className="flex justify-between items-center">
            <div>
              <Card.Title>Recent Blogs</Card.Title>
              <Card.Description>Latest published blogs</Card.Description>
            </div>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </Card.Header>
          <Card.Content>
            {blogsLoading ? (
              <div className="py-4 text-center text-gray-500">Loading...</div>
            ) : recentBlogs.length === 0 ? (
              <div className="py-4 text-center text-gray-500">No blogs available</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentBlogs.map((blog) => (
                  <li key={blog.id} className="py-3">
                    <div className="flex justify-between">
                      <div className="truncate">
                        <p className="text-sm font-medium text-gray-900 truncate">{blog.title}</p>
                        <p className="text-xs text-gray-500 truncate">{blog.subheading}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(blog.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card.Content>
          <Card.Footer className="text-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/blogs')}
            >
              View All Blogs
            </Button>
          </Card.Footer>
        </Card>
        
        {/* Recent Comments */}
        <Card>
          <Card.Header className="flex justify-between items-center">
            <div>
              <Card.Title>Recent Comments</Card.Title>
              <Card.Description>Latest user comments</Card.Description>
            </div>
            <MessageSquare className="h-5 w-5 text-gray-400" />
          </Card.Header>
          <Card.Content>
            {commentsLoading ? (
              <div className="py-4 text-center text-gray-500">Loading...</div>
            ) : recentComments.length === 0 ? (
              <div className="py-4 text-center text-gray-500">No comments available</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentComments.map((comment) => (
                  <li key={comment.id} className="py-3">
                    <div>
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">{comment.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 truncate">{comment.content}</p>
                      <p className="mt-1 text-xs text-gray-500">Blog ID: {comment.blog}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card.Content>
          <Card.Footer className="text-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/comments')}
            >
              View All Comments
            </Button>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;