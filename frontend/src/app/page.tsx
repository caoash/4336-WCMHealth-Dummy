'use client';

import { useState } from 'react';
import Link from 'next/link';

// Helper function to format file size (copied from original page)
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Functionality for HomePage added
export default function HomePage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null); // For feedback
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadStatus(null); // Clear previous status on new file selection
            setUploadError(null);
        } else {
            setSelectedFile(null);
        }
        // Reset file input visually if needed (optional, sometimes browsers handle this)
        event.target.value = '';
    };

    // Handle file upload to the backend
    const handleFileUpload = async () => {
        if (!selectedFile) {
            setUploadError('Please select a file first.');
            return;
        }

        setUploadStatus('Uploading...');
        setUploadError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/upload', { // Target the existing upload endpoint
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                // Try to get error message from response body if possible
                let errorMsg = `Upload failed with status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg; // Use backend error if available
                } catch (e) { /* Ignore if response body isn't JSON */ }
                throw new Error(errorMsg);
            }

            const result = await response.json();
            console.log('File processed:', result);
            setUploadStatus(`Success! ${result.message || 'File processed.'}`); // Use backend message if available
            setSelectedFile(null); // Clear selection after successful upload

        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadStatus(null);
            setUploadError(error.message || 'An unexpected error occurred during upload.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h1 className="text-2xl font-bold mb-6 text-[#5f43b2]">WCM Health Tracker - Home</h1>

                {/* File Upload Section */}
                <div className="border rounded-md p-4">
                    <h2 className="text-lg font-semibold mb-3 text-gray-700">Upload Data</h2>
                    <div className="flex items-center gap-4">
                         <label
                            htmlFor="file-upload"
                            className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#5f43b2] text-white text-sm font-medium rounded-md hover:bg-[#4a3590] transition-colors"
                        >
                            Choose File (.csv)
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".csv" // Keep accepting CSV files as per original logic
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        {selectedFile && (
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">{selectedFile.name}</span> ({formatFileSize(selectedFile.size)})
                            </div>
                        )}
                    </div>

                    {selectedFile && (
                         <button
                            onClick={handleFileUpload}
                            disabled={uploadStatus === 'Uploading...'}
                            className="mt-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-wait transition-colors"
                        >
                            {uploadStatus === 'Uploading...' ? 'Uploading...' : 'Upload Data'}
                        </button>
                    )}

                    {/* Feedback Messages */}
                    {uploadStatus && !uploadError && (
                        <p className="mt-3 text-sm text-green-600">{uploadStatus}</p>
                    )}
                     {uploadError && (
                        <p className="mt-3 text-sm text-red-600">Error: {uploadError}</p>
                    )}
                </div>
            </div>

            {/* Navigation Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/health-report" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold text-[#5f43b2] mb-2">View Health Report</h2>
                    <p className="text-gray-600 text-sm">View pass/fail report showing system health status with voltage monitoring.</p>
                </Link>
                <Link href="/configuration" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold text-[#5f43b2] mb-2">Configuration</h2>
                    <p className="text-gray-600 text-sm">Adjust application settings (coming soon).</p>
                </Link>
            </div>
        </div>
    );
}
