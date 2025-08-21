import React, { useMemo, useState } from 'react';

const Historique = ({ history, title = 'Historique des réservations', enableFilters = true, maxItems = null, onDelete }) => {
  const [filters, setFilters] = useState({
    date: '', // format YYYY-MM-DD
    month: '', // format YYYY-MM
    itineraire: ''
  });

  const filtered = useMemo(() => {
    return (history || []).filter((h) => {
      const d = new Date(h.date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const monthStr = `${y}-${m}`;
      const okDate = filters.date ? dateStr === filters.date : true;
      const okMonth = filters.month ? monthStr === filters.month : true;
      const okItin = filters.itineraire ? (h.itineraire || '').toLowerCase().includes(filters.itineraire.toLowerCase()) : true;
      return okDate && okMonth && okItin;
    });
  }, [history, filters]);

  const rows = useMemo(() => (maxItems && maxItems > 0 ? filtered.slice(0, maxItems) : filtered), [filtered, maxItems]);

  return (
    <div className="mt-8 bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {enableFilters && (
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="border p-1 rounded text-sm"
            title="Filtrer par date"
          />
          <input
            type="month"
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            className="border p-1 rounded text-sm"
            title="Filtrer par mois"
          />
          <input
            type="text"
            placeholder="Itinéraire"
            value={filters.itineraire}
            onChange={(e) => setFilters({ ...filters, itineraire: e.target.value })}
            className="border p-1 rounded text-sm"
            title="Filtrer par itinéraire"
          />
        </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p>Aucun historique disponible</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border text-left">Date</th>
              <th className="p-2 border text-left">Heure</th>
              <th className="p-2 border text-left">Itinéraire</th>
              <th className="p-2 border text-left">Voiture</th>
              <th className="p-2 border text-left">Modèle</th>
              <th className="p-2 border text-left">Places</th>
              <th className="p-2 border text-left">Action</th>
              <th className="p-2 border text-left">Supp.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-2 border">{new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                <td className="p-2 border">{item.heure || new Date(item.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                <td className="p-2 border">{item.itineraire || '—'}</td>
                <td className="p-2 border">{item.voiture}</td>
                <td className="p-2 border">{item.modele || '—'}</td>
                <td className="p-2 border">{typeof item.places === 'number' ? `${item.places} places disponibles` : '—'}</td>
                <td className="p-2 border">{item.action}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => onDelete && onDelete(index, item)}
                    className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700 text-xs"
                    disabled={!onDelete}
                    title={onDelete ? 'Supprimer cette ligne' : 'Suppression désactivée'}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Historique;