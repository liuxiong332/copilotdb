'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import {
    Download,
    Monitor,
    Smartphone,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    FileText,
    Shield,
    Clock,
    HardDrive
} from 'lucide-react'
import { DownloadLink, DownloadStats, SystemRequirements } from '@database-gui/types'
import { dashboardService } from '@/lib/dashboard-service'

interface DownloadsPageProps {
    user: User
}

export default function DownloadsPage({ user }: DownloadsPageProps) {
    const [downloads, setDownloads] = useState<DownloadLink[]>([])
    const [downloadStats, setDownloadStats] = useState<DownloadStats[]>([])
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState<string | null>(null)

    useEffect(() => {
        const loadDownloads = async () => {
            try {
                const [availableDownloads, userDownloadStats] = await Promise.all([
                    Promise.resolve(dashboardService.getAvailableDownloads()),
                    dashboardService.getDownloadStats(user.id)
                ])

                setDownloads(availableDownloads)
                setDownloadStats(userDownloadStats)
            } catch (error) {
                console.error('Error loading downloads:', error)
            } finally {
                setLoading(false)
            }
        }

        loadDownloads()
    }, [user.id])

    const handleDownload = async (download: DownloadLink) => {
        setDownloading(download.id)

        try {
            // Record the download
            await dashboardService.recordDownload(user.id, download.platform, download.version)

            // Trigger the actual download
            const link = document.createElement('a')
            link.href = download.downloadUrl
            link.download = `database-gui-client-${download.platform}-${download.version}.${download.platform === 'windows' ? 'exe' : 'dmg'}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // Refresh download stats
            const updatedStats = await dashboardService.getDownloadStats(user.id)
            setDownloadStats(updatedStats)
        } catch (error) {
            console.error('Error downloading:', error)
        } finally {
            setDownloading(null)
        }
    }

    const getSystemRequirements = (platform: 'windows' | 'macos'): SystemRequirements => {
        if (platform === 'windows') {
            return {
                platform: 'windows',
                minimumVersion: 'Windows 10',
                recommendedVersion: 'Windows 11',
                architecture: ['x64'],
                diskSpace: '100 MB',
                memory: '4 GB RAM',
                additionalRequirements: [
                    '.NET Framework 4.8 or later',
                    'Visual C++ Redistributable'
                ]
            }
        } else {
            return {
                platform: 'macos',
                minimumVersion: 'macOS 11.0 (Big Sur)',
                recommendedVersion: 'macOS 13.0 (Ventura) or later',
                architecture: ['Intel x64', 'Apple Silicon (M1/M2)'],
                diskSpace: '120 MB',
                memory: '4 GB RAM',
                additionalRequirements: [
                    'Rosetta 2 (for Intel Macs running Apple Silicon apps)'
                ]
            }
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                            <div className="h-6 bg-gray-200 rounded mb-4"></div>
                            <div className="h-32 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Downloads</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Download the Database GUI Client desktop applications for your operating system.
                </p>
            </div>

            {/* Download cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {downloads.map((download) => {
                    const requirements = getSystemRequirements(download.platform)
                    const isDownloading = downloading === download.id

                    return (
                        <div key={download.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                {/* Platform header */}
                                <div className="flex items-center mb-4">
                                    <div className="flex-shrink-0">
                                        {download.platform === 'windows' ? (
                                            <Monitor className="h-8 w-8 text-blue-600" />
                                        ) : (
                                            <Smartphone className="h-8 w-8 text-gray-600" />
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {download.platform === 'windows' ? 'Windows' : 'macOS'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Version {download.version} • {dashboardService.formatFileSize(download.fileSize)}
                                        </p>
                                    </div>
                                    {download.isLatest && (
                                        <div className="ml-auto">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Latest
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Download button */}
                                <button
                                    onClick={() => handleDownload(download)}
                                    disabled={isDownloading}
                                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDownloading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-5 w-5 mr-2" />
                                            Download for {download.platform === 'windows' ? 'Windows' : 'macOS'}
                                        </>
                                    )}
                                </button>

                                {/* System requirements */}
                                <div className="mt-6">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">System Requirements</h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <Monitor className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>{requirements.minimumVersion} or later</span>
                                        </div>
                                        <div className="flex items-center">
                                            <HardDrive className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>{requirements.diskSpace} free space</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Shield className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>{requirements.memory} minimum</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Release info */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1" />
                                            <span>Released {dashboardService.formatDate(download.releaseDate)}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Shield className="h-4 w-4 mr-1" />
                                            <span>Verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Installation instructions */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Installation Instructions</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Windows instructions */}
                        <div>
                            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                                <Monitor className="h-5 w-5 mr-2 text-blue-600" />
                                Windows Installation
                            </h4>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                                <li>Download the .exe installer file</li>
                                <li>Right-click the file and select "Run as administrator"</li>
                                <li>Follow the installation wizard prompts</li>
                                <li>Launch Database GUI Client from the Start menu</li>
                            </ol>
                        </div>

                        {/* macOS instructions */}
                        <div>
                            <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                                <Smartphone className="h-5 w-5 mr-2 text-gray-600" />
                                macOS Installation
                            </h4>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                                <li>Download the .dmg disk image file</li>
                                <li>Double-click to mount the disk image</li>
                                <li>Drag Database GUI Client to your Applications folder</li>
                                <li>Launch from Applications or Spotlight search</li>
                            </ol>
                        </div>
                    </div>

                    {/* Security note */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Shield className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3">
                                <h4 className="text-sm font-medium text-blue-800">Security Note</h4>
                                <p className="mt-1 text-sm text-blue-700">
                                    All downloads are digitally signed and verified. Your browser or operating system may show security warnings for new applications. This is normal for desktop applications.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Download history */}
            {downloadStats.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Download History</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {downloadStats.map((download, index) => (
                                <div key={`${download.platform}-${download.downloaded_at}`} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            {download.platform === 'windows' ? (
                                                <Monitor className="h-5 w-5 text-blue-600" />
                                            ) : (
                                                <Smartphone className="h-5 w-5 text-gray-600" />
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                {download.platform === 'windows' ? 'Windows' : 'macOS'} App v{download.version}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Downloaded on {dashboardService.formatDate(download.downloaded_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Help and support */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Need Help?</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="/support"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all duration-200"
                        >
                            <FileText className="h-6 w-6 text-primary-600 mr-3" />
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">Documentation</h4>
                                <p className="text-sm text-gray-500">Installation guides and tutorials</p>
                            </div>
                        </a>

                        <a
                            href="/support"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all duration-200"
                        >
                            <AlertCircle className="h-6 w-6 text-primary-600 mr-3" />
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">Troubleshooting</h4>
                                <p className="text-sm text-gray-500">Common issues and solutions</p>
                            </div>
                        </a>

                        <a
                            href="mailto:support@databasegui.com"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all duration-200"
                        >
                            <ExternalLink className="h-6 w-6 text-primary-600 mr-3" />
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">Contact Support</h4>
                                <p className="text-sm text-gray-500">Get help from our team</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}