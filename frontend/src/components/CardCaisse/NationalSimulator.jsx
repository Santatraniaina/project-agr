import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Simulator.css';

const NationalSimulator = ({ periode }) => {
    const initialVoitureState = { 
        passagers_tnr: 0, 
        passagers_abe: 0, 
        paye_autre_dest_tnr: 0, 
        paye_autre_dest_abe: 0 
    };
    
    const [voitures, setVoitures] = useState([{...initialVoitureState}]);
    const [resultats, setResultats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const isMountedRef = useRef(false);
    const [isCalculating, setIsCalculating] = useState(false); // Protection contre les calculs multiples
    const abortControllerRef = useRef(null); // Pour annuler les requêtes en cours
    
    const [parametres, setParametres] = useState({
        prix_tnr: 50000,
        prix_abe: periode === 'matin' ? 40000 : 50000,
        pourcentage_reduction: 10,
        frais_fixe: 5000
    });

    // Mise à jour des paramètres quand la période change
    useEffect(() => {
        setParametres(prev => ({
            ...prev,
            prix_abe: periode === 'matin' ? 40000 : 50000
        }));
    }, [periode]);

    // Chargement des données sauvegardées
    useEffect(() => {
        const loadSavedData = () => {
            try {
                const savedVoitures = localStorage.getItem('nationalSimulator_lastVoituresInput');
                if (savedVoitures) {
                    const parsed = JSON.parse(savedVoitures);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setVoitures(parsed);
                    }
                }

                const savedResults = localStorage.getItem('nationalSimulator_lastResults');
                if (savedResults) {
                    setResultats(JSON.parse(savedResults));
                }
            } catch (e) {
                console.error("Erreur de lecture localStorage", e);
                localStorage.removeItem('nationalSimulator_lastVoituresInput');
                localStorage.removeItem('nationalSimulator_lastResults');
            }
        };

        loadSavedData();
    }, []);

    // Réinitialisation des résultats quand les données changent
    useEffect(() => {
        if (isMountedRef.current) {
            setResultats(null);
            localStorage.removeItem('nationalSimulator_lastResults');
        } else {
            isMountedRef.current = true;
        }
    }, [periode, voitures]);

    // Nettoyage lors du démontage du composant
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            isMountedRef.current = false;
        };
    }, []);

    const handleParametreChange = (name, value) => {
        // Protection contre les modifications pendant le calcul
        if (loading || isCalculating) {
            console.log('Modification bloquée pendant le calcul');
            return;
        }
        
        let numValue = parseFloat(value) || 0;
        
        if (name === 'pourcentage_reduction') {
            numValue = Math.min(Math.max(numValue, 0), 100);
        } else {
            numValue = Math.max(numValue, 0);
        }
        
        setParametres(prev => ({
            ...prev,
            [name]: numValue
        }));
        setResultats(null);
    };

    const handleInputChange = (index, event) => {
        // Protection contre les modifications pendant le calcul
        if (loading || isCalculating) {
            console.log('Modification bloquée pendant le calcul');
            return;
        }
        
        const { name, value } = event.target;
        const numValue = Math.max(parseInt(value || 0, 10), 0);
        
        setVoitures(prev => {
            const newVoitures = [...prev];
            newVoitures[index] = {
                ...newVoitures[index],
                [name]: numValue
            };
            return newVoitures;
        });
    };

    const handleAddVoiture = () => {
        // Protection contre les modifications pendant le calcul
        if (loading || isCalculating) {
            console.log('Modification bloquée pendant le calcul');
            return;
        }
        
        setVoitures(prev => [...prev, {...initialVoitureState}]);
    };

    const handleRemoveVoiture = (index) => {
        // Protection contre les modifications pendant le calcul
        if (loading || isCalculating) {
            console.log('Modification bloquée pendant le calcul');
            return;
        }
        
        setVoitures(prev => {
            const newVoitures = [...prev];
            newVoitures.splice(index, 1);
            return newVoitures.length > 0 ? newVoitures : [{...initialVoitureState}];
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Protection contre les calculs multiples
        if (isCalculating || loading) {
            console.log('Calcul déjà en cours, ignoré');
            return;
        }
        
        // Validation des données avant envoi
        if (!voitures || voitures.length === 0) {
            setError('Aucune voiture à calculer');
            return;
        }
        
        // Vérification que toutes les voitures ont des données valides
        const hasValidData = voitures.every(v => 
            v.passagers_tnr >= 0 && 
            v.passagers_abe >= 0 && 
            v.paye_autre_dest_tnr >= 0 && 
            v.paye_autre_dest_abe >= 0
        );
        
        if (!hasValidData) {
            setError('Veuillez vérifier que tous les champs sont remplis correctement');
            return;
        }
        
        // Initialisation du contrôleur d'annulation
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        
        setLoading(true);
        setIsCalculating(true);
        setError('');
        
        try {
            // Récupération du token CSRF
            const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
                withCredentials: true,
                signal: abortControllerRef.current.signal
            });

            // Préparation des données avec correction du pourcentage
            const requestData = {
                periode,
                voitures: voitures.map(v => ({
                    passagers_tnr: v.passagers_tnr,
                    passagers_abe: v.passagers_abe,
                    paye_autre_dest_tnr: v.paye_autre_dest_tnr,
                    paye_autre_dest_abe: v.paye_autre_dest_abe
                })),
                parametres: {
                    prix_tnr: parametres.prix_tnr,
                    prix_abe: parametres.prix_abe,
                    pourcentage_reduction: parametres.pourcentage_reduction / 100, // Conversion en décimal
                    frais_fixe: parametres.frais_fixe
                }
            };

            // Envoi de la requête avec signal d'annulation
            const response = await axios.post(
                'http://localhost:8000/api/simulateur/national',
                requestData,
                {
                    headers: { 
                        'X-CSRF-TOKEN': csrfResponse.data.csrfToken,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    withCredentials: true,
                    signal: abortControllerRef.current.signal
                }
            );

            // Vérification que le composant est toujours monté
            if (isMountedRef.current) {
            setResultats(response.data);
            localStorage.setItem('nationalSimulator_lastResults', JSON.stringify(response.data));
            localStorage.setItem('nationalSimulator_lastVoituresInput', JSON.stringify(voitures));
            try {
                const now = new Date();
                const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                const storageKey = `caisse_totaux:${monthKey}`;
                const existing = localStorage.getItem(storageKey);
                const parsed = existing ? JSON.parse(existing) : {};
                const montantFinal = response.data?.total_global?.montant_a_payer_total || 0;
                parsed[`national_${periode}`] = montantFinal;
                parsed.updatedAt = new Date().toISOString();
                localStorage.setItem(storageKey, JSON.stringify(parsed));
            } catch (e) {
                console.error('Erreur enregistrement totaux national dans localStorage:', e);
            }
            }
        } catch (err) {
            // Ignorer les erreurs d'annulation
            if (axios.isCancel(err)) {
                console.log('Requête annulée');
                return;
            }
            
            let errorMsg = 'Erreur lors du calcul';
            
            if (err.response) {
                if (err.response.status === 422) {
                    errorMsg = "Données invalides: " + 
                        (err.response.data.errors ? 
                         Object.values(err.response.data.errors).join(', ') : 
                         err.response.data.message);
                } else {
                    errorMsg = err.response.data.message || `Erreur ${err.response.status}`;
                }
            } else {
                errorMsg = err.message || errorMsg;
            }
            
            if (isMountedRef.current) {
            setError(errorMsg);
            }
            console.error("Erreur API:", err);
        } finally {
            if (isMountedRef.current) {
            setLoading(false);
                setIsCalculating(false);
            }
        }
    };

    return (
        <div className="simulator">
            <h2>Simulateur National ({periode === 'matin' ? 'Matin' : 'Soir'})</h2>
            
            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-2/3">
                    {/* Section des paramètres configurables - Style moderne */}
                    <div className="parametres-section" style={{
                        backgroundColor: '#f8f9fa',
                        padding: '20px',
                        marginBottom: '20px',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{
                            marginTop: '0',
                            color: '#495057',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            marginBottom: '15px'
                        }}>Paramètres de Calcul</h3>
                        <div className="parametres-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '15px'
                        }}>
                <div className="input-group">
                    <label>Prix TNR (Ar):</label>
                    <input
                        type="number"
                        value={parametres.prix_tnr}
                        onChange={(e) => handleParametreChange('prix_tnr', e.target.value)}
                                    onWheel={(e) => e.target.blur()} // Désactive le scroll de la souris
                        min="0"
                        step="1000"
                                    disabled={loading || isCalculating}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        backgroundColor: (loading || isCalculating) ? '#f8f9fa' : 'white',
                                        cursor: (loading || isCalculating) ? 'not-allowed' : 'text',
                                        userSelect: (loading || isCalculating) ? 'none' : 'auto',
                                        pointerEvents: (loading || isCalculating) ? 'none' : 'auto'
                                    }}
                    />
                </div>
                <div className="input-group">
                    <label>Prix Antsirabe (Ar):</label>
                    <input
                        type="number"
                        value={parametres.prix_abe}
                        onChange={(e) => handleParametreChange('prix_abe', e.target.value)}
                                    onWheel={(e) => e.target.blur()} // Désactive le scroll de la souris
                        min="0"
                        step="1000"
                                    disabled={loading || isCalculating}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        backgroundColor: (loading || isCalculating) ? '#f8f9fa' : 'white',
                                        cursor: (loading || isCalculating) ? 'not-allowed' : 'text',
                                        userSelect: (loading || isCalculating) ? 'none' : 'auto',
                                        pointerEvents: (loading || isCalculating) ? 'none' : 'auto'
                                    }}
                    />
                </div>
                <div className="input-group">
                    <label>Réduction (%):</label>
                    <input
                        type="number"
                        value={parametres.pourcentage_reduction}
                        onChange={(e) => handleParametreChange('pourcentage_reduction', e.target.value)}
                                    onWheel={(e) => e.target.blur()} // Désactive le scroll de la souris
                        min="0"
                        max="100"
                        step="0.1"
                                    disabled={loading || isCalculating}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        backgroundColor: (loading || isCalculating) ? '#f8f9fa' : 'white',
                                        cursor: (loading || isCalculating) ? 'not-allowed' : 'text',
                                        userSelect: (loading || isCalculating) ? 'none' : 'auto',
                                        pointerEvents: (loading || isCalculating) ? 'none' : 'auto'
                                    }}
                    />
                </div>
                <div className="input-group">
                    <label>Frais Fixe (Ar):</label>
                    <input
                        type="number"
                        value={parametres.frais_fixe}
                        onChange={(e) => handleParametreChange('frais_fixe', e.target.value)}
                                    onWheel={(e) => e.target.blur()} // Désactive le scroll de la souris
                        min="0"
                        step="1000"
                                    disabled={loading || isCalculating}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        backgroundColor: (loading || isCalculating) ? '#f8f9fa' : 'white',
                                        cursor: (loading || isCalculating) ? 'not-allowed' : 'text',
                                        userSelect: (loading || isCalculating) ? 'none' : 'auto',
                                        pointerEvents: (loading || isCalculating) ? 'none' : 'auto'
                                    }}
                                />
                            </div>
                </div>
            </div>

                    <form onSubmit={handleSubmit}>
                {voitures.map((voiture, index) => (
                            <div key={index} className="voiture-inputs" style={{
                                border: '1px dashed #6c757d',
                                padding: '20px',
                                marginBottom: '20px',
                                borderRadius: '8px',
                                backgroundColor: '#f8f9fa',
                                position: 'relative'
                            }}>
                                {/* Overlay de protection pendant le calcul */}
                                {(loading || isCalculating) && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(248, 249, 250, 0.9)',
                                        borderRadius: '8px',
                                        zIndex: 5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        pointerEvents: 'none'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            color: '#6c757d',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                border: '2px solid #6c757d',
                                                borderTop: '2px solid transparent',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }}></div>
                                            Calcul en cours...
                                        </div>
                                    </div>
                                )}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '15px'
                                }}>
                                    <h4 style={{
                                        margin: '0',
                                        color: '#495057',
                                        fontSize: '1.1rem',
                                        fontWeight: '600'
                                    }}>Voiture {index + 1}</h4>
                            {voitures.length > 1 && (
                                <button 
                                    type="button" 
                                    className="remove-btn"
                                    onClick={() => handleRemoveVoiture(index)}
                                            style={{
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '6px 12px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            × Supprimer
                                </button>
                            )}
                        </div>
                        
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '15px'
                                }}>
                            <div className="input-group">
                                <label>Passagers TNR:</label>
                                <input
                                    type="number"
                                    name="passagers_tnr"
                                    value={voiture.passagers_tnr}
                                    onChange={(e) => handleInputChange(index, e)}
                                            onWheel={(e) => e.target.blur()} // Désactive le scroll de la souris
                                    min="0"
                                            disabled={loading || isCalculating}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #ced4da',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                backgroundColor: (loading || isCalculating) ? '#f8f9fa' : 'white',
                                                cursor: (loading || isCalculating) ? 'not-allowed' : 'text',
                                                userSelect: (loading || isCalculating) ? 'none' : 'auto',
                                                pointerEvents: (loading || isCalculating) ? 'none' : 'auto'
                                            }}
                                />
                            </div>
                            <div className="input-group">
                                <label>Passagers Antsirabe:</label>
                                <input
                                    type="number"
                                    name="passagers_abe"
                                    value={voiture.passagers_abe}
                                    onChange={(e) => handleInputChange(index, e)}
                                            onWheel={(e) => e.target.blur()} // Désactive le scroll de la souris
                                    min="0"
                                            disabled={loading || isCalculating}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #ced4da',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                backgroundColor: (loading || isCalculating) ? '#f8f9fa' : 'white',
                                                cursor: (loading || isCalculating) ? 'not-allowed' : 'text',
                                                userSelect: (loading || isCalculating) ? 'none' : 'auto',
                                                pointerEvents: (loading || isCalculating) ? 'none' : 'auto'
                                            }}
                                />
                            </div>
                            <div className="input-group">
                                <label>Payé autre dest. TNR:</label>
                                <input
                                    type="number"
                                    name="paye_autre_dest_tnr"
                                    value={voiture.paye_autre_dest_tnr}
                                    onChange={(e) => handleInputChange(index, e)}
                                            onWheel={(e) => e.target.blur()} // Désactive le scroll de la souris
                                    min="0"
                                            disabled={loading || isCalculating}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #ced4da',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                backgroundColor: (loading || isCalculating) ? '#f8f9fa' : 'white',
                                                cursor: (loading || isCalculating) ? 'not-allowed' : 'text',
                                                userSelect: (loading || isCalculating) ? 'none' : 'auto',
                                                pointerEvents: (loading || isCalculating) ? 'none' : 'auto'
                                            }}
                                />
                            </div>
                            <div className="input-group">
                                <label>Payé autre dest. Antsirabe:</label>
                                <input
                                    type="number"
                                    name="paye_autre_dest_abe"
                                    value={voiture.paye_autre_dest_abe}
                                    onChange={(e) => handleInputChange(index, e)}
                                            onWheel={(e) => e.target.blur()} // Désactive le scroll de la souris
                                    min="0"
                                            disabled={loading || isCalculating}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #ced4da',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                backgroundColor: (loading || isCalculating) ? '#f8f9fa' : 'white',
                                                cursor: (loading || isCalculating) ? 'not-allowed' : 'text',
                                                userSelect: (loading || isCalculating) ? 'none' : 'auto',
                                                pointerEvents: (loading || isCalculating) ? 'none' : 'auto'
                                            }}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                        <div style={{
                            display: 'flex',
                            gap: '15px',
                            marginTop: '20px',
                            flexWrap: 'wrap'
                        }}>
                    <button 
                        type="button" 
                        onClick={handleAddVoiture}
                                style={{
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '12px 20px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                    >
                        + Ajouter Voiture
                    </button>
                    <button 
                        type="submit" 
                                disabled={loading || isCalculating}
                                style={{
                                    backgroundColor: (loading || isCalculating) ? '#6c757d' : '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '12px 24px',
                                    cursor: (loading || isCalculating) ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    position: 'relative'
                                }}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            border: '2px solid #ffffff',
                                            borderTop: '2px solid transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }}></div>
                                        Calcul en cours...
                                    </span>
                                ) : isCalculating ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            border: '2px solid #ffffff',
                                            borderTop: '2px solid transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }}></div>
                                        Traitement...
                                    </span>
                                ) : (
                                    'Calculer'
                                )}
                    </button>
                </div>
            </form>

            {error && (
                        <div className="error-message" style={{
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: '#f8d7da',
                            border: '1px solid #f5c6cb',
                            borderRadius: '6px',
                            color: '#721c24'
                        }}>
                            <p style={{ margin: '0' }}>⚠️ {error}</p>
                </div>
            )}

            {resultats && (
                        <div className="results-section" style={{
                            marginTop: '30px',
                            paddingTop: '20px',
                            borderTop: '2px solid #e9ecef'
                        }}>
                            <h3 style={{
                                color: '#495057',
                                marginBottom: '20px',
                                fontSize: '1.3rem'
                            }}>Résultats du Calcul</h3>
                            
                            <div className="results-table" style={{
                                overflowX: 'auto',
                                marginBottom: '25px'
                            }}>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '6px',
                                    overflow: 'hidden'
                                }}>
                            <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{
                                                padding: '12px',
                                                border: '1px solid #dee2e6',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                color: '#495057'
                                            }}>Voiture</th>
                                            <th style={{
                                                padding: '12px',
                                                border: '1px solid #dee2e6',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                color: '#495057'
                                            }}>Pass. TNR</th>
                                            <th style={{
                                                padding: '12px',
                                                border: '1px solid #dee2e6',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                color: '#495057'
                                            }}>Pass. ABE</th>
                                            <th style={{
                                                padding: '12px',
                                                border: '1px solid #dee2e6',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                color: '#495057'
                                            }}>Montant Brut</th>
                                            <th style={{
                                                padding: '12px',
                                                border: '1px solid #dee2e6',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                color: '#495057'
                                            }}>Montant Net</th>
                                            <th style={{
                                                padding: '12px',
                                                border: '1px solid #dee2e6',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                color: '#495057'
                                            }}>Payé Autre TNR</th>
                                            <th style={{
                                                padding: '12px',
                                                border: '1px solid #dee2e6',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                color: '#495057'
                                            }}>Payé Autre ABE</th>
                                            <th style={{
                                                padding: '12px',
                                                border: '1px solid #dee2e6',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                color: '#495057'
                                            }}>À Payer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultats.voitures.map((v, i) => (
                                            <tr key={i} style={{
                                                backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8f9fa'
                                            }}>
                                                <td style={{
                                                    padding: '12px',
                                                    border: '1px solid #dee2e6',
                                                    fontWeight: '500'
                                                }}>V{i+1}</td>
                                                <td style={{
                                                    padding: '12px',
                                                    border: '1px solid #dee2e6'
                                                }}>{v.passagers_tnr}</td>
                                                <td style={{
                                                    padding: '12px',
                                                    border: '1px solid #dee2e6'
                                                }}>{v.passagers_abe}</td>
                                                <td style={{
                                                    padding: '12px',
                                                    border: '1px solid #dee2e6',
                                                    fontWeight: '500'
                                                }}>{v.montant_brut?.toLocaleString() ?? 'N/A'}</td>
                                                <td style={{
                                                    padding: '12px',
                                                    border: '1px solid #dee2e6',
                                                    fontWeight: '500'
                                                }}>{v.montant_apres_reduction?.toLocaleString() ?? 'N/A'}</td>
                                                <td style={{
                                                    padding: '12px',
                                                    border: '1px solid #dee2e6'
                                                }}>{v.paye_autre_dest_tnr}</td>
                                                <td style={{
                                                    padding: '12px',
                                                    border: '1px solid #dee2e6'
                                                }}>{v.paye_autre_dest_abe}</td>
                                                <td style={{
                                                    padding: '12px',
                                                    border: '1px solid #dee2e6',
                                                    fontWeight: '600',
                                                    color: '#28a745',
                                                    backgroundColor: '#d4edda'
                                                }}>
                                            {v.montant_a_payer?.toLocaleString() ?? 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                            <div className="totals-section" style={{
                                backgroundColor: '#f8f9fa',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #dee2e6'
                            }}>
                                <h4 style={{
                                    color: '#495057',
                                    marginTop: '0',
                                    marginBottom: '20px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600'
                                }}>Totaux Généraux</h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '15px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '10px',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <span style={{ fontWeight: '500' }}>Nombre de voitures:</span>
                                        <span style={{ fontWeight: '600', color: '#495057' }}>{resultats.nombre_voitures}</span>
                            </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '10px',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <span style={{ fontWeight: '500' }}>Total Passagers TNR:</span>
                                        <span style={{ fontWeight: '600', color: '#495057' }}>{resultats.total_global.passagers_tnr}</span>
                            </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '10px',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <span style={{ fontWeight: '500' }}>Total Passagers Antsirabe:</span>
                                        <span style={{ fontWeight: '600', color: '#495057' }}>{resultats.total_global.passagers_abe}</span>
                            </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '10px',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <span style={{ fontWeight: '500' }}>Montant Brut Total:</span>
                                        <span style={{ fontWeight: '600', color: '#495057' }}>{resultats.total_global.montant_brut_total?.toLocaleString() ?? 'N/A'}</span>
                            </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '10px',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <span style={{ fontWeight: '500' }}>Montant Net Total:</span>
                                        <span style={{ fontWeight: '600', color: '#495057' }}>{resultats.total_global.montant_apres_reduction_total?.toLocaleString() ?? 'N/A'}</span>
                            </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '15px',
                                        backgroundColor: '#d4edda',
                                        borderRadius: '6px',
                                        border: '2px solid #28a745',
                                        gridColumn: '1 / -1'
                                    }}>
                                        <span style={{ fontWeight: '600', color: '#155724' }}>Montant Final à Payer:</span>
                                        <span style={{ fontWeight: '700', color: '#155724', fontSize: '1.1rem' }}>{resultats.total_global.montant_a_payer_total?.toLocaleString() ?? 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
                </div>
                {/* Le résumé des dépenses est maintenant géré par le composant parent CardCaisse */}
            </div>
        </div>
    );
};

export default NationalSimulator;