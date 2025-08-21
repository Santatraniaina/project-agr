<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class placesVip extends Model
{
    use HasFactory;

    // Définir la table si elle n'est pas automatiquement détectée
    protected $table = 'places_vips';

    // Définir les colonnes qui peuvent être remplies en masse
    protected $fillable = [
        // 'numero', // Cette colonne n'existe pas dans la table places_vips
        'nom',
        'contact',
        'place_1',
        'place_2',
        'place_3',
        'place_4',
        'place_5',
        'place_6',
        'place_7',
        'place_8',
        'place_9',
        'place_10',
        'voiture_id',
        'statut_paiement', // Ajouté pour permettre l'assignation de masse si nécessaire
    ];

    // Relation avec le modèle Voiture VIP
    public function voitureVip()
    {
        // Correction: utiliser le bon nom de classe
        return $this->belongsTo(voitureVip::class, 'voiture_id'); // Chaque enregistrement de places VIP appartient à une voiture VIP
    }
}
