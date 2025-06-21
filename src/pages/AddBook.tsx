import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createBook, type CreateBookData } from '../services/api'

type ViewMode = 'form' | 'csv' | 'success'

interface CSVUploadResult {
  successful: CreateBookData[]
  failed: { row: number; data: any; error: string }[]
}

export function AddBook() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('form')
  const [createdBookId, setCreatedBookId] = useState<string>('')
  const [csvResults, setCsvResults] = useState<CSVUploadResult | null>(null)

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
  })

  const [tagInput, setTagInput] = useState('')
  const [contentWarningInput, setContentWarningInput] = useState('')

  const createBookMutation = useMutation({
    mutationFn: createBook,
    onSuccess: data => {
      setCreatedBookId(data.book.id)
      setViewMode('success')
    },
    onError: error => {
      console.error('Failed to create book:', error)
    },
  })

  // CSV Template headers - matches CreateBookData interface
  const csvHeaders = [
    'id',
    'title',
    'authorName',
    'description',
    'tags', // Will be semicolon-separated
    'coverUrl',
    'sourceUrl',
    'source', // AMAZON or ROYAL_ROAD
    'contentWarnings', // Will be semicolon-separated
    'rating',
    'followers',
    'views',
    'pages',
    'average_views',
    'favorites',
    'ratings_count',
    'character_score',
    'grammar_score',
    'overall_score',
    'story_score',
    'style_score',
  ]

  // Download CSV template
  const downloadCSVTemplate = () => {
    const csvContent = csvHeaders.join(',') + '\n'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'book_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Parse CSV content
  const parseCSV = (csvText: string): CreateBookData[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim())
    const books: CreateBookData[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]
        .split(',')
        .map(v => v.trim().replace(/^"|"$/g, ''))
      const book: any = {}

      headers.forEach((header, index) => {
        const value = values[index] || ''

        switch (header) {
          case 'tags':
          case 'contentWarnings':
            book[header] = value
              ? value
                  .split(';')
                  .map(t => t.trim())
                  .filter(t => t)
              : []
            break
          case 'rating':
          case 'character_score':
          case 'grammar_score':
          case 'overall_score':
          case 'story_score':
          case 'style_score':
            book[header] = value ? parseFloat(value) : 0
            break
          case 'followers':
          case 'views':
          case 'pages':
          case 'average_views':
          case 'favorites':
          case 'ratings_count':
            book[header] = value ? parseInt(value) : 0
            break
          case 'source':
            book[header] = value === 'ROYAL_ROAD' ? 'ROYAL_ROAD' : 'AMAZON'
            break
          default:
            book[header] = value
        }
      })

      if (
        book.id &&
        book.title &&
        book.authorName &&
        book.description &&
        book.sourceUrl
      ) {
        books.push(book as CreateBookData)
      }
    }

    return books
  }

  // Handle CSV file upload
  const handleCSVUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const books = parseCSV(text)

    if (books.length === 0) {
      alert('No valid books found in CSV file. Please check the format.')
      return
    }

    // Process books one by one
    const results: CSVUploadResult = {
      successful: [],
      failed: [],
    }

    for (let i = 0; i < books.length; i++) {
      try {
        await createBook(books[i])
        results.successful.push(books[i])
      } catch (error) {
        results.failed.push({
          row: i + 2, // +2 because CSV starts at row 1 and we skip header
          data: books[i],
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    setCsvResults(results)
    setViewMode('success')
  }

  const handleInputChange = (field: keyof CreateBookData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange(
      'tags',
      formData.tags.filter(tag => tag !== tagToRemove)
    )
  }

  const addContentWarning = () => {
    if (
      contentWarningInput.trim() &&
      !formData.contentWarnings.includes(contentWarningInput.trim())
    ) {
      handleInputChange('contentWarnings', [
        ...formData.contentWarnings,
        contentWarningInput.trim(),
      ])
      setContentWarningInput('')
    }
  }

  const removeContentWarning = (warningToRemove: string) => {
    handleInputChange(
      'contentWarnings',
      formData.contentWarnings.filter(warning => warning !== warningToRemove)
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (
      !formData.id ||
      !formData.title ||
      !formData.authorName ||
      !formData.description ||
      !formData.sourceUrl
    ) {
      alert(
        'Please fill in all required fields (ID, Title, Author, Description, Source URL)'
      )
      return
    }

    createBookMutation.mutate(formData)
  }

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
    })
    setTagInput('')
    setContentWarningInput('')
    setViewMode('form')
    setCreatedBookId('')
    setCsvResults(null)
  }

  if (viewMode === 'success') {
    return (
      <div className='min-h-screen bg-dark-blue text-white p-8'>
        <div className='max-w-4xl mx-auto bg-slate p-8 rounded-lg shadow-lg'>
          {csvResults ? (
            // CSV Upload Results
            <>
              <h1 className='text-3xl font-bold mb-6 text-copper'>
                CSV Upload Complete
              </h1>

              <div className='space-y-6'>
                {csvResults.successful.length > 0 && (
                  <div className='p-6 bg-green-600/20 border border-green-600/30 rounded-lg'>
                    <h2 className='text-xl font-semibold text-green-400 mb-4'>
                      Successfully Added ({csvResults.successful.length} books)
                    </h2>
                    <div className='max-h-40 overflow-y-auto'>
                      {csvResults.successful.map((book, index) => (
                        <div
                          key={index}
                          className='text-sm text-green-200 mb-1'>
                          • "{book.title}" by {book.authorName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {csvResults.failed.length > 0 && (
                  <div className='p-6 bg-red-600/20 border border-red-600/30 rounded-lg'>
                    <h2 className='text-xl font-semibold text-red-400 mb-4'>
                      Failed to Add ({csvResults.failed.length} books)
                    </h2>
                    <div className='max-h-40 overflow-y-auto'>
                      {csvResults.failed.map((failure, index) => (
                        <div key={index} className='text-sm text-red-200 mb-2'>
                          <div className='font-medium'>
                            Row {failure.row}: "{failure.data.title}"
                          </div>
                          <div className='text-xs text-red-300 ml-2'>
                            Error: {failure.error}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Single Book Success
            <>
              <h1 className='text-3xl font-bold mb-6 text-copper'>
                Book Added Successfully!
              </h1>
              <p className='text-light-gray mb-6'>
                "{formData.title}" by {formData.authorName} has been added to
                the database.
              </p>
            </>
          )}

          <div className='space-y-4 mt-8'>
            {createdBookId && (
              <button
                onClick={() => navigate({ to: `/books/${createdBookId}` })}
                className='w-full py-3 px-6 bg-copper text-dark-blue font-medium rounded-lg hover:bg-light-gray transition-colors'>
                View Book Details
              </button>
            )}

            <div className='grid md:grid-cols-2 gap-4'>
              <button
                onClick={resetForm}
                className='py-3 px-6 border border-medium-gray text-light-gray rounded-lg hover:bg-medium-gray transition-colors'>
                Add More Books
              </button>

              <button
                onClick={() => navigate({ to: '/' })}
                className='py-3 px-6 text-light-gray hover:text-white transition-colors'>
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-dark-blue text-white p-8'>
      <div className='max-w-4xl mx-auto bg-slate p-8 rounded-lg shadow-lg'>
        <h1 className='text-3xl font-bold mb-6 text-copper'>Add New Books</h1>
        <p className='text-light-gray mb-8'>
          Add books to the LitRPG Academy database individually or in bulk using
          CSV upload.
        </p>

        {/* Mode Selection */}
        <div className='flex mb-8 bg-dark-blue rounded-lg p-1'>
          <button
            onClick={() => setViewMode('form')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              viewMode === 'form'
                ? 'bg-copper text-dark-blue font-medium'
                : 'text-light-gray hover:text-white'
            }`}>
            Single Book Form
          </button>
          <button
            onClick={() => setViewMode('csv')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              viewMode === 'csv'
                ? 'bg-copper text-dark-blue font-medium'
                : 'text-light-gray hover:text-white'
            }`}>
            CSV Bulk Upload
          </button>
        </div>

        {viewMode === 'csv' ? (
          /* CSV Upload Section */
          <div className='space-y-6'>
            <div className='bg-dark-blue p-6 rounded-lg border border-medium-gray'>
              <h2 className='text-xl font-semibold mb-4 text-copper'>
                CSV Bulk Upload
              </h2>
              <p className='text-light-gray mb-6'>
                Upload a CSV file to add multiple books at once. Download the
                template first to see the required format.
              </p>

              <div className='space-y-4'>
                <button
                  onClick={downloadCSVTemplate}
                  className='w-full py-3 px-6 bg-medium-gray text-white rounded-lg hover:bg-light-gray hover:text-dark-blue transition-colors font-medium'>
                  📥 Download CSV Template
                </button>

                <div className='relative'>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='.csv'
                    onChange={handleCSVUpload}
                    className='hidden'
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className='w-full py-3 px-6 bg-copper text-dark-blue rounded-lg hover:bg-light-gray transition-colors font-medium'>
                    📤 Upload CSV File
                  </button>
                </div>
              </div>

              <div className='mt-6 p-4 bg-medium-gray/20 rounded-lg'>
                <h3 className='font-medium mb-2 text-light-gray'>
                  CSV Format Notes:
                </h3>
                <ul className='text-sm text-light-gray space-y-1'>
                  <li>
                    • Required fields: id, title, authorName, description,
                    sourceUrl
                  </li>
                  <li>
                    • Use semicolons (;) to separate multiple tags or content
                    warnings
                  </li>
                  <li>• Source should be either "AMAZON" or "ROYAL_ROAD"</li>
                  <li>
                    • Numeric fields (rating, followers, etc.) can be left empty
                    for defaults
                  </li>
                  <li>
                    • Make sure your CSV uses comma separators and quote text
                    fields if they contain commas
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Single Book Form - existing form code remains exactly the same */
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Basic Information */}
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Book ID <span className='text-red-400'>*</span>
                </label>
                <input
                  type='text'
                  value={formData.id}
                  onChange={e => handleInputChange('id', e.target.value)}
                  className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                  placeholder='e.g., asin-B08XYZ123 or unique-identifier'
                  required
                />
                <p className='text-xs text-light-gray mt-1'>
                  Unique identifier for the book
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>
                  Source <span className='text-red-400'>*</span>
                </label>
                <select
                  value={formData.source}
                  onChange={e =>
                    handleInputChange(
                      'source',
                      e.target.value as 'ROYAL_ROAD' | 'AMAZON'
                    )
                  }
                  className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'>
                  <option value='AMAZON'>Amazon</option>
                  <option value='ROYAL_ROAD'>Royal Road</option>
                </select>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                Title <span className='text-red-400'>*</span>
              </label>
              <input
                type='text'
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                placeholder='Enter book title'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                Author <span className='text-red-400'>*</span>
              </label>
              <input
                type='text'
                value={formData.authorName}
                onChange={e => handleInputChange('authorName', e.target.value)}
                className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                placeholder='Enter author name'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                Description <span className='text-red-400'>*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                rows={4}
                className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                placeholder='Enter book description'
                required
              />
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Cover URL
                </label>
                <input
                  type='url'
                  value={formData.coverUrl}
                  onChange={e => handleInputChange('coverUrl', e.target.value)}
                  className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                  placeholder='https://example.com/cover.jpg'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>
                  Source URL <span className='text-red-400'>*</span>
                </label>
                <input
                  type='url'
                  value={formData.sourceUrl}
                  onChange={e => handleInputChange('sourceUrl', e.target.value)}
                  className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                  placeholder='https://amazon.com/dp/... or https://royalroad.com/fiction/...'
                  required
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className='block text-sm font-medium mb-2'>Tags</label>
              <div className='flex gap-2 mb-2'>
                <input
                  type='text'
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyPress={e =>
                    e.key === 'Enter' && (e.preventDefault(), addTag())
                  }
                  className='flex-1 p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                  placeholder='Add a tag (e.g., LitRPG, Fantasy, Adventure)'
                />
                <button
                  type='button'
                  onClick={addTag}
                  className='px-4 py-3 bg-copper text-dark-blue font-medium rounded hover:bg-light-gray transition-colors'>
                  Add
                </button>
              </div>
              <div className='flex flex-wrap gap-2'>
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className='px-3 py-1 bg-medium-gray text-white rounded-full text-sm flex items-center gap-2'>
                    {tag}
                    <button
                      type='button'
                      onClick={() => removeTag(tag)}
                      className='text-red-400 hover:text-red-300'>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Content Warnings */}
            <div>
              <label className='block text-sm font-medium mb-2'>
                Content Warnings
              </label>
              <div className='flex gap-2 mb-2'>
                <input
                  type='text'
                  value={contentWarningInput}
                  onChange={e => setContentWarningInput(e.target.value)}
                  onKeyPress={e =>
                    e.key === 'Enter' &&
                    (e.preventDefault(), addContentWarning())
                  }
                  className='flex-1 p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                  placeholder='Add content warning (e.g., Violence, Sexual content)'
                />
                <button
                  type='button'
                  onClick={addContentWarning}
                  className='px-4 py-3 bg-copper text-dark-blue font-medium rounded hover:bg-light-gray transition-colors'>
                  Add
                </button>
              </div>
              <div className='flex flex-wrap gap-2'>
                {formData.contentWarnings.map((warning, index) => (
                  <span
                    key={index}
                    className='px-3 py-1 bg-red-600 text-white rounded-full text-sm flex items-center gap-2'>
                    {warning}
                    <button
                      type='button'
                      onClick={() => removeContentWarning(warning)}
                      className='text-red-200 hover:text-white'>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div>
              <h3 className='text-xl font-semibold mb-4 text-copper'>
                Statistics (Optional)
              </h3>
              <div className='grid md:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Rating (0-5)
                  </label>
                  <input
                    type='number'
                    min='0'
                    max='5'
                    step='0.1'
                    value={formData.rating}
                    onChange={e =>
                      handleInputChange(
                        'rating',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Pages
                  </label>
                  <input
                    type='number'
                    min='0'
                    value={formData.pages}
                    onChange={e =>
                      handleInputChange('pages', parseInt(e.target.value) || 0)
                    }
                    className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Ratings Count
                  </label>
                  <input
                    type='number'
                    min='0'
                    value={formData.ratings_count}
                    onChange={e =>
                      handleInputChange(
                        'ratings_count',
                        parseInt(e.target.value) || 0
                      )
                    }
                    className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Followers
                  </label>
                  <input
                    type='number'
                    min='0'
                    value={formData.followers}
                    onChange={e =>
                      handleInputChange(
                        'followers',
                        parseInt(e.target.value) || 0
                      )
                    }
                    className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Views
                  </label>
                  <input
                    type='number'
                    min='0'
                    value={formData.views}
                    onChange={e =>
                      handleInputChange('views', parseInt(e.target.value) || 0)
                    }
                    className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Favorites
                  </label>
                  <input
                    type='number'
                    min='0'
                    value={formData.favorites}
                    onChange={e =>
                      handleInputChange(
                        'favorites',
                        parseInt(e.target.value) || 0
                      )
                    }
                    className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                  />
                </div>
              </div>

              <div className='mt-4'>
                <h4 className='text-lg font-medium mb-3 text-light-gray'>
                  Detailed Scores (0-5)
                </h4>
                <div className='grid md:grid-cols-5 gap-4'>
                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      Overall
                    </label>
                    <input
                      type='number'
                      min='0'
                      max='5'
                      step='0.1'
                      value={formData.overall_score}
                      onChange={e =>
                        handleInputChange(
                          'overall_score',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      Story
                    </label>
                    <input
                      type='number'
                      min='0'
                      max='5'
                      step='0.1'
                      value={formData.story_score}
                      onChange={e =>
                        handleInputChange(
                          'story_score',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      Style
                    </label>
                    <input
                      type='number'
                      min='0'
                      max='5'
                      step='0.1'
                      value={formData.style_score}
                      onChange={e =>
                        handleInputChange(
                          'style_score',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      Grammar
                    </label>
                    <input
                      type='number'
                      min='0'
                      max='5'
                      step='0.1'
                      value={formData.grammar_score}
                      onChange={e =>
                        handleInputChange(
                          'grammar_score',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      Character
                    </label>
                    <input
                      type='number'
                      min='0'
                      max='5'
                      step='0.1'
                      value={formData.character_score}
                      onChange={e =>
                        handleInputChange(
                          'character_score',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className='w-full p-3 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper text-white'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className='flex gap-4 pt-6'>
              <button
                type='submit'
                disabled={createBookMutation.isPending}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                  createBookMutation.isPending
                    ? 'bg-medium-gray text-light-gray cursor-not-allowed'
                    : 'bg-copper text-dark-blue hover:bg-light-gray'
                }`}>
                {createBookMutation.isPending
                  ? 'Adding Book...'
                  : 'Add Book to Database'}
              </button>

              <button
                type='button'
                onClick={() => navigate({ to: '/' })}
                className='px-6 py-3 border border-medium-gray text-light-gray rounded-lg hover:bg-medium-gray transition-colors'>
                Cancel
              </button>
            </div>

            {createBookMutation.error && (
              <div className='p-4 bg-red-600/20 border border-red-600/30 rounded-lg'>
                <p className='text-red-400'>
                  Error:{' '}
                  {createBookMutation.error instanceof Error
                    ? createBookMutation.error.message
                    : 'Unknown error'}
                </p>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
