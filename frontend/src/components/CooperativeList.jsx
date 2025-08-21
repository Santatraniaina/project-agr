import React from 'react';
import { FaEdit, FaTrash, FaCity, FaEye } from 'react-icons/fa';

const CooperativeList = ({ cooperatives, onEdit, onDelete, onConfigureCities, loading, error }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Erreur! </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        );
    }

    if (cooperatives.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-xl font-medium text-gray-700 mb-2">Aucune coopérative trouvée</h3>
                <p className="text-gray-500 mb-4">Commencez par créer votre première coopérative</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nom
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Marque
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Modèle
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Logo
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {cooperatives.map((cooperative) => (
                            <tr key={cooperative.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{cooperative.nom}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{cooperative.marque}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{cooperative.modele}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {cooperative.logoPreview ? (
                                        <div className="relative group">
                                            <img 
                                                src={cooperative.logoPreview} 
                                                alt={`Logo ${cooperative.nom}`}
                                                className="h-12 w-12 rounded-lg object-cover border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer"
                                                title={`Logo de ${cooperative.nom}`}
                                            />
                                            {/* Aperçu agrandi au survol */}
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                                <img 
                                                    src={cooperative.logoPreview} 
                                                    alt={`Aperçu ${cooperative.nom}`}
                                                    className="h-24 w-24 rounded-lg object-cover border-2 border-white shadow-lg"
                                                />
                                            </div>
                                        </div>
                                    ) : cooperative.hasLogo ? (
                                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                                            <div className="text-center">
                                                <div className="text-blue-600 text-xs font-medium">Logo</div>
                                                <div className="text-blue-400 text-xs">En cours...</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                                            <div className="text-center">
                                                <div className="text-gray-500 text-xs font-medium">No Logo</div>
                                                <div className="text-gray-400 text-xs">Ajouter</div>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => onConfigureCities(cooperative)}
                                            className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 transition-colors duration-200"
                                            title="Configurer les villes"
                                        >
                                            <FaCity />
                                        </button>
                                        <button
                                            onClick={() => onEdit(cooperative)}
                                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 transition-colors duration-200"
                                            title="Modifier"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => onDelete(cooperative.id)}
                                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition-colors duration-200"
                                            title="Supprimer"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CooperativeList;