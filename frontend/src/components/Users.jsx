import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Users = () => {
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
          <h1 className="text-3xl font-bold text-white mb-6">Gestion des Utilisateurs</h1>
          
          <div className="grid gap-6">
            {/* Exemple de liste d'utilisateurs */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h2 className="text-xl text-white mb-4">Liste des Utilisateurs</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-white/90">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-3 px-4 text-left">Nom</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Rôle</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">John Doe</td>
                      <td className="py-3 px-4">john@example.com</td>
                      <td className="py-3 px-4">Administrateur</td>
                      <td className="py-3 px-4">
                        <button className="px-3 py-1 bg-white/10 rounded hover:bg-white/20 transition-colors mr-2">
                          Éditer
                        </button>
                        <button className="px-3 py-1 bg-red-500/30 rounded hover:bg-red-500/50 transition-colors">
                          Supprimer
                        </button>
                      </td>
                    </tr>
                    {/* Ajoutez plus de lignes selon vos besoins */}
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

export default Users; 