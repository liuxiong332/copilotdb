import { CustomTitleBar } from './CustomTitleBar';
import { AuthUser } from '@database-gui/types';

interface MainLayoutProps {
  user?: AuthUser | null;
  onSkipLogin: () => void;
}

export function MainLayout({ user, onSkipLogin }: MainLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-background" data-testid="main-layout">
      {/* Custom Title Bar */}
      <CustomTitleBar user={user} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Database Explorer (placeholder for future tasks) */}
        <div className="w-64 bg-card border-r border-border">
          <div className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Database Explorer
            </h3>
            <div className="text-sm text-muted-foreground">
              Connect to a database to explore its structure
            </div>
            {/* User info for testing */}
            <div className="mt-4 text-xs text-muted-foreground" data-testid="user-info">
              User: {user ? user.email : 'No user'}
            </div>
          </div>
        </div>

        {/* Right Panel Container */}
        <div className="flex-1 flex flex-col">
          {/* Top Panel - Query Editor (placeholder for future tasks) */}
          <div className="flex-1 bg-background border-b border-border">
            <div className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Query Editor
              </h3>
              <div className="text-sm text-muted-foreground">
                Write and execute database queries
              </div>
            </div>
          </div>

          {/* Bottom Panel - Results Viewer (placeholder for future tasks) */}
          <div className="flex-1 bg-card">
            <div className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Results
              </h3>
              <div className="text-sm text-muted-foreground">
                Query results will appear here
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - AI Chat (placeholder for future tasks) */}
        <div className="w-80 bg-card border-l border-border hidden">
          <div className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              AI Assistant
            </h3>
            <div className="text-sm text-muted-foreground">
              Chat with AI to generate queries
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}