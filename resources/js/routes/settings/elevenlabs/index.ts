import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\ElevenLabsConnectController::connect
* @see app/Http/Controllers/Web/ElevenLabsConnectController.php:14
* @route '/settings/elevenlabs/connect'
*/
export const connect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connect.url(options),
    method: 'post',
})

connect.definition = {
    methods: ["post"],
    url: '/settings/elevenlabs/connect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\ElevenLabsConnectController::connect
* @see app/Http/Controllers/Web/ElevenLabsConnectController.php:14
* @route '/settings/elevenlabs/connect'
*/
connect.url = (options?: RouteQueryOptions) => {
    return connect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ElevenLabsConnectController::connect
* @see app/Http/Controllers/Web/ElevenLabsConnectController.php:14
* @route '/settings/elevenlabs/connect'
*/
connect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\ElevenLabsConnectController::status
* @see app/Http/Controllers/Web/ElevenLabsConnectController.php:93
* @route '/settings/elevenlabs/status'
*/
export const status = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})

status.definition = {
    methods: ["get","head"],
    url: '/settings/elevenlabs/status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\ElevenLabsConnectController::status
* @see app/Http/Controllers/Web/ElevenLabsConnectController.php:93
* @route '/settings/elevenlabs/status'
*/
status.url = (options?: RouteQueryOptions) => {
    return status.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ElevenLabsConnectController::status
* @see app/Http/Controllers/Web/ElevenLabsConnectController.php:93
* @route '/settings/elevenlabs/status'
*/
status.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\ElevenLabsConnectController::status
* @see app/Http/Controllers/Web/ElevenLabsConnectController.php:93
* @route '/settings/elevenlabs/status'
*/
status.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status.url(options),
    method: 'head',
})

const elevenlabs = {
    connect: Object.assign(connect, connect),
    status: Object.assign(status, status),
}

export default elevenlabs