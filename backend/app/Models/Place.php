<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Place extends Model
{
    use HasFactory;

    // Définir la table si elle n'est pas automatiquement détectée
    protected $table = 'places';

    // Définir les colonnes qui peuvent être remplies en masse
    protected $fillable = [
        'numero',
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
        'place_11',
        'place_12',
        'place_13',
        'place_14',
        'place_15',
        'place_16',
        'voiture_id',
        'arret',
        'payment_type',
        'mobile_money_operator',
        'statut_paiement',
    ];

    // Relation avec le modèle Voiture
    public function voiture()
    {
        return $this->belongsTo(Voiture::class); // Chaque place appartient à une voiture
    }
}
