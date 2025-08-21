#!/usr/bin/env node

/**
 * Script de vérification de la configuration des coopératives
 * Exécutez ce script pour vérifier que tout est en place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration des coopératives...\n');

const requiredFiles = [
    'src/components/CooperativeManagement.jsx',
    'src/components/CooperativeList.jsx',
    'src/components/CooperativeForm.jsx',
    'src/components/QuickCooperativeTest.jsx',
    'src/components/IndexedDBTest.jsx',
    'src/services/CooperativeStorageService.js',
    'README_COOPERATIVES_FIX.md',
    'INTEGRATION_TEST.md'
];

const requiredImports = [
    'cooperativeStorageService',
    'useState',
    'useEffect',
    'React'
];

let allGood = true;

// Vérifier l'existence des fichiers
console.log('📁 Vérification des fichiers requis...');
requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - MANQUANT`);
        allGood = false;
    }
});

// Vérifier le contenu des composants principaux
console.log('\n🔧 Vérification du contenu des composants...');

try {
    // Vérifier CooperativeManagement.jsx
    const managementPath = path.join(process.cwd(), 'src/components/CooperativeManagement.jsx');
    if (fs.existsSync(managementPath)) {
        const content = fs.readFileSync(managementPath, 'utf8');
        
        if (content.includes('cooperativeStorageService')) {
            console.log('  ✅ CooperativeManagement.jsx - Service intégré');
        } else {
            console.log('  ❌ CooperativeManagement.jsx - Service non intégré');
            allGood = false;
        }
        
        if (content.includes('loadCooperatives()')) {
            console.log('  ✅ CooperativeManagement.jsx - Fonction de chargement présente');
        } else {
            console.log('  ❌ CooperativeManagement.jsx - Fonction de chargement manquante');
            allGood = false;
        }
    }
    
    // Vérifier CooperativeStorageService.js
    const servicePath = path.join(process.cwd(), 'src/services/CooperativeStorageService.js');
    if (fs.existsSync(servicePath)) {
        const content = fs.readFileSync(servicePath, 'utf8');
        
        if (content.includes('class CooperativeStorageService')) {
            console.log('  ✅ CooperativeStorageService.js - Classe définie');
        } else {
            console.log('  ❌ CooperativeStorageService.js - Classe manquante');
            allGood = false;
        }
        
        if (content.includes('saveCooperative')) {
            console.log('  ✅ CooperativeStorageService.js - Méthode saveCooperative présente');
        } else {
            console.log('  ❌ CooperativeStorageService.js - Méthode saveCooperative manquante');
            allGood = false;
        }
    }
    
} catch (error) {
    console.log(`  ❌ Erreur lors de la vérification: ${error.message}`);
    allGood = false;
}

// Vérifier la structure des dossiers
console.log('\n📂 Vérification de la structure des dossiers...');
const requiredDirs = [
    'src/components',
    'src/services'
];

requiredDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        console.log(`  ✅ ${dir}/`);
    } else {
        console.log(`  ❌ ${dir}/ - MANQUANT`);
        allGood = false;
    }
});

// Résumé
console.log('\n📊 RÉSUMÉ DE LA VÉRIFICATION');
console.log('=' .repeat(50));

if (allGood) {
    console.log('🎉 Tous les composants sont correctement configurés !');
    console.log('\n🚀 Prochaines étapes :');
    console.log('1. Intégrer QuickCooperativeTest dans ton application');
    console.log('2. Tester la création d\'une coopérative');
    console.log('3. Vérifier la persistance après rechargement');
    console.log('4. Consulter INTEGRATION_TEST.md pour plus de détails');
} else {
    console.log('⚠️  Certains composants nécessitent une attention particulière');
    console.log('\n🔧 Actions recommandées :');
    console.log('1. Vérifier que tous les fichiers sont présents');
    console.log('2. S\'assurer que les imports sont corrects');
    console.log('3. Relancer la vérification après correction');
}

console.log('\n📚 Documentation disponible :');
console.log('- README_COOPERATIVES_FIX.md - Explication de la correction');
console.log('- INTEGRATION_TEST.md - Guide de test et intégration');

console.log('\n' + '=' .repeat(50));

// Code de sortie
process.exit(allGood ? 0 : 1);
