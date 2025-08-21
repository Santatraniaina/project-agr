# 🚗 Guide d'utilisation : Solde du Chauffeur

## 📋 Vue d'ensemble

Le **Solde du Chauffeur** est une nouvelle carte ajoutée dans la section **Clôture Mensuelle** qui affiche le montant de la réduction (%) calculé depuis le simulateur national.

## 🎯 Fonctionnalités

### ✅ **Affichage automatique**
- Le montant de la réduction s'affiche automatiquement après avoir appuyé sur **"Calculer"** dans le simulateur national
- Les données sont récupérées depuis le localStorage du simulateur

### ✅ **Calcul intelligent**
- **Méthode précise** : Utilise les données détaillées du simulateur (montant brut, montant après réduction, frais fixe)
- **Méthode d'estimation** : Si les données détaillées ne sont pas disponibles, estime la réduction à 10% du revenu national

### ✅ **Rafraîchissement manuel**
- Bouton de rafraîchissement (🔄) pour mettre à jour manuellement les données de réduction
- Utile après avoir modifié les paramètres du simulateur

## 🔄 Processus d'utilisation

### 1. **Utiliser le simulateur national**
```
1. Aller dans "Simulateur National"
2. Remplir les données (passagers, paramètres)
3. Appuyer sur "Calculer"
4. Les données sont automatiquement sauvegardées
```

### 2. **Vérifier la clôture mensuelle**
```
1. Aller dans "Clôture Mensuelle"
2. Sélectionner le mois et l'année
3. Le Solde du Chauffeur s'affiche automatiquement
4. Utiliser le bouton 🔄 si nécessaire
```

## 📊 Calculs et formules

### **Solde Final** (carte verte)
```
Solde Final = Solde Initial - Total Dépenses du Mois
```

### **Solde du Chauffeur** (carte jaune)
```
Réduction = Montant Brut - (Montant Après Réduction - Frais Fixe)
```

### **Exemple concret**
- **Montant Brut** : 1,000,000 Ar
- **Montant Après Réduction** : 905,000 Ar (après 10% de réduction + 5,000 Ar frais fixe)
- **Frais Fixe** : 5,000 Ar
- **Réduction Calculée** : 1,000,000 - (905,000 - 5,000) = **100,000 Ar**

## ⚠️ Points importants

### **Le Solde du Chauffeur est INDÉPENDANT**
- ❌ Il n'intervient **PAS** dans le calcul du Solde Final
- ✅ Il s'affiche **SÉPARÉMENT** pour information
- 💡 C'est un montant de réduction, pas un solde à déduire

### **Données utilisées**
- **Simulateur National** : `nationalSimulator_lastResults` (données détaillées)
- **Totaux mensuels** : `caisse_totaux:${monthKey}` (revenus finaux)

## 🛠️ Dépannage

### **Le montant de réduction ne s'affiche pas ?**
1. Vérifier que vous avez utilisé le simulateur national
2. Appuyer sur "Calculer" dans le simulateur
3. Utiliser le bouton 🔄 de rafraîchissement
4. Vérifier la console pour les messages de debug

### **Le montant semble incorrect ?**
1. Vérifier les paramètres du simulateur (pourcentage de réduction)
2. S'assurer que les données sont bien sauvegardées
3. Utiliser le bouton 🔄 pour rafraîchir

### **Solde final négatif (déficit) ?**
1. **Vérifier l'utilisation des simulateurs** : S'assurer que "Calculer" a été appuyé
2. **Vérifier les données sauvegardées** : Console (F12) pour les messages de debug
3. **Vérifier le mois/année** : S'assurer que le bon mois est sélectionné
4. **Utiliser le bouton 🔄** : Rafraîchir après utilisation des simulateurs

**⚠️ Important** : Un déficit n'est pas une erreur de calcul, mais indique que les revenus sont insuffisants par rapport aux dépenses.

**📖 Guide complet** : Voir `GUIDE_DEPANNAGE_DEFICIT.md` pour une résolution détaillée.

## 🔍 Messages de debug

La console affiche des informations détaillées :
- Données récupérées du simulateur national
- Calculs de réduction effectués
- Estimations utilisées
- Erreurs éventuelles

## 📱 Interface utilisateur

### **Carte "Solde du Chauffeur"**
- **Couleur** : Jaune (distinctive des autres cartes)
- **Contenu** : Montant de la réduction en Ar
- **Bouton** : 🔄 pour rafraîchir
- **Description** : "Réduction (%) du simulateur"

### **Note explicative**
- Section bleue sous les cartes
- Explique les formules de calcul
- Clarifie l'indépendance du Solde du Chauffeur

---

## 🎉 Résumé

Le **Solde du Chauffeur** affiche automatiquement le montant de la réduction (%) calculé depuis le simulateur national. Il est **indépendant** du calcul du Solde Final et s'affiche **séparément** pour information.

**Formule principale** : `Solde Final = Solde Initial - Total Dépenses du Mois`
**Solde du Chauffeur** : Montant de la réduction (affiché séparément)
