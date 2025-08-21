<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicule extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_matricule',
        'proprietaire_nom',
        'proprietaire_contact',
        'chauffeur_nom',
        'chauffeur_contact'
    ];
}