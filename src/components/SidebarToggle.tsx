import React from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';

interface SidebarToggleProps {
  sidebarOpen: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ sidebarOpen, onToggle }: SidebarToggleProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg shadow-lg shadow-cyan-500/50 transition-all"
    >
      {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </motion.button>
  );
}
