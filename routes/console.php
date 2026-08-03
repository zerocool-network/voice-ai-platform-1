<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('activitylog:clean')->weekly();
Schedule::command('data:purge-expired')->daily()->at('03:00');
Schedule::command('compliance:digest')->weekly()->mondays()->at('08:00');
Schedule::command('elevenlabs:health-check')->weekly();
Schedule::command('system:health-check')->everyFiveMinutes();
Schedule::command('integrations:health-check')->hourly();
Schedule::command('tokens:purge-expired')->daily();
Schedule::command('calls:execute-scheduled')->everyMinute();
Schedule::command('calls:score-completed')->everyFiveMinutes();
