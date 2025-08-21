<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voyage extends Model
{
    protected $table = 'voyages';
    
    protected $fillable = [
        'voiture_id',
        'status'
    ];
    
    public function voiture()
    {
        return $this->belongsTo(Voiture::class);
    }
}
