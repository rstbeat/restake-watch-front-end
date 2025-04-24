import React from 'react';
import { Twitter, Coffee, Heart, Signal } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#e6e7ec] text-gray-600 py-6 sm:py-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-center sm:text-left order-2 sm:order-1 flex flex-wrap items-center justify-center sm:justify-start gap-1 text-xs sm:text-sm w-full">
              <span>Made with un chingo de</span>
              <span
                role="img"
                aria-label="heart"
                className="text-red-500 animate-pulse"
              >
                ❤️
              </span>
              <span>from</span>
              <span className="font-medium">CDMX</span>
              <span role="img" aria-label="taco and sparkles" className="mx-1">
                🌮✨
              </span>
              <span className="italic text-gray-600 block w-full sm:inline sm:w-auto text-xs mt-1 sm:mt-0">
                (where the code is as hot as the salsa)
              </span>
            </p>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 order-1 sm:order-2 w-full sm:w-auto">
              <div className="text-xs rounded-md py-2 px-3 sm:px-4 bg-purple-100 text-gray-700 shadow-sm hover:shadow transition-shadow duration-300 w-full sm:w-auto text-center">
                For funding or to share valuable info:{' '}
                <a
                  href="https://signal.me/#eu/espejelomar.01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#ab3bd2] hover:underline hover:text-purple-800 transition-colors"
                >
                  Signal
                </a>
              </div>
              <div className="flex space-x-4 justify-center">
                <a
                  href="https://twitter.com/therestakewatch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 rounded-full bg-purple-100 hover:bg-purple-200 text-[#ab3bd2] hover:text-purple-800 transition-all transform hover:scale-110"
                  aria-label="Twitter"
                >
                  <Twitter size={16} className="sm:w-5 sm:h-5" />
                </a>
                <a
                  href="https://signal.me/#eu/espejelomar.01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 rounded-full bg-purple-100 hover:bg-purple-200 text-[#ab3bd2] hover:text-purple-800 transition-all transform hover:scale-110"
                  aria-label="Signal"
                >
                  <Signal size={16} className="sm:w-5 sm:h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2 sm:space-y-3 text-xs text-center">
            <p className="italic text-gray-500 flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              <Coffee size={14} className="text-brown-600 sm:w-4 sm:h-4" />
              <span>
                Powered by excessive coffee and genuine love for decentralized
                Ethereum
              </span>
              <Heart size={14} className="text-red-500 sm:w-4 sm:h-4" />
            </p>
            <p className="text-xs text-gray-400 px-2">
              Yes, we shamelessly borrowed the color palette from L2Beat. Those
              folks are absolute legends! 🙌
            </p>
            <p className="text-xs text-gray-500 mt-1 px-2">
              Committed to making the restaking ecosystem as secure and
              transparent as possible.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
