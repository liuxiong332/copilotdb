'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { 
    User as UserIcon, 
    Mail, 
    Calendar, 
    Shield, 
    Settings, 
    Save,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff
} from 'lucide-react'
import { UserProfile, UserPreferences } from '@database-gui/types'
import { dashboardService } from '@/lib/dashboard-service'
import { useAuth } from '@/contexts/AuthContext'

interface ProfilePageProps {
    user: User
}

export default function ProfilePage({ user }: ProfilePageProps) {
    const { updatePassword } = useAuth()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [preferences, setPreferences] = useState<UserPreferences>({
        theme: 'system',
        defaultQueryLimit: 100,
        autoSaveQueries: true,
        showQueryExecutionTime: true,
        defaultResultView: 'table',
        enableAIAssistance: true,
        language: 'en'
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    
    // Password change form
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    })

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profileData = await dashboardService.getUserProfile(user.id)
                if (profileData) {
                    setProfile(profileData)
                    if (profileData.preferences) {
                        setPreferences(profileData.preferences)
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error)
                setMessage({ type: 'error', text: 'Failed to load profile data' })
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [user.id])

    const handleSavePreferences = async () => {
        setSaving(true)
        setMessage(null)

        try {
            const success = await dashboardService.updateUserProfile(user.id, {
                preferences
            })

            if (success) {
                setMessage({ type: 'success', text: 'Preferences saved successfully' })
            } else {
                setMessage({ type: 'error', text: 'Failed to save preferences' })
            }
        } catch (error) {
            console.error('Error saving preferences:', error)
            setMessage({ type: 'error', text: 'Failed to save preferences' })
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' })
            return
        }

        if (passwordForm.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters long' })
            return
        }

        setSaving(true)

        try {
            const success = await updatePassword(passwordForm.newPassword)
            if (success) {
                setMessage({ type: 'success', text: 'Password updated successfully' })
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                setShowPasswordForm(false)
            } else {
                setMessage({ type: 'error', text: 'Failed to update password' })
            }
        } catch (error) {
            console.error('Error updating password:', error)
            setMessage({ type: 'error', text: 'Failed to update password' })
        } finally {
            setSaving(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getSubscriptionDisplayName = (tier: string) => {
        switch (tier) {
            case 'pro': return 'Pro Plan'
            case 'enterprise': return 'Enterprise Plan'
            default: return 'Free Plan'
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Manage your account information and preferences.
                </p>
            </div>

            {/* Message */}
            {message && (
                <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {message.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 text-green-400" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-400" />
                            )}
                        </div>
                        <div className="ml-3">
                            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                                {message.text}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Information */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">User ID</p>
                                    <p className="text-sm text-gray-600 font-mono">{user.id}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center">
                                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Email Address</p>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <Shield className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Subscription</p>
                                    <p className="text-sm text-gray-600">
                                        {profile ? getSubscriptionDisplayName(profile.subscription_tier) : 'Free Plan'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center">
                                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Member Since</p>
                                    <p className="text-sm text-gray-600">
                                        {profile ? formatDate(profile.created_at) : formatDate(user.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Security</h3>
                </div>
                <div className="p-6">
                    {!showPasswordForm ? (
                        <div>
                            <p className="text-sm text-gray-600 mb-4">
                                Change your password to keep your account secure.
                            </p>
                            <button
                                onClick={() => setShowPasswordForm(true)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Change Password
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                                    Current Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        id="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                    >
                                        {showPasswords.current ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        id="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                    >
                                        {showPasswords.new ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm New Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        id="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                    >
                                        {showPasswords.confirm ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Update Password
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordForm(false)
                                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                                    }}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
                </div>
                <div className="p-6">
                    <div className="space-y-6">
                        {/* Theme */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Theme
                            </label>
                            <select
                                value={preferences.theme}
                                onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' | 'system' }))}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="system">System Default</option>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>

                        {/* Default Query Limit */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Default Query Limit
                            </label>
                            <select
                                value={preferences.defaultQueryLimit}
                                onChange={(e) => setPreferences(prev => ({ ...prev, defaultQueryLimit: parseInt(e.target.value) }))}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value={50}>50 rows</option>
                                <option value={100}>100 rows</option>
                                <option value={500}>500 rows</option>
                                <option value={1000}>1000 rows</option>
                            </select>
                        </div>

                        {/* Default Result View */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Default Result View
                            </label>
                            <select
                                value={preferences.defaultResultView}
                                onChange={(e) => setPreferences(prev => ({ ...prev, defaultResultView: e.target.value as 'table' | 'tree' | 'json' }))}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="table">Table</option>
                                <option value="tree">Tree</option>
                                <option value="json">JSON</option>
                            </select>
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    id="autoSaveQueries"
                                    type="checkbox"
                                    checked={preferences.autoSaveQueries}
                                    onChange={(e) => setPreferences(prev => ({ ...prev, autoSaveQueries: e.target.checked }))}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="autoSaveQueries" className="ml-2 block text-sm text-gray-900">
                                    Auto-save queries to history
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="showQueryExecutionTime"
                                    type="checkbox"
                                    checked={preferences.showQueryExecutionTime}
                                    onChange={(e) => setPreferences(prev => ({ ...prev, showQueryExecutionTime: e.target.checked }))}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="showQueryExecutionTime" className="ml-2 block text-sm text-gray-900">
                                    Show query execution time
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="enableAIAssistance"
                                    type="checkbox"
                                    checked={preferences.enableAIAssistance}
                                    onChange={(e) => setPreferences(prev => ({ ...prev, enableAIAssistance: e.target.checked }))}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="enableAIAssistance" className="ml-2 block text-sm text-gray-900">
                                    Enable AI assistance
                                </label>
                            </div>
                        </div>

                        {/* Save button */}
                        <div className="pt-4">
                            <button
                                onClick={handleSavePreferences}
                                disabled={saving}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Preferences
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}