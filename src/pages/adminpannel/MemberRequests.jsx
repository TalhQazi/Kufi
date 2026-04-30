import React, { useState, useEffect } from 'react';
import { Loader2, Trash2, Mail, Calendar, Search, Download } from 'lucide-react';
import api from '../../api';

export default function MemberRequests({ darkMode }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/newsletter/requests');
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this request?')) return;
        try {
            setDeleting(id);
            await api.delete(`/newsletter/${id}`);
            setRequests(prev => prev.filter(r => r._id !== id));
        } catch (error) {
            console.error('Error deleting request:', error);
            alert('Failed to delete request');
        } finally {
            setDeleting(null);
        }
    };

    const filteredRequests = requests.filter(r => 
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ['Email', 'Subscription Date', 'Status'];
        const data = filteredRequests.map(r => [
            r.email,
            new Date(r.createdAt).toLocaleString(),
            r.status
        ]);
        
        const csvContent = [
            headers.join(','),
            ...data.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `membership_requests_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className={`h-8 w-8 animate-spin ${darkMode ? 'text-blue-400' : 'text-[#704b24]'}`} />
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Become a Member Requests</h1>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        View and manage newsletter subscription requests
                    </p>
                </div>
                <button
                    onClick={exportToCSV}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 ${darkMode ? 'bg-blue-600' : 'bg-[#704b24]'}`}
                >
                    <Download className="h-4 w-4" />
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors focus:ring-2 focus:ring-opacity-50 ${
                            darkMode 
                                ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500' 
                                : 'bg-white border-gray-300 text-gray-900 focus:ring-[#704b24] focus:border-[#704b24]'
                        }`}
                    />
                </div>
            </div>

            {/* Table */}
            <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Email Address</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Request Date</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((request) => (
                                    <tr key={request._id} className={`${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'} transition-colors`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-[#704b24]/10'}`}>
                                                    <Mail className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-[#704b24]'}`} />
                                                </div>
                                                <span className="font-medium">{request.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(request.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                request.status === 'active'
                                                    ? (darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700')
                                                    : (darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600')
                                            }`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(request._id)}
                                                disabled={deleting === request._id}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    darkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'
                                                }`}
                                            >
                                                {deleting === request._id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                        No membership requests found.
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
