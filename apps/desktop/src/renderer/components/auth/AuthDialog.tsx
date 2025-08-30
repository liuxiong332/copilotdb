import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

// Define User type locally for now (will be properly imported from types package later)
interface User {
  id: string;
  email: string;
}
import { Button } from '../ui/button';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onSuccess: (user: User) => void;
}

export function AuthDialog({ isOpen, onClose, onSkip, onSuccess }: AuthDialogProps) {
  // This is a placeholder component for task 7.2
  // The actual authentication implementation will be done in the next task
  
  const handleSkip = () => {
    onSkip();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Database GUI Client</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sign in to access AI features and sync your settings, or skip to use the app offline.
          </p>
          
          {/* Placeholder for authentication form - will be implemented in task 7.2 */}
          <div className="p-8 border-2 border-dashed border-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Authentication form will be implemented in task 7.2
            </p>
          </div>
          
          <div className="flex justify-between space-x-2">
            <Button variant="outline" onClick={handleSkip}>
              Skip for now
            </Button>
            <Button onClick={handleSkip} disabled>
              Sign In (Coming in 7.2)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}