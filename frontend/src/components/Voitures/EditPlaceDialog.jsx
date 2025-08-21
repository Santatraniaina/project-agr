import React from 'react';

const EditPlaceDialog = ({ editingPlace, setEditingPlace, modifierPlace }) => {
  if (!editingPlace) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-xl font-semibold mb-4">
          Modifier place {editingPlace.numero}
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nom client</label>
          <input
            type="text"
            value={editingPlace.client_nom || ''}
            onChange={(e) => setEditingPlace({...editingPlace, client_nom: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        
        {/* ... autres champs ... */}
        
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setEditingPlace(null)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              modifierPlace(editingPlace.id, {
                client_nom: editingPlace.client_nom,
                client_tel: editingPlace.client_tel,
                status: editingPlace.status
              });
              setEditingPlace(null);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPlaceDialog;