<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Depense extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'categorie_depense_id',
        'montant',
        'commentaire',
        'pieces_jointes',
        'user_id',
        'enabled',
    ];

    protected $casts = [
        'date' => 'date',
        'pieces_jointes' => 'array', // Pour gérer facilement les chemins des fichiers
        'enabled' => 'boolean',
    ];

    public function categorieDepense() {
        return $this->belongsTo(CategorieDepense::class, 'categorie_depense_id');
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}
