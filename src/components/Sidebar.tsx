import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart, X, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Add the StyledIcon component
const SmallStyledIcon: React.FC<{
  icon: React.ReactNode;
  gradientColors: string[];
}> = ({ icon, gradientColors }) => {
  return (
    <div
      className="flex items-center justify-center rounded-full p-1.5 h-5 w-5 shrink-0"
      style={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        boxShadow: `0 2px 4px rgba(0, 0, 0, 0.1)`,
      }}
    >
      <div className="text-white">{icon}</div>
    </div>
  );
};

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  setIsMobileOpen,
  children,
}) => {
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#e6e7ec] text-[#000000] font-bold relative pb-14">
      <div className="p-4">
        <Image
          src="/restake-watch-logo.png"
          alt="Restake Watch Logo"
          width={180} // Increased from 120 to 180 (50% bigger)
          height={60} // Adjusted proportionally
          className="h-15 w-auto mb-6" // Changed from h-10 to h-15 for 50% increase
        />
        {children}
      </div>
      <nav className="flex flex-col space-y-4 mt-8 p-4">
        <Link href="/#publications">
          <Button
            variant="ghost"
            className="w-full justify-start text-[#000000] font-bold hover:bg-[#ab3bd2]"
          >
            <SmallStyledIcon
              icon={<FileText className="h-2 w-2" />}
              gradientColors={['#3b82f6', '#06b6d4']}
            />
            <span className="ml-2">Publications</span>
          </Button>
        </Link>
        <Link
          href="https://hackmd.io/@espejelomar/H14XiPt51g"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="ghost"
            className="w-full justify-start text-[#000000] font-bold hover:bg-[#ab3bd2]"
          >
            <SmallStyledIcon
              icon={<BookOpen className="h-2 w-2" />}
              gradientColors={['#8b5cf6', '#d946ef']}
            />
            <span className="ml-2">Metrics Paper</span>
          </Button>
        </Link>
        <Link
          href="https://t.me/espejelomar"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="ghost"
            className="w-full justify-start text-[#000000] font-bold hover:bg-[#ab3bd2]"
          >
            <SmallStyledIcon
              icon={<Heart className="h-2 w-2" />}
              gradientColors={['#ec4899', '#f43f5e']}
            />
            <span className="ml-2">Collaborate</span>
          </Button>
        </Link>
      </nav>

      <Button
        size="sm"
        className="md:hidden w-24 self-center absolute bottom-2  bg-[#ab3bd2] text-white hover:bg-[#922fb8]"
        onClick={() => setIsMobileOpen(false)}
      >
        Close
        <X className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed h-screen w-48 bg-[#e6e7ec] text-[#000000] font-bold">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-48 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
