import { useState, useEffect } from 'react';
import { Button } from '../ui/button';

// Define User type locally for now (will be properly imported from types package later)
interface User {
  id: string;
  email: string;
}
import { Input } from '../ui/input';
import { 
  Menu, 
  Minimize2, 
  Maximize2, 
  X, 
  Database, 
  Search, 
  MessageSquare,
  ChevronDown 
} from 'lucide-react';

interface CustomTitleBarProps {
  user?: User | null;
}

export function CustomTitleBar({ user }: CustomTitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check if window is maximized on mount
    checkMaximizedState();
  }, []);

  const checkMaximizedState = async () => {
    if (window.electronAPI) {
      const maximized = await window.electronAPI.window.isMaximized();
      setIsMaximized(maximized);
    }
  };

  const handleMinimize = async () => {
    if (window.electronAPI) {
      await window.electronAPI.window.minimize();
    }
  };

  const handleMaximize = async () => {
    if (window.electronAPI) {
      await window.electronAPI.window.maximize();
      setIsMaximized(!isMaximized);
    }
  };

  const handleClose = async () => {
    if (window.electronAPI) {
      await window.electronAPI.window.close();
    }
  };

  const handleMenuClick = () => {
    // Menu functionality will be implemented in future tasks
    console.log('Menu clicked');
  };

  const handleDatabaseSwitch = () => {
    // Database switching functionality will be implemented in future tasks
    console.log('Database switch clicked');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Search functionality will be implemented in future tasks
    console.log('Search:', query);
  };

  const handleChatToggle = () => {
    // Chat toggle functionality will be implemented in future tasks
    console.log('Chat toggle clicked');
  };

  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-between drag-region">
      {/* Left Section - Menu and DB Switcher */}
      <div className="flex items-center space-x-2 px-4 no-drag">
        {/* Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMenuClick}
          className="h-8 w-8 p-0"
          aria-label="Menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Database Instance Switcher */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDatabaseSwitch}
          className="h-8 px-3 text-sm"
        >
          <Database className="h-4 w-4 mr-2" />
          <span>No Database</span>
          <ChevronDown className="h-3 w-3 ml-2" />
        </Button>
      </div>

      {/* Center Section - Search Bar */}
      <div className="flex-1 max-w-md mx-4 no-drag">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search databases, tables..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-8 text-sm"
          />
        </div>
      </div>

      {/* Right Section - Chat Button and Window Controls */}
      <div className="flex items-center space-x-2 px-4 no-drag">
        {/* ChatBot Trigger Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleChatToggle}
          className="h-8 w-8 p-0"
          aria-label="Toggle AI Chat"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>

        {/* Window Controls */}
        <div className="flex items-center space-x-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMinimize}
            className="h-8 w-8 p-0 hover:bg-muted"
            aria-label="Minimize window"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMaximize}
            className="h-8 w-8 p-0 hover:bg-muted"
            aria-label="Maximize window"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
            aria-label="Close window"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}