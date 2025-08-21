import React, { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaDownload, FaEye, FaDatabase, FaInfoCircle } from 'react-icons/fa';
import imageStorageService from '../services/ImageStorageService';
import StorageInfo from './StorageInfo';

const ImageStorageDemo = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showUploadForm, setShowUploadForm] = useState(false);

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            setLoading(true);
            const allImages = await imageStorageService.getAllImages();
            setImages(allImages);
        } catch (error) {
            console.error('Erreur lors du chargement des images:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const uploadedImages = [];

        try {
            for (const file of files) {
                if (file.size > 100 * 1024 * 1024) {
                    alert(`Fichier ${file.name} trop volumineux (max 100 MB)`);
                    continue;
                }

                // Compression automatique si l'image est grande
                let processedFile = file;
                if (file.size > 5 * 1024 * 1024) {
                    processedFile = await imageStorageService.compressImage(file, 1920, 0.8);
                    console.log(`Image compressée: ${(file.size / (1024 * 1024)).toFixed(2)} MB → ${(processedFile.size / (1024 * 1024)).toFixed(2)} MB`);
                }

                const imageId = await imageStorageService.saveImage(processedFile);
                uploadedImages.push({ ...processedFile, id: imageId });
            }

            await loadImages();
            alert(`${uploadedImages.length} image(s) téléchargée(s) avec succès !`);
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            alert('Erreur lors du téléchargement des images');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (window.confirm('Voulez-vous vraiment supprimer cette image ?')) {
            try {
                await imageStorageService.deleteImage(imageId);
                await loadImages();
                alert('Image supprimée avec succès');
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    const handleViewImage = async (image) => {
        try {
            const base64 = await imageStorageService.imageToBase64(image.data);
            setSelectedImage({ ...image, preview: base64 });
        } catch (error) {
            console.error('Erreur lors de l\'affichage:', error);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString('fr-FR');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Démonstration du Stockage d'Images
                </h1>
                <p className="text-gray-600">
                    Système de stockage durable avec support jusqu'à 100 MB par image
                </p>
            </div>

            {/* Informations de stockage */}
            <StorageInfo />

            {/* Zone de téléchargement */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Télécharger des Images</h2>
                    <button
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        {showUploadForm ? 'Masquer' : 'Télécharger'}
                    </button>
                </div>

                {showUploadForm && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <div className="space-y-2">
                            <p className="text-lg font-medium text-gray-700">
                                Glissez-déposez vos images ici ou cliquez pour sélectionner
                            </p>
                            <p className="text-sm text-gray-500">
                                Formats supportés: PNG, JPG, GIF, WebP (max 100 MB par fichier)
                            </p>
                            <p className="text-xs text-gray-400">
                                Les images seront automatiquement compressées si nécessaire
                            </p>
                        </div>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {uploading && (
                            <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span>Téléchargement en cours...</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Liste des images */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Images Stockées ({images.length})
                    </h2>
                    <button
                        onClick={loadImages}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Actualiser
                    </button>
                </div>

                {images.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <FaDatabase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">Aucune image stockée</p>
                        <p className="text-sm">Commencez par télécharger quelques images</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((image) => (
                            <div key={image.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium text-gray-800 truncate" title={image.filename}>
                                        {image.filename}
                                    </h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleViewImage(image)}
                                            className="p-1 text-blue-600 hover:text-blue-800"
                                            title="Voir l'image"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteImage(image.id)}
                                            className="p-1 text-red-600 hover:text-red-800"
                                            title="Supprimer"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Taille:</span>
                                        <span className="font-medium">{formatFileSize(image.size)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Type:</span>
                                        <span className="font-medium">{image.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Ajouté:</span>
                                        <span className="font-medium">{formatDate(image.timestamp)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal d'affichage d'image */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {selectedImage.filename}
                            </h3>
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4">
                            <img
                                src={selectedImage.preview}
                                alt={selectedImage.filename}
                                className="max-w-full h-auto rounded-lg"
                            />
                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="font-medium">Taille:</span> {formatFileSize(selectedImage.size)}
                                </div>
                                <div>
                                    <span className="font-medium">Type:</span> {selectedImage.type}
                                </div>
                                <div>
                                    <span className="font-medium">Ajouté:</span> {formatDate(selectedImage.timestamp)}
                                </div>
                                <div>
                                    <span className="font-medium">ID:</span> {selectedImage.id}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageStorageDemo;
