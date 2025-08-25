import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { pdfService } from '../services/api';
import { Header } from '../components/layout/Header';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { UploadedPDF } from '../types';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFile = droppedFiles.find(file => file.type === 'application/pdf');

    if (pdfFile) {
      setFile(pdfFile);
      if (!title) {
        setTitle(pdfFile.name.replace('.pdf', ''));
      }
    } else {
      toast.error('Please select a PDF file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace('.pdf', ''));
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setTitle('');
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      // First upload the PDF
      const uploadedPDF = await pdfService.uploadPDF(file, title, isPublic);
      toast.success('PDF uploaded successfully!');
      
      // Then generate the quiz
      toast.loading('Generating quiz questions...', { id: 'generating' });
      const quiz = await pdfService.generateQuiz(uploadedPDF.id, numQuestions);
      toast.success('Quiz generated successfully!', { id: 'generating' });
      
      // Navigate to the quiz taking page
      navigate(`/quiz/${quiz.quiz_id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload PDF Document</h1>
          <p className="text-gray-600 mt-2">
            Upload a PDF document to generate AI-powered quiz questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Select PDF File</h2>
                <p className="text-gray-600 text-sm">
                  Drag and drop your PDF file or click to browse
                </p>
              </CardHeader>
              <CardContent>
                {!file ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                      dragActive
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-900">
                        Drop your PDF file here
                      </p>
                      <p className="text-gray-600">or</p>
                      <label className="cursor-pointer inline-block">
                        <div className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 transition-colors duration-200">
                          Browse files
                        </div>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Maximum file size: 10MB
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-red-500" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                        title="Remove file"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                )}

                {file && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quiz Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a title for your quiz"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        If left empty, we'll use the filename
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Questions
                      </label>
                      <select
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        aria-label="Number of questions to generate"
                        title="Number of questions to generate"
                      >
                        <option value={3}>3 questions</option>
                        <option value={5}>5 questions</option>
                        <option value={10}>10 questions</option>
                        <option value={15}>15 questions</option>
                        <option value={20}>20 questions</option>
                        <option value={25}>25 questions</option>
                        <option value={30}>30 questions</option>
                        <option value={40}>40 questions</option>
                        <option value={50}>50 questions</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose how many questions to generate from your PDF
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isPublic" className="ml-2 block text-sm font-medium text-gray-700">
                          Make quiz public
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Public quizzes can be accessed by other users
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">How it works</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Upload PDF</h3>
                      <p className="text-sm text-gray-600">
                        Select and upload your PDF document
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">AI Analysis</h3>
                      <p className="text-sm text-gray-600">
                        Our AI analyzes the content and generates questions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Take Quiz</h3>
                      <p className="text-sm text-gray-600">
                        Answer the generated questions and get instant feedback
                      </p>
                    </div>
                  </div>
                </div>

                {file && (
                  <div className="mt-8">
                    <Button
                      onClick={handleUpload}
                      loading={uploading}
                      className="w-full"
                      size="lg"
                    >
                      {uploading ? 'Uploading...' : 'Upload PDF'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <h3 className="text-lg font-medium">Supported formats</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>PDF documents (.pdf)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Maximum size: 10MB</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};