import React from 'react';

const AddClientDialog = ({
  showDialog,
  setShowDialog,
  nouveauClient,
  setNouveauClient,
  selectedPlace,
  ajouterClient,
  ajouterFileAttente
}) => {
  if (!showDialog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {selectedPlace ? 'Ajouter un client à la place' : 'Ajouter à la file d\'attente'}
        </h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nom du client</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={nouveauClient}
            onChange={(e) => setNouveauClient(e.target.value)}
            placeholder="Entrez le nom du client"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setShowDialog(false);
              setNouveauClient('');
            }}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Annuler
          </button>
          
          <button
            onClick={() => {
              if (selectedPlace) {
                ajouterClient(selectedPlace.id, nouveauClient);
              } else {
                ajouterFileAttente(nouveauClient);
              }
              setShowDialog(false);
              setNouveauClient('');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddClientDialog;