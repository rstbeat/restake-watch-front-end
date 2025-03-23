import React from 'react';
import { Twitter, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#e6e7ec] text-gray-500 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-center sm:text-left order-2 sm:order-1">
            Made with un chingo de{' '}
            <span role="img" aria-label="heart">
              ❤️
            </span>
          </p>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 order-1 sm:order-2">
            <div className="text-sm rounded-md py-1 px-3 bg-purple-100 text-gray-700">
              For funding or to share valuable info: <a
                href="https://signal.me/#eu/espejelomar.01"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#ab3bd2] hover:underline"
              >
                espejelomar.01
              </a> on Signal
            </div>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/therestakewatch"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#ab3bd2] transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={24} />
              </a>
              <a
                href="https://signal.me/#eu/espejelomar.01"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#ab3bd2] transition-colors"
                aria-label="Signal"
              >
                <Phone size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
