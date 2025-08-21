// Test de l'API du simulateur national
// Ce fichier peut être exécuté dans la console du navigateur

class SimulateurAPITest {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.testData = {
            periode: 'matin',
            voitures: [
                {
                    passagers_tnr: 5,
                    passagers_abe: 3,
                    paye_autre_dest_tnr: 2,
                    paye_autre_dest_abe: 1
                }
            ],
            parametres: {
                prix_tnr: 50000,
                prix_abe: 40000,
                pourcentage_reduction: 0.10,
                frais_fixe: 5000
            }
        };
    }

    // Test de récupération du token CSRF
    async testCSRFToken() {
        try {
            console.log('🔑 Test de récupération du token CSRF...');
            const response = await fetch(`${this.baseURL}/csrf-token`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Token CSRF récupéré:', data.csrfToken);
                return data.csrfToken;
            } else {
                console.error('❌ Erreur lors de la récupération du token CSRF:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ Erreur lors de la récupération du token CSRF:', error);
            return null;
        }
    }

    // Test du simulateur national
    async testSimulateurNational(csrfToken) {
        try {
            console.log('🚗 Test du simulateur national...');
            console.log('📊 Données de test:', this.testData);
            
            const response = await fetch(`${this.baseURL}/simulateur/national`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(this.testData)
            });
            
            if (response.ok) {
                const resultats = await response.json();
                console.log('✅ Résultats du simulateur national:', resultats);
                this.verifierCalculs(resultats);
                return resultats;
            } else {
                const errorData = await response.json();
                console.error('❌ Erreur du simulateur national:', response.status, errorData);
                return null;
            }
        } catch (error) {
            console.error('❌ Erreur lors du test du simulateur national:', error);
            return null;
        }
    }

    // Test du simulateur régional
    async testSimulateurRegional(csrfToken) {
        try {
            console.log('🌍 Test du simulateur régional...');
            
            const testDataRegional = {
                periode: 'matin',
                voitures: [
                    {
                        passagers_manakara: 4,
                        gasoil: 15000,
                        paye_autre_dest_manakara: 1
                    }
                ],
                parametres: {
                    prix_manakara: 30000,
                    deplacement_manakara: 12000
                }
            };
            
            console.log('📊 Données de test régional:', testDataRegional);
            
            const response = await fetch(`${this.baseURL}/simulateur/regional`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(testDataRegional)
            });
            
            if (response.ok) {
                const resultats = await response.json();
                console.log('✅ Résultats du simulateur régional:', resultats);
                return resultats;
            } else {
                const errorData = await response.json();
                console.error('❌ Erreur du simulateur régional:', response.status, errorData);
                return null;
            }
        } catch (error) {
            console.error('❌ Erreur lors du test du simulateur régional:', error);
            return null;
        }
    }

    // Vérification des calculs
    verifierCalculs(resultats) {
        console.log('🔍 Vérification des calculs...');
        
        if (!resultats || !resultats.voitures || resultats.voitures.length === 0) {
            console.error('❌ Aucun résultat à vérifier');
            return;
        }
        
        const voiture = resultats.voitures[0];
        const testData = this.testData.voitures[0];
        const parametres = this.testData.parametres;
        
        // Calculs attendus
        const montantBrutAttendu = (testData.passagers_tnr * parametres.prix_tnr) + 
                                  (testData.passagers_abe * parametres.prix_abe);
        const montantApresReductionAttendu = (montantBrutAttendu * (1 - parametres.pourcentage_reduction)) + 
                                           parametres.frais_fixe;
        const valeurPayeAutreTnr = testData.paye_autre_dest_tnr * parametres.prix_tnr;
        const valeurPayeAutreAbe = testData.paye_autre_dest_abe * parametres.prix_abe;
        const montantFinalAttendu = montantApresReductionAttendu - valeurPayeAutreTnr - valeurPayeAutreAbe;
        
        console.log('📊 Calculs attendus:');
        console.log(`  - Montant Brut: ${montantBrutAttendu.toLocaleString()} Ar`);
        console.log(`  - Montant après réduction: ${montantApresReductionAttendu.toLocaleString()} Ar`);
        console.log(`  - Montant Final: ${montantFinalAttendu.toLocaleString()} Ar`);
        
        console.log('📊 Résultats reçus:');
        console.log(`  - Montant Brut: ${voiture.montant_brut?.toLocaleString() ?? 'N/A'} Ar`);
        console.log(`  - Montant après réduction: ${voiture.montant_apres_reduction?.toLocaleString() ?? 'N/A'} Ar`);
        console.log(`  - Montant Final: ${voiture.montant_a_payer?.toLocaleString() ?? 'N/A'} Ar`);
        
        // Vérification des calculs
        const tolerance = 1; // Tolérance de 1 Ar pour les arrondis
        
        if (Math.abs(voiture.montant_brut - montantBrutAttendu) <= tolerance) {
            console.log('✅ Montant Brut correct');
        } else {
            console.error('❌ Montant Brut incorrect');
        }
        
        if (Math.abs(voiture.montant_apres_reduction - montantApresReductionAttendu) <= tolerance) {
            console.log('✅ Montant après réduction correct');
        } else {
            console.error('❌ Montant après réduction incorrect');
        }
        
        if (Math.abs(voiture.montant_a_payer - montantFinalAttendu) <= tolerance) {
            console.log('✅ Montant Final correct');
        } else {
            console.error('❌ Montant Final incorrect');
        }
    }

    // Test complet
    async runTests() {
        console.log('🚀 Démarrage des tests de l\'API simulateur...');
        console.log('=' .repeat(50));
        
        // Test 1: Récupération du token CSRF
        const csrfToken = await this.testCSRFToken();
        if (!csrfToken) {
            console.error('❌ Impossible de continuer sans token CSRF');
            return;
        }
        
        console.log('=' .repeat(50));
        
        // Test 2: Simulateur national
        const resultatsNational = await this.testSimulateurNational(csrfToken);
        
        console.log('=' .repeat(50));
        
        // Test 3: Simulateur régional
        const resultatsRegional = await this.testSimulateurRegional(csrfToken);
        
        console.log('=' .repeat(50));
        
        // Résumé des tests
        console.log('📋 Résumé des tests:');
        console.log(`  - Token CSRF: ${csrfToken ? '✅' : '❌'}`);
        console.log(`  - Simulateur National: ${resultatsNational ? '✅' : '❌'}`);
        console.log(`  - Simulateur Régional: ${resultatsRegional ? '✅' : '❌'}`);
        
        if (csrfToken && resultatsNational && resultatsRegional) {
            console.log('🎉 Tous les tests sont passés avec succès !');
        } else {
            console.log('⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
        }
    }
}

// Fonction pour lancer les tests depuis la console
function lancerTestsSimulateur() {
    const testeur = new SimulateurAPITest();
    testeur.runTests();
}

// Fonction pour tester uniquement le simulateur national
function testerSimulateurNational() {
    const testeur = new SimulateurAPITest();
    testeur.testCSRFToken().then(csrfToken => {
        if (csrfToken) {
            testeur.testSimulateurNational(csrfToken);
        }
    });
}

// Fonction pour tester uniquement le simulateur régional
function testerSimulateurRegional() {
    const testeur = new SimulateurAPITest();
    testeur.testCSRFToken().then(csrfToken => {
        if (csrfToken) {
            testeur.testSimulateurRegional(csrfToken);
        }
    });
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimulateurAPITest;
}

// Instructions d'utilisation
console.log(`
🧪 Tests de l'API Simulateur

Pour lancer tous les tests:
  lancerTestsSimulateur()

Pour tester uniquement le simulateur national:
  testerSimulateurNational()

Pour tester uniquement le simulateur régional:
  testerSimulateurRegional()

Assurez-vous que le serveur backend est démarré sur http://localhost:8000
`);
