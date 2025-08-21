class CooperativeStorageService {
    constructor() {
        this.dbName = 'CooperativeStorageDB';
        this.dbVersion = 1;
        this.cooperativesStore = 'cooperatives';
        this.imagesStore = 'images';
        this.db = null;
        this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB non supporté'));
                return;
            }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                console.log('Base de données CooperativeStorageDB ouverte avec succès');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Créer l'object store pour les coopératives
                if (!db.objectStoreNames.contains(this.cooperativesStore)) {
                    const cooperativesStore = db.createObjectStore(this.cooperativesStore, { keyPath: 'id', autoIncrement: true });
                    cooperativesStore.createIndex('nom', 'nom', { unique: false });
                    cooperativesStore.createIndex('timestamp', 'timestamp', { unique: false });
                    console.log('Object store cooperatives créé avec succès');
                }
                
                // Créer l'object store pour les images
                if (!db.objectStoreNames.contains(this.imagesStore)) {
                    const imagesStore = db.createObjectStore(this.imagesStore, { keyPath: 'id', autoIncrement: true });
                    imagesStore.createIndex('cooperativeId', 'cooperativeId', { unique: false });
                    imagesStore.createIndex('timestamp', 'timestamp', { unique: false });
                    console.log('Object store images créé avec succès');
                }
            };
        });
    }

    // Générer un ID unique
    generateId() {
        return `coop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Sauvegarder une coopérative avec son image
    async saveCooperative(cooperativeData) {
        if (!this.db) {
            await this.init();
        }

        return new Promise(async (resolve, reject) => {
            try {
                const transaction = this.db.transaction([this.cooperativesStore, this.imagesStore], 'readwrite');
                const cooperativesStore = transaction.objectStore(this.cooperativesStore);
                const imagesStore = transaction.objectStore(this.imagesStore);

                // Préparer les données de la coopérative
                const cooperative = {
                    id: cooperativeData.id || this.generateId(),
                    nom: cooperativeData.nom,
                    marque: cooperativeData.marque,
                    modele: cooperativeData.modele,
                    timestamp: Date.now(),
                    lastModified: Date.now()
                };

                // Si il y a une image, la traiter
                if (cooperativeData.logo && typeof cooperativeData.logo !== 'string') {
                    const imageId = `img_${cooperative.id}_${Date.now()}`;
                    
                    // Sauvegarder l'image
                    const imageData = {
                        id: imageId,
                        cooperativeId: cooperative.id,
                        filename: cooperativeData.logo.name,
                        type: cooperativeData.logo.type,
                        size: cooperativeData.logo.size,
                        data: cooperativeData.logo,
                        timestamp: Date.now()
                    };

                    // Ajouter l'ID de l'image à la coopérative
                    cooperative.logoId = imageId;
                    cooperative.hasLogo = true;

                    // Sauvegarder l'image
                    await new Promise((imgResolve, imgReject) => {
                        const imgRequest = imagesStore.add(imageData);
                        imgRequest.onsuccess = () => imgResolve();
                        imgRequest.onerror = () => imgReject(imgRequest.error);
                    });
                }

                // Sauvegarder la coopérative
                const coopRequest = cooperativesStore.put(cooperative);
                coopRequest.onsuccess = () => {
                    console.log('Coopérative sauvegardée avec succès:', cooperative.id);
                    resolve(cooperative);
                };
                coopRequest.onerror = () => reject(coopRequest.error);

            } catch (error) {
                reject(error);
            }
        });
    }

    // Récupérer toutes les coopératives avec leurs images
    async getAllCooperatives() {
        if (!this.db) {
            await this.init();
        }

        return new Promise(async (resolve, reject) => {
            try {
                const transaction = this.db.transaction([this.cooperativesStore, this.imagesStore], 'readonly');
                const cooperativesStore = transaction.objectStore(this.cooperativesStore);
                const imagesStore = transaction.objectStore(this.imagesStore);

                // Récupérer toutes les coopératives
                const cooperativesRequest = cooperativesStore.getAll();
                cooperativesRequest.onsuccess = async () => {
                    const cooperatives = cooperativesRequest.result;
                    
                    // Pour chaque coopérative, récupérer son image si elle existe
                    const cooperativesWithImages = await Promise.all(
                        cooperatives.map(async (cooperative) => {
                            if (cooperative.logoId) {
                                try {
                                    const imageRequest = imagesStore.get(cooperative.logoId);
                                    const imageResult = await new Promise((imgResolve, imgReject) => {
                                        imageRequest.onsuccess = () => imgResolve(imageRequest.result);
                                        imageRequest.onerror = () => imgReject(imageRequest.error);
                                    });
                                    
                                    if (imageResult) {
                                        // Convertir l'image en base64 pour l'affichage
                                        cooperative.logoPreview = await this.fileToBase64(imageResult.data);
                                        cooperative.hasLogo = true;
                                    } else {
                                        cooperative.hasLogo = false;
                                    }
                                } catch (error) {
                                    console.warn('Erreur lors de la récupération de l\'image:', error);
                                    cooperative.hasLogo = false;
                                }
                            } else {
                                cooperative.hasLogo = false;
                            }
                            
                            return cooperative;
                        })
                    );

                    resolve(cooperativesWithImages);
                };
                cooperativesRequest.onerror = () => reject(cooperativesRequest.error);

            } catch (error) {
                reject(error);
            }
        });
    }

    // Récupérer une coopérative par ID
    async getCooperative(id) {
        if (!this.db) {
            await this.init();
        }

        return new Promise(async (resolve, reject) => {
            try {
                const transaction = this.db.transaction([this.cooperativesStore, this.imagesStore], 'readonly');
                const cooperativesStore = transaction.objectStore(this.cooperativesStore);
                const imagesStore = transaction.objectStore(this.imagesStore);

                const cooperativeRequest = cooperativesStore.get(id);
                cooperativeRequest.onsuccess = async () => {
                    if (cooperativeRequest.result) {
                        const cooperative = cooperativeRequest.result;
                        
                        // Récupérer l'image si elle existe
                        if (cooperative.logoId) {
                            try {
                                const imageRequest = imagesStore.get(cooperative.logoId);
                                imageRequest.onsuccess = async () => {
                                    if (imageRequest.result) {
                                        cooperative.logoPreview = await this.fileToBase64(imageRequest.result.data);
                                    }
                                    resolve(cooperative);
                                };
                                imageRequest.onerror = () => resolve(cooperative);
                            } catch (error) {
                                console.warn('Erreur lors de la récupération de l\'image:', error);
                                resolve(cooperative);
                            }
                        } else {
                            resolve(cooperative);
                        }
                    } else {
                        reject(new Error('Coopérative non trouvée'));
                    }
                };
                cooperativeRequest.onerror = () => reject(cooperativeRequest.error);

            } catch (error) {
                reject(error);
            }
        });
    }

    // Mettre à jour une coopérative
    async updateCooperative(id, updateData) {
        if (!this.db) {
            await this.init();
        }

        try {
            // Récupérer la coopérative existante
            const existingCooperative = await this.getCooperative(id);
            if (!existingCooperative) {
                throw new Error('Coopérative non trouvée');
            }

            // Fusionner les données
            const updatedCooperative = {
                ...existingCooperative,
                ...updateData,
                lastModified: Date.now()
            };

            // Sauvegarder la mise à jour
            return await this.saveCooperative(updatedCooperative);

        } catch (error) {
            throw error;
        }
    }

    // Supprimer une coopérative et son image
    async deleteCooperative(id) {
        if (!this.db) {
            await this.init();
        }

        return new Promise(async (resolve, reject) => {
            try {
                const transaction = this.db.transaction([this.cooperativesStore, this.imagesStore], 'readwrite');
                const cooperativesStore = transaction.objectStore(this.cooperativesStore);
                const imagesStore = transaction.objectStore(this.imagesStore);

                // Récupérer la coopérative pour obtenir l'ID de l'image
                const cooperativeRequest = cooperativesStore.get(id);
                cooperativeRequest.onsuccess = async () => {
                    if (cooperativeRequest.result && cooperativeRequest.result.logoId) {
                        // Supprimer l'image associée
                        try {
                            await new Promise((imgResolve, imgReject) => {
                                const imgRequest = imagesStore.delete(cooperativeRequest.result.logoId);
                                imgRequest.onsuccess = () => imgResolve();
                                imgRequest.onerror = () => imgReject(imgRequest.error);
                            });
                        } catch (error) {
                            console.warn('Erreur lors de la suppression de l\'image:', error);
                        }
                    }

                    // Supprimer la coopérative
                    const deleteRequest = cooperativesStore.delete(id);
                    deleteRequest.onsuccess = () => {
                        console.log('Coopérative supprimée avec succès:', id);
                        resolve();
                    };
                    deleteRequest.onerror = () => reject(deleteRequest.error);
                };
                cooperativeRequest.onerror = () => reject(cooperativeRequest.error);

            } catch (error) {
                reject(error);
            }
        });
    }

    // Convertir un fichier en base64
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Obtenir les informations de stockage
    async getStorageInfo() {
        if (!this.db) {
            await this.init();
        }

        try {
            const transaction = this.db.transaction([this.cooperativesStore, this.imagesStore], 'readonly');
            const cooperativesStore = transaction.objectStore(this.cooperativesStore);
            const imagesStore = transaction.objectStore(this.imagesStore);

            const [cooperatives, images] = await Promise.all([
                new Promise((resolve, reject) => {
                    const request = cooperativesStore.getAll();
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                }),
                new Promise((resolve, reject) => {
                    const request = imagesStore.getAll();
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                })
            ]);

            const totalImageSize = images.reduce((sum, img) => sum + img.size, 0);

            return {
                totalCooperatives: cooperatives.length,
                totalImages: images.length,
                totalImageSize: totalImageSize,
                totalImageSizeMB: (totalImageSize / (1024 * 1024)).toFixed(2)
            };

        } catch (error) {
            throw error;
        }
    }

    // Nettoyer les anciennes données
    async cleanupOldData(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 jours par défaut
        if (!this.db) {
            await this.init();
        }

        try {
            const transaction = this.db.transaction([this.cooperativesStore, this.imagesStore], 'readwrite');
            const cooperativesStore = transaction.objectStore(this.cooperativesStore);
            const imagesStore = transaction.objectStore(this.imagesStore);

            const [cooperatives, images] = await Promise.all([
                new Promise((resolve, reject) => {
                    const request = cooperativesStore.getAll();
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                }),
                new Promise((resolve, reject) => {
                    const request = imagesStore.getAll();
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                })
            ]);

            const now = Date.now();
            let deletedCount = 0;

            // Supprimer les anciennes coopératives et leurs images
            for (const cooperative of cooperatives) {
                if ((now - cooperative.timestamp) > maxAge) {
                    await this.deleteCooperative(cooperative.id);
                    deletedCount++;
                }
            }

            console.log(`${deletedCount} anciennes coopératives supprimées`);
            return deletedCount;

        } catch (error) {
            throw error;
        }
    }

    // Exporter toutes les données
    async exportAllData() {
        if (!this.db) {
            await this.init();
        }

        try {
            const cooperatives = await this.getAllCooperatives();
            return {
                cooperatives: cooperatives,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
        } catch (error) {
            throw error;
        }
    }

    // Importer des données
    async importData(data) {
        if (!this.db) {
            await this.init();
        }

        try {
            if (data.cooperatives && Array.isArray(data.cooperatives)) {
                for (const cooperative of data.cooperatives) {
                    await this.saveCooperative(cooperative);
                }
                console.log(`${data.cooperatives.length} coopératives importées avec succès`);
            }
        } catch (error) {
            throw error;
        }
    }
}

// Créer une instance singleton
const cooperativeStorageService = new CooperativeStorageService();

export default cooperativeStorageService;
