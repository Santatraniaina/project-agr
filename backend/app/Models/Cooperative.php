<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cooperative extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'marque',
        'modele',
        'logo'
    ];

    /**
     * Get the cities for the cooperative.
     */
    public function cities()
    {
        return $this->belongsToMany(Ville::class, 'cooperative_cities')
                    ->withPivot('is_destination')
                    ->withTimestamps();
    }

    /**
     * Get the itineraries for the cooperative.
     */
    public function itineraires()
    {
        return $this->hasMany(Itineraire::class);
    }

    /**
     * Get the vehicles for the cooperative.
     */
    public function vehicules()
    {
        return $this->hasMany(Vehicule::class);
    }

    /**
     * Get the expenses for the cooperative.
     */
    public function depenses()
    {
        return $this->hasMany(Depense::class);
    }

    /**
     * Get the prices for the cooperative.
     */
    public function prix()
    {
        return $this->hasMany(Prix::class);
    }
}