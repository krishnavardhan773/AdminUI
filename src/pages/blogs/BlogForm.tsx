import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { useFetch, useCreate, useUpdate } from '../../hooks/useFetch';
import { Blog } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Card from '../../components/ui/Card';

interface BlogFormData {
  title: string;
  slug: string;
  subheading: string;
  tldr: string;
  content: string;
  image: string;
  estimated_read_time: number;
}

const BlogForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const { data: blog, isLoading: isFetchingBlog } = useFetch<Blog>(
    ['blog', id], 
    `/blogs/${id}/`,
    undefined,
    { enabled: isEditMode }
  );
  
  const { mutate: createBlog, isLoading: isCreating } = useCreate<Blog, BlogFormData>(
    '/blogs/',
    ['blogs'],
    {
      onSuccess: () => {
        toast.success('Blog created successfully');
        navigate('/blogs');
      },
      onError: (error) => {
        toast.error(`Error creating blog: ${error.message}`);
      },
    }
  );
  
  const { mutate: updateBlog, isLoading: isUpdating } = useUpdate<Blog, BlogFormData>(
    '/blogs',
    ['blogs', 'blog', id],
    {
      onSuccess: () => {
        toast.success('Blog updated successfully');
        navigate('/blogs');
      },
      onError: (error) => {
        toast.error(`Error updating blog: ${error.message}`);
      },
    }
  );
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BlogFormData>({
    defaultValues: {
      title: '',
      slug: '',
      subheading: '',
      tldr: '',
      content: '',
      image: '',
      estimated_read_time: 5,
    },
  });
  
  useEffect(() => {
    if (blog) {
      reset({
        title: blog.title,
        slug: blog.slug,
        subheading: blog.subheading,
        tldr: blog.tldr,
        content: blog.content,
        image: blog.image,
        estimated_read_time: blog.estimated_read_time,
      });
    }
  }, [blog, reset]);
  
  const onSubmit = (data: BlogFormData) => {
    if (isEditMode && id) {
      updateBlog({ id: parseInt(id), data });
    } else {
      createBlog(data);
    }
  };
  
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };
  
  const isLoading = isFetchingBlog || isCreating || isUpdating;
  
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Blog' : 'Create New Blog'}
          </h1>
        </div>
        <Button 
          variant="primary" 
          leftIcon={<Save size={16} />}
          onClick={handleSubmit(onSubmit)}
          isLoading={isLoading}
        >
          {isEditMode ? 'Update' : 'Save'}
        </Button>
      </div>
      
      <Card>
        <Card.Content className="py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Title"
                fullWidth
                error={errors.title?.message}
                {...register('title', { 
                  required: 'Title is required',
                  onChange: (e) => {
                    // Auto-generate slug based on title
                    const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement;
                    if (slugInput && (slugInput.value === '' || slugInput.value === generateSlug(e.target.value.substring(0, e.target.value.length - 1)))) {
                      slugInput.value = generateSlug(e.target.value);
                    }
                  }
                })}
              />
              
              <Input
                label="Slug"
                fullWidth
                error={errors.slug?.message}
                {...register('slug', { 
                  required: 'Slug is required',
                  pattern: {
                    value: /^[a-z0-9-]+$/,
                    message: 'Slug can only contain lowercase letters, numbers, and hyphens'
                  }
                })}
              />
            </div>
            
            <Input
              label="Subheading"
              fullWidth
              error={errors.subheading?.message}
              {...register('subheading', { 
                required: 'Subheading is required',
              })}
            />
            
            <Input
              label="TLDR (Too Long; Didn't Read)"
              fullWidth
              error={errors.tldr?.message}
              {...register('tldr', { 
                required: 'TLDR is required',
              })}
            />
            
            <Textarea
              label="Content"
              rows={10}
              fullWidth
              error={errors.content?.message}
              {...register('content', { 
                required: 'Content is required',
              })}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Image URL"
                fullWidth
                error={errors.image?.message}
                {...register('image', { 
                  required: 'Image URL is required',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Must be a valid URL starting with http:// or https://'
                  }
                })}
              />
              
              <Input
                label="Estimated Read Time (minutes)"
                type="number"
                fullWidth
                error={errors.estimated_read_time?.message}
                {...register('estimated_read_time', { 
                  required: 'Read time is required',
                  min: {
                    value: 1,
                    message: 'Read time must be at least 1 minute'
                  },
                  valueAsNumber: true,
                })}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                variant="primary"
                isLoading={isLoading}
              >
                {isEditMode ? 'Update Blog' : 'Create Blog'}
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
};

export default BlogForm;