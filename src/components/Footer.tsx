import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-4 text-center">
      <p>
        Made with un chingón de{' '}
        <span role="img" aria-label="heart">
          ❤️
        </span>{' '}
        from Mexico
      </p>
    </footer>
  );
};

export default Footer;
