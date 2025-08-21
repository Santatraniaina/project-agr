import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Simulator.css';

const ConfigurationManager = () => {
    const [configurations, setConfigurations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeCategory, setActiveCategory] = useState('national');
    const [activePeriode, setActivePeriode] = useState('matin');
    const [timeStepMinutes, setTimeStepMinutes] = useState(() => {
        const saved = localStorage.getItem('time_step_minutes');
        const parsed = parseInt(saved || '5', 10);
        return Number.isNaN(parsed) ? 5 : Math.min(Math.max(parsed, 1), 60);
    });

    // Charger les configurations au montage
    useEffect(() => {
        loadConfigurations();
    }, [activeCategory, activePeriode]);

    // Synchroniser la configuration de l'heure depuis localStorage quand on ouvre la page
    useEffect(() => {
        try {
            const saved = localStorage.getItem('time_step_minutes');
            if (saved) {
                const parsed = parseInt(saved, 10);
                if (!Number.isNaN(parsed)) {
                    setTimeStepMinutes(Math.min(Math.max(parsed, 1), 60));
                }
            }
        } catch {}
    }, []);

    const loadConfigurations = async () => {
        setLoading(true);
        setError('');
        try {
            const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
                withCredentials: true,
                headers: { 'Accept': 'application/json' }
            });
            const csrfToken = csrfResponse.data.csrfToken;

            const response = await axios.get('http://localhost:8000/api/configurations', {
                params: {
                    category: activeCategory,
                    periode: activePeriode,
                    active: true
                },
                headers: { 'X-CSRF-TOKEN': csrfToken },
                withCredentials: true
            });

            setConfigurations(response.data.configurations);
        } catch (err) {
            setError('Erreur lors du chargement des configurations: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleValueChange = (configId, newValue) => {
        setConfigurations(prev => 
            prev.map(config => 
                config.id === configId 
                    ? { ...config, value: newValue }
                    : config
            )
        );
    };

    const saveConfigurations = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const csrfResponse = await axios.get('http://localhost:8000/api/csrf-token', {
                withCredentials: true,
                headers: { 'Accept': 'application/json' }
            });
            const csrfToken = csrfResponse.data.csrfToken;

            const configsToUpdate = configurations.map(config => ({
                id: config.id,
                value: config.value
            }));

            await axios.post('http://localhost:8000/api/configurations/batch-update', {
                configurations: configsToUpdate
            }, {
                headers: { 'X-CSRF-TOKEN': csrfToken },
                withCredentials: true
            });

            setSuccess('Configurations sauvegardées avec succès !');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Erreur lors de la sauvegarde: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const saveTimeSettings = () => {
        const normalized = Math.min(Math.max(parseInt(timeStepMinutes || 5, 10), 1), 60);
        setTimeStepMinutes(normalized);
        localStorage.setItem('time_step_minutes', String(normalized));
        setSuccess('Paramètre d\'heure sauvegardé.');
        setTimeout(() => setSuccess(''), 2000);
    };

    const formatValue = (config) => {
        if (config.type === 'percentage') {
            return (parseFloat(config.value) * 100).toFixed(1) + '%';
        } else if (config.type === 'amount' || config.type === 'price') {
            return parseInt(config.value).toLocaleString() + ' Ar';
        }
        return config.value;
    };

    const getInputType = (config) => {
        if (config.type === 'percentage') {
            return 'number';
        } else if (config.type === 'amount' || config.type === 'price') {
            return 'number';
        }
        return 'text';
    };

    const getInputStep = (config) => {
        if (config.type === 'percentage') {
            return '0.01';
        }
        return '1';
    };

    const getDisplayValue = (config) => {
        if (config.type === 'percentage') {
            return (parseFloat(config.value) * 100).toString();
        }
        return config.value;
    };

    const handleInputChange = (configId, inputValue, type) => {
        let actualValue = inputValue;
        if (type === 'percentage') {
            actualValue = (parseFloat(inputValue) / 100).toString();
        }
        handleValueChange(configId, actualValue);
    };

    return (
        <div className="simulator">
            <h2>Gestion des Configurations</h2>
            
            {/* Sélecteurs de catégorie et période */}
            <div className="config-selectors" style={{ marginBottom: '20px' }}>
                <div className="input-group">
                    <label>Catégorie:</label>
                    <select 
                        value={activeCategory} 
                        onChange={(e) => setActiveCategory(e.target.value)}
                    >
                        <option value="national">National (TNR/A-BE)</option>
                        <option value="regional">Régional (Manakara)</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Période:</label>
                    <select 
                        value={activePeriode} 
                        onChange={(e) => setActivePeriode(e.target.value)}
                    >
                        <option value="matin">Matin</option>
                        <option value="soir">Soir</option>
                    </select>
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message" style={{ color: 'green' }}>{success}</p>}

            {loading ? (
                <p>Chargement...</p>
            ) : (
                <div className="config-form">
                    <h3>Configuration {activeCategory} - {activePeriode}</h3>
                    
                    {configurations.length === 0 ? (
                        <p>Aucune configuration trouvée pour cette catégorie et période.</p>
                    ) : (
                        <div className="config-list">
                            {configurations.map(config => (
                                <div key={config.id} className="config-item" style={{ 
                                    marginBottom: '15px', 
                                    padding: '15px', 
                                    border: '1px solid #ddd', 
                                    borderRadius: '5px' 
                                }}>
                                    <div className="config-header">
                                        <h4>{config.description}</h4>
                                        <small>Valeur actuelle: {formatValue(config)}</small>
                                    </div>
                                    <div className="input-group">
                                        <label>
                                            Nouvelle valeur 
                                            {config.type === 'percentage' && ' (%)'}
                                            {(config.type === 'amount' || config.type === 'price') && ' (Ar)'}:
                                        </label>
                                        <input
                                            type={getInputType(config)}
                                            step={getInputStep(config)}
                                            value={getDisplayValue(config)}
                                            onChange={(e) => handleInputChange(config.id, e.target.value, config.type)}
                                            min="0"
                                        />
                                    </div>
                                </div>
                            ))}
                            
                            <div className="config-actions" style={{ marginTop: '20px' }}>
                                <button 
                                    type="button" 
                                    onClick={saveConfigurations}
                                    disabled={loading}
                                    className="save-btn"
                                    style={{ 
                                        backgroundColor: '#28a745', 
                                        color: 'white', 
                                        padding: '10px 20px',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={loadConfigurations}
                                    disabled={loading}
                                    style={{ 
                                        marginLeft: '10px',
                                        backgroundColor: '#6c757d', 
                                        color: 'white', 
                                        padding: '10px 20px',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bloc paramétrage d'heure */}
                    <div className="config-list" style={{ marginTop: '24px' }}>
                        <div className="config-item" style={{ 
                            marginBottom: '15px', 
                            padding: '15px', 
                            border: '1px solid #ddd', 
                            borderRadius: '5px' 
                        }}>
                            <div className="config-header">
                                <h4>Paramétrage d'heure (pas des minutes)</h4>
                                <small>Définit le pas des champs heure (inputs time) en minutes</small>
                            </div>
                            <div className="input-group">
                                <label>Pas (minutes):</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    step="1"
                                    value={timeStepMinutes}
                                    onChange={(e) => setTimeStepMinutes(parseInt(e.target.value || '5', 10))}
                                />
                            </div>
                            <div className="config-actions" style={{ marginTop: '12px' }}>
                                <button 
                                    type="button" 
                                    onClick={saveTimeSettings}
                                    className="save-btn"
                                    style={{ 
                                        backgroundColor: '#0d6efd', 
                                        color: 'white', 
                                        padding: '8px 16px',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Sauvegarder le paramètre d'heure
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfigurationManager;