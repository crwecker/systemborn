import { useState, useEffect } from 'react';

export function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const threshold = 120; // Don't hide header until scrolled down close to header height
      
      setIsVisible(
        currentScrollY <= threshold || 
        currentScrollY < lastScrollY
      );
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 bg-[#F5F5F7] shadow-md z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-32">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center">
              <img 
                src="/assets/images/wizard.png" 
                alt="Wizard Icon"
                className="h-20 w-20 object-contain"
              />
              <img 
                src="/assets/images/litrpgacademyicon.png" 
                alt="LitRPG Academy"
                className="h-16 w-auto ml-2"
              />
            </a>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="/signin" 
              className="text-[#2B324B] hover:text-[#1A1F2E] transition-colors text-lg"
            >
              Sign In
            </a>
            <a 
              href="/signup"
              className="bg-[#2B324B] text-white px-6 py-3 rounded-lg hover:bg-[#1A1F2E] transition-colors text-lg font-medium"
            >
              Sign Up
            </a>
          </nav>
          <button className="md:hidden text-[#2B324B]">
            Menu
          </button>
        </div>
      </div>
    </header>
  );
} 