import React, { useState } from 'react';
import GestionDepenses from './GestionDepenses';
import GestionCategories from './GestionCategories';
import './DepensesManager.css';

const DepensesManager = () => {
    const [activeTab, setActiveTab] = useState('depenses');

    return (
        <div className="depenses-manager-container">
            <header className="depenses-header">
                <h1>Gestion Financière</h1>
                <p>Système complet de gestion des dépenses pour AGR Transport</p>
            </header>
            
            <div className="depenses-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'depenses' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('depenses')}>
                    💰 Gestion des Dépenses
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('categories')}>
                    🏷️ Catégories
                </button>
            </div>

            <main className="depenses-content">
                {activeTab === 'depenses' && <GestionDepenses />}
                {activeTab === 'categories' && <GestionCategories />}
            </main>

            <footer className="depenses-footer">
                © {new Date().getFullYear()} AGR Transport • Système de Gestion Financière
            </footer>
        </div>
    );
};

export default DepensesManager;