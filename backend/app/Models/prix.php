<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prix extends Model
{
    use HasFactory;
     protected $table = 'prix';

    protected $fillable = [
        'prix_matin',
        'prix_soir',
        'arret',
        'destination',
        'itineraire_id'
    ];

    public function itineraire()
    {
        return $this->belongsTo(Itineraire::class);
    }
}