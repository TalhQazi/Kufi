import React, { useState, useEffect, useMemo } from "react";
import { Search, MapPin, Users, Clock, ArrowRightLeft, Eye, CheckCircle, XCircle } from "lucide-react";
import api from "../../api";

const SupplierManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [supplierHistory, setSupplierHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    
    // Transfer logic
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [bookingToTransfer, setBookingToTransfer] = useState(null);
    const [allSuppliersList, setAllSuppliersList] = useState([]);
    const [transferLoading, setTransferLoading] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users');
            const data = Array.isArray(response.data) ? response.data : (response.data.users || []);
            const filtered = data.filter(u => (u.role || '').toLowerCase() === 'supplier');
            setSuppliers(filtered);
            setAllSuppliersList(filtered);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSupplierHistory = async (supplierId) => {
        try {
            setHistoryLoading(true);
            const response = await api.get(`/admin/suppliers/${supplierId}/history`);
            setSupplierHistory(response.data || []);
        } catch (error) {
            console.error("Error fetching history:", error);
            setSupplierHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleViewSupplier = (supplier) => {
        setSelectedSupplier(supplier);
        fetchSupplierHistory(supplier._id);
        setHistoryModalOpen(true);
    };

    const handleOpenTransfer = (booking) => {
        setBookingToTransfer(booking);
        setTransferModalOpen(true);
    };

    const handleTransfer = async (targetSupplierId) => {
        if (!bookingToTransfer || !targetSupplierId) return;
        if (!window.confirm("Are you sure you want to transfer this request?")) return;

        try {
            setTransferLoading(true);
            await api.patch(`/bookings/${bookingToTransfer._id}/transfer`, { supplierId: targetSupplierId });
            alert("Request transferred successfully!");
            setTransferModalOpen(false);
            setBookingToTransfer(null);
            // Refresh history if we're in a modal
            if (selectedSupplier) {
                fetchSupplierHistory(selectedSupplier._id);
            }
        } catch (error) {
            console.error("Error transferring request:", error);
            alert("Failed to transfer request");
        } finally {
            setTransferLoading(false);
        }
    };

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s => 
            (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [suppliers, searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Suppliers</h1>
                    <p className="text-sm text-gray-500 mt-1">Oversee supplier performance, history, and request assignments</p>
                </div>
                <div className="flex items-center bg-white border border-gray-100 rounded-2xl px-4 py-2.5 shadow-sm w-full sm:w-72">
                    <Search className="w-4 h-4 mr-2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        className="flex-1 bg-transparent outline-none text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gray-100 rounded-full"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-gray-100 rounded"></div>
                                    <div className="h-3 w-32 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                            <div className="h-10 bg-gray-50 rounded-xl"></div>
                        </div>
                    ))
                ) : filteredSuppliers.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100">
                        <Users className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                        <p className="text-gray-500">No suppliers found.</p>
                    </div>
                ) : (
                    filteredSuppliers.map((supplier) => (
                        <div key={supplier._id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-[#704b24]/10 text-[#704b24] flex items-center justify-center font-bold text-lg">
                                        {supplier.name?.charAt(0) || 'S'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 group-hover:text-[#704b24] transition-colors">{supplier.name}</h3>
                                        <p className="text-xs text-gray-500">{supplier.email}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    supplier.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                    {supplier.status || 'Active'}
                                </span>
                            </div>

                            {/* Verification Status */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                    supplier.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {supplier.isVerified ? 'Verified' : 'Pending'}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    License: {supplier.businessLicenseStatus || 'pending'}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    Profile: {supplier.businessProfileStatus || 'pending'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50 mb-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Score</p>
                                    <p className="text-sm font-bold text-slate-700">{supplier.scorePoints || 0}/100</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Joined</p>
                                    <p className="text-sm font-medium text-slate-700">
                                        {supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {!supplier.isVerified && (
                                    <button
                                        onClick={async () => {
                                            if (!window.confirm(`Verify supplier ${supplier.name}?`)) return;
                                            try {
                                                await api.put(`/admin/suppliers/${supplier._id}/verify-all`);
                                                alert("Supplier verified successfully!");
                                                fetchSuppliers();
                                            } catch (error) {
                                                console.error("Error verifying supplier:", error);
                                                alert("Failed to verify supplier");
                                            }
                                        }}
                                        className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-emerald-100 transition-all"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Verify
                                    </button>
                                )}
                                <button
                                    onClick={() => handleViewSupplier(supplier)}
                                    className="flex-1 py-3 bg-gray-50 text-slate-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#704b24] hover:text-white transition-all shadow-sm"
                                >
                                    <Eye className="w-4 h-4" />
                                    View
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Supplier History Modal */}
            {historyModalOpen && selectedSupplier && (
                <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Supplier Page: {selectedSupplier.name}</h2>
                                <p className="text-sm text-gray-500">History of assigned requests and status</p>
                            </div>
                            <button
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                onClick={() => setHistoryModalOpen(false)}
                            >
                                <XCircle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8">
                            {historyLoading ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#704b24]"></div>
                                </div>
                            ) : supplierHistory.length === 0 ? (
                                <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No request history found for this supplier.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {supplierHistory.map((booking) => (
                                        <div key={booking._id} className="group border border-gray-100 rounded-2xl p-5 hover:border-[#704b24]/30 hover:bg-[#f7f1e7]/10 transition-all">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                                                        <Users className="w-5 h-5 text-[#704b24]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{booking.travelerName}</p>
                                                        <p className="text-xs text-gray-400">{booking.travelerEmail}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                                                        booking.status === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                                                        'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        {booking.status}
                                                    </span>
                                                    <button
                                                        onClick={() => handleOpenTransfer(booking)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Transfer Request"
                                                    >
                                                        <ArrowRightLeft className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs pt-4 border-t border-gray-50">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span>{booking.tripDetails?.country || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[#704b24] font-bold">
                                                    Budget: {booking.tripDetails?.budget || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {transferModalOpen && bookingToTransfer && (
                <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-8 space-y-6">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ArrowRightLeft className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Transfer Request</h3>
                                <p className="text-sm text-gray-500">
                                    Reassign <span className="font-bold text-slate-700">{bookingToTransfer.travelerName}'s</span> request to another supplier.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Select New Supplier</label>
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                    {allSuppliersList
                                        .filter(s => s._id !== (selectedSupplier?._id))
                                        .map(s => (
                                            <button
                                                key={s._id}
                                                onClick={() => handleTransfer(s._id)}
                                                disabled={transferLoading}
                                                className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-[#704b24]/50 hover:bg-[#f7f1e7]/30 transition-all text-left group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-50 text-[#704b24] flex items-center justify-center font-bold text-sm group-hover:bg-white transition-colors">
                                                        {s.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{s.name}</p>
                                                        <p className="text-[10px] text-gray-400">{s.scorePoints || 0} pts • {s.country || 'Global'}</p>
                                                    </div>
                                                </div>
                                                <CheckCircle className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setTransferModalOpen(false)}
                                    className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierManagement;
