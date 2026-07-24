import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V2\MonitoringController::health
* @see app/Http/Controllers/Api/V2/MonitoringController.php:16
* @route '/api/v2/monitoring/health'
*/
export const health = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: health.url(options),
    method: 'get',
})

health.definition = {
    methods: ["get","head"],
    url: '/api/v2/monitoring/health',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V2\MonitoringController::health
* @see app/Http/Controllers/Api/V2/MonitoringController.php:16
* @route '/api/v2/monitoring/health'
*/
health.url = (options?: RouteQueryOptions) => {
    return health.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V2\MonitoringController::health
* @see app/Http/Controllers/Api/V2/MonitoringController.php:16
* @route '/api/v2/monitoring/health'
*/
health.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: health.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V2\MonitoringController::health
* @see app/Http/Controllers/Api/V2/MonitoringController.php:16
* @route '/api/v2/monitoring/health'
*/
health.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: health.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V2\MonitoringController::system
* @see app/Http/Controllers/Api/V2/MonitoringController.php:29
* @route '/api/v2/monitoring/system'
*/
export const system = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: system.url(options),
    method: 'get',
})

system.definition = {
    methods: ["get","head"],
    url: '/api/v2/monitoring/system',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V2\MonitoringController::system
* @see app/Http/Controllers/Api/V2/MonitoringController.php:29
* @route '/api/v2/monitoring/system'
*/
system.url = (options?: RouteQueryOptions) => {
    return system.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V2\MonitoringController::system
* @see app/Http/Controllers/Api/V2/MonitoringController.php:29
* @route '/api/v2/monitoring/system'
*/
system.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: system.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V2\MonitoringController::system
* @see app/Http/Controllers/Api/V2/MonitoringController.php:29
* @route '/api/v2/monitoring/system'
*/
system.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: system.url(options),
    method: 'head',
})

const MonitoringController = { health, system }

export default MonitoringController