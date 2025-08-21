<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('itineraires', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('depart');
            $table->string('itineraire');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('itineraires');
    }
};