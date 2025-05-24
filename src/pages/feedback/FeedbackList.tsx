import React, { useState, useMemo } from 'react';
import { Star, Calendar, TrendingUp, MessageSquare, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useFetch } from '../../hooks/useFetch';
import { Feedback, Blog } from '../../types';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const FeedbackList: React.FC = () => {
  const [blogFilter, setBlogFilter] = useState<string>('');
  
  const { data: blogs } = useFetch<Blog[]>(
    ['blogs'], 
    '/api/blogs/'
  );
  
  const { data: feedback, isLoading, error } = useFetch<Feedback[]>(
    ['feedback', { blog: blogFilter }], 
    '/api/admin/feedback/',
    blogFilter ? { blog: blogFilter } : undefined
  );
  
  const stats = useMemo(() => {
    if (!feedback) return null;
    
    const total = feedback.length;
    const avgRating = feedback.reduce((acc, item) => acc + item.rating, 0) / total;
    const ratingDistribution = feedback.reduce((acc, item) => {
      acc[item.rating] = (acc[item.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return {
      total,
      avgRating: avgRating.toFixed(1),
      distribution: ratingDistribution,
    };
  }, [feedback]);
  
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
      label: blog.title,
    })),
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Feedback Dashboard</h1>
        <div className="flex items-center space-x-3">
          <Filter size={16} className="text-gray-500" />
          <Select
            options={blogOptions}
            value={blogFilter}
            onChange={(e) => setBlogFilter(e.target.value)}
            className="w-64"
          />
        </div>
      </div>
      
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-primary-500 to-primary-600">
            <Card.Content className="p-6">
              <div className="flex justify-between items-center text-white">
                <div>
                  <p className="text-primary-100">Total Feedback</p>
                  <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
                </div>
                <MessageSquare className="h-8 w-8 opacity-80" />
              </div>
            </Card.Content>
          </Card>
          
          <Card className="bg-gradient-to-br from-accent-500 to-accent-600">
            <Card.Content className="p-6">
              <div className="flex justify-between items-center text-white">
                <div>
                  <p className="text-accent-100">Average Rating</p>
                  <div className="flex items-center mt-1">
                    <span className="text-3xl font-bold mr-2">{stats.avgRating}</span>
                    <Star className="h-6 w-6" fill="currentColor" />
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 opacity-80" />
              </div>
            </Card.Content>
          </Card>
        </div>
      )}
      
      {/* Rating Distribution */}
      {stats && (
        <Card>
          <Card.Header>
            <Card.Title>Rating Distribution</Card.Title>
            <Card.Description>Overview of feedback ratings</Card.Description>
          </Card.Header>
          <Card.Content className="p-6">
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.distribution[rating] || 0;
                const percentage = ((count / stats.total) * 100).toFixed(1);
                
                return (
                  <div key={rating} className="flex items-center">
                    <div className="w-12 text-sm text-gray-600 flex items-center">
                      {rating} <Star className="h-4 w-4 ml-1 text-accent-400" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="bg-accent-400 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-sm text-gray-600">
                      {count} ({percentage}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </Card.Content>
        </Card>
      )}
      
      {/* Recent Feedback */}
      <Card>
        <Card.Header>
          <Card.Title>Recent Feedback</Card.Title>
          <Card.Description>Latest user comments and ratings</Card.Description>
        </Card.Header>
        <Card.Content>
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : !feedback || feedback.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No feedback available
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {feedback.map((item) => (
                <div key={item.id} className="py-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{item.email}</p>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`h-4 w-4 ${
                              index < item.rating
                                ? 'text-accent-400 fill-accent-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(item.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2">{item.message}</p>
                  {blogs && (
                    <p className="text-sm text-gray-500 mt-2">
                      On: {blogs.find(b => b.id === item.blog)?.title || 'Unknown Blog'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default FeedbackList;