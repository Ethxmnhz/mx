import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { apiUrl } from '../lib/api';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  AcademicCapIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl('/api/admin/users'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      setDetailsLoading(true);
      const response = await fetch(apiUrl(`/api/admin/users/${userId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch user details');
      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchUserDetails(user.id);
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const badges = {
      'approved': { bg: 'bg-emerald-500/15', text: 'text-emerald-200', border: 'border-emerald-400/30', icon: CheckCircleIcon },
      'COMPLETED': { bg: 'bg-emerald-500/15', text: 'text-emerald-200', border: 'border-emerald-400/30', icon: CheckCircleIcon },
      'active': { bg: 'bg-emerald-500/15', text: 'text-emerald-200', border: 'border-emerald-400/30', icon: CheckCircleIcon },
      'pending': { bg: 'bg-yellow-500/15', text: 'text-yellow-200', border: 'border-yellow-400/30', icon: ClockIcon },
      'PENDING': { bg: 'bg-yellow-500/15', text: 'text-yellow-200', border: 'border-yellow-400/30', icon: ClockIcon },
      'rejected': { bg: 'bg-red-500/15', text: 'text-red-200', border: 'border-red-400/30', icon: XCircleIcon },
      'FAILED': { bg: 'bg-red-500/15', text: 'text-red-200', border: 'border-red-400/30', icon: XCircleIcon },
    };
    const badge = badges[status] || badges['pending'];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  return (
    <AdminLayout title="User Management">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-4 py-4 border-b border-white/10">
            <h2 className="text-white font-semibold mb-3">All Users</h2>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/30 border border-white/10 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-slate-400">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-slate-400">No users found</div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${
                      selectedUser?.id === user.id ? 'bg-emerald-500/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {user.full_name || 'Unnamed User'}
                        </div>
                        <div className="text-xs text-slate-400 truncate">{user.email}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">
                            {user.enrollments?.length || 0} courses
                          </span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-500">
                            {user.transaction_count || 0} transactions
                          </span>
                        </div>
                      </div>
                      {user.is_admin && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-200 border border-purple-400/30">
                          ADMIN
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedUser ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <UsersIcon className="h-16 w-16 mx-auto text-slate-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Select a User</h3>
              <p className="text-sm text-slate-400">Click on a user to view their details and transaction history</p>
            </div>
          ) : detailsLoading ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <div className="text-slate-400">Loading user details...</div>
            </div>
          ) : userDetails ? (
            <>
              {/* User Info Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {userDetails.user.full_name || 'Unnamed User'}
                    </h2>
                    <p className="text-slate-400">{userDetails.user.email}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Joined {new Date(userDetails.user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {userDetails.user.is_admin && (
                    <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-500/20 text-purple-200 border border-purple-400/30">
                      ADMIN
                    </span>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AcademicCapIcon className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs text-slate-400">Enrollments</span>
                    </div>
                    <div className="text-xl font-bold text-white">{userDetails.stats.total_enrollments}</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCardIcon className="h-4 w-4 text-blue-400" />
                      <span className="text-xs text-slate-400">Transactions</span>
                    </div>
                    <div className="text-xl font-bold text-white">{userDetails.stats.total_transactions}</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs text-slate-400">Successful</span>
                    </div>
                    <div className="text-xl font-bold text-emerald-400">{userDetails.stats.successful_payments}</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <ClockIcon className="h-4 w-4 text-yellow-400" />
                      <span className="text-xs text-slate-400">Pending</span>
                    </div>
                    <div className="text-xl font-bold text-yellow-400">{userDetails.stats.pending_payments}</div>
                  </div>
                </div>
              </div>

              {/* Enrollments */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white">Enrolled Courses</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {userDetails.enrollments.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">No enrollments</div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {userDetails.enrollments.map((enrollment) => (
                        <div key={enrollment.id} className="p-4 hover:bg-white/5">
                          <div className="flex items-center gap-3">
                            {enrollment.courses?.thumbnail && (
                              <img
                                src={enrollment.courses.thumbnail}
                                alt={enrollment.courses.title}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">
                                {enrollment.courses?.title || 'Unknown Course'}
                              </div>
                              <div className="text-xs text-slate-400">
                                Enrolled {new Date(enrollment.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(enrollment.status)}
                              <div className="text-xs text-slate-400 mt-1">
                                ₹{enrollment.courses?.price || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Transactions */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white">Payment History</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {userDetails.manual_payments.length === 0 && userDetails.phonepe_orders.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">No transactions</div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {/* Manual Payments */}
                      {userDetails.manual_payments.map((payment) => (
                        <div key={`manual-${payment.id}`} className="p-4 hover:bg-white/5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30">
                                  MANUAL UPI
                                </span>
                                {getStatusBadge(payment.status)}
                              </div>
                              <div className="text-sm font-medium text-white mb-1">
                                {payment.courses?.title || 'Unknown Course'}
                              </div>
                              <div className="text-xs text-slate-400">
                                Transaction ID: {payment.transaction_id || 'N/A'}
                              </div>
                              <div className="text-xs text-slate-500">
                                {new Date(payment.created_at).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-emerald-400">₹{payment.amount}</div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* PhonePe Orders */}
                      {userDetails.phonepe_orders.map((order) => (
                        <div key={`phonepe-${order.id}`} className="p-4 hover:bg-white/5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-400/30">
                                  PHONEPE
                                </span>
                                {getStatusBadge(order.status)}
                              </div>
                              <div className="text-sm font-medium text-white mb-1">
                                {order.courses?.title || 'Unknown Course'}
                              </div>
                              <div className="text-xs text-slate-400">
                                Transaction ID: {order.phonepe_transaction_id || order.merchant_transaction_id || 'N/A'}
                              </div>
                              <div className="text-xs text-slate-500">
                                {new Date(order.created_at).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-emerald-400">₹{order.amount}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}
