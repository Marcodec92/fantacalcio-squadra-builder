
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-green-600" />
          <span className="text-sm text-gray-600">
            {user?.email}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="text-red-600 hover:text-red-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Esci
        </Button>
      </div>
    </div>
  );
};

export default Header;
