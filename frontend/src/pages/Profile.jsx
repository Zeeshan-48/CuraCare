import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, Mail } from 'lucide-react';

import { updateUserProfile } from '../features/auth/authSlice.js';
import { updateProfileApi, uploadImageApi, getErrorMessage, getMyOrdersApi } from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

// Profile details validation schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
});

// Password change validation schema
const passwordChangeSchema = z
  .object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ['confirmPassword'],
  });

const Profile = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const user = useSelector((state) => state.auth.user);

  const [avatarPreview, setAvatarPreview] = useState(user?.profileImage || '');

  const [orders, setOrders] = useState([]);
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem(`reminders_${user?._id}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrdersApi();
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Extract unique items ordered by the user
  const orderedMedicines = [];
  const seenMedicines = new Set();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const medId = item.productId || item._id;
      if (medId && !seenMedicines.has(medId)) {
        seenMedicines.add(medId);
        orderedMedicines.push(item);
      }
    });
  });

  const handleAddReminder = (medicineName, days) => {
    const newReminder = {
      id: Math.random().toString(36).substr(2, 9),
      name: medicineName,
      days,
      nextRefillDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString(),
    };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    localStorage.setItem(`reminders_${user?._id}`, JSON.stringify(updated));
    showToast(`Refill reminder set for ${medicineName} in ${days} days.`, 'success');
  };

  const handleCancelReminder = (id, name) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    localStorage.setItem(`reminders_${user?._id}`, JSON.stringify(updated));
    showToast(`Reminder for ${name} cancelled.`, 'info');
  };

  // 1. Profile details form setup
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  // Keep form in sync when user resolves or updates
  useEffect(() => {
    if (user) {
      resetProfileForm({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user, resetProfileForm]);

  // 2. Change password form setup
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordChangeSchema),
  });

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        showToast('Uploading profile picture to secure server...', 'info');
        const uploadResult = await uploadImageApi(file);
        const imageUrl = uploadResult.url;
        setAvatarPreview(imageUrl);
        
        const updatedUser = await updateProfileApi({ profileImage: imageUrl });
        dispatch(updateUserProfile(updatedUser));
        showToast('Profile image updated successfully.', 'success');
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      }
    }
  };

  const onProfileUpdate = async (data) => {
    try {
      const updatedUser = await updateProfileApi({ name: data.name, phone: data.phone });
      dispatch(updateUserProfile(updatedUser));
      showToast('Profile information saved.', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  const onPasswordUpdate = async (data) => {
    try {
      const updatedUser = await updateProfileApi({ password: data.newPassword });
      dispatch(updateUserProfile(updatedUser));
      resetPasswordForm();
      showToast('Password changed successfully.', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold font-display text-txt-title">
          My Account
        </h1>
        <p className="text-sm text-dark-500 mt-1">
          Manage your personal details, profile picture, contact phone numbers, and security options.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Profile Card & Avatar */}
        <div className="lg:col-span-1 glass-panel p-8 rounded-3xl flex flex-col items-center text-center">
          <div className="relative group cursor-pointer">
            <div className="w-32 h-32 rounded-full bg-primary-50 dark:bg-primary-950/80 border-2 border-primary-500/20 flex items-center justify-center text-primary-500 overflow-hidden text-4xl font-display font-bold">
              {avatarPreview ? (
                <img src={avatarPreview} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            {/* Upload Hover Overlay */}
            <label className="absolute inset-0 bg-dark-950/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={24} />
              <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
            </label>
          </div>

          <h2 className="text-xl font-bold font-display text-txt-title mt-5">
            {user?.name}
          </h2>
          <span className="px-2.5 py-0.5 rounded bg-primary-100 dark:bg-primary-950 text-primary-500 text-[10px] font-bold uppercase tracking-wider mt-1.5 font-display">
            {user?.role} Account
          </span>

          <p className="text-xs text-dark-400 mt-6 flex items-center gap-1.5">
            <Mail size={12} />
            {user?.email}
          </p>
        </div>

        {/* Edit Info Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="glass-panel p-8 rounded-3xl">
            <h3 className="font-display font-bold text-lg text-txt-title mb-6">
              General Information
            </h3>
            <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4">
              <Input
                label="Full Name"
                error={profileErrors.name?.message}
                {...registerProfile('name')}
              />
              <Input
                label="Phone Number"
                placeholder="+1 (555) 019-2834"
                error={profileErrors.phone?.message}
                {...registerProfile('phone')}
              />
              <div className="text-right">
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="glass-panel p-8 rounded-3xl">
            <h3 className="font-display font-bold text-lg text-txt-title mb-6">
              Change Security Password
            </h3>
            <form onSubmit={handlePasswordSubmit(onPasswordUpdate)} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                error={passwordErrors.oldPassword?.message}
                {...registerPassword('oldPassword')}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Min 6 characters"
                error={passwordErrors.newPassword?.message}
                {...registerPassword('newPassword')}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm password"
                error={passwordErrors.confirmPassword?.message}
                {...registerPassword('confirmPassword')}
              />
              <div className="text-right">
                <Button type="submit" variant="primary">
                  Change Password
                </Button>
              </div>
            </form>
          </div>

          {/* Automated Refill Reminders Card */}
          <div className="glass-panel p-8 rounded-3xl">
            <h3 className="font-display font-bold text-lg text-txt-title mb-2">
              Refill Reminders & Subscriptions
            </h3>
            <p className="text-xs text-txt-muted mb-6">
              Never run out of your essential maintenance medications. Set up recurring refill alerts for products you have purchased.
            </p>

            <div className="space-y-6">
              {/* Active Reminders List */}
              <div>
                <h4 className="font-semibold text-sm text-txt-title mb-3">Active Refill Alerts</h4>
                {reminders.length > 0 ? (
                  <div className="space-y-3">
                    {reminders.map((rem) => (
                      <div key={rem.id} className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-txt-title">{rem.name}</p>
                          <p className="text-[10px] text-dark-450 mt-0.5">
                            Alert every {rem.days} days • Next refill: <span className="font-semibold text-primary-500">{rem.nextRefillDate}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleCancelReminder(rem.id, rem.name)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold cursor-pointer transition-colors shrink-0"
                        >
                          Cancel Alert
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-dark-400 italic">No active refill alerts scheduled.</p>
                )}
              </div>

              {/* Set Reminder for purchased items */}
              <div className="border-t border-dark-100 dark:border-dark-850 pt-6">
                <h4 className="font-semibold text-sm text-txt-title mb-3">Order History Medicines</h4>
                {orderedMedicines.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {orderedMedicines.map((med, idx) => {
                      const hasReminder = reminders.some((r) => r.name === med.name);
                      return (
                        <div key={idx} className="p-3 bg-bg-panel border border-bdr-main rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <p className="font-semibold text-txt-title">{med.name}</p>
                            <p className="text-[10px] text-dark-450 mt-0.5">Purchased at ${med.price.toFixed(2)}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {hasReminder ? (
                              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 font-bold rounded-lg text-[10px] uppercase">
                                Scheduled
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleAddReminder(med.name, 30)}
                                  className="px-2.5 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold cursor-pointer transition-colors"
                                >
                                  30 Days
                                </button>
                                <button
                                  onClick={() => handleAddReminder(med.name, 60)}
                                  className="px-3 py-1 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-semibold cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 shadow-sm hover:shadow-accent-500/25"
                                >
                                  60 Days
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-dark-400 italic">
                    Purchase items to set up automatic refill alerts.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
