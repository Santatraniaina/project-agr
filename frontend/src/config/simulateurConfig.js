// Configuration centralisée pour les simulateurs
export const simulateurConfig = {
    // Configuration du simulateur national
    national: {
        matin: {
            prix_tnr: 50000,
            prix_abe: 40000,
            pourcentage_reduction: 10,
            frais_fixe: 5000
        },
        soir: {
            prix_tnr: 50000,
            prix_abe: 50000,
            pourcentage_reduction: 10,
            frais_fixe: 5000
        }
    },
    
    // Configuration du simulateur régional
    regional: {
        matin: {
            prix_manakara: 30000,
            deplacement_manakara: 12000
        },
        soir: {
            prix_manakara: 35000,
            deplacement_manakara: 12000
        }
    },
    
    // Validation des champs
    validation: {
        pourcentage_reduction: {
            min: 0,
            max: 100,
            step: 0.1
        },
        prix: {
            min: 0,
            step: 1000
        },
        passagers: {
            min: 0,
            step: 1
        }
    },
    
    // Messages d'erreur
    messages: {
        erreur_calcul: 'Erreur lors du calcul',
        donnees_invalides: 'Données invalides',
        pourcentage_invalide: 'Le pourcentage de réduction doit être entre 0 et 100%',
        prix_negatif: 'Les prix ne peuvent pas être négatifs',
        passagers_negatif: 'Le nombre de passagers ne peut pas être négatif'
    },
    
    // Styles par défaut
    styles: {
        colors: {
            primary: '#007bff',
            success: '#28a745',
            danger: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8',
            light: '#f8f9fa',
            dark: '#343a40'
        },
        spacing: {
            small: '8px',
            medium: '15px',
            large: '20px'
        },
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
};

// Fonctions utilitaires
export const simulateurUtils = {
    // Formater un montant en Ariary
    formatMontant: (montant) => {
        if (montant === null || montant === undefined) return 'N/A';
        return new Intl.NumberFormat('fr-MG', {
            style: 'currency',
            currency: 'MGA',
            minimumFractionDigits: 0
        }).format(montant);
    },
    
    // Valider un pourcentage
    validerPourcentage: (pourcentage) => {
        const num = parseFloat(pourcentage);
        return !isNaN(num) && num >= 0 && num <= 100;
    },
    
    // Valider un prix
    validerPrix: (prix) => {
        const num = parseFloat(prix);
        return !isNaN(num) && num >= 0;
    },
    
    // Calculer le montant après réduction
    calculerMontantApresReduction: (montantBrut, pourcentageReduction, fraisFixe = 0) => {
        const pourcentageDecimal = pourcentageReduction / 100;
        return (montantBrut * (1 - pourcentageDecimal)) + fraisFixe;
    },
    
    // Calculer le montant final
    calculerMontantFinal: (montantNet, payeAutreTnr, prixTnr, payeAutreAbe, prixAbe) => {
        const valeurPayeAutreTnr = payeAutreTnr * prixTnr;
        const valeurPayeAutreAbe = payeAutreAbe * prixAbe;
        return montantNet - valeurPayeAutreTnr - valeurPayeAutreAbe;
    }
};

// Configuration des thèmes
export const themes = {
    light: {
        backgroundColor: '#ffffff',
        textColor: '#495057',
        borderColor: '#dee2e6',
        cardBackground: '#f8f9fa',
        primaryColor: '#007bff'
    },
    dark: {
        backgroundColor: '#212529',
        textColor: '#f8f9fa',
        borderColor: '#495057',
        cardBackground: '#343a40',
        primaryColor: '#0d6efd'
    }
};

export default simulateurConfig;
