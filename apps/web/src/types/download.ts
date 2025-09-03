// Download and version management types
export interface DownloadLink {
    id: string;
    platform: 'windows' | 'macos';
    version: string;
    downloadUrl: string;
    fileSize: number;
    checksum: string;
    releaseDate: string;
    isLatest: boolean;
    minimumSystemVersion?: string;
    architecture?: 'x64' | 'arm64' | 'universal';
}

export interface DownloadStats {
    user_id: string;
    platform: 'windows' | 'macos';
    version: string;
    downloaded_at: string;
    ip_address?: string;
    user_agent?: string;
}

export interface AppVersion {
    version: string;
    releaseDate: string;
    releaseNotes: string[];
    breaking: boolean;
    platforms: {
        windows?: DownloadLink;
        macos?: DownloadLink;
    };
}

export interface SystemRequirements {
    platform: 'windows' | 'macos';
    minimumVersion: string;
    recommendedVersion: string;
    architecture: string[];
    diskSpace: string;
    memory: string;
    additionalRequirements?: string[];
}