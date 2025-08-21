import React, { useState, useEffect } from 'react';

const CityDropdown = ({ selectedCity, onCityChange, label = "Ville" }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the same base URL as other components
      const response = await fetch('/api/villes?enabled=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Check if response is ok before parsing
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La réponse du serveur n\'est pas au format JSON');
      }
      
      const data = await response.json();
      setCities(data);
    } catch (err) {
      // Handle different types of errors
      if (err instanceof SyntaxError) {
        setError('Erreur de parsing JSON: ' + err.message);
      } else if (err.message.includes('JSON')) {
        setError('Format de données invalide reçu du serveur');
      } else {
        setError(err.message || 'Erreur lors du chargement des villes');
      }
      console.error('Erreur lors du chargement des villes:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="block mb-2 font-medium">{label}</label>
      {loading ? (
        <div className="p-2 border rounded bg-gray-100 text-gray-500">
          Chargement des villes...
        </div>
      ) : error ? (
        <div className="p-2 border rounded bg-red-100 text-red-500">
          Erreur: {error}
        </div>
      ) : (
        <select
          className="w-full p-2 border rounded"
          value={selectedCity || ''}
          onChange={(e) => onCityChange(e.target.value)}
        >
          <option value="">Toutes les villes</option>
          {cities.map((city) => (
            <option key={city.id} value={city.nom}>
              {city.nom}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CityDropdown;