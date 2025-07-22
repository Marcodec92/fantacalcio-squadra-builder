
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="glass-card border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-none">
            {user?.email}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="glass-button border-destructive/20 hover:border-destructive/30 text-destructive hover:text-destructive/80 text-xs sm:text-sm px-2 sm:px-3"
        >
          <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Esci</span>
          <span className="sm:hidden">Exit</span>
        </Button>
      </div>
    </div>
  );
};

export default Header;
