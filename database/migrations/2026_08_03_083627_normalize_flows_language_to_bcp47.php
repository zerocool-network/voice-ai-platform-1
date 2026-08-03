<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $map = [
            'en' => 'en-US',
            'es' => 'es-ES',
            'de' => 'de-DE',
            'fr' => 'fr-FR',
            'it' => 'it-IT',
            'pt' => 'pt-BR',
        ];

        foreach ($map as $from => $to) {
            DB::table('flows')->where('language', $from)->update(['language' => $to]);
        }

        Schema::table('flows', function (Blueprint $table) {
            $table->string('language', 10)->default('en-US')->change();
        });
    }

    public function down(): void
    {
        Schema::table('flows', function (Blueprint $table) {
            $table->string('language', 10)->default('en')->change();
        });
    }
};
