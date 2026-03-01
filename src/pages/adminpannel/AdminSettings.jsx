import React, { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus, Shield, Mail, Phone, Search } from 'lucide-react';
import api from '../../api';

const AdminSettings = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        name: '',
        username: '',
        password: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/all');
            setAdmins(res.data);
        } catch (error) {
            console.error('Error fetching admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/create', newAdmin);
            alert('Admin added successfully');
            setShowAddModal(false);
            setNewAdmin({ name: '', username: '', password: '', email: '', phone: '' });
            fetchAdmins();
        } catch (error) {
            console.error('Error creating admin:', error);
            alert(error.response?.data?.message || 'Failed to create admin');
        }
    };

    const handleDeleteAdmin = async (id) => {
        if (!window.confirm('Are you sure you want to delete this admin?')) return;
        try {
            await api.delete(`/admin/${id}`);
            fetchAdmins();
        } catch (error) {
            console.error('Error deleting admin:', error);
            alert(error.response?.data?.message || 'Failed to delete admin');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage system administrators and permissions</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 bg-[#704b24] hover:bg-[#5a3c1d] text-white px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                >
                    <UserPlus className="w-5 h-5" />
                    <span className="font-medium">Add New Admin</span>
                </button>
            </div>

           
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-[#704b24]" />
                        <h2 className="font-semibold text-slate-900">Administrator Accounts</h2>
                    </div>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                        {admins.length} Total
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Username</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {admins.map((admin) => (
                                <tr key={admin._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#704b24]/10 text-[#704b24] flex items-center justify-center font-bold text-sm">
                                                {admin.name?.charAt(0) || 'A'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm">{admin.name}</p>
                                                <p className="text-xs text-gray-400">Super Admin</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                                        @{admin.username}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Mail className="w-3.5 h-3.5" />
                                                {admin.email || '-'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Phone className="w-3.5 h-3.5" />
                                                {admin.phone || '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDeleteAdmin(admin._id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove Admin"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

           
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-slate-900">Add New Administrator</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                    value={newAdmin.name}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Username</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="johndoe"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                    value={newAdmin.username}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Password</label>
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Email</label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                        value={newAdmin.email}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Phone</label>
                                    <input
                                        type="tel"
                                        placeholder="+1 234 567 890"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                        value={newAdmin.phone}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-slate-600 font-medium hover:bg-gray-50 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#704b24] hover:bg-[#5a3c1d] text-white px-4 py-3 rounded-xl font-medium transition-all shadow-sm active:scale-95 text-sm"
                                >
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
