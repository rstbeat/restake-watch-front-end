import React from 'react';
import { Twitter, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#ab3bd2] text-white py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <p className="text-center md:text-left mb-4 md:mb-0">
          Made with un chingo de{' '}
          <span role="img" aria-label="heart">
            ❤️
          </span>
        </p>
        <div className="flex space-x-4">
          <a
            href="https://twitter.com/therestakewatch"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-200 transition-colors"
            aria-label="Twitter"
          >
            <Twitter size={24} />
          </a>
          <a
            href="https://t.me/espejelomar"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-200 transition-colors"
            aria-label="Telegram"
          >
            <MessageCircle size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
