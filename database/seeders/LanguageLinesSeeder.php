<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\TranslationLoader\LanguageLine;

class LanguageLinesSeeder extends Seeder
{
    public function run(): void
    {
        LanguageLine::updateOrCreate(
            ['group' => 'dashboard', 'key' => 'welcome'],
            ['text' => [
                'en' => 'Welcome to ZeroVoice, :name!',
                'es' => '¡Bienvenido a ZeroVoice, :name!',
                'de' => 'Willkommen bei ZeroVoice, :name!',
                'fr' => 'Bienvenue sur ZeroVoice, :name!',
                'it' => 'Benvenuto su ZeroVoice, :name!',
                'pt' => 'Bem-vindo ao ZeroVoice, :name!',
            ]]
        );

        LanguageLine::updateOrCreate(
            ['group' => 'common', 'key' => 'copied'],
            ['text' => [
                'en' => 'Copied to clipboard!',
                'es' => '¡Copiado al portapapeles!',
                'de' => 'In die Zwischenablage kopiert!',
                'fr' => 'Copié dans le presse-papiers !',
                'it' => 'Copiato negli appunti!',
                'pt' => 'Copiado para a área de transferência!',
            ]]
        );

        LanguageLine::updateOrCreate(
            ['group' => 'team', 'key' => 'invite_sent'],
            ['text' => [
                'en' => 'Invitation on its way!',
                'es' => '¡Invitación en camino!',
                'de' => 'Einladung unterwegs!',
                'fr' => 'Invitation en route !',
                'it' => 'Invito in arrivo!',
                'pt' => 'Convite a caminho!',
            ]]
        );
    }
}
