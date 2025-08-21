<?php
// app/Models/Client.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
class Client extends Model
{
    protected $fillable = ['nom', 'contact', 'attributions'];
    
    protected $casts = ['attributions' => 'array'];

    // Relation optionnelle si vous voulez quand même garder la relation Eloquent
    public function places()
    {
        return $this->belongsToMany(Place::class, 'client_place')
                   ->withPivot('date_attribution')
                   ->withTimestamps();
    }
}