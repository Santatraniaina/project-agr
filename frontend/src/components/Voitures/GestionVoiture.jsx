// GestionVoitures.jsx (composant parent)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VoitureSelection from './VoitureSelection';
import VoitureVipSelection from './VoitureVipSelection';

const GestionVoitures = () => {
  // États pour les voitures normales
  const [voitures, setVoitures] = useState([]);
  const [voitureSelectionnee, setVoitureSelectionnee] = useState(null);
  
  // États pour les voitures VIP
  const [voituresVip, setVoituresVip] = useState([]);
  const [voitureVipSelectionnee, setVoitureVipSelectionnee] = useState(null);
  
  // Onglet actif
  const [activeTab, setActiveTab] = useState('normales');

  // Chargement des données
  const fetchVoitures = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/voitures');
      setVoitures(response.data);
    } catch (error) {
      console.error("Erreur voitures normales:", error);
    }
  };

  const fetchVoituresVip = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/voitures-vip');
      setVoituresVip(response.data);
    } catch (error) {
      console.error("Erreur voitures VIP:", error);
    }
  };

  useEffect(() => {
    fetchVoitures();
    fetchVoituresVip();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Onglets */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          className={`py-4 px-6 font-medium text-sm ${
            activeTab === 'normales' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('normales')}
        >
          Voitures Normales
        </button>
        <button
          className={`py-4 px-6 font-medium text-sm ${
            activeTab === 'vip' 
              ? 'text-purple-600 border-b-2 border-purple-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('vip')}
        >
          Voitures VIP
        </button>
      </div>

      {/* Contenu */}
      {activeTab === 'normales' ? (
        <VoitureSelection
          voitures={voitures}
          voitureSelectionnee={voitureSelectionnee}
          setVoitureSelectionnee={setVoitureSelectionnee}
          fetchVoitures={fetchVoitures}
        />
      ) : (
        <VoitureVipSelection
          voituresVip={voituresVip}
          voitureSelectionnee={voitureVipSelectionnee}
          setVoitureSelectionnee={setVoitureVipSelectionnee}
          fetchVoituresVip={fetchVoituresVip}
        />
      )}
    </div>
  );
};

export default GestionVoitures;