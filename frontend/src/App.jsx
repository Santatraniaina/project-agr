import './App.css';
import React, { useEffect, useState } from 'react';
import DashboardCards from './components/dashboard';
import { Routes, Route, useNavigate } from 'react-router-dom';
import VoituresPage from './components/VoiturePage';
import Itineraire from './components/Itineraire';
import Information from './components/Information';
import './tailwind.css';
import UserManagement from './components/User/UserManagement';
import Connexion from './components/User/Connexion';
import ProtectedRoute from './components/User/ProtectedRoute';
import axios from 'axios';
import icon from './assets/img/icon.png';
import VilleList from './components/VilleList';
import PrixManager from './components/PrixManager';
import Sidebar from './components/Sidebar';
import CaisseTransactions from './components/Caisse';
import CaisseLayout from './components/CaisseLayout';
import SimulateurCaisse from './components/SimulateurCaisse';
import ClotureMensuelle from './components/ClotureMensuelle';
import CaisseRapports from './components/CaisseRapports';
import loadImage from './assets/img/load.png';
import CardCaisse from './components/CardCaisse/CardCaisse';
import CooperativeManagement from './components/CooperativeManagement';
import CaisseSidebar from './components/CaisseSidebar';

function App() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [minLoadingDone, setMinLoadingDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setOnlineStatus(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    const MIN_LOADING_TIME = 3000;

    const checkAuth = async () => {
      try {
        const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
          withCredentials: true,
          headers: { 'Accept': 'application/json' }
        });
        const csrfToken = csrfResponse.data.csrfToken;
        
        const response = await axios.get('http://localhost:8000/api/user', {
          withCredentials: true,
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.data && response.data.name) {
          setUser({
            name: response.data.name,
            role: response.data.role,
            email: response.data.email,
            photo: response.data.photo
          });
        } else {
          throw new Error("Données utilisateur invalides");
        }
      } catch (error) {
        console.log("Non connecté", error);
        // Ne pas rediriger automatiquement vers login si l'utilisateur n'est pas connecté
        // Laissez l'utilisateur accéder à la page de connexion
      } finally {
        const elapsed = Date.now() - startTime;
        const remaining = MIN_LOADING_TIME - elapsed;

        if (remaining > 0) {
          setTimeout(() => {
            setIsLoading(false);
            setMinLoadingDone(true);
          }, remaining);
        } else {
          setIsLoading(false);
          setMinLoadingDone(true);
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      const csrfToken = csrfResponse.data.csrfToken;
      await axios.post('http://localhost:8000/api/logout', {}, {
        withCredentials: true,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setUser(null);
      navigate('/login');
      setShowDropdown(false);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '';
    const names = name.trim().split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUser(prev => ({
          ...prev,
          photo: event.target.result
        }));
        // Upload logic would go here
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <div className="flex-1 flex items-end justify-center pb-12">
          <img
            src={loadImage}
            alt="Logo de chargement"
            className="w-32 h-32 object-contain animate-pulse"
          />
        </div>

        <div className="flex flex-col items-center justify-center w-full px-4">
          <div className="uppercase text-center max-w-md w-full">
            <h1 className="text-3xl font-light mb-6 tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-600 to-slate-400">
                APPLICATION GESTION
              </span>
              <div className="mt-1 text-xl font-normal text-slate-500">
                DE RÉSERVATION
              </div>
            </h1>
          </div>

          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-2 mx-auto">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="text-sm text-gray-500 text-center">
            Chargement... {progress}%
          </div>
        </div>

        <div className="flex-1"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-y-auto bg-gradient-to-bl from-[#ffe4e6f1] to-[#ddf7f1]">
      <div className="flex-1 overflow-hidden flex flex-col">
        <header className="shrink-0 bg-sky-300 shadow-md sticky top-0 z-50 h-14 flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="agr-logo">
              <span className="letter letter-a">A</span>
              <span className="letter letter-g">G</span>
              <span className="letter letter-r">R</span>
            </div>
          </div>

          {user && (
            <div className="relative">
              <div className="relative group">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-sky-700 font-medium hover:bg-sky-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ring-offset-white shadow-sm relative group"
                  aria-label="Menu utilisateur"
                  aria-expanded={showDropdown}
                >
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user.name)
                  )}

                  <span className={`
                    absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white
                    ${onlineStatus ?
                      'bg-emerald-400 animate-pulse shadow-[0_0_6px_2px_rgba(74,222,128,0.5)]' :
                      'bg-gray-400 shadow-none'
                    }
                    transition-all duration-300 ease-in-out
                  `}>
                    <span className={`
                      absolute inset-0 rounded-full opacity-0
                      ${onlineStatus ? 'bg-emerald-400 animate-ping' : ''}
                    `}></span>
                  </span>
                </button>

                <div className="
                  absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2
                  px-2 py-1 bg-gray-800 text-white text-xs rounded
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                  whitespace-nowrap pointer-events-none
                ">
                  {onlineStatus ? 'En ligne et actif' : 'Hors ligne'}
                  <div className="absolute top-full left-1/2 w-2 h-2 bg-gray-800 transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                </div>
              </div>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-100 divide-y divide-gray-100">
                  <div className="px-4 py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Connecté en tant que</p>
                        <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
                        <p className="text-xs font-medium text-sky-600 mt-1">{user.role}</p>
                      </div>
                      <div className={`
                        flex items-center px-2 py-1 rounded-full
                        ${onlineStatus ?
                          'bg-emerald-50 text-emerald-700' :
                          'bg-gray-100 text-gray-600'
                        }
                      `}>
                        <span className={`
                          w-2 h-2 rounded-full mr-1.5
                          ${onlineStatus ? 'bg-emerald-500' : 'bg-gray-500'}
                        `}></span>
                        <span className="text-xs font-medium">
                          {onlineStatus ? 'En ligne' : 'Hors ligne'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-sky-600 transition-colors duration-150"
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Mon profil
                      </div>
                    </button>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-sky-600 transition-colors duration-150"
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Déconnexion
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-100">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute isAuthenticated={!!user}>
                <DashboardCards />
              </ProtectedRoute>
            } />
            <Route path="/voitures" element={
              <ProtectedRoute isAuthenticated={!!user}>
                <VoituresPage />
              </ProtectedRoute>
            } />
            <Route path="/Itineraire" element={
              <ProtectedRoute isAuthenticated={!!user}>
                <Itineraire />
              </ProtectedRoute>
            } />
            <Route path="/Information" element={
              <ProtectedRoute isAuthenticated={!!user}>
                <Information />
              </ProtectedRoute>
            } />
            <Route path="/villes" element={
              <ProtectedRoute isAuthenticated={!!user}>
                <VilleList />
              </ProtectedRoute>
            } />
            <Route path="/prix" element={
              <ProtectedRoute isAuthenticated={!!user}>
                <PrixManager />
              </ProtectedRoute>
            } />
            {/* Routes de caisse avec sidebar unifié intégré */}
            <Route path="/caisse" element={
              <ProtectedRoute isAuthenticated={!!user}>
                <CardCaisse />
              </ProtectedRoute>
            } />
            
            <Route path="/caisse/depenses" element={
              <ProtectedRoute isAuthenticated={!!user}>
                <CardCaisse initialMenu="depenses" />
              </ProtectedRoute>
            } />
            
            {/* Anciennes routes de caisse pour compatibilité */}
            <Route path="/caisse-old" element={
              <ProtectedRoute isAuthenticated={!!user}>
                <CaisseLayout />
              </ProtectedRoute>
            }>
              <Route index element={<CaisseTransactions />} />
              <Route path="transactions" element={<CaisseTransactions />} />
              <Route path="simulateur" element={<SimulateurCaisse />} />
              <Route path="cloture" element={<ClotureMensuelle />} />
              <Route path="rapports" element={<CaisseRapports />} />
            </Route>
            
            {/* Route de compatibilité pour l'ancien simulateur */}
            <Route path="/simulateur-caisse" element={
              <ProtectedRoute isAuthenticated={!!user}>
                <SimulateurCaisse />
              </ProtectedRoute>
            } />
            <Route path="/utilisateur" element={
              <ProtectedRoute isAuthenticated={!!user}
                userRole={user?.role}
                allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />

            <Route path="/login" element={<Connexion onLogin={(userData) => {
              setUser(userData);
              navigate('/');
            }} />} />

            <Route path="/profile" element={
              <ProtectedRoute isAuthenticated={!!user}>
                <div className="flex min-h-screen bg-gray-50">
                  <Sidebar />

                  <div className="flex-1 p-6 md:p-8">
                    <div className="max-w-5xl mx-auto">
                      {/* En-tête du profil */}
                      <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl p-6 mb-8 shadow-lg">
                        <div className="flex flex-col md:flex-row items-center">
                          <div className="relative mb-4 md:mb-0 md:mr-6">
                            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl border-4 border-white/30">
                              {user?.photo ? (
                                <img
                                  src={user.photo}
                                  alt="Profile"
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-3xl font-bold text-sky-700">
                                  {getInitials(user?.name)}
                                </span>
                              )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors">
                              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoUpload}
                              />
                            </label>
                          </div>

                          <div className="text-center md:text-left">
                            <h1 className="text-2xl md:text-3xl font-bold text-white">{user?.name}</h1>
                            <div className="flex items-center justify-center md:justify-start mt-2">
                              <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium">
                                {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                              </span>
                              <div className="flex items-center ml-4">
                                <span className={`w-3 h-3 rounded-full mr-2 ${onlineStatus ? 'bg-emerald-400' : 'bg-gray-400'}`}></span>
                                <span className="text-white/90 text-sm">
                                  {onlineStatus ? 'En ligne' : 'Hors ligne'}
                                </span>
                              </div>
                            </div>
                            <p className="mt-3 text-white/90 flex items-center justify-center md:justify-start">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Grille de contenu */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Colonne de gauche */}
                        <div className="lg:col-span-2 space-y-6">
                          {/* Section Informations personnelles */}
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
                              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Informations personnelles
                              </h2>
                            </div>
                            <div className="p-6">
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-500 mb-1">Nom complet</label>
                                  <div className="flex items-center">
                                    <input
                                      type="text"
                                      value={user?.name || ''}
                                      className="w-full px-4 py-2 text-gray-800 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sky-300 focus:border-transparent"
                                      readOnly
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-500 mb-1">Adresse email</label>
                                  <div className="flex items-center">
                                    <input
                                      type="email"
                                      value={user?.email || ''}
                                      className="w-full px-4 py-2 text-gray-800 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sky-300 focus:border-transparent"
                                      readOnly
                                    />
                                    <button className="ml-3 px-4 py-2 bg-sky-50 text-sky-600 text-sm font-medium rounded-lg hover:bg-sky-100 transition-colors">
                                      Modifier
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-500 mb-1">Rôle</label>
                                  <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                    <span className="font-medium capitalize">
                                      {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Section Sécurité */}
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
                              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Sécurité du compte
                              </h2>
                            </div>
                            <div className="p-6">
                              <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-sky-50 rounded-lg border border-sky-100">
                                  <div>
                                    <h3 className="font-medium text-gray-800">Mot de passe</h3>
                                    <p className="text-sm text-gray-500 mt-1">Dernière modification: {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                  </div>
                                  <button className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors">
                                    Changer
                                  </button>
                                </div>

                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                                  <div>
                                    <h3 className="font-medium text-gray-800">Authentification à deux facteurs</h3>
                                    <p className="text-sm text-gray-500 mt-1">Ajoutez une sécurité supplémentaire à votre compte</p>
                                  </div>
                                  <button className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                                    Activer
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Colonne de droite */}
                        <div className="space-y-6">
                          {/* Section Préférences */}
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
                              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Préférences
                              </h2>
                            </div>
                            <div className="p-6">
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="font-medium text-gray-800">Mode sombre</h3>
                                    <p className="text-sm text-gray-500">Adaptez l'interface à votre environnement</p>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                  </label>
                                </div>

                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="font-medium text-gray-800">Langue</h3>
                                    <p className="text-sm text-gray-500">Français</p>
                                  </div>
                                  <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                                    Modifier
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Section Notifications */}
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
                              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                Notifications
                              </h2>
                            </div>
                            <div className="p-6">
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="font-medium text-gray-800">Email</h3>
                                    <p className="text-sm text-gray-500">Recevoir des notifications par email</p>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                  </label>
                                </div>

                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="font-medium text-gray-800">Push</h3>
                                    <p className="text-sm text-gray-500">Notifications sur l'appareil</p>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                  </label>
                                </div>

                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="font-medium text-gray-800">SMS</h3>
                                    <p className="text-sm text-gray-500">Notifications par message texte</p>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Section Actions */}
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
                              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Actions du compte
                              </h2>
                            </div>
                            <div className="p-6">
                              <div className="space-y-3">
                                <button className="w-full text-left px-4 py-3 text-gray-700 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors flex items-center">
                                  <svg className="w-5 h-5 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Supprimer le compte
                                </button>

                                <button
                                  onClick={handleLogout}
                                  className="w-full text-left px-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors flex items-center"
                                >
                                  <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                  </svg>
                                  Déconnexion
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/user-list" element={
              <ProtectedRoute isAuthenticated={!!user}
                userRole={user?.role}
                allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/cooperative-management" element={
              <ProtectedRoute isAuthenticated={!!user}>
                <CooperativeManagement />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        <footer className="shrink-0 bg-sky-300 text-center py-1 border-t border-sky-400 text-xs text-sky-800">
          <p>© {new Date().getFullYear()} Dashboard Réservation - created by TRILOGY DEV</p>
        </footer>
      </div>
    </div>
  );
}

export default App;