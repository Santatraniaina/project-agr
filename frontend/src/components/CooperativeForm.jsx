import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaUpload, FaCompress, FaInfoCircle } from 'react-icons/fa';
import cooperativeStorageService from '../services/CooperativeStorageService';

const CooperativeForm = ({ cooperative, onCreate, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({
        nom: '',
        marque: '',
        modele: '',
        logo: null
    });
    const [logoPreview, setLogoPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [imageProcessing, setImageProcessing] = useState(false);
    const [compressionEnabled, setCompressionEnabled] = useState(true);

    useEffect(() => {
        if (cooperative) {
            setFormData({
                nom: cooperative.nom || '',
                marque: cooperative.marque || '',
                modele: cooperative.modele || '',
                logo: cooperative.logo || null
            });
            // Afficher le logo existant s'il y en a un
            if (cooperative.logoPreview) {
                setLogoPreview(cooperative.logoPreview);
            } else if (cooperative.logo) {
                // Si le logo est stocké directement (ancien format)
                setLogoPreview(`data:image/jpeg;base64,${cooperative.logo}`);
            } else {
                setLogoPreview(null);
            }
        }
    }, [cooperative]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérifier la taille (100 MB max)
            if (file.size > 100 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    logo: 'La taille du fichier ne doit pas dépasser 100 MB'
                }));
                return;
            }
            
            setImageProcessing(true);
            
            try {
                let processedFile = file;
                
                // Compression automatique si activée et si l'image est grande
                if (compressionEnabled && file.size > 5 * 1024 * 1024) { // 5 MB
                    processedFile = await compressImage(processedFile, 1920, 0.8);
                    console.log(`Image compressée: ${(file.size / (1024 * 1024)).toFixed(2)} MB → ${(processedFile.size / (1024 * 1024)).toFixed(2)} MB`);
                }
                
                setFormData(prev => ({
                    ...prev,
                    logo: processedFile
                }));
                
                // Créer l'aperçu
                const preview = await fileToBase64(processedFile);
                setLogoPreview(preview);
                
                // Effacer les erreurs
                if (errors.logo) {
                    setErrors(prev => ({
                        ...prev,
                        logo: ''
                    }));
                }
                
            } catch (error) {
                console.error('Erreur lors du traitement de l\'image:', error);
                setErrors(prev => ({
                    ...prev,
                    logo: 'Erreur lors du traitement de l\'image'
                }));
            } finally {
                setImageProcessing(false);
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.nom.trim()) {
            newErrors.nom = 'Le nom est requis';
        }
        
        if (!formData.marque.trim()) {
            newErrors.marque = 'La marque est requise';
        }
        
        if (!formData.modele.trim()) {
            newErrors.modele = 'Le modèle est requis';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            // Préparer les données pour le stockage
            const cooperativeData = {
                id: cooperative?.id, // undefined pour nouvelle coopérative
                nom: formData.nom,
                marque: formData.marque,
                modele: formData.modele,
                logo: formData.logo
            };
            
            let savedCooperative;
            
            if (cooperative) {
                // Mettre à jour une coopérative existante
                savedCooperative = await cooperativeStorageService.updateCooperative(cooperative.id, cooperativeData);
                console.log('Coopérative mise à jour:', savedCooperative);
            } else {
                // Créer une nouvelle coopérative
                savedCooperative = await cooperativeStorageService.saveCooperative(cooperativeData);
                console.log('Nouvelle coopérative créée:', savedCooperative);
            }
            
            // Appeler les callbacks avec les données sauvegardées
            if (cooperative) {
                await onUpdate(cooperative.id, savedCooperative);
            } else {
                await onCreate(savedCooperative);
            }
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            setErrors(prev => ({
                ...prev,
                submit: 'Erreur lors de la sauvegarde de la coopérative'
            }));
        }
    };

    const handleCancel = () => {
        onCancel();
    };

    // Fonction utilitaire pour compresser une image
    const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculer les nouvelles dimensions
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                // Dessiner l'image redimensionnée
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir en blob avec compression
                canvas.toBlob(
                    (blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    },
                    file.type,
                    quality
                );
            };

            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    };

    // Fonction utilitaire pour convertir un fichier en base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {cooperative ? 'Modifier une coopérative' : 'Ajouter une coopérative'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                            Nom de la coopérative
                        </label>
                        <input
                            type="text"
                            id="nom"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.nom ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Entrez le nom de la coopérative"
                        />
                        {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="marque" className="block text-sm font-medium text-gray-700 mb-1">
                            Marque
                        </label>
                        <input
                            type="text"
                            id="marque"
                            name="marque"
                            value={formData.marque}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.marque ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Entrez la marque"
                        />
                        {errors.marque && <p className="mt-1 text-sm text-red-600">{errors.marque}</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="modele" className="block text-sm font-medium text-gray-700 mb-1">
                            Modèle
                        </label>
                        <input
                            type="text"
                            id="modele"
                            name="modele"
                            value={formData.modele}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.modele ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Entrez le modèle"
                        />
                        {errors.modele && <p className="mt-1 text-sm text-red-600">{errors.modele}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Logo
                        </label>
                        
                        {/* Options de compression */}
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <FaCompress className="text-blue-600" />
                                    <span className="text-sm font-medium text-blue-800">Compression automatique</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={compressionEnabled}
                                        onChange={(e) => setCompressionEnabled(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <p className="text-xs text-blue-600 mt-1">
                                Compression automatique des images {'>'} 5 MB pour optimiser l'espace
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {logoPreview && (
                                <div className="relative group">
                                    <img 
                                        src={logoPreview} 
                                        alt="Logo preview" 
                                        className="h-20 w-20 rounded-lg object-cover border-2 border-gray-300 hover:border-blue-400 transition-all duration-200"
                                    />
                                    {imageProcessing && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        </div>
                                    )}
                                    {/* Aperçu agrandi au survol */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                        <img 
                                            src={logoPreview} 
                                            alt="Aperçu agrandi"
                                            className="h-32 w-32 rounded-lg object-cover border-2 border-white shadow-xl"
                                        />
                                    </div>
                                    {/* Bouton de suppression du logo */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLogoPreview(null);
                                            setFormData(prev => ({ ...prev, logo: null }));
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                                        title="Supprimer le logo"
                                    >
                                        <FaTimes className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                            <div className="flex-1">
                                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                    imageProcessing 
                                        ? 'border-gray-400 bg-gray-50 cursor-not-allowed' 
                                        : logoPreview
                                        ? 'border-blue-300 bg-blue-50 hover:border-blue-400'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {imageProcessing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mb-4"></div>
                                                <p className="text-sm text-gray-500">Traitement en cours...</p>
                                            </>
                                        ) : logoPreview ? (
                                            <>
                                                <FaUpload className="w-8 h-8 mb-4 text-blue-500" />
                                                <p className="text-sm text-blue-600 font-medium">
                                                    Remplacer le logo
                                                </p>
                                                <p className="text-xs text-blue-500">Cliquez pour changer</p>
                                            </>
                                        ) : (
                                            <>
                                                <FaUpload className="w-8 h-8 mb-4 text-gray-500" />
                                                <p className="text-sm text-gray-500">
                                                    <span className="font-semibold">Cliquez pour télécharger</span>
                                                </p>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 100 MB)</p>
                                                <p className="text-xs text-gray-400">Stockage durable garanti</p>
                                            </>
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleLogoChange}
                                        disabled={imageProcessing}
                                    />
                                </label>
                                {errors.logo && <p className="mt-1 text-sm text-red-600">{errors.logo}</p>}
                                
                                {/* Informations sur le stockage */}
                                <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                                    <FaInfoCircle />
                                    <span>Images stockées localement avec IndexedDB pour une persistance durable</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Affichage des erreurs de soumission */}
                {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-600">{errors.submit}</p>
                    </div>
                )}
                
                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                    >
                        <FaTimes className="mr-2" />
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                    >
                        <FaSave className="mr-2" />
                        {cooperative ? 'Mettre à jour' : 'Créer'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CooperativeForm;