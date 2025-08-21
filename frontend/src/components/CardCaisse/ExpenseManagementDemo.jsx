import React from 'react';
import ExpenseManagementDisplay from './ExpenseManagementDisplay';
import './DepensesManager.css';

const ExpenseManagementDemo = () => {
    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <h1 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '1rem' }}>
                    Interface de Gestion des Dépenses
                </h1>
                <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>
                    Démonstration de l'interface complète de gestion financière
                </p>
                
                <div style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    padding: '2rem',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{ color: '#1f2937', marginBottom: '1rem' }}>Instructions d'utilisation</h2>
                    <ul style={{ color: '#374151', paddingLeft: '1.5rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>Sélectionnez l'onglet "Gestion des Dépenses" pour voir la liste des dépenses</li>
                        <li style={{ marginBottom: '0.5rem' }}>Utilisez le bouton "Ajouter une Dépense" pour créer une nouvelle dépense</li>
                        <li style={{ marginBottom: '0.5rem' }}>Filtrez les dépenses par catégorie, date ou mots-clés</li>
                        <li style={{ marginBottom: '0.5rem' }}>Modifiez ou supprimez des dépenses existantes avec les boutons d'action</li>
                        <li>Consultez les statistiques de dépenses en bas de la section</li>
                    </ul>
                </div>
                
                <ExpenseManagementDisplay />
            </div>
        </div>
    );
};

export default ExpenseManagementDemo;