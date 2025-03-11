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
    const [newDetail, setNewDetail] = useState({
        Details: '',
        Value: '',
        Status: '' as StatusType
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [threshold, setThreshold] = useState(50); // Default threshold value

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => {
                setDetails(data.details);
                setChannels(data.channels);
            });
    }, []);

    const getStatusColor = (status: string) => {
        switch(status.toLowerCase()) {
            case 'inactive': return 'text-red-600';
            case 'active': return 'text-green-600';
            case 'pending': return 'text-yellow-600';
            case 'standby': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleAddDetail = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/dashboard/detail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newDetail),
            });

            if (!response.ok) throw new Error('Failed to add detail');

            const updatedDetails = await fetch('/api/dashboard').then(res => res.json());
            setDetails(updatedDetails.details);
            setNewDetail({ Details: '', Value: '', Status: '' as StatusType });
            setShowAddForm(false);
        } catch (error) {
            console.error('Error adding detail:', error);
        }
    };

    const handleDeleteDetail = async (id: number) => {
        try {
            const response = await fetch(`/api/dashboard/detail/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete detail');

            const updatedDetails = await fetch('/api/dashboard').then(res => res.json());
            setDetails(updatedDetails.details);
        } catch (error) {
            console.error('Error deleting detail:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-bold text-lg pl-6 text-[#5f43b2]">Board Diagnostics - Field Test</h1>
                <div className="relative flex items-center">
                    <label htmlFor="tool-dump" className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5f43b2] cursor-pointer">
                        <span className="mr-2">Tool Dump</span>
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </label>
                    <input
                        id="tool-dump"
                        type="file"
                        accept=".csv,.txt"
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

            <div className="mb-8 bg-white p-6 pt-4 pb-2">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#5f43b2]">System Details</h2>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="px-3 py-1 text-xs bg-[#5f43b2] text-white rounded-md hover:bg-[#4a3590] transition-colors"
                    >
                        {showAddForm ? 'Cancel' : 'Add Detail'}
                    </button>
                </div>

                {showAddForm && (
                    <form onSubmit={handleAddDetail} className="mb-4 p-4 bg-gray-50 border border-gray-300">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Details"
                                    value={newDetail.Details}
                                    onChange={(e) => setNewDetail({...newDetail, Details: e.target.value})}
                                    className="w-full px-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f43b2] text-gray-500"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Value"
                                    value={newDetail.Value}
                                    onChange={(e) => setNewDetail({...newDetail, Value: e.target.value})}
                                    className="w-full px-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f43b2] text-gray-500"
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={newDetail.Status}
                                    onChange={(e) => setNewDetail({...newDetail, Status: e.target.value as StatusType})}
                                    className="flex-1 px-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f43b2] text-gray-500"
                                    required
                                >
                                    <option value="" className="text-gray-500">Select Status</option>
                                    {STATUS_OPTIONS.map(status => (
                                        <option key={status} value={status} className="text-gray-500">{status}</option>
                                    ))}
                                </select>
                                <button
                                    type="submit"
                                    className="px-4 py-1 text-xs bg-[#5f43b2] text-white rounded-md hover:bg-[#4a3590] transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Value</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {details.map((detail, index) => (
                                <tr key={detail.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                                    <td className="px-6 py-2 whitespace-nowrap text-[#5f43b2] text-xs">{detail.Details}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-xs text-gray-500">{detail.Value}</td>
                                    <td className={`px-6 py-2 whitespace-nowrap text-xs ${getStatusColor(detail.Status)}`}>
                                        {detail.Status}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-xs">
                                        <button
                                            onClick={() => handleDeleteDetail(detail.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            ×
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-6 pt-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Channel</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {channels.map((channel, index) => (
                                <tr key={channel.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                                    <td className="px-6 py-2 whitespace-nowrap text-[#5f43b2] text-xs">{channel.Channel}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-xs text-gray-500">{channel.Name}</td>
                                    <td className={`px-6 py-2 whitespace-nowrap text-xs ${getStatusColor(channel.Status)}`}>
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
