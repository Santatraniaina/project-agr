<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class voitureVip extends Model
{
    use HasFactory;

    protected $fillable = [
        'marque',
        'modele',
        'itineraire',
        'date_depart',
        'heure_depart',
        'places'
    ];

    protected $casts = [
        'date_depart' => 'datetime'
    ];


    public function places()
    {
        return $this->hasMany(placesVip::class, 'voiture_id');
    }
}
