<?php

// voyagesVip.php → VoyageVip.php (correction du nom de fichier et de classe)
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoyageVip extends Model // PascalCase pour le nom de classe
{
    protected $table = 'voyage_vips'; // snake_case cohérent (sans 's' après voyage)

    protected $fillable = [
        'voiture_id',
        'status'
    ];

    public function voitureVip() // Nom de méthode en camelCase
    {
        return $this->belongsTo(VoitureVip::class, 'voiture_id');
    }
}