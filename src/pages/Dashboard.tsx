import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Star, 
  BookText
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { Blog, Feedback, Story } from '../types';
import Card from '../components/ui/Card';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: blogs } = useFetch<Blog[]>(
    ['blogs'], 
    '/api/blogs/'
  );
  
  const { data: feedback } = useFetch<Feedback[]>(
    ['feedback'], 
    '/api/admin/feedback/'
  );
  
  const { data: stories } = useFetch<Story[]>(
    ['stories'], 
    '/api/admin/stories/'
  );
  
  const statCards = [
    { 
      title: 'Blog Posts', 
      count: blogs?.length || 0,
      description: 'Manage your blog content',
      icon: <BookOpen className="h-8 w-8 text-primary-500" />,
      onClick: () => navigate('/blogs')
    },
    { 
      title: 'Feedback', 
      count: feedback?.length || 0,
      description: 'View reader feedback',
      icon: <Star className="h-8 w-8 text-accent-500" />,
      onClick: () => navigate('/feedback')
    },
    { 
      title: 'Story Submissions', 
      count: stories?.length || 0,
      description: 'Review submitted stories',
      icon: <BookText className="h-8 w-8 text-success-500" />,
      onClick: () => navigate('/stories')
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <Card 
            key={index} 
            className="transition-all duration-200 hover:translate-y-[-4px]"
            onClick={card.onClick}
            hoverable
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{card.title}</h2>
                  <p className="text-3xl font-bold text-primary-600 mt-2">{card.count}</p>
                </div>
                <div>{card.icon}</div>
              </div>
              <p className="text-sm text-gray-500">{card.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;