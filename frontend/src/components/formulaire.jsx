import React from 'react';
import CardUtilisateur from './cardUser';
import CardCaisse from './cardCaisse';
import CardReservation from './cardReservation';

const DashboardCards = () => {
  return (
    <div className=" py-12 px-4">
      <div className=" max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Bienvenue sur le Coperative Madagascar</h1>
        <p className="text-gray-900">Gérer votre utilisateur, caisse et réservation</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Carte Utilisateur avec glassmorphisme */}
        <div >
          <CardUtilisateur />
        </div>
        
        {/* Carte Caisse avec glassmorphisme */}
        <div >
          <CardCaisse />
        </div>
        
        {/* Carte Réservation avec glassmorphisme */}
        <div >
          <CardReservation />
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;