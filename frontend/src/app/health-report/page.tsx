'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'; // Added for navigation
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

// Helper function to parse the Details string
const parseDetailsString = (detailsString: string): { [key: string]: string } => {
    if (!detailsString) return {};
    return detailsString.split(', ').reduce((acc, pair) => {
        const [key, ...valueParts] = pair.split(':');
        const value = valueParts.join(':').trim();
        if (key) {
            acc[key.trim()] = value;
        }
        return acc;
    }, {} as { [key: string]: string });
};

// Renamed component
export default function HealthReport() {
    const [details, setDetails] = useState<DetailRow[]>([]);
    const [channels, setChannels] = useState<ChannelRow[]>([]);
    // Removed threshold state as it wasn't used
    const [showAddForm, setShowAddForm] = useState(false);
    const [newDetail, setNewDetail] = useState({
        Details: '',
        Value: '',
        Status: '' as StatusType,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);

    // States for Visualization (using details data)
    const [selectedFeature, setSelectedFeature] = useState<string>('');
    const [detailFeatures, setDetailFeatures] = useState<string[]>([]); // Holds unique keys from Details string

    useEffect(() => {
        fetchDetailsAndChannels();
    }, []);

    const fetchDetailsAndChannels = async () => {
        try {
            const res = await fetch('/api/dashboard'); // Using the existing API endpoint
            const data = await res.json();
            setDetails(data.details);
            setChannels(data.channels);

            // Adjust current page if needed
            setCurrentPage(prev => {
                const totalPages = Math.ceil(data.details.length / itemsPerPage);
                return prev > totalPages ? Math.max(1, totalPages) : prev;
            });

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Effect to derive features from details data
    useEffect(() => {
        if (details.length > 0) {
            const allKeys = new Set<string>();
            details.forEach((detail: DetailRow) => { // Ensure type hint is present
                const parsed = parseDetailsString(detail.Details);
                Object.keys(parsed).forEach(key => allKeys.add(key));
            });
            const features = Array.from(allKeys).sort();
            setDetailFeatures(features);
            setSelectedFeature(''); // Reset feature selection when details change
        } else {
            setDetailFeatures([]);
            setSelectedFeature('');
        }
    }, [details]); // Re-run ONLY when details data changes

    const handleAddDetail = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/dashboard/detail', { // Using the existing API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newDetail),
            });

            if (!response.ok) throw new Error('Failed to add detail');

            await fetchDetailsAndChannels(); // Refresh data

            setNewDetail({ Details: '', Value: '', Status: '' as StatusType });
            setShowAddForm(false);
        } catch (error) {
            console.error('Error adding detail:', error);
        }
    };

    const handleDeleteDetail = async (id: number) => {
        try {
            const response = await fetch(`/api/dashboard/detail/${id}`, { // Using the existing API endpoint
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete detail');

            await fetchDetailsAndChannels(); // Refresh data
        } catch (error) {
            console.error('Error deleting detail:', error);
        }
    };

    // Calculate current items for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDetails = details.slice(indexOfFirstItem, indexOfLastItem);

    // Determine dynamic headers for the table
    const dynamicHeaders =
        currentDetails.length > 0 ? Object.keys(parseDetailsString(currentDetails[0].Details)) : [];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'inactive': return 'text-red-600';
            case 'active': return 'text-green-600';
            case 'pending': return 'text-yellow-600';
            case 'standby': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    // formatFileSize removed - it was only for the file upload display

    // Prepare chart data when a feature is selected
    let chartData = null;
    if (details.length > 0 && selectedFeature) {
        const chartLabels: string[] = [];
        const chartValues: number[] = [];

        details.forEach((detail: DetailRow) => {
            const parsed = parseDetailsString(detail.Details);
            const valueStr = parsed[selectedFeature];
            if (valueStr !== undefined) {
                const valueNum = Number(valueStr);
                if (!isNaN(valueNum)) {
                    chartLabels.push(`ID ${detail.id}`);
                    chartValues.push(valueNum);
                }
            }
        });

        if (chartValues.length > 0 && chartValues.length === chartLabels.length) {
            chartData = {
                labels: chartLabels,
                datasets: [
                    {
                        label: selectedFeature,
                        data: chartValues,
                        borderColor: 'rgba(75,192,192,1)',
                        backgroundColor: 'rgba(75,192,192,0.2)',
                        fill: false,
                    },
                ],
            };
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Navigation */}
             <nav className="mb-6">
                <Link href="/" className="text-blue-600 hover:underline">
                    &larr; Back to Home
                </Link>
            </nav>

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                {/* Updated Title */}
                <h1 className="font-bold text-2xl text-[#5f43b2]">Health Report</h1>
                {/* Removed file upload button */}
            </div>

            {/* System Details Table */}
            <div className="mb-8 bg-white p-6 pt-4 pb-2 rounded-lg shadow">
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
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Details (key:value,...)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Temp: 25, Voltage: 1.2"
                                    value={newDetail.Details}
                                    onChange={(e) => setNewDetail({ ...newDetail, Details: e.target.value })}
                                    className="w-full px-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f43b2] text-gray-700"
                                    required
                                />
                            </div>
                            <div>
                                 <label className="block text-xs font-medium text-gray-700 mb-1">Value (Overall)</label>
                                <input
                                    type="text"
                                    placeholder="Overall Value"
                                    value={newDetail.Value}
                                    onChange={(e) => setNewDetail({ ...newDetail, Value: e.target.value })}
                                    className="w-full px-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f43b2] text-gray-700"
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                 <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={newDetail.Status}
                                        onChange={(e) => setNewDetail({ ...newDetail, Status: e.target.value as StatusType })}
                                        className="w-full px-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f43b2] text-gray-900"
                                        required
                                    >
                                        <option value="" disabled>Select Status</option>
                                        {STATUS_OPTIONS.map((status) => (
                                            <option key={status} value={status} className="text-gray-900">
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="self-end px-4 py-1 text-xs bg-[#5f43b2] text-white rounded-md hover:bg-[#4a3590] transition-colors"
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
                                {dynamicHeaders.map((header) => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        {header}
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Value</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-10"></th> {/* Action column */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentDetails.map((detail, index) => {
                                const parsedDetails = parseDetailsString(detail.Details);
                                return (
                                    <tr key={detail.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                                        {dynamicHeaders.map((header) => (
                                            <td key={header} className="px-6 py-2 whitespace-nowrap text-xs text-gray-700">
                                                {parsedDetails[header] || '--'} {/* Display '--' if key missing */}
                                            </td>
                                        ))}
                                        <td className="px-6 py-2 whitespace-nowrap text-xs text-gray-700">{detail.Value}</td>
                                        <td className={`px-6 py-2 whitespace-nowrap text-xs font-medium ${getStatusColor(detail.Status)}`}>{detail.Status}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-xs text-center">
                                            <button
                                                onClick={() => handleDeleteDetail(detail.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete"
                                            >
                                                &times; {/* Multiplication sign for 'x' */}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {currentDetails.length === 0 && (
                                <tr>
                                    <td colSpan={dynamicHeaders.length + 3} className="text-center py-4 text-sm text-gray-500">
                                        No system details available.
                                    </td>
                                </tr>
                             )}
                        </tbody>
                    </table>
                </div>

                {details.length > itemsPerPage && ( // Show pagination only if needed
                    <div className="flex justify-end items-center gap-4 mt-4">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-xs bg-[#5f43b2] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-xs text-gray-500">
                            Page {currentPage} of {Math.ceil(details.length / itemsPerPage)}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(details.length / itemsPerPage), p + 1))}
                            disabled={currentPage === Math.ceil(details.length / itemsPerPage)}
                            className="px-3 py-1 text-xs bg-[#5f43b2] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Details Visualization Section */}
            {details.length > 0 && (
                <div className="mb-8 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-[#5f43b2] mb-4">Details Visualization</h2>
                    {detailFeatures.length > 0 ? (
                        <>
                            <div className="mb-4">
                                <label htmlFor="feature-select" className="block text-xs font-medium text-gray-700 mb-1">Select Feature to Visualize:</label>
                                <select
                                    id="feature-select"
                                    value={selectedFeature}
                                    onChange={(e) => setSelectedFeature(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f43b2] text-sm text-gray-900"
                                >
                                    <option value="">-- Select --</option>
                                    {detailFeatures.map((feature) => (
                                        <option key={feature} value={feature} className="text-gray-900">
                                            {feature}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedFeature && chartData && (
                                <div style={{height: '300px'}}> {/* Added height constraint */}
                                    <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </div>
                            )}
                            {!selectedFeature && (
                                <p className="text-xs text-gray-500">Please select a feature from the dropdown above to visualize.</p>
                            )}
                            {selectedFeature && !chartData && (
                                <p className="text-xs text-red-500">Could not generate chart for '{selectedFeature}'. Ensure this feature exists in the details and contains valid numerical data.</p>
                            )}
                        </>
                     ) : (
                         <p className="text-sm text-gray-500">No plottable features found in the details data.</p>
                     )}
                </div>
            )}

            {/* Channel Data Table */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-[#5f43b2] mb-4">Channel Data</h2>
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
                                    <td className="px-6 py-2 whitespace-nowrap text-xs text-gray-700">{channel.Name}</td>
                                    <td className={`px-6 py-2 whitespace-nowrap text-xs font-medium ${getStatusColor(channel.Status)}`}>
                                        {channel.Status}
                                    </td>
                                </tr>
                            ))}
                             {channels.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center py-4 text-sm text-gray-500">
                                        No channel data available.
                                    </td>
                                </tr>
                             )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}