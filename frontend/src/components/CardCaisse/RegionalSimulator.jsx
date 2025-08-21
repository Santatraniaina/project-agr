import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExpenseSummary from './ExpenseSummary';
import './Simulator.css';

const RegionalSimulator = ({ periode }) => {
    const initialVoitureState = { passagers_manakara: 0, gasoil: 0, paye_autre_dest_manakara: 0 };
    const [voitures, setVoitures] = useState([initialVoitureState]);
    const [resultats, setResultats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // États pour les paramètres configurables
    const [parametres, setParametres] = useState({
        prix_manakara: periode === 'matin' ? 30000 : 35000,
        deplacement_manakara: 12000
    });

    // Mettre à jour les paramètres par défaut quand la période change
    useEffect(() => {
        setParametres({
            prix_manakara: periode === 'matin' ? 30000 : 35000,
            deplacement_manakara: 12000
        });
    }, [periode]);

    // Fonction pour gérer les changements de paramètres
    const handleParametreChange = (name, value) => {
        setParametres(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
        // Effacer les résultats quand les paramètres changent
        setResultats(null);
    };

    useEffect(() => {
        setResultats(null);
    }, [periode, voitures.length]);

    const handleInputChange = (index, event) => {
        const { name, value } = event.target;
        const list = [...voitures];
        list[index][name] = parseFloat(value) || 0; // Gasoil peut être décimal
        setVoitures(list);
    };

    const handleAddVoiture = () => {
        setVoitures([...voitures, { ...initialVoitureState }]);
    };

    const handleRemoveVoiture = (index) => {
        const list = [...voitures];
        list.splice(index, 1);
        setVoitures(list.length > 0 ? list : [initialVoitureState]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setResultats(null);
        try {
            // 1. Récupérer le jeton CSRF
            const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
                withCredentials: true,
                headers: { 'Accept': 'application/json' }
            });
            const csrfToken = csrfResponse.data.csrfToken;

            // 2. Envoyer la requête POST avec le jeton CSRF dans les en-têtes
            const response = await axios.post('simulateur/regional',
                {
                    periode,
                    voitures,
                    parametres: {
                        prix_manakara: parametres.prix_manakara,
                        deplacement_manakara: parametres.deplacement_manakara
                    }
                },
                {
                    headers: { 'X-CSRF-TOKEN': csrfToken },
                    withCredentials: true
                }
            );
            setResultats(response.data);
            try {
                const now = new Date();
                const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                const storageKey = `caisse_totaux:${monthKey}`;
                const existing = localStorage.getItem(storageKey);
                const parsed = existing ? JSON.parse(existing) : {};
                const montantFinal = response.data?.total_global?.montant_a_payer_total || 0;
                parsed[`regional_${periode}`] = montantFinal;
                parsed.updatedAt = new Date().toISOString();
                localStorage.setItem(storageKey, JSON.stringify(parsed));
            } catch (e) {
                console.error('Erreur enregistrement totaux regional dans localStorage:', e);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Erreur lors du calcul.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="simulator">
            <h2>Calcul Régional ({periode.charAt(0).toUpperCase() + periode.slice(1)})</h2>
            
            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-2/3">
                    {/* Section des paramètres configurables */}
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
                                <label style={{
                                    display: 'block',
                                    marginBottom: '5px',
                                    fontWeight: 'bold',
                                    color: '#495057'
                                }}>Prix Manakara (Ar):</label>
                                <input
                                    type="number"
                                    value={parametres.prix_manakara}
                                    onChange={(e) => handleParametreChange('prix_manakara', e.target.value)}
                                    min="0"
                                    step="1000"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div className="input-group">
                                <label style={{
                                    display: 'block',
                                    marginBottom: '5px',
                                    fontWeight: 'bold',
                                    color: '#495057'
                                }}>Déplacement Manakara (Ar):</label>
                                <input
                                    type="number"
                                    value={parametres.deplacement_manakara}
                                    onChange={(e) => handleParametreChange('deplacement_manakara', e.target.value)}
                                    min="0"
                                    step="1000"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '6px',
                                        fontSize: '14px'
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
                                <h4 style={{
                                    margin: '0 0 15px 0',
                                    color: '#495057',
                                    fontSize: '1.1rem',
                                    fontWeight: '600'
                                }}>Voiture {index + 1}</h4>
                                <div className="input-group" style={{ marginBottom: '15px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '5px',
                                        fontWeight: 'bold',
                                        color: '#495057'
                                    }}>Passagers Dest:</label>
                                    <input 
                                        type="number" 
                                        name="passagers_manakara" 
                                        value={voiture.passagers_manakara} 
                                        onChange={e => handleInputChange(index, e)}
                                        min="0"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ced4da',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '5px',
                                        fontWeight: 'bold',
                                        color: '#495057'
                                    }}>Gasoil (Ar):</label>
                                    <input 
                                        type="number" 
                                        step="1000" 
                                        name="gasoil" 
                                        value={voiture.gasoil} 
                                        onChange={e => handleInputChange(index, e)}
                                        min="0"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ced4da',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '5px',
                                        fontWeight: 'bold',
                                        color: '#495057'
                                    }}>Nbr Payé Autre Dest. Arret:</label>
                                    <input 
                                        type="number" 
                                        name="paye_autre_dest_manakara" 
                                        value={voiture.paye_autre_dest_manakara} 
                                        onChange={e => handleInputChange(index, e)}
                                        min="0"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ced4da',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
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
                                            fontSize: '12px',
                                            marginTop: '10px'
                                        }}
                                    >
                                        × Supprimer
                                    </button>
                                )}
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
                                disabled={loading}
                                style={{
                                    backgroundColor: loading ? '#6c757d' : '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '12px 24px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                {loading ? 'Calcul en cours...' : 'Calculer'}
                            </button>
                        </div>
                    </form>

                    {error && <p className="error-message">{error}</p>}

                    {resultats && (
                        <div className="results-section">
                            <h3>Résultats</h3>
                            <h4>Détails par voiture :</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Voiture</th>
                                        <th>Pass. Manakara</th>
                                        <th>Montant Brut</th>
                                        <th>Déplacement</th>
                                        <th>Gasoil</th>
                                        <th>Nbr Payé Autre Dest.</th>
                                        <th>Montant à Payer</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultats.voitures.map((v, i) => (
                                        <tr key={i}>
                                            <td>V{v.id}</td>
                                            <td>{v.passagers_manakara}</td>
                                            <td>{v.montant_brut.toLocaleString()}</td>
                                            <td>{v.deplacement.toLocaleString()}</td>
                                            <td>{v.gasoil.toLocaleString()}</td>
                                            <td>{v.paye_autre_dest_manakara}</td>
                                            <td>{v.montant_a_payer.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <h4>Totaux :</h4>
                            <p>Nombre de voitures: {resultats.nombre_voitures}</p>
                            <p>Total Passagers Manakara: {resultats.total_global.passagers_manakara}</p>
                            <p>Montant Brut Total: {resultats.total_global.montant_brut_total.toLocaleString()}</p>
                            <p>Déplacement Total: {resultats.total_global.deplacement_total.toLocaleString()}</p>
                            <p>Gasoil Total: {resultats.total_global.gasoil_total.toLocaleString()}</p>
                            <p>Valeur Payé Autre Dest. Manakara Total: {resultats.total_global.paye_autre_dest_manakara_total_valeur.toLocaleString()}</p>
                            <p><strong>Montant à Payer Total: {resultats.total_global.montant_a_payer_total.toLocaleString()}</strong></p>
                            <p>Montant à Payer par Voiture (Moyenne): {resultats.total_global.montant_a_payer_par_voiture_moyenne.toLocaleString()}</p>
                        </div>
                    )}
                </div>
                <div className="md:w-1/3">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <ExpenseSummary />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegionalSimulator;
