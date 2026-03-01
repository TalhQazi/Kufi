import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Upload, Key } from 'lucide-react';
import api from '../../api';

const AdminProfile = () => {
    const [profile, setProfile] = useState({
        name: 'Admin User',
        email: 'admin@kufi.com',
        phone: '',
        phone: '',
        role: 'Administrator',
        image: ''
    });
    const fileInputRef = React.useRef(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/profile');
            setProfile(res.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            await api.put('/admin/profile', {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                image: profile.image 
            });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        try {
            await api.post('/admin/change-password', {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            alert('Password changed successfully!');
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordError('');
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Failed to change password');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Profile</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center shadow-sm">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-[#704b24] border-2 border-white shadow-md mb-3 overflow-hidden">
                                {profile.image ? (
                                    <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    profile.name?.charAt(0) || 'A'
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-2 right-0 p-1.5 bg-[#704b24] text-white rounded-full hover:bg-[#5a3c1d] transition-colors shadow-sm"
                            >
                                <Upload className="w-3.5 h-3.5" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                        <h2 className="font-bold text-slate-900 text-lg">{profile.name}</h2>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                        <span className="mt-3 px-3 py-1 bg-[#704b24]/10 text-[#704b24] text-xs font-semibold rounded-full">
                            {profile.role || 'Super Admin'}
                        </span>
                    </div>
                </div>

               
                <div className="md:col-span-2 space-y-6">
                   
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                            <User className="w-5 h-5 text-[#704b24]" />
                            <h3 className="font-semibold text-slate-900">Personal Information</h3>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Full Name</label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Email Address</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-[#704b24] hover:bg-[#5a3c1d] text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                  
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                            <Key className="w-5 h-5 text-[#704b24]" />
                            <h3 className="font-semibold text-slate-900">Change Password</h3>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            {passwordError && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                                    {passwordError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Current Password</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={passwords.oldPassword}
                                        onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">New Password</label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={passwords.confirmPassword}
                                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
