import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CaisseVip = () => {
  const [error, setError] = useState(null);
  const [clientsVipAttribues, setClientsVipAttribues] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClientsVipAttribues = async () => {
      setLoadingClients(true);
      try {
        const response = await axios.get('http://localhost:8000/api/reservations-vip', { // URL pour les réservations VIP
          withCredentials: true,
        });
        if (response.data.success && Array.isArray(response.data.data)) {
          const clientsData = response.data.data.map(reservation => {
            const places = [];
            // Adapter la logique de récupération des numéros de places si la structure de PlaceVip est différente
            for (let i = 1; i <= 16; i++) { // Supposant jusqu'à 16 places VIP
              if (reservation[`place_vip_${i}`] || reservation[`place_${i}`]) { // Vérifier les deux conventions de nommage possibles
                places.push(`P${i}`);
              }
            }
            return {
              id: reservation.id,
              nom: reservation.nom,
              contact: reservation.contact,
              places: places.join(', ') || 'Aucune place VIP spécifiée',
              date_reservation: new Date(reservation.created_at).toLocaleString(),
              statut_paiement: reservation.statut_paiement || 'a_encaisser',
              voiture_id: reservation.voiture_vip_id || reservation.voiture_id, // Adapter selon votre modèle
            };
          }).filter(client => client.nom && client.contact);
          setClientsVipAttribues(clientsData);
        } else {
          setError('Format de données des clients VIP attribués incorrect.');
          setClientsVipAttribues([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des clients VIP attribués.');
        setClientsVipAttribues([]);
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClientsVipAttribues();
  }, []);

  const handleConfirmVipPayment = async (reservationId) => {
    const originalClients = [...clientsVipAttribues];
    setClientsVipAttribues(prevClients =>
      prevClients.map(client =>
        client.id === reservationId ? { ...client, statut_paiement: 'P' } : client
      )
    );

    try {
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      const csrfToken = csrfResponse.data.csrfToken;

      if (!csrfToken) {
        setError("Impossible de récupérer le jeton CSRF.");
        setClientsVipAttribues(originalClients);
        return;
      }

      const response = await axios.post(`http://localhost:8000/api/reservations-vip/${reservationId}/confirm-payment`, // URL pour confirmer paiement VIP
        {},
        {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (response.data.success) {
        console.log('Paiement VIP confirmé (statut P) pour la réservation ID:', reservationId);
      } else {
        setError(response.data.message || 'Erreur lors de la confirmation du paiement VIP côté serveur.');
        setClientsVipAttribues(originalClients);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur réseau lors de la confirmation du paiement VIP.');
      setClientsVipAttribues(originalClients);
    }
  };

  const filteredClientsVip = clientsVipAttribues.filter(client =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.places.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/" // Ou vers une page de tableau de bord VIP si elle existe
          className="inline-flex items-center text-blue-600 mb-8 hover:text-blue-800 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Retour
        </Link>
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button onClick={() => setError(null)} className="float-right font-bold">&times;</button>
          </div>
        )}

        <div className="bg-gray-50 shadow-xl rounded-2xl p-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Clients VIP avec places attribuées</h2>
            <input
              type="text"
              placeholder="Rechercher par nom, contact, places..."
              className="p-2 bg-white rounded-lg text-gray-700 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loadingClients ? (
            <p className="text-gray-700 text-center">Chargement des clients VIP...</p>
          ) : filteredClientsVip.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-gray-700">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-left">Nom du client</th>
                    <th className="py-3 px-4 text-left">Contact</th>
                    <th className="py-3 px-4 text-left">Places VIP Attribuées</th>
                    <th className="py-3 px-4 text-left">Statut Paiement / Action</th>
                    <th className="py-3 px-4 text-left">Date Réservation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClientsVip.map((client) => (
                    <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-100">
                      <td className="py-3 px-4">{client.nom}</td>
                      <td className="py-3 px-4">{client.contact}</td>
                      <td className="py-3 px-4">{client.places}</td>
                      <td className="py-3 px-4">
                        {client.statut_paiement === 'a_encaisser' ? (
                          <button
                            onClick={() => handleConfirmVipPayment(client.id)}
                            className={`px-2 py-1 text-xs font-semibold rounded-full bg-yellow-200 text-yellow-800 hover:bg-yellow-300 cursor-pointer`}
                            title="Cliquer pour encaisser"
                          >
                            {client.statut_paiement}
                          </button>
                        ) : (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800`}>
                            {client.statut_paiement}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">{client.date_reservation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-700 text-center">Aucun client VIP trouvé {searchTerm ? `pour "${searchTerm}"` : 'avec place attribuée'}.</p>
          )}
          {error && !loadingClients && clientsVipAttribues.length === 0 && (
             <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                Erreur lors du chargement des clients VIP : {typeof error === 'string' ? error : JSON.stringify(error)}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaisseVip;