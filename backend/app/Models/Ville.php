<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// Renommez le fichier villes.php en Ville.php
class Ville extends Model
{
    use HasFactory;

    // Si votre table s'appelle 'villes', spécifiez-le explicitement
    protected $table = 'villes';

    protected $fillable = [
        'nom',
        'numero_route',
        'enable'
    ];

    protected $casts = [
        'enable' => 'boolean'
    ];

    /**
     * Get the cooperatives that operate in this city.
     */
    public function cooperatives()
    {
        return $this->belongsToMany(Cooperative::class, 'cooperative_cities')
                    ->withPivot('is_destination')
                    ->withTimestamps();
    }
}
