import React from 'react';

const DepenseList = ({ depenses, onEdit, onDelete }) => {
    if (!depenses || depenses.length === 0) {
        return <p className="text-gray-500">Aucune dépense pour ce mois.</p>;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant (Ar)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commentaire</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pièces Jointes</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {depenses.map((depense) => (
                        <tr key={depense.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{formatDate(depense.date)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{depense.categorie_depense ? depense.categorie_depense.nom : 'N/A'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-right">{parseFloat(depense.montant).toLocaleString()}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{depense.commentaire || '-'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                <button onClick={() => onEdit(depense)} className="text-indigo-600 hover:text-indigo-900 mr-2">Modifier</button>
                                <button onClick={() => onDelete(depense.id)} className="text-red-600 hover:text-red-900">Supprimer</button>                                
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700">
                                {depense.pieces_jointes && depense.pieces_jointes.length > 0 ? (
                                    <ul className="space-y-1">
                                        {depense.pieces_jointes.map((pj, index) => (
                                            <li key={index}>
                                                <a
                                                    href={pj.path || pj.url || pj}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline text-xs"
                                                    title={`Taille: ${pj.size ? (pj.size / 1024).toFixed(2) + ' KB' : 'N/A'}`}
                                                >
                                                    {pj.nom_original || pj.nom || `Fichier ${index + 1}`}
                                                </a>
                                                {pj.mime_type && (
                                                    <span className="text-gray-400 text-xs ml-1">
                                                        ({pj.mime_type.split('/')[1]?.toUpperCase()})
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-gray-400">Aucune</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DepenseList;