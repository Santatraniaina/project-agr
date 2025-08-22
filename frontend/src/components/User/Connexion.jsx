import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Connexion = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Déterminer l'URL de base du backend
  const getBaseURL = () => {
    // Utiliser la variable d'environnement si elle existe, sinon utiliser localhost:8000
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  };

  // Fonction pour gérer les erreurs de réseau
  const handleNetworkError = (error) => {
    if (error.code === 'ERR_NETWORK') {
      return 'Erreur de connexion au serveur. Veuillez vérifier votre connexion internet.';
    }
    if (error.code === 'ECONNREFUSED') {
      return 'Le serveur est inaccessible. Veuillez réessayer plus tard.';
    }
    return 'Une erreur de réseau est survenue.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const baseURL = getBaseURL();
      
      // Obtenir le token CSRF
      const csrfResponse = await axios.get(`${baseURL}/api/csrf-token`, {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });

      const csrfToken = csrfResponse.data.csrfToken;
      
      // Tenter la connexion
      const response = await axios.post(`${baseURL}/api/login`,
        { username, password },
        {
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const { user } = response.data;
      onLogin(user);
      navigate('/');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        if (error.response.status === 401) {
          setError('Nom d\'utilisateur ou mot de passe incorrect');
        } else if (error.response.status === 419) {
          setError('Session expirée. Veuillez réessayer.');
        } else if (error.response.status === 422) {
          setError('Données de connexion invalides. Veuillez vérifier vos informations.');
        } else if (error.response.status >= 500) {
          setError('Erreur serveur. Veuillez réessayer plus tard.');
        } else {
          setError(`Erreur de connexion: ${error.response.data.message || 'Une erreur inconnue est survenue'}`);
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        setError(handleNetworkError(error));
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        setError('Une erreur est survenue lors de la tentative de connexion.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-gray-100 flex align-items-center justify-center h-full p-4">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-6xl w-full mx-auto">
        {/* Partie gauche - Logo et texte descriptif */}
        <div className="text-center md:text-left md:w-1/2 lg:w-2/5">
          <div className="agr-logo mb-6">
            <span className="letter letter-a text-6xl md:text-7xl font-bold text-blue-600">A</span>
            <span className="letter letter-g text-6xl md:text-7xl font-bold text-green-600">G</span>
            <span className="letter letter-r text-6xl md:text-7xl font-bold text-red-600">R</span>
          </div>
          <p className="text-xl md:text-2xl text-gray-800">
            Avec Application Gestion de Reservation, Vos réservations, enfin simples et performantes.
          </p>
        </div>

        {/* Partie droite - Formulaire */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-500 focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              className={`w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-bold text-lg ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </div>
              ) : (
                "Se connecter"
              )}
            </button>

            <div className="text-center">
              <a href="#" className="text-blue-600 text-sm hover:underline">
                Mot de passe oublié ?
              </a>
            </div>

            <div className="border-t border-gray-300 pt-4 mt-4 text-center">
              <button
                type="button"
                className="bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 focus:ring-2 focus:ring-emerald-400 transition-all duration-150 font-semibold shadow-md"
              >
                Créer un nouveau compte
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Connexion;