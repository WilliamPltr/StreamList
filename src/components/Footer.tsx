import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer
      className="w-full flex flex-col items-center justify-center py-6 mt-12"
      style={{ background: 'transparent' }}
    >
      <style>{`
        @media (prefers-color-scheme: dark) {
          footer .footer-text {
            color: rgba(245,245,245,0.18) !important;
          }
        }
        @media (prefers-color-scheme: light), (prefers-color-scheme: no-preference) {
          footer .footer-text {
            color: #5f5f5f !important;
          }
        }
      `}</style>
      <div
        className="footer-text flex items-center text-center gap-2 text-base font-medium"
        style={{
          filter: 'drop-shadow(0 1px 8px rgba(0,0,0,0.12))',
        }}
      >
        <span>Made with</span>
        <span aria-label="coeur" role="img" className="mx-1 text-red-500 text-lg">❤️</span>
        <span>-</span>
        <span className="underline font-semibold flex items-center gap-1 footer-text" style={{textDecorationThickness: '2px'}}>
          William PELTIER
        </span>
        <a
          href="https://github.com/WilliamPltr"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 footer-text"
          aria-label="GitHub"
        >
          <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24" className="hover:scale-110 transition-transform duration-150">
            <path d="M12 0.297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387 0.6 0.113 0.82-0.258 0.82-0.577 0-0.285-0.01-1.04-0.015-2.04-3.338 0.724-4.042-1.415-4.042-1.415-0.546-1.387-1.333-1.756-1.333-1.756-1.089-0.745 0.084-0.729 0.084-0.729 1.205 0.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495 0.997 0.108-0.775 0.419-1.304 0.762-1.604-2.665-0.304-5.466-1.334-5.466-5.931 0-1.311 0.469-2.381 1.236-3.221-0.124-0.303-0.535-1.523 0.117-3.176 0 0 1.008-0.322 3.301 1.23 0.957-0.266 1.983-0.399 3.003-0.404 1.02 0.005 2.047 0.138 3.006 0.404 2.291-1.552 3.297-1.23 3.297-1.23 0.653 1.653 0.242 2.873 0.119 3.176 0.77 0.84 1.235 1.91 1.235 3.221 0 4.609-2.803 5.625-5.475 5.921 0.43 0.371 0.823 1.102 0.823 2.222 0 1.606-0.014 2.898-0.014 3.293 0 0.321 0.216 0.694 0.825 0.576 4.765-1.589 8.199-6.084 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
