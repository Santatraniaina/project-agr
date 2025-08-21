import React from 'react';
import { FaArrowLeft, FaPlus, FaMinus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Caisse = () => {
  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-[#57534e] via-[#a8a29e] to-[#e7e5e4] p-8">
      <div className="max-w-7xl mx-auto">
        <Link 
          to="/"
          className="inline-flex items-center text-white mb-8 hover:text-gray-200 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Retour au tableau de bord
        </Link>
        
        <div className="bg-white/10 backdrop-filter backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-6">Gestion de Caisse</h1>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Solde actuel */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <h2 className="text-xl text-white mb-2">Solde actuel</h2>
              <p className="text-3xl font-bold text-white">25,000 Ar</p>
            </div>
            
            {/* Actions rapides */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <h2 className="text-xl text-white mb-4">Actions rapides</h2>
              <div className="flex gap-4">
                <button className="flex-1 py-3 px-4 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-white flex items-center justify-center">
                  <FaPlus className="mr-2" />
                  Entrée
                </button>
                <button className="flex-1 py-3 px-4 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-white flex items-center justify-center">
                  <FaMinus className="mr-2" />
                  Sortie
                </button>
              </div>
            </div>
            
            {/* Historique des transactions */}
            <div className="md:col-span-2 bg-white/5 p-6 rounded-xl border border-white/10">
              <h2 className="text-xl text-white mb-4">Historique des transactions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-white/90">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-left">Type</th>
                      <th className="py-3 px-4 text-left">Montant</th>
                      <th className="py-3 px-4 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">22/05/2024</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-500/20 rounded text-green-300">Entrée</span>
                      </td>
                      <td className="py-3 px-4 text-green-300">+5,000 Ar</td>
                      <td className="py-3 px-4">Paiement client</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">21/05/2024</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-red-500/20 rounded text-red-300">Sortie</span>
                      </td>
                      <td className="py-3 px-4 text-red-300">-2,000 Ar</td>
                      <td className="py-3 px-4">Achat fournitures</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Caisse; 