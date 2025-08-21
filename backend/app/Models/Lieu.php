<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lieu extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'numero',
        'lieu',
        'voiture_id',
        'status'
    ];

    /**
     * Les valeurs par défaut des attributs.
     *
     * @var array
     */
    protected $attributes = [
        'status' => 'libre',
    ];

    /**
     * Relation avec le modèle Voiture
     */
    public function voiture()
    {
        return $this->belongsTo(Voiture::class);
    }

    /**
     * Scope pour les lieux libres
     */
    public function scopeLibres($query)
    {
        return $query->where('status', 'libre');
    }

    /**
     * Scope pour les lieux occupés
     */
    public function scopeOccupes($query)
    {
        return $query->where('status', 'occupé');
    }

    /**
     * Accesseur pour le nom complet du lieu
     */
    public function getNomCompletAttribute()
    {
        return "Place {$this->numero} - {$this->lieu}";
    }
}