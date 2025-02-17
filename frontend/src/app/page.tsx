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

export default function Dashboard() {
    const [details, setDetails] = useState<DetailRow[]>([]);
    const [channels, setChannels] = useState<ChannelRow[]>([]);

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
            case 'active': return 'text-green-600';
            case 'inactive': return 'text-red-600';
            case 'pending': return 'text-yellow-600';
            case 'standby': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="font-bold text-lg pl-6 text-[#5f43b2]">Board Diagnostics - Field Test</h1>
            <div className="mb-8 bg-white p-6 pt-4 pb-2">
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Value</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
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