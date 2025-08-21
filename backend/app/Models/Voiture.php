<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
/**
 * @OA\Schema(
 *     schema="User",
 *     required={"name", "email"},
 *     @OA\Property(property="id", type="integer", format="int64"),
 *     @OA\Property(property="name", type="string"),
 *     @OA\Property(property="email", type="string", format="email")
 * )
 */
class Voiture extends Model
{
    use HasFactory;

    protected $fillable = [
        'marque',
        'modele',
        'itineraire',
        'date_depart',
        'heure_depart',
        'places'
    ];

    protected $casts = [
        'date_depart' => 'datetime'
    ];


    public function places()
    {
        return $this->hasMany(Place::class);
    }
}
