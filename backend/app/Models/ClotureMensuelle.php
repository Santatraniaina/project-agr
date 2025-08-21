<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClotureMensuelle extends Model
{
    use HasFactory;

    protected $table = 'clotures_mensuelles';

    protected $fillable = [
        'annee',
        'mois',
        'solde_initial',
        'total_depenses',
        'solde_final',
        'user_id',
        'date_cloture',
    ];

    protected $casts = [
        'date_cloture' => 'datetime',
    ];
}