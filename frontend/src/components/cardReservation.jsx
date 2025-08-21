import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaArrowRight } from 'react-icons/fa';

const CardReservation = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/voitures');
  };

  return (
    <div
      onClick={handleClick}
      className="group relative backdrop-blur-xl bg-white/20 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.3)] p-6 w-full max-w-md mx-auto min-h-[320px] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-white/40 hover:border-white/60 overflow-hidden hover:-translate-y-2 cursor-pointer"
    >
      {/* Effet glassmorphism background */}
      <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-b from-white/50 to-white/30 opacity-80 group-hover:opacity-90 transition-all duration-1000 ease-out"></div>

      {/* Effet de brillance */}
      <div className="absolute -inset-1 bg-white opacity-0 group-hover:opacity-20 blur-xl transition-all duration-1000 ease-out"></div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col items-center h-full">
        {/* En-tête avec icône et titre - taille réduite */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative p-5 backdrop-blur-lg bg-purple-500/80 rounded-2xl shadow-lg mb-3 transform group-hover:scale-110 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:shadow-purple-200/50 border border-white/20">
            <FaCalendarAlt className="text-5xl text-white/90 relative z-10 transform group-hover:scale-105 transition-transform duration-700 ease-out" />
          </div>
          <div className="transform transition-all duration-500 ease-out">
            <h2 className="text-2xl font-bold text-gray-800/90 group-hover:text-purple-600/90 transition-all duration-700 ease-in-out">
              RÉSERVATIONS
            </h2>
            <p className="text-xs text-gray-500/80 mt-1 transition-all duration-500 ease-out group-hover:text-purple-500/70">
              Gestion des réservations de voitures
            </p>
          </div>
        </div>

        {/* Séparateur animé avec effet glass - taille réduite */}
        <div className="relative h-[1.5px] w-full mb-6 overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-white/20"></div>
          <div className="h-full bg-purple-400/50 backdrop-blur-sm w-0 group-hover:w-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]"></div>
        </div>

        {/* Description - texte réduit */}
        <p className="text-gray-700/90 text-base text-center mb-6 flex-grow backdrop-blur-sm transform transition-all duration-700 ease-out group-hover:text-gray-800/90 px-3">
          Voir et assurer la gestion opérationnelle des réservations.
        </p>

        {/* Footer avec bouton - taille réduite */}
        <div className="w-full flex justify-between items-center mt-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500/90">
            <span className="w-2 h-2 rounded-full bg-green-400/80 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse"></span>
            <span className="transform transition-all duration-500 ease-out group-hover:translate-x-1 backdrop-blur-sm">
              Accès direct
            </span>
          </div>
          <button
            onClick={handleClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md bg-white/10 border border-white/30 hover:bg-white/20 text-purple-600/90 hover:text-purple-700/90 transition-all duration-500 ease-out group-hover:translate-x-2 hover:shadow-lg hover:shadow-white/20"
          >
            <span className="transform transition-all duration-500 ease-out group-hover:translate-x-1 font-medium text-sm">
              Accéder
            </span>
            <FaArrowRight className="text-xs transform transition-all duration-500 ease-out group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Effet de bordure glass */}
      <div className="absolute inset-0 border border-white/30 group-hover:border-white/50 rounded-xl transition-all duration-700 ease-out"></div>
    </div>
  );
};

export default CardReservation;