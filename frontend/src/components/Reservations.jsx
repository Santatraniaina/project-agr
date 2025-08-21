import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Reservations = () => {
  const navigate = useNavigate();
  const [reservations] = useState([
    {
      id: 1,
      date: "23/05/2024",
      client: "Rakoto Jean",
      itineraire: "Antananarivo - Toamasina",
      statut: "confirmée",
      prix: "150,000 Ar"
    },
    {
      id: 2,
      date: "24/05/2024",
      client: "Rabe Marie",
      itineraire: "Antananarivo - Mahajanga",
      statut: "en_attente",
      prix: "200,000 Ar"
    }
  ]);

  return (
    <div className="bg-glass rounded-2xl shadow-lg p-8 w-full max-w-md mx-auto hover:shadow-2xl transition-all duration-300 border border-blue-200 transform hover:-translate-y-1 min-h-[250px] flex flex-col cursor-pointer"
     onClick={() => navigate('/voitures')}>
      <div className="flex flex-col items-center flex-grow">
        <h2 className="text-3xl font-bold mb-6 uppercase text-red-800 text-center">RÉSERVATIONS📅</h2>
        <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent w-full my-4"></div>
        
        <div className="w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs uppercase bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Client</th>
                  <th className="px-4 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{reservation.date}</td>
                    <td className="px-4 py-2">{reservation.client}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        reservation.statut === 'confirmée' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reservation.statut === 'confirmée' ? 'Confirmée' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <p className="text-gray-700 text-lg text-center mt-6">
          Cliquez pour voir plus de détails sur les réservations
        </p>
      </div>
    </div>
  );
};

export default Reservations; 