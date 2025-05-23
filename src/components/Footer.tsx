import React from 'react';
import { Twitter, Coffee, Heart, Signal } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gradient-to-br from-[#e6e7ec] via-purple-50/30 to-blue-50/20 text-gray-600 py-6 sm:py-8 border-t border-gray-200/50 overflow-hidden">
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ab3bd2]/10 via-transparent to-[#3b82f6]/10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[repeating-linear-gradient(-45deg,transparent,transparent_3px,rgba(59,130,246,0.05)_3px,rgba(59,130,246,0.05)_6px)]"></div>
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-center sm:text-left order-2 sm:order-1 flex flex-wrap items-center justify-center sm:justify-start gap-1 text-xs sm:text-sm w-full relative">
              <span className="font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">
                Made with
              </span>
              <span className="relative font-bold bg-gradient-to-r from-[#ab3bd2] to-[#3b82f6] bg-clip-text text-transparent hover:scale-110 transition-transform duration-300 cursor-default">
                un chingo de
                <span className="absolute inset-0 bg-gradient-to-r from-[#ab3bd2]/20 to-[#3b82f6]/20 blur-sm animate-pulse -z-10 rounded"></span>
              </span>
              <span
                role="img"
                aria-label="heart"
                className="text-red-500 animate-pulse hover:animate-bounce transition-all duration-300 text-base"
              >
                ❤️
              </span>
              <span className="font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">
                from
              </span>
              <span className="font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent hover:scale-110 transition-transform duration-300 cursor-default">
                CDMX
              </span>
              <span
                role="img"
                aria-label="taco and sparkles"
                className="mx-1 hover:animate-spin transition-all duration-300 text-base"
              >
                🌮✨
              </span>
              <span className="italic text-gray-600 block w-full sm:inline sm:w-auto text-xs mt-1 sm:mt-0 bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent font-medium">
                (where the code is as hot as the salsa)
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 order-1 sm:order-2 w-full sm:w-auto">
              <div className="text-xs rounded-md py-2 px-3 sm:px-4 bg-gradient-to-r from-purple-100 to-blue-100 text-gray-700 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 w-full sm:w-auto text-center border border-purple-200/50">
                For funding or to share valuable info:{' '}
                <a
                  href="https://signal.me/#eu/espejelomar.01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold bg-gradient-to-r from-[#ab3bd2] to-[#3b82f6] bg-clip-text text-transparent hover:from-purple-800 hover:to-blue-800 hover:underline transition-all duration-300"
                >
                  Signal
                </a>
              </div>
              <div className="flex space-x-4 justify-center">
                <a
                  href="https://twitter.com/therestakewatch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 text-[#ab3bd2] hover:text-purple-800 transition-all transform hover:scale-110 hover:rotate-12 shadow-sm hover:shadow-md border border-purple-200/50"
                  aria-label="Twitter"
                >
                  <Twitter
                    size={16}
                    className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300"
                  />
                </a>
                <a
                  href="https://signal.me/#eu/espejelomar.01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 text-[#ab3bd2] hover:text-purple-800 transition-all transform hover:scale-110 hover:rotate-12 shadow-sm hover:shadow-md border border-purple-200/50"
                  aria-label="Signal"
                >
                  <Signal
                    size={16}
                    className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300"
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2 sm:space-y-3 text-xs text-center">
            <div className="italic text-gray-500 flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              <Coffee
                size={14}
                className="text-amber-700 sm:w-4 sm:h-4 hover:animate-bounce transition-all duration-300"
              />
              <span>
                <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent font-medium">
                  Powered by excessive coffee
                </span>
                <span className="font-medium"> and genuine love for </span>
                <span className="bg-gradient-to-r from-[#ab3bd2] to-[#3b82f6] bg-clip-text text-transparent font-bold hover:scale-105 transition-transform duration-300 cursor-default">
                  decentralized Ethereum
                </span>
              </span>
              <Heart
                size={14}
                className="text-red-500 sm:w-4 sm:h-4 hover:animate-pulse transition-all duration-300"
              />
            </div>
            <div className="text-xs text-gray-400 px-2 relative">
              <span className="font-medium">
                Yes, we shamelessly borrowed the color palette from{' '}
              </span>
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-bold hover:scale-105 transition-transform duration-300 cursor-default">
                L2Beat
              </span>
              <span className="font-medium">. Those folks are absolute </span>
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent font-bold">
                legends!
              </span>
              <span className="animate-bounce inline-block ml-1">🙌</span>
            </div>
            <div className="text-xs text-gray-500 mt-1 px-2 relative">
              <span className="font-medium bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">
                Committed to making the{' '}
              </span>
              <span className="bg-gradient-to-r from-[#ab3bd2] to-[#3b82f6] bg-clip-text text-transparent font-bold hover:scale-105 transition-transform duration-300 cursor-default">
                restaking ecosystem
              </span>
              <span className="font-medium bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">
                {' '}
                as{' '}
              </span>
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                secure
              </span>
              <span className="font-medium bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">
                {' '}
                and{' '}
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-bold">
                transparent
              </span>
              <span className="font-medium bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">
                {' '}
                as possible.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
