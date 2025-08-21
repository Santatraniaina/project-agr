<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FileAttente extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'nbre_place',
        'contact',
        'date',
        'heure'
    ];

    protected $casts = [
        'date' => 'date',
        'heure' => 'datetime:H:i'
    ];
}