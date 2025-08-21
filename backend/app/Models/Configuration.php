<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Configuration extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'description',
        'type',
        'periode',
        'category',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Récupérer les configurations par catégorie et période
     */
    public static function getByCategory($category, $periode = null)
    {
        $query = self::where('category', $category)
                    ->where('is_active', true);

        if ($periode) {
            $query->where(function($q) use ($periode) {
                $q->where('periode', $periode)
                  ->orWhere('periode', 'both');
            });
        }

        return $query->get()->keyBy('key');
    }

    /**
     * Obtenir la valeur typée selon le type de configuration
     */
    public function getTypedValue()
    {
        switch ($this->type) {
            case 'percentage':
                return (float) $this->value / 100; // Convertir en décimal (ex: 10 -> 0.10)
            case 'amount':
            case 'price':
                return (float) $this->value;
            default:
                return $this->value;
        }
    }

    /**
     * Obtenir une configuration par clé
     */
    public static function getByKey($key)
    {
        return self::where('key', $key)
                  ->where('is_active', true)
                  ->first();
    }

    /**
     * Définir ou mettre à jour une configuration
     */
    public static function setValue($key, $value, $description = null, $type = 'amount', $periode = 'both', $category = 'general')
    {
        return self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'description' => $description ?? $key,
                'type' => $type,
                'periode' => $periode,
                'category' => $category,
                'is_active' => true
            ]
        );
    }
}