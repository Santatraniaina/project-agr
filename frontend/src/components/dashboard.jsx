import React, { useEffect } from 'react';
import CardUtilisateur from './cardUser';
import CardCaisse from './cardCaisse';
import CardReservation from './cardReservation';
import CardCooperative from './cardCooperative';
import { Link } from 'react-router-dom'; // Ajout de l'import pour Link

const DashboardCards = () => {
  useEffect(() => {
    // Création des particules
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + 'vw';
      particle.style.animationDuration = Math.random() * 3 + 2 + 's';
      // S'assurer que .particles-container existe avant d'ajouter un enfant
      const particlesContainer = document.querySelector('.particles-container');
      if (particlesContainer) {
        particlesContainer.appendChild(particle);
      }

      // Suppression après l'animation
      setTimeout(() => {
        particle.remove();
      }, 5000);
    };

    // Création périodique de particules
    const particleInterval = setInterval(createParticle, 300);

    return () => clearInterval(particleInterval);
  }, []);

  return (
    <div className="h-full overflow-hidden">
      {/* Background animé */}
      {/*
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-slow-zoom"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')`,
        }}
      />

      <div className="particles-container absolute inset-0 pointer-events-none" />

      <div
        className="absolute inset-0 animate-gradient"
        style={{
          background: `linear-gradient(120deg,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 0.7) 50%,
            rgba(255, 255, 255, 0.8) 100%
          )` // Corrigé le '%' manquant
        }}
      />
      */}


      {/* Contenu */}
      <div className="h-full z-10 py-8 px-4">
        <div className="max-w-3xl mx-auto text-center mb-10 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 font-sans">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">
              Bienvenue sur Cooperative Madagascar
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed">
            Solution pour la gestion des utilisateurs, caisses et réservations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {/* Carte Utilisateur avec glassmorphisme */}
          <div className="transform hover:scale-105 transition-transform duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Link to="/utilisateur"> {/* Assurez-vous que cette route est définie dans App.jsx */}
              <CardUtilisateur />
            </Link>
          </div>

          {/* Carte Caisse avec glassmorphisme */}
          <div className="transform hover:scale-105 transition-transform duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/caisse"> {/* Lien vers la page Caisse */}
              <CardCaisse />
            </Link>
          </div>

          {/* Carte Réservation avec glassmorphisme */}
          <div className="transform hover:scale-105 transition-transform duration-300 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/voitures"> {/* Lien vers la page Réservations/Voitures */}
              <CardReservation />
            </Link>
          </div>

          {/* Carte Coopérative avec glassmorphisme */}
          <div className="transform hover:scale-105 transition-transform duration-300 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <CardCooperative />
          </div>
        </div>
      </div>
    </div>
  );
};

// Ajout des styles d'animation dans une balise style
// Il est généralement préférable de mettre ces styles dans un fichier CSS séparé
// ou d'utiliser une solution CSS-in-JS pour une meilleure organisation.
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slow-zoom {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes float-up {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes shine {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes particle-float {
    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
    50% { opacity: 0.8; }
    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
  }

  .animate-slow-zoom {
    animation: slow-zoom 20s infinite ease-in-out;
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient-shift 15s infinite linear;
  }

  .animate-slide-up {
    animation: float-up 0.8s ease-out forwards;
    opacity: 0;
  }

  .animate-shine {
    background: linear-gradient(
      to right,
      #333 20%,
      #666 40%,
      #666 60%,
      #333 80%
    );
    background-size: 200% auto;
    color: transparent;
    background-clip: text;
    -webkit-background-clip: text;
    animation: shine 4s linear infinite;
  }

  .animate-fade-in {
    animation: float-up 1s ease-out forwards;
    opacity: 0;
  }

  .particle {
    position: absolute;
    width: 6px;
    height: 6px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    pointer-events: none;
    animation: particle-float linear forwards;
  }
`;
// S'assurer que document.head existe avant d'ajouter le style (utile pour le SSR par exemple)
if (typeof document !== 'undefined' && document.head) {
  document.head.appendChild(styleSheet);
}

export default DashboardCards;
