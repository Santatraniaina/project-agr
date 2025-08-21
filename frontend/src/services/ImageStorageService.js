class ImageStorageService {
    constructor() {
        this.dbName = 'ImageStorageDB';
        this.dbVersion = 1;
        this.storeName = 'images';
        this.db = null;
        this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Erreur lors de l\'ouverture de la base de données:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Base de données IndexedDB ouverte avec succès');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Créer l'object store s'il n'existe pas
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('filename', 'filename', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    console.log('Object store créé avec succès');
                }
            };
        });
    }

    // Générer un ID unique pour l'image
    generateImageId() {
        return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Sauvegarder une image dans IndexedDB
    async saveImage(file, customId = null) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const imageData = {
                id: customId || this.generateImageId(),
                filename: file.name,
                type: file.type,
                size: file.size,
                timestamp: Date.now(),
                data: file
            };

            const request = store.add(imageData);

            request.onsuccess = () => {
                console.log('Image sauvegardée avec succès:', imageData.id);
                resolve(imageData.id);
            };

            request.onerror = () => {
                console.error('Erreur lors de la sauvegarde de l\'image:', request.error);
                reject(request.error);
            };
        });
    }

    // Récupérer une image par ID
    async getImage(imageId) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(imageId);

            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result);
                } else {
                    reject(new Error('Image non trouvée'));
                }
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Récupérer toutes les images
    async getAllImages() {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Supprimer une image
    async deleteImage(imageId) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(imageId);

            request.onsuccess = () => {
                console.log('Image supprimée avec succès:', imageId);
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Vérifier l'espace disponible
    async getStorageInfo() {
        if (!this.db) {
            await this.init();
        }

        const images = await this.getAllImages();
        const totalSize = images.reduce((sum, img) => sum + img.size, 0);
        
        return {
            totalImages: images.length,
            totalSize: totalSize,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
        };
    }

    // Nettoyer les anciennes images (optionnel)
    async cleanupOldImages(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 jours par défaut
        if (!this.db) {
            await this.init();
        }

        const images = await this.getAllImages();
        const now = Date.now();
        const oldImages = images.filter(img => (now - img.timestamp) > maxAge);

        for (const img of oldImages) {
            await this.deleteImage(img.id);
        }

        console.log(`${oldImages.length} anciennes images supprimées`);
        return oldImages.length;
    }

    // Convertir une image en base64 pour l'affichage
    async imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Compresser une image (optionnel pour économiser l'espace)
    async compressImage(file, maxWidth = 1920, quality = 0.8) {
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
    }
}

// Créer une instance singleton
const imageStorageService = new ImageStorageService();

export default imageStorageService;
