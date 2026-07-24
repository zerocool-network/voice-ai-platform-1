import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import tenant69401c from './tenant'
import voice1db564 from './voice'
import voices from './voices'
import documents from './documents'
import webhooks from './webhooks'
import activity from './activity'
import errors from './errors'
import elevenlabs from './elevenlabs'
import agents from './agents'
import dataProtection0a045c from './data-protection'
import phoneNumbersCd7706 from './phone-numbers'
import system0654f6 from './system'
import rolesF85c84 from './roles'
/**
* @see \App\Http\Controllers\Web\TenantSettingsController::tenant
* @see app/Http/Controllers/Web/TenantSettingsController.php:24
* @route '/settings/tenant'
*/
export const tenant = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tenant.url(options),
    method: 'get',
})

tenant.definition = {
    methods: ["get","head"],
    url: '/settings/tenant',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\TenantSettingsController::tenant
* @see app/Http/Controllers/Web/TenantSettingsController.php:24
* @route '/settings/tenant'
*/
tenant.url = (options?: RouteQueryOptions) => {
    return tenant.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TenantSettingsController::tenant
* @see app/Http/Controllers/Web/TenantSettingsController.php:24
* @route '/settings/tenant'
*/
tenant.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tenant.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\TenantSettingsController::tenant
* @see app/Http/Controllers/Web/TenantSettingsController.php:24
* @route '/settings/tenant'
*/
tenant.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: tenant.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::voice
* @see app/Http/Controllers/Web/VoiceSettingsController.php:21
* @route '/settings/voice'
*/
export const voice = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: voice.url(options),
    method: 'get',
})

voice.definition = {
    methods: ["get","head"],
    url: '/settings/voice',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::voice
* @see app/Http/Controllers/Web/VoiceSettingsController.php:21
* @route '/settings/voice'
*/
voice.url = (options?: RouteQueryOptions) => {
    return voice.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::voice
* @see app/Http/Controllers/Web/VoiceSettingsController.php:21
* @route '/settings/voice'
*/
voice.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: voice.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::voice
* @see app/Http/Controllers/Web/VoiceSettingsController.php:21
* @route '/settings/voice'
*/
voice.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: voice.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\DataProtectionController::dataProtection
* @see app/Http/Controllers/Web/DataProtectionController.php:15
* @route '/settings/data-protection'
*/
export const dataProtection = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dataProtection.url(options),
    method: 'get',
})

dataProtection.definition = {
    methods: ["get","head"],
    url: '/settings/data-protection',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\DataProtectionController::dataProtection
* @see app/Http/Controllers/Web/DataProtectionController.php:15
* @route '/settings/data-protection'
*/
dataProtection.url = (options?: RouteQueryOptions) => {
    return dataProtection.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\DataProtectionController::dataProtection
* @see app/Http/Controllers/Web/DataProtectionController.php:15
* @route '/settings/data-protection'
*/
dataProtection.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dataProtection.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\DataProtectionController::dataProtection
* @see app/Http/Controllers/Web/DataProtectionController.php:15
* @route '/settings/data-protection'
*/
dataProtection.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dataProtection.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\PrivacyController::privacy
* @see app/Http/Controllers/Web/PrivacyController.php:15
* @route '/settings/privacy'
*/
export const privacy = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: privacy.url(options),
    method: 'get',
})

privacy.definition = {
    methods: ["get","head"],
    url: '/settings/privacy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\PrivacyController::privacy
* @see app/Http/Controllers/Web/PrivacyController.php:15
* @route '/settings/privacy'
*/
privacy.url = (options?: RouteQueryOptions) => {
    return privacy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\PrivacyController::privacy
* @see app/Http/Controllers/Web/PrivacyController.php:15
* @route '/settings/privacy'
*/
privacy.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: privacy.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\PrivacyController::privacy
* @see app/Http/Controllers/Web/PrivacyController.php:15
* @route '/settings/privacy'
*/
privacy.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: privacy.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::phoneNumbers
* @see app/Http/Controllers/Web/PhoneNumberController.php:18
* @route '/settings/phone-numbers'
*/
export const phoneNumbers = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: phoneNumbers.url(options),
    method: 'get',
})

phoneNumbers.definition = {
    methods: ["get","head"],
    url: '/settings/phone-numbers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::phoneNumbers
* @see app/Http/Controllers/Web/PhoneNumberController.php:18
* @route '/settings/phone-numbers'
*/
phoneNumbers.url = (options?: RouteQueryOptions) => {
    return phoneNumbers.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::phoneNumbers
* @see app/Http/Controllers/Web/PhoneNumberController.php:18
* @route '/settings/phone-numbers'
*/
phoneNumbers.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: phoneNumbers.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::phoneNumbers
* @see app/Http/Controllers/Web/PhoneNumberController.php:18
* @route '/settings/phone-numbers'
*/
phoneNumbers.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: phoneNumbers.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\SystemHealthController::system
* @see app/Http/Controllers/Web/SystemHealthController.php:19
* @route '/settings/system'
*/
export const system = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: system.url(options),
    method: 'get',
})

system.definition = {
    methods: ["get","head"],
    url: '/settings/system',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\SystemHealthController::system
* @see app/Http/Controllers/Web/SystemHealthController.php:19
* @route '/settings/system'
*/
system.url = (options?: RouteQueryOptions) => {
    return system.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SystemHealthController::system
* @see app/Http/Controllers/Web/SystemHealthController.php:19
* @route '/settings/system'
*/
system.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: system.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\SystemHealthController::system
* @see app/Http/Controllers/Web/SystemHealthController.php:19
* @route '/settings/system'
*/
system.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: system.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\RoleController::roles
* @see app/Http/Controllers/Web/RoleController.php:17
* @route '/settings/roles'
*/
export const roles = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: roles.url(options),
    method: 'get',
})

roles.definition = {
    methods: ["get","head"],
    url: '/settings/roles',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\RoleController::roles
* @see app/Http/Controllers/Web/RoleController.php:17
* @route '/settings/roles'
*/
roles.url = (options?: RouteQueryOptions) => {
    return roles.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\RoleController::roles
* @see app/Http/Controllers/Web/RoleController.php:17
* @route '/settings/roles'
*/
roles.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: roles.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\RoleController::roles
* @see app/Http/Controllers/Web/RoleController.php:17
* @route '/settings/roles'
*/
roles.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: roles.url(options),
    method: 'head',
})

const settings = {
    tenant: Object.assign(tenant, tenant69401c),
    voice: Object.assign(voice, voice1db564),
    voices: Object.assign(voices, voices),
    documents: Object.assign(documents, documents),
    webhooks: Object.assign(webhooks, webhooks),
    activity: Object.assign(activity, activity),
    errors: Object.assign(errors, errors),
    elevenlabs: Object.assign(elevenlabs, elevenlabs),
    agents: Object.assign(agents, agents),
    dataProtection: Object.assign(dataProtection, dataProtection0a045c),
    privacy: Object.assign(privacy, privacy),
    phoneNumbers: Object.assign(phoneNumbers, phoneNumbersCd7706),
    system: Object.assign(system, system0654f6),
    roles: Object.assign(roles, rolesF85c84),
}

export default settings