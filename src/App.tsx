import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'sonner';

import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import BlogList from './pages/blogs/BlogList';
import BlogForm from './pages/blogs/BlogForm';
import BlogDetail from './pages/blogs/BlogDetail';
import FeedbackList from './pages/feedback/FeedbackList';
import StoryList from './pages/stories/StoryList';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route path="blogs" element={<BlogList />} />
            <Route path="blogs/new" element={<BlogForm />} />
            <Route path="blogs/:id" element={<BlogDetail />} />
            <Route path="blogs/:id/edit" element={<BlogForm />} />
            
            <Route path="feedback" element={<FeedbackList />} />
            <Route path="stories" element={<StoryList />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
        <Toaster position="top-right" richColors />
      </Router>
    </QueryClientProvider>
  );
}

export default App;