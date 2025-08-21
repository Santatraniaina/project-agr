<?php
// app/Models/FileAttenteVip.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FileAttenteVip extends Model
{
    use HasFactory;

    protected $table = 'file_attente_vips';

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
