import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
        <Link
          href="https://hackmd.io/@espejelomar/H14XiPt51g"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="ghost"
            className="w-full justify-start text-[#000000] font-bold hover:bg-[#ab3bd2]"
          >
            <BookOpen className="h-4 w-4 text-inherit" />
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
            <Heart className="h-4 w-4 text-inherit" />
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
      <div className="hidden md:flex w-48 bg-[#e6e7ec] text-[#000000] font-bold">
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
