import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaHome, FaCar, FaRoute, FaInfoCircle, FaCity, FaDollarSign, FaCashRegister, FaUserCircle } from 'react-icons/fa';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      if (width < 1024) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (isMobile || isTablet) {
      setIsOpen(false);
    }
  }, [location, isMobile, isTablet]);

  const navItems = [
    { path: "/", name: "Dashboard", icon: <FaHome /> },
    { path: "/voitures", name: "Voitures", icon: <FaCar /> },
    { path: "/Itineraire", name: "Itineraire", icon: <FaRoute /> },
    { path: "/villes", name: "Villes", icon: <FaCity />},
    { path: "/prix", name: "Prix", icon: <FaDollarSign />},
    { path: "/utilisateur", name: "utilisateur", icon: <FaUserCircle />},
    { path: "/caisse", name: "Caisse", icon: <FaCashRegister />},
  { path: "/Information", name: "Information", icon: <FaInfoCircle /> }

  ];

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {(isMobile || isTablet) && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={handleOverlayClick}
        />
      )}

      <div
        className={`fixed top-55 left-0 h-[84vh] mt-4 mb-6 bg-white shadow-xl z-40 
          transition-all duration-300 ease-in-out flex flex-col
          ${isMobile ? 'w-72' : isOpen ? 'w-64' : 'w-16'}
          ${isOpen ? 'translate-x-0' : '-translate-x-0'}
          border-r border-gray-100 rounded-r-xl`}
      >
        {isOpen && (
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Menu principal  </h2>
          </div>
        )}

        <nav className="p-2 overflow-y-auto flex-1 flex flex-col justify-between">
          {/* Espace vide en haut pour descendre les éléments */}
          <div className="h-6"></div>
          
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => (isMobile || isTablet) && setIsOpen(false)}
                  className={`flex items-center p-2 rounded-lg transition-all
                    ${location.pathname === item.path
                      ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-50'}
                    ${!isOpen ? 'justify-center h-12' : ''}`}
                  title={!isOpen ? item.name : ''}
                >
                  <span className={`flex items-center justify-center 
                    ${!isOpen ? 'w-8 h-8' : 'mr-3'} 
                    ${location.pathname === item.path ? 'text-white' : 'text-sky-500'}`}>
                    {item.icon}
                  </span>
                  {isOpen && <span className="font-medium text-sm">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>

          {/* Toggle Button - Centré et compact */}
          <div className="border-t border-gray-100">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full flex items-center justify-center p-3 transition-all duration-300
                ${isOpen ? 'hover:bg-gray-50' : ''}`}
            >
              {isOpen ? (
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500 text-white">
                  <FaChevronLeft className="text-sm" />
                </span>
              ) : (
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500 text-white">
                  <FaChevronRight className="text-sm" />
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Pied de page */}
        {isOpen && (
          <div className="p-3 border-t border-gray-100 bg-white/80">
            <p className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} Cooperative Madagascar
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;