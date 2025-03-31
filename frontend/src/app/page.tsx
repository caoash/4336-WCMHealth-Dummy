'use client';

import { useEffect, useState } from 'react';

interface DetailRow {
    id: number;
    Details: string;
    Value: string;
    Status: string;
}

interface ChannelRow {
    id: number;
    Channel: string;
    Name: string;
    Status: string;
}

const STATUS_OPTIONS = ['Inactive', 'Active', 'Pending', 'Standby', '--'] as const;
type StatusType = typeof STATUS_OPTIONS[number];

export default function Dashboard() {
    const [details, setDetails] = useState<DetailRow[]>([]);
    const [channels, setChannels] = useState<ChannelRow[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [threshold, setThreshold] = useState(50); // Default threshold value
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchDetailsAndChannels();
    }, []);

    const fetchDetailsAndChannels = async () => {
        try {
            const res = await fetch('/api/dashboard');
            const data = await res.json();
            setDetails(data.details);
            setChannels(data.channels);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'inactive':
                return 'text-red-600';
            case 'active':
                return 'text-green-600';
            case 'pending':
                return 'text-yellow-600';
            case 'standby':
                return 'text-gray-600';
            default:
                return 'text-gray-600';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);

            // Create FormData to send file to backend
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to upload file');
                }

                const result = await response.json();
                console.log('File processed:', result);

                // Refresh data after upload
                await fetchDetailsAndChannels();
            } catch (error) {
                console.error('Upload error:', error);
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header and File Upload Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-bold text-lg pl-6 text-[#5f43b2]">Board Diagnostics - Field Test</h1>
                <div className="relative flex items-center">
                    <label
                        htmlFor="tool-dump"
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5f43b2] cursor-pointer"
                    >
                        <span className="mr-2">Tool Dump</span>
                        <svg
                            className="h-4 w-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </label>
                    <input
                        id="tool-dump"
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    {selectedFile && (
                        <div className="ml-3 text-xs text-gray-500">
                            <div className="font-medium">{selectedFile.name}</div>
                            <div>{formatFileSize(selectedFile.size)}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Threshold Section */}
            <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-gray-500">Threshold:</span>
                    <div className="flex-1 flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={threshold}
                            onChange={(e) => setThreshold(Number(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5f43b2]"
                        />
                        <span className="text-xs font-medium text-gray-500 w-8">{threshold}%</span>
                    </div>
                </div>
            </div>

            {/* System Details Table */}
            <div className="mb-8 bg-white p-6 pt-4 pb-2 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-[#5f43b2] mb-4">System Details</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Value
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {details.map((detail, index) => (
                                <tr key={detail.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                                    <td className="px-6 py-2 whitespace-nowrap text-[#5f43b2] text-xs">{detail.Details}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-xs text-gray-500">{detail.Value}</td>
                                    <td
                                        className={`px-6 py-2 whitespace-nowrap text-xs ${getStatusColor(
                                            detail.Status
                                        )}`}
                                    >
                                        {detail.Status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Channel Data Table */}
            <div className="bg-white p-6 pt-0 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-[#5f43b2] mb-4">Channel Data</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Channel
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {channels.map((channel, index) => (
                                <tr key={channel.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                                    <td className="px-6 py-2 whitespace-nowrap text-[#5f43b2] text-xs">{channel.Channel}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-xs text-gray-500">{channel.Name}</td>
                                    <td
                                        className={`px-6 py-2 whitespace-nowrap text-xs ${getStatusColor(
                                            channel.Status
                                        )}`}
                                    >
                                        {channel.Status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
