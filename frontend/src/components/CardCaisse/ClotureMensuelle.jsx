import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DepenseList from './DepenseList'; // Importer le nouveau composant
import './Simulator.css'; // Réutiliser ou créer un CSS dédié
import './PrintableTable.css'; // CSS pour l'impression

const ClotureMensuelle = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Mois actuel (1-12)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [depenses, setDepenses] = useState([]);
    const [soldeInitial, setSoldeInitial] = useState(0);
    const [revenuNational, setRevenuNational] = useState(0);
    const [revenuRegional, setRevenuRegional] = useState(0);
    const [totalDepensesMois, setTotalDepensesMois] = useState(0);
    const [soldeFinal, setSoldeFinal] = useState(0);
    const [montantReduction, setMontantReduction] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // États pour le formulaire de dépense
    const [showDepenseForm, setShowDepenseForm] = useState(false);
    const [currentDepense, setCurrentDepense] = useState(null); // Pour l'édition
    const [categoriesDepenses, setCategoriesDepenses] = useState([]);
    // États pour le formulaire de dépense
    const [dateDepense, setDateDepense] = useState(new Date().toISOString().split('T')[0]);
    const [categorieDepenseId, setCategorieDepenseId] = useState('');
    const [montantDepense, setMontantDepense] = useState('');
    const [commentaireDepense, setCommentaireDepense] = useState('');
    const [piecesJointesDepense, setPiecesJointesDepense] = useState(null); // Pour les fichiers

    // URL de base de ton API Laravel. Adapte-la si nécessaire.
    const API_BASE_URL = 'http://localhost:8000/api';

    // Fonction pour calculer le montant de la réduction
    const calculerMontantReduction = (selectedYear, selectedMonth) => {
        let totalReduction = 0;
        
        try {
            // Récupérer les données du simulateur national pour ce mois spécifique
            const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
            
            console.log('🔍 Calcul de la réduction pour:', monthKey);
            
            // Essayer de récupérer les données depuis le localStorage des simulateurs
            // Pour le simulateur national, on peut avoir des données détaillées
            const nationalResults = localStorage.getItem('nationalSimulator_lastResults');
            if (nationalResults) {
                try {
                    const nationalData = JSON.parse(nationalResults);
                    console.log('📊 Données nationales trouvées:', nationalData);
                    
                    if (nationalData.total_global) {
                        const montantBrutNational = nationalData.total_global.montant_brut_total || 0;
                        const montantApresReductionNational = nationalData.total_global.montant_apres_reduction_total || 0;
                        const fraisFixeNational = nationalData.total_global.frais_fixe_total || 0;
                        
                        // Calcul de la réduction : montant brut - (montant après réduction - frais fixe)
                        const reductionNational = montantBrutNational - (montantApresReductionNational - fraisFixeNational);
                        totalReduction += reductionNational;
                        
                        console.log('✅ Calcul précis de la réduction:', {
                            montantBrut: montantBrutNational,
                            montantApresReduction: montantApresReductionNational,
                            fraisFixe: fraisFixeNational,
                            reduction: reductionNational
                        });
                    } else {
                        console.log('⚠️ Pas de données total_global dans les résultats nationaux');
                    }
                } catch (e) {
                    console.error('❌ Erreur parsing données nationales:', e);
                }
            } else {
                console.log('⚠️ Aucun résultat national trouvé dans localStorage');
            }

            // Si pas de données détaillées, essayer de calculer approximativement
            // en utilisant le pourcentage de réduction par défaut (10%)
            if (totalReduction === 0) {
                try {
                    const storageKey = `caisse_totaux:${monthKey}`;
                    const saved = localStorage.getItem(storageKey);
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        console.log('📁 Données caisse trouvées:', parsed);
                        
                        const revenuNational = (parsed.national_matin || 0) + (parsed.national_soir || 0);
                        
                        // Estimation basée sur un pourcentage de réduction de 10% (valeur par défaut)
                        // Cette estimation est approximative car on n'a pas les montants bruts exacts
                        const estimationReduction = revenuNational * 0.1; // 10% de réduction
                        totalReduction = estimationReduction;
                        
                        console.log('📊 Estimation de réduction (10%):', {
                            revenuNational: revenuNational,
                            estimationReduction: estimationReduction
                        });
                    } else {
                        console.log('⚠️ Aucune donnée caisse trouvée pour:', monthKey);
                    }
                } catch (e) {
                    console.error('❌ Erreur calcul estimation réduction:', e);
                }
            }
            
            console.log('🎯 Réduction totale calculée:', totalReduction);
            
        } catch (e) {
            console.error('❌ Erreur calcul réduction simulateurs:', e);
        }
        
        return totalReduction;
    };

    // Fonction pour rafraîchir les données de réduction
    const rafraichirDonneesReduction = () => {
        const reduction = calculerMontantReduction(selectedYear, selectedMonth);
        setMontantReduction(reduction);
        console.log('Données de réduction rafraîchies:', reduction);
    };

    // Récupérer les catégories de dépenses au montage
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Récupérer le token CSRF
                const csrfResponse = await axios.get(`${API_BASE_URL}/csrf-token`, {
                    withCredentials: true,
                    headers: { 'Accept': 'application/json' }
                });
                const csrfToken = csrfResponse.data.csrfToken;

                const response = await axios.get(`${API_BASE_URL}/categories-depenses`, {
                    headers: { 'X-CSRF-TOKEN': csrfToken },
                    withCredentials: true
                });
                setCategoriesDepenses(response.data);
            } catch (err) {
                console.error("Erreur lors du chargement des catégories de dépenses:", err);
                setError('Erreur chargement catégories.');
            }
        };
        fetchCategories();
    }, []);

    // Pré-remplir le formulaire si on édite une dépense
    useEffect(() => {
        if (currentDepense) {
            setDateDepense(currentDepense.date ? new Date(currentDepense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
            setCategorieDepenseId(currentDepense.categorie_depense_id || '');
            setMontantDepense(currentDepense.montant || '');
            setCommentaireDepense(currentDepense.commentaire || '');
            setPiecesJointesDepense(null); // La gestion des fichiers existants est plus complexe
            setShowDepenseForm(true);
        } else {
            // Réinitialiser pour un nouveau formulaire
            setDateDepense(new Date().toISOString().split('T')[0]);
            setCategorieDepenseId(categoriesDepenses.length > 0 ? categoriesDepenses[0].id : ''); // Sélectionner la première par défaut si disponible
            setMontantDepense('');
            setCommentaireDepense('');
            setPiecesJointesDepense(null);
        }
    }, [currentDepense, categoriesDepenses]); // Ajouter categoriesDepenses ici pour initialiser categorieDepenseId

    // Récupérer les données de clôture et les dépenses
    const fetchDataMois = async () => {
        setError('');
        
        try {
            // Vérification des paramètres
            if (!selectedYear || !selectedMonth) {
                throw new Error("Année ou mois non sélectionné");
            }

            // Récupérer le token CSRF
            const csrfResponse = await axios.get(`${API_BASE_URL}/csrf-token`, {
                withCredentials: true,
                headers: { 'Accept': 'application/json' }
            });
            const csrfToken = csrfResponse.data.csrfToken;

            // 1. Clôture mensuelle
            const clotureUrl = `${API_BASE_URL}/cloture-mois/${selectedYear}/${selectedMonth}`;
            console.log("Fetching cloture:", clotureUrl); // Debug
            
            const clotureRes = await axios.get(clotureUrl, {
                headers: { 'X-CSRF-TOKEN': csrfToken },
                withCredentials: true
            });
            // Lire les totaux des simulateurs depuis localStorage pour ce mois
            let nat = 0; let reg = 0; // Déclarés hors du try pour être utilisables plus bas
            let totalReduction = 0; // Pour calculer le montant total de la réduction
            try {
                const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
                const storageKey = `caisse_totaux:${monthKey}`;
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // additionner matin+soir si présents
                    nat = (parsed.national_matin || 0) + (parsed.national_soir || 0);
                    reg = (parsed.regional_matin || 0) + (parsed.regional_soir || 0);
                }

                // Calculer le montant de la réduction en récupérant les données détaillées des simulateurs
                totalReduction = calculerMontantReduction(selectedYear, selectedMonth);

                setRevenuNational(nat);
                setRevenuRegional(reg);
                setMontantReduction(totalReduction);
                const totalSimulateurs = nat + reg;
                // Solde initial = montant total provenant des deux simulateurs
                setSoldeInitial(totalSimulateurs);
            } catch (e) {
                console.error('Erreur lecture totaux simulateurs localStorage:', e);
                setRevenuNational(0);
                setRevenuRegional(0);
                setMontantReduction(0);
            }

            // Solde final provenant de l'API (si clôturé) sinon estimé = soldeInitial - totalDepenses
            const apiSoldeFinal = clotureRes.data.solde_final || 0;
            const apiTotalDepenses = clotureRes.data.total_depenses || 0;
            setTotalDepensesMois(apiTotalDepenses);
            
            // Utiliser la même variable que pour setSoldeInitial pour la cohérence
            const totalSimulateurs = nat + reg;
            
            console.log('🔍 Debug détaillé du calcul:', {
                nat: nat,
                reg: reg,
                totalSimulateurs: totalSimulateurs,
                apiSoldeFinal: apiSoldeFinal,
                apiTotalDepenses: apiTotalDepenses,
                soldeInitialSet: totalSimulateurs
            });
            
            // Calcul correct du solde final : Solde Initial - Total Dépenses
            // Le solde du chauffeur (montant de réduction) n'intervient pas dans ce calcul
            let soldeFinalCalcule;
            
            if (apiSoldeFinal !== 0) {
                // Si l'API retourne un solde final (mois clôturé), l'utiliser
                soldeFinalCalcule = apiSoldeFinal;
                console.log('📊 Utilisation du solde final de l\'API:', apiSoldeFinal);
            } else {
                // Sinon, calculer le solde final estimé
                soldeFinalCalcule = totalSimulateurs - apiTotalDepenses;
                console.log('🧮 Calcul du solde final estimé:', {
                    totalSimulateurs: totalSimulateurs,
                    apiTotalDepenses: apiTotalDepenses,
                    resultat: soldeFinalCalcule
                });
            }
            
            // Le solde final peut être négatif si les dépenses dépassent le solde initial
            // C'est une situation normale qui indique un déficit
            setSoldeFinal(soldeFinalCalcule);
            
            console.log('🎯 Solde final définitif:', {
                soldeInitial: totalSimulateurs,
                totalDepenses: apiTotalDepenses,
                soldeFinalCalcule: soldeFinalCalcule,
                soldeFinalAPI: apiSoldeFinal,
                soldeFinalFinal: soldeFinalCalcule,
                difference: totalSimulateurs - apiTotalDepenses,
                deficit: apiTotalDepenses > totalSimulateurs ? 'OUI' : 'NON',
                montantDeficit: apiTotalDepenses > totalSimulateurs ? apiTotalDepenses - totalSimulateurs : 0,
                verification: `Vérification: ${totalSimulateurs} - ${apiTotalDepenses} = ${totalSimulateurs - apiTotalDepenses}`,
                setSoldeFinalAppele: `setSoldeFinal(${soldeFinalCalcule})`
            });

            // 2. Dépenses du mois
            const depensesUrl = `${API_BASE_URL}/depenses?annee=${selectedYear}&mois=${selectedMonth}`;
            console.log("Fetching depenses:", depensesUrl); // Debug
            
            const depensesRes = await axios.get(depensesUrl, {
                headers: { 'X-CSRF-TOKEN': csrfToken },
                withCredentials: true
            });
            setDepenses(depensesRes.data);
            
        } catch (err) {
            let errorMsg = 'Erreur lors du chargement des données';
            if (err.response) {
                errorMsg += ` (${err.response.status})`;
                if (err.response.status === 404) {
                    errorMsg += ": Endpoint non trouvé - Vérifiez les paramètres";
                }
            }
            setError(errorMsg);
            console.error("Détails erreur:", err);
        }
    };

    // Récupérer les données de clôture et les dépenses lorsque le mois/année change
    useEffect(() => {
        if (selectedMonth && selectedYear) { // S'assurer que le mois et l'année sont définis
            setLoading(true);
            fetchDataMois().finally(() => setLoading(false));
        }
    }, [selectedMonth, selectedYear]); // Déclencher quand le mois ou l'année change

    // Surveiller les changements de l'état soldeFinal pour le debug
    useEffect(() => {
        console.log('🔄 État soldeFinal mis à jour:', {
            soldeFinal: soldeFinal,
            timestamp: new Date().toISOString(),
            selectedMonth: selectedMonth,
            selectedYear: selectedYear
        });
    }, [soldeFinal, selectedMonth, selectedYear]);

    const handleCloturerMois = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir clôturer ce mois ? Cette action est irréversible.')) {
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            // Récupérer le token CSRF
            const csrfResponse = await axios.get(`${API_BASE_URL}/csrf-token`, {
                withCredentials: true,
                headers: { 'Accept': 'application/json' }
            });
            const csrfToken = csrfResponse.data.csrfToken;

            // Clôturer le mois
            const response = await axios.post(`${API_BASE_URL}/cloture-mois`, {
                annee: selectedYear,
                mois: selectedMonth
            }, {
                headers: { 'X-CSRF-TOKEN': csrfToken },
                withCredentials: true
            });

            alert('Mois clôturé avec succès !');
            // Recharger les données pour afficher la clôture
            await fetchDataMois();
            
        } catch (err) {
            if (err.response?.status === 409) {
                setError('Ce mois est déjà clôturé.');
            } else {
                setError('Erreur lors de la clôture du mois.');
            }
            console.error("Erreur clôture:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = async () => {
        setLoading(true);
        setError('');
        
        try {
            // Récupérer le token CSRF
            const csrfResponse = await axios.get(`${API_BASE_URL}/csrf-token`, {
                withCredentials: true,
                headers: { 'Accept': 'application/json' }
            });
            const csrfToken = csrfResponse.data.csrfToken;

            // Exporter en Excel
            const response = await axios.get(`${API_BASE_URL}/cloture-mois/${selectedYear}/${selectedMonth}/export`, {
                headers: { 'X-CSRF-TOKEN': csrfToken },
                withCredentials: true,
                responseType: 'blob' // Important pour les fichiers
            });

            // Créer un lien de téléchargement
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `cloture_${selectedYear}_${selectedMonth}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
        } catch (err) {
            setError('Erreur lors de l\'export Excel.');
            console.error("Erreur export:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDepenseInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setPiecesJointesDepense(files);
        } else {
            switch (name) {
                case 'dateDepense': setDateDepense(value); break;
                case 'categorieDepenseId': setCategorieDepenseId(value); break;
                case 'montantDepense': setMontantDepense(value); break;
                case 'commentaireDepense': setCommentaireDepense(value); break;
                default: break;
            }
        }
    };

    const handleDepenseSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Récupérer le token CSRF
            const csrfResponse = await axios.get(`${API_BASE_URL}/csrf-token`, {
                withCredentials: true,
                headers: { 'Accept': 'application/json' }
            });
            const csrfToken = csrfResponse.data.csrfToken;

            const formData = new FormData();
            formData.append('date', dateDepense);
            formData.append('categorie_depense_id', categorieDepenseId);
            formData.append('montant', montantDepense);
            formData.append('commentaire', commentaireDepense);
            
            // Gérer les pièces jointes (si sélectionnées)
            if (piecesJointesDepense) {
                for (let i = 0; i < piecesJointesDepense.length; i++) {
                    formData.append('pieces_jointes[]', piecesJointesDepense[i]);
                }
            }

            if (currentDepense) {
                // Mise à jour d'une dépense existante
                await axios.post(`${API_BASE_URL}/depenses/${currentDepense.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-HTTP-Method-Override': 'PUT'
                    },
                    withCredentials: true
                });
            } else {
                // Ajout d'une nouvelle dépense
                await axios.post(`${API_BASE_URL}/depenses`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    withCredentials: true
                });
            }
            
            setCurrentDepense(null);
            // Recharger les données après ajout/modification
            await fetchDataMois();
            
        } catch (err) {
            setError(currentDepense ? 'Erreur modification dépense.' : 'Erreur ajout dépense.');
            console.error(err);
        } finally {
            setLoading(false);
            handleCancelDepenseForm(); // Fermer et réinitialiser le formulaire
        }
    };

    const handleCancelDepenseForm = () => {
        setShowDepenseForm(false);
        setCurrentDepense(null);
        // Réinitialiser les champs du formulaire n'est pas strictement nécessaire ici
        // car le useEffect [currentDepense] le fera, mais c'est une bonne pratique.
        setDateDepense(new Date().toISOString().split('T')[0]);
        setCategorieDepenseId(categoriesDepenses.length > 0 ? categoriesDepenses[0].id : '');
        setMontantDepense('');
        setCommentaireDepense('');
        setPiecesJointesDepense(null);
    };

    const handleEditDepense = (depense) => {
        setCurrentDepense(depense); // Cela va déclencher le useEffect pour pré-remplir le formulaire
        setShowDepenseForm(true);
    };

    const handleDeleteDepense = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
            setLoading(true);
            setError('');
            try {
                // Récupérer le token CSRF
                const csrfResponse = await axios.get(`${API_BASE_URL}/csrf-token`, {
                    withCredentials: true,
                    headers: { 'Accept': 'application/json' }
                });
                const csrfToken = csrfResponse.data.csrfToken;

                // Supprimer la dépense
                await axios.delete(`${API_BASE_URL}/depenses/${id}`, {
                    headers: { 'X-CSRF-TOKEN': csrfToken },
                    withCredentials: true
                });

                // Recharger les données après suppression
                await fetchDataMois();
                
            } catch (err) {
                setError('Erreur lors de la suppression de la dépense.');
                console.error("Erreur suppression dépense:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDateForPrint = (year, month) => {
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="simulator p-4">
            <h2 className="text-xl font-semibold mb-4">Clôture de Caisse Mensuelle</h2>

            {/* Sélecteur de Mois/Année */}
            <div className="mb-4 flex gap-4 items-center">
                <div>
                    <label htmlFor="month-select" className="block text-sm font-medium text-gray-700">Mois:</label>
                    <select id="month-select" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('fr-FR', { month: 'long' })}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="year-select" className="block text-sm font-medium text-gray-700">Année:</label>
                    <input type="number" id="year-select" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
            </div>

            {/* Affichage des Soldes */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-100 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-blue-800">Solde Initial</h3>
                    <p className="text-2xl font-semibold text-blue-900">{soldeInitial.toLocaleString()} Ar</p>
                </div>
                <div className="p-4 bg-red-100 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-red-800">Total Dépenses du Mois</h3>
                    <p className="text-2xl font-semibold text-red-900">{totalDepensesMois.toLocaleString()} Ar</p>
                </div>
                <div className="p-4 bg-green-100 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-green-800">Solde Final (Estimé/Clôturé)</h3>
                    <p className={`text-2xl font-semibold ${soldeFinal >= 0 ? 'text-green-900' : 'text-red-600'}`}>
                        {soldeFinal >= 0 ? '+' : ''}{soldeFinal.toLocaleString()} Ar
                    </p>
                    {soldeFinal < 0 && (
                        <p className="text-xs text-red-600 mt-1">
                            ⚠️ Déficit: {(Math.abs(soldeFinal)).toLocaleString()} Ar
                        </p>
                    )}
                    {soldeFinal >= 0 && soldeFinal < 100000 && (
                        <p className="text-xs text-yellow-600 mt-1">
                            ⚠️ Solde faible
                        </p>
                    )}
                </div>
                <div className="p-4 bg-yellow-100 rounded-lg shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800">Solde du Chauffeur</h3>
                            <p className="text-2xl font-semibold text-yellow-900">{montantReduction.toLocaleString()} Ar</p>
                            <p className="text-xs text-yellow-700 mt-1">Réduction (%) du simulateur</p>
                        </div>
                        <button 
                            onClick={rafraichirDonneesReduction}
                            className="text-yellow-700 hover:text-yellow-900 p-1 rounded-full hover:bg-yellow-200 transition-colors duration-200"
                            title="Rafraîchir les données de réduction"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Note explicative sur les calculs */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="text-sm font-medium text-gray-800 mb-2">📊 Explication des calculs :</h4>
                <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Solde Final = Solde Initial - Total Dépenses du Mois</strong></p>
                    <p><strong>Solde du Chauffeur = Montant de la Réduction (%)</strong> (calculé séparément depuis le simulateur national)</p>
                    <p className="text-blue-600">💡 Le Solde du Chauffeur n'intervient pas dans le calcul du Solde Final</p>
                </div>
            </div>

            {/* Avertissement si solde initial faible par rapport aux dépenses */}
            {soldeInitial > 0 && totalDepensesMois > 0 && totalDepensesMois > soldeInitial * 2 && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Attention : Dépenses élevées</h4>
                    <div className="text-xs text-yellow-700 space-y-1">
                        <p>Les dépenses du mois ({totalDepensesMois.toLocaleString()} Ar) dépassent largement le solde initial ({soldeInitial.toLocaleString()} Ar).</p>
                        <p>Vérifiez que :</p>
                        <ul className="list-disc list-inside ml-2">
                            <li>Tous les simulateurs ont été utilisés ce mois-ci</li>
                            <li>Les données des simulateurs sont bien sauvegardées</li>
                            <li>Les dépenses sont correctement enregistrées</li>
                        </ul>
                        <p className="mt-2 font-medium">Ratio Dépenses/Solde Initial : {(totalDepensesMois / soldeInitial).toFixed(2)}x</p>
                    </div>
                </div>
            )}

            {/* Revenus par simulateur */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-gray-700">Revenu Simulateur National (Matin + Soir)</h3>
                    <p className="text-xl font-semibold">{revenuNational.toLocaleString()} Ar</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-gray-700">Revenu Simulateur Régional (Matin + Soir)</h3>
                    <p className="text-xl font-semibold">{revenuRegional.toLocaleString()} Ar</p>
                </div>
            </div>

            {/* Section Dépenses */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Dépenses du Mois</h3>
                    <button onClick={() => { setShowDepenseForm(true); setCurrentDepense(null); }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Ajouter Dépense
                    </button>
                </div>

                {/* Formulaire d'ajout/modification de dépense */}
                {showDepenseForm && (
                    <div className="p-4 border rounded-md bg-gray-50 mb-4">
                        <h4 className="text-md font-semibold mb-3">{currentDepense ? 'Modifier la Dépense' : 'Ajouter une Dépense'}</h4>
                        <form onSubmit={handleDepenseSubmit} className="space-y-3">
                            <div>
                                <label htmlFor="dateDepense" className="block text-sm font-medium text-gray-700">Date:</label>
                                <input type="date" id="dateDepense" name="dateDepense" value={dateDepense} onChange={handleDepenseInputChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="categorieDepenseId" className="block text-sm font-medium text-gray-700">Catégorie:</label>
                                <select id="categorieDepenseId" name="categorieDepenseId" value={categorieDepenseId} onChange={handleDepenseInputChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                                    <option value="">Sélectionner une catégorie</option>
                                    {categoriesDepenses.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nom}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="montantDepense" className="block text-sm font-medium text-gray-700">Montant (Ar):</label>
                                <input type="number" id="montantDepense" name="montantDepense" value={montantDepense} onChange={handleDepenseInputChange} required step="0.01" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="commentaireDepense" className="block text-sm font-medium text-gray-700">Commentaire:</label>
                                <textarea id="commentaireDepense" name="commentaireDepense" value={commentaireDepense} onChange={handleDepenseInputChange} rows="3" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                            </div>
                            <div>
                                <label htmlFor="piecesJointesDepense" className="block text-sm font-medium text-gray-700">Pièces Jointes (Optionnel):</label>
                                <input type="file" id="piecesJointesDepense" name="piecesJointesDepense" onChange={handleDepenseInputChange} multiple className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {piecesJointesDepense && piecesJointesDepense.length > 0 && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <p>Fichiers sélectionnés :</p>
                                        <ul>
                                            {Array.from(piecesJointesDepense).map((file, index) => (
                                                <li key={index}>- {file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Vous pouvez sélectionner plusieurs fichiers.</p>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={handleCancelDepenseForm} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                                    Annuler
                                </button>
                                <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" disabled={loading}>
                                    {loading ? 'Enregistrement...' : (currentDepense ? 'Modifier' : 'Ajouter')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {loading && <p>Chargement des dépenses...</p>}
                {!loading && error && <p className="error-message">{error}</p>}
                {!loading && !error && (
                    <DepenseList depenses={depenses} onEdit={handleEditDepense} onDelete={handleDeleteDepense} />
                )}

            </div>

            {/* Actions de Clôture */}
            <div className="flex gap-4 screen-only">
                <button onClick={handleCloturerMois} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" disabled={loading}>Clôturer le Mois</button>
                <button onClick={handleExportExcel} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" disabled={loading}>Exporter en Excel</button>
                <button onClick={handlePrint} className="print-button" disabled={loading}>Imprimer</button>
            </div>

            {/* Section imprimable */}
            <div className="printable-section">
                <div className="print-header">
                    <h1>CLÔTURE DE CAISSE MENSUELLE</h1>
                    <h2>{formatDateForPrint(selectedYear, selectedMonth)}</h2>
                    <div className="print-date-range">
                        Période: 01/{selectedMonth.toString().padStart(2, '0')}/{selectedYear} au 31/{selectedMonth.toString().padStart(2, '0')}/{selectedYear}
                    </div>
                </div>

                <div className="print-summary">
                    <h3>RÉSUMÉ FINANCIER</h3>
                    <div className="summary-row">
                        <span className="summary-label">Solde Initial:</span>
                        <span className="summary-value">{soldeInitial.toLocaleString()} Ar</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Total Dépenses du Mois:</span>
                        <span className="summary-value">{totalDepensesMois.toLocaleString()} Ar</span>
                    </div>
                    <div className="summary-row final-balance">
                        <span className="summary-label">Solde Final:</span>
                        <span className="summary-value">{soldeFinal.toLocaleString()} Ar</span>
                    </div>
                </div>

                {depenses.length > 0 && (
                    <div>
                        <h3>DÉTAIL DES DÉPENSES</h3>
                        <table className="printable-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Catégorie</th>
                                    <th>Montant (Ar)</th>
                                    <th>Commentaire</th>
                                </tr>
                            </thead>
                            <tbody>
                                {depenses.map((depense) => (
                                    <tr key={depense.id}>
                                        <td>{new Date(depense.date).toLocaleDateString('fr-FR')}</td>
                                        <td>{depense.categorie_depense?.nom || 'N/A'}</td>
                                        <td style={{ textAlign: 'right' }}>{parseFloat(depense.montant).toLocaleString()}</td>
                                        <td>{depense.commentaire || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Section pour les signatures */}
                <div className="print-signature-section">
                    <div className="signature-box">
                        Signature Responsable
                    </div>
                    <div className="signature-box">
                        Signature Comptable
                    </div>
                </div>
            </div>

            {error && <p className="error-message mt-4">{error}</p>}
        </div>
    );
};

export default ClotureMensuelle;