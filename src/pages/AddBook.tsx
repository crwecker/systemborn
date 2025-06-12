import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { createBook, type CreateBookData } from '../services/api';

type ViewMode = 'form' | 'success';

export function AddBook() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [createdBookId, setCreatedBookId] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<CreateBookData>({
    id: '',
    title: '',
    authorName: '',
    description: '',
    tags: [],
    coverUrl: '',
    sourceUrl: '',
    source: 'AMAZON',
    contentWarnings: [],
    rating: 0,
    followers: 0,
    views: 0,
    pages: 0,
    average_views: 0,
    favorites: 0,
    ratings_count: 0,
    character_score: 0,
    grammar_score: 0,
    overall_score: 0,
    story_score: 0,
    style_score: 0,
  });

  const [tagInput, setTagInput] = useState('');
  const [contentWarningInput, setContentWarningInput] = useState('');

  const createBookMutation = useMutation({
    mutationFn: createBook,
    onSuccess: (data) => {
      setCreatedBookId(data.book.id);
      setViewMode('success');
    },
    onError: (error) => {
      console.error('Failed to create book:', error);
    },
  });

  const handleInputChange = (field: keyof CreateBookData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const addContentWarning = () => {
    if (contentWarningInput.trim() && !formData.contentWarnings.includes(contentWarningInput.trim())) {
      handleInputChange('contentWarnings', [...formData.contentWarnings, contentWarningInput.trim()]);
      setContentWarningInput('');
    }
  };

  const removeContentWarning = (warningToRemove: string) => {
    handleInputChange('contentWarnings', formData.contentWarnings.filter(warning => warning !== warningToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.id || !formData.title || !formData.authorName || !formData.description || !formData.sourceUrl) {
      alert('Please fill in all required fields (ID, Title, Author, Description, Source URL)');
      return;
    }

    createBookMutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      authorName: '',
      description: '',
      tags: [],
      coverUrl: '',
      sourceUrl: '',
      source: 'AMAZON',
      contentWarnings: [],
      rating: 0,
      followers: 0,
      views: 0,
      pages: 0,
      average_views: 0,
      favorites: 0,
      ratings_count: 0,
      character_score: 0,
      grammar_score: 0,
      overall_score: 0,
      story_score: 0,
      style_score: 0,
    });
    setTagInput('');
    setContentWarningInput('');
    setViewMode('form');
    setCreatedBookId('');
  };

  if (viewMode === 'success') {
    return (
      <div className="min-h-screen bg-dark-blue text-white p-8 pt-32">
        <div className="max-w-2xl mx-auto bg-slate p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold mb-6 text-copper">Book Added Successfully!</h1>
          <p className="text-light-gray mb-6">
            "{formData.title}" by {formData.authorName} has been added to the database.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate({ to: `/books/${createdBookId}` })}
              className="w-full py-3 px-6 bg-copper text-dark-blue font-medium rounded-lg hover:bg-light-gray transition-colors"
            >
              View Book Details
            </button>
            
            <button
              onClick={resetForm}
              className="w-full py-3 px-6 border border-medium-gray text-light-gray rounded-lg hover:bg-medium-gray transition-colors"
            >
              Add Another Book
            </button>
            
            <button
              onClick={() => navigate({ to: '/' })}
              className="w-full py-3 px-6 text-light-gray hover:text-white transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-blue text-white p-8 pt-32">
      <div className="max-w-4xl mx-auto bg-slate p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-copper">Add New Book</h1>
        <p className="text-light-gray mb-8">
          Add a new book to the LitRPG Academy database. Fill in as much information as possible for the best user experience.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Book ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
                placeholder="e.g., asin-B08XYZ123 or unique-identifier"
                required
              />
              <p className="text-xs text-light-gray mt-1">Unique identifier for the book</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Source <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value as 'ROYAL_ROAD' | 'AMAZON')}
                className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
              >
                <option value="AMAZON">Amazon</option>
                <option value="ROYAL_ROAD">Royal Road</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
              placeholder="Enter book title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Author <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.authorName}
              onChange={(e) => handleInputChange('authorName', e.target.value)}
              className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
              placeholder="Enter author name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
              placeholder="Enter book description"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Cover URL</label>
              <input
                type="url"
                value={formData.coverUrl}
                onChange={(e) => handleInputChange('coverUrl', e.target.value)}
                className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Source URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => handleInputChange('sourceUrl', e.target.value)}
                className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
                placeholder="https://amazon.com/dp/... or https://royalroad.com/fiction/..."
                required
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
                placeholder="Add a tag (e.g., LitRPG, Fantasy, Adventure)"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-3 bg-copper text-dark-blue font-medium rounded hover:bg-light-gray transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-medium-gray text-white rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Content Warnings */}
          <div>
            <label className="block text-sm font-medium mb-2">Content Warnings</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={contentWarningInput}
                onChange={(e) => setContentWarningInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addContentWarning())}
                className="flex-1 p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
                placeholder="Add content warning (e.g., Violence, Sexual content)"
              />
              <button
                type="button"
                onClick={addContentWarning}
                className="px-4 py-3 bg-copper text-dark-blue font-medium rounded hover:bg-light-gray transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.contentWarnings.map((warning, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-600 text-white rounded-full text-sm flex items-center gap-2"
                >
                  {warning}
                  <button
                    type="button"
                    onClick={() => removeContentWarning(warning)}
                    className="text-red-200 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-copper">Statistics (Optional)</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating (0-5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Pages</label>
                <input
                  type="number"
                  min="0"
                  value={formData.pages}
                  onChange={(e) => handleInputChange('pages', parseInt(e.target.value) || 0)}
                  className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ratings Count</label>
                <input
                  type="number"
                  min="0"
                  value={formData.ratings_count}
                  onChange={(e) => handleInputChange('ratings_count', parseInt(e.target.value) || 0)}
                  className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Followers</label>
                <input
                  type="number"
                  min="0"
                  value={formData.followers}
                  onChange={(e) => handleInputChange('followers', parseInt(e.target.value) || 0)}
                  className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Views</label>
                <input
                  type="number"
                  min="0"
                  value={formData.views}
                  onChange={(e) => handleInputChange('views', parseInt(e.target.value) || 0)}
                  className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Favorites</label>
                <input
                  type="number"
                  min="0"
                  value={formData.favorites}
                  onChange={(e) => handleInputChange('favorites', parseInt(e.target.value) || 0)}
                  className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
                />
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-lg font-medium mb-3 text-light-gray">Detailed Scores (0-5)</h4>
              <div className="grid md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Overall</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.overall_score}
                    onChange={(e) => handleInputChange('overall_score', parseFloat(e.target.value) || 0)}
                    className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Story</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.story_score}
                    onChange={(e) => handleInputChange('story_score', parseFloat(e.target.value) || 0)}
                    className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Style</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.style_score}
                    onChange={(e) => handleInputChange('style_score', parseFloat(e.target.value) || 0)}
                    className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Grammar</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.grammar_score}
                    onChange={(e) => handleInputChange('grammar_score', parseFloat(e.target.value) || 0)}
                    className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Character</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.character_score}
                    onChange={(e) => handleInputChange('character_score', parseFloat(e.target.value) || 0)}
                    className="w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={createBookMutation.isPending}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                createBookMutation.isPending
                  ? 'bg-medium-gray text-light-gray cursor-not-allowed'
                  : 'bg-copper text-dark-blue hover:bg-light-gray'
              }`}
            >
              {createBookMutation.isPending ? 'Adding Book...' : 'Add Book to Database'}
            </button>

            <button
              type="button"
              onClick={() => navigate({ to: '/' })}
              className="px-6 py-3 border border-medium-gray text-light-gray rounded-lg hover:bg-medium-gray transition-colors"
            >
              Cancel
            </button>
          </div>

          {createBookMutation.error && (
            <div className="p-4 bg-red-600/20 border border-red-600/30 rounded-lg">
              <p className="text-red-400">
                Error: {createBookMutation.error instanceof Error ? createBookMutation.error.message : 'Unknown error'}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 