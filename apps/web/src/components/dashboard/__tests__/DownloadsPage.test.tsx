import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { User } from '@supabase/supabase-js'
import DownloadsPage from '../DownloadsPage'
import { dashboardService } from '@/lib/dashboard-service'

// Mock the dashboard service
jest.mock('@/lib/dashboard-service', () => ({
    dashboardService: {
        getAvailableDownloads: jest.fn(),
        getDownloadStats: jest.fn(),
        recordDownload: jest.fn(),
        formatFileSize: jest.fn((bytes) => `${Math.round(bytes / 1024 / 1024)} MB`),
        formatDate: jest.fn((date) => new Date(date).toLocaleDateString()),
    }
}))

const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {},
}

const mockDownloads = [
    {
        id: 'windows-latest',
        platform: 'windows' as const,
        version: '1.0.0',
        downloadUrl: '/api/download/windows/latest',
        fileSize: 85 * 1024 * 1024,
        checksum: 'sha256:abc123',
        releaseDate: '2024-01-01T00:00:00Z',
        isLatest: true,
        minimumSystemVersion: 'Windows 10',
        architecture: 'x64' as const,
    },
    {
        id: 'macos-latest',
        platform: 'macos' as const,
        version: '1.0.0',
        downloadUrl: '/api/download/macos/latest',
        fileSize: 92 * 1024 * 1024,
        checksum: 'sha256:def456',
        releaseDate: '2024-01-01T00:00:00Z',
        isLatest: true,
        minimumSystemVersion: 'macOS 11.0',
        architecture: 'universal' as const,
    }
]

const mockDownloadStats = [
    {
        user_id: 'test-user-id',
        platform: 'windows' as const,
        version: '1.0.0',
        downloaded_at: '2024-01-01T00:00:00Z',
    }
]

// Mock DOM methods
Object.defineProperty(document, 'createElement', {
    value: jest.fn(() => ({
        href: '',
        download: '',
        click: jest.fn(),
    })),
})

Object.defineProperty(document.body, 'appendChild', {
    value: jest.fn(),
})

Object.defineProperty(document.body, 'removeChild', {
    value: jest.fn(),
})

describe('DownloadsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders loading state initially', () => {
        ;(dashboardService.getAvailableDownloads as jest.Mock).mockImplementation(() => new Promise(() => {}))
        ;(dashboardService.getDownloadStats as jest.Mock).mockImplementation(() => new Promise(() => {}))

        render(<DownloadsPage user={mockUser} />)

        expect(screen.getByText('Downloads')).toBeInTheDocument()
        expect(screen.getAllByRole('generic')).toHaveLength(expect.any(Number))
    })

    it('renders download options after loading', async () => {
        ;(dashboardService.getAvailableDownloads as jest.Mock).mockResolvedValue(mockDownloads)
        ;(dashboardService.getDownloadStats as jest.Mock).mockResolvedValue(mockDownloadStats)

        render(<DownloadsPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Windows')).toBeInTheDocument()
        })

        expect(screen.getByText('macOS')).toBeInTheDocument()
        expect(screen.getByText('Version 1.0.0 • 85 MB')).toBeInTheDocument()
        expect(screen.getByText('Version 1.0.0 • 92 MB')).toBeInTheDocument()
        expect(screen.getAllByText('Latest')).toHaveLength(2)
    })

    it('shows system requirements for each platform', async () => {
        ;(dashboardService.getAvailableDownloads as jest.Mock).mockResolvedValue(mockDownloads)
        ;(dashboardService.getDownloadStats as jest.Mock).mockResolvedValue(mockDownloadStats)

        render(<DownloadsPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Windows 10 or later')).toBeInTheDocument()
        })

        expect(screen.getByText('macOS 11.0 (Big Sur) or later')).toBeInTheDocument()
        expect(screen.getByText('100 MB free space')).toBeInTheDocument()
        expect(screen.getByText('120 MB free space')).toBeInTheDocument()
    })

    it('handles download button click', async () => {
        ;(dashboardService.getAvailableDownloads as jest.Mock).mockResolvedValue(mockDownloads)
        ;(dashboardService.getDownloadStats as jest.Mock).mockResolvedValue(mockDownloadStats)
        ;(dashboardService.recordDownload as jest.Mock).mockResolvedValue(true)

        render(<DownloadsPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Download for Windows')).toBeInTheDocument()
        })

        const downloadButton = screen.getByText('Download for Windows')
        fireEvent.click(downloadButton)

        await waitFor(() => {
            expect(dashboardService.recordDownload).toHaveBeenCalledWith('test-user-id', 'windows', '1.0.0')
        })

        expect(document.createElement).toHaveBeenCalledWith('a')
    })

    it('shows downloading state during download', async () => {
        ;(dashboardService.getAvailableDownloads as jest.Mock).mockResolvedValue(mockDownloads)
        ;(dashboardService.getDownloadStats as jest.Mock).mockResolvedValue(mockDownloadStats)
        ;(dashboardService.recordDownload as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

        render(<DownloadsPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Download for Windows')).toBeInTheDocument()
        })

        const downloadButton = screen.getByText('Download for Windows')
        fireEvent.click(downloadButton)

        expect(screen.getByText('Downloading...')).toBeInTheDocument()
        expect(downloadButton.closest('button')).toBeDisabled()
    })

    it('shows download history when available', async () => {
        ;(dashboardService.getAvailableDownloads as jest.Mock).mockResolvedValue(mockDownloads)
        ;(dashboardService.getDownloadStats as jest.Mock).mockResolvedValue(mockDownloadStats)

        render(<DownloadsPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Download History')).toBeInTheDocument()
        })

        expect(screen.getByText('Windows App v1.0.0')).toBeInTheDocument()
    })

    it('shows installation instructions', async () => {
        ;(dashboardService.getAvailableDownloads as jest.Mock).mockResolvedValue(mockDownloads)
        ;(dashboardService.getDownloadStats as jest.Mock).mockResolvedValue(mockDownloadStats)

        render(<DownloadsPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Installation Instructions')).toBeInTheDocument()
        })

        expect(screen.getByText('Windows Installation')).toBeInTheDocument()
        expect(screen.getByText('macOS Installation')).toBeInTheDocument()
        expect(screen.getByText('Download the .exe installer file')).toBeInTheDocument()
        expect(screen.getByText('Download the .dmg disk image file')).toBeInTheDocument()
    })

    it('shows help and support section', async () => {
        ;(dashboardService.getAvailableDownloads as jest.Mock).mockResolvedValue(mockDownloads)
        ;(dashboardService.getDownloadStats as jest.Mock).mockResolvedValue(mockDownloadStats)

        render(<DownloadsPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Need Help?')).toBeInTheDocument()
        })

        expect(screen.getByText('Documentation')).toBeInTheDocument()
        expect(screen.getByText('Troubleshooting')).toBeInTheDocument()
        expect(screen.getByText('Contact Support')).toBeInTheDocument()
    })

    it('handles download errors gracefully', async () => {
        ;(dashboardService.getAvailableDownloads as jest.Mock).mockResolvedValue(mockDownloads)
        ;(dashboardService.getDownloadStats as jest.Mock).mockResolvedValue(mockDownloadStats)
        ;(dashboardService.recordDownload as jest.Mock).mockRejectedValue(new Error('Download failed'))

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

        render(<DownloadsPage user={mockUser} />)

        await waitFor(() => {
            expect(screen.getByText('Download for Windows')).toBeInTheDocument()
        })

        const downloadButton = screen.getByText('Download for Windows')
        fireEvent.click(downloadButton)

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error downloading:', expect.any(Error))
        })

        consoleSpy.mockRestore()
    })
})