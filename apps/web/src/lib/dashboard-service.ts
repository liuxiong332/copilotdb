import { createClient } from './supabase'
import { UserProfile, UsageStats, Payment } from '@database-gui/types'

export class DashboardService {
    private supabase = createClient()

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await this.supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching user profile:', error)
            return null
        }

        return data
    }

    async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
        const { error } = await this.supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', userId)

        if (error) {
            console.error('Error updating user profile:', error)
            return false
        }

        return true
    }

    async getUsageStats(userId: string): Promise<UsageStats | null> {
        const { data: profile } = await this.supabase
            .from('user_profiles')
            .select('subscription_tier, ai_usage_count, ai_usage_reset_date')
            .eq('id', userId)
            .single()

        if (!profile) return null

        // Get subscription limits based on tier
        const limits = this.getSubscriptionLimits(profile.subscription_tier)

        // Get connection count
        const { count: connectionsUsed } = await this.supabase
            .from('saved_connections')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_active', true)

        // Calculate period dates
        const resetDate = new Date(profile.ai_usage_reset_date)
        const now = new Date()
        const periodEnd = new Date(resetDate)
        periodEnd.setMonth(periodEnd.getMonth() + 1)

        return {
            user_id: userId,
            period_start: resetDate.toISOString(),
            period_end: periodEnd.toISOString(),
            ai_queries_used: profile.ai_usage_count,
            ai_queries_limit: limits.aiQueriesPerMonth,
            connections_used: connectionsUsed || 0,
            connections_limit: limits.maxConnections,
            storage_used: 0, // Not implemented yet
            storage_limit: 1024 * 1024 * 1024 // 1GB default
        }
    }

    async getDownloadStats(userId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .from('downloads')
            .select('*')
            .eq('user_id', userId)
            .order('downloaded_at', { ascending: false })

        if (error) {
            console.error('Error fetching download stats:', error)
            return []
        }

        return data || []
    }

    async getPaymentHistory(userId: string): Promise<Payment[]> {
        const { data, error } = await this.supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching payment history:', error)
            return []
        }

        return data || []
    }

    async recordDownload(userId: string, platform: 'windows' | 'macos', version: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('downloads')
            .insert({
                user_id: userId,
                platform,
                version
            })

        if (error) {
            console.error('Error recording download:', error)
            return false
        }

        return true
    }

    getAvailableDownloads(): any[] {
        // In a real app, this would come from a database or API
        // For now, we'll return mock data
        return [
            {
                id: 'windows-latest',
                platform: 'windows',
                version: '1.0.0',
                downloadUrl: '/api/download/windows/latest',
                fileSize: 85 * 1024 * 1024, // 85MB
                checksum: 'sha256:abc123...',
                releaseDate: new Date().toISOString(),
                isLatest: true,
                minimumSystemVersion: 'Windows 10',
                architecture: 'x64'
            },
            {
                id: 'macos-latest',
                platform: 'macos',
                version: '1.0.0',
                downloadUrl: '/api/download/macos/latest',
                fileSize: 92 * 1024 * 1024, // 92MB
                checksum: 'sha256:def456...',
                releaseDate: new Date().toISOString(),
                isLatest: true,
                minimumSystemVersion: 'macOS 11.0',
                architecture: 'universal'
            }
        ]
    }

    private getSubscriptionLimits(tier: string) {
        switch (tier) {
            case 'pro':
                return {
                    aiQueriesPerMonth: 1000,
                    maxConnections: 50,
                    maxQueryHistoryItems: 10000,
                    supportLevel: 'email' as const
                }
            case 'enterprise':
                return {
                    aiQueriesPerMonth: -1, // unlimited
                    maxConnections: -1, // unlimited
                    maxQueryHistoryItems: -1, // unlimited
                    supportLevel: 'priority' as const
                }
            default: // free
                return {
                    aiQueriesPerMonth: 10,
                    maxConnections: 3,
                    maxQueryHistoryItems: 100,
                    supportLevel: 'community' as const
                }
        }
    }

    formatFileSize(bytes: number): string {
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        if (bytes === 0) return '0 Bytes'
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }
}

export const dashboardService = new DashboardService()