import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\SystemHealthController::index
* @see app/Http/Controllers/Web/SystemHealthController.php:19
* @route '/settings/system'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/system',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\SystemHealthController::index
* @see app/Http/Controllers/Web/SystemHealthController.php:19
* @route '/settings/system'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SystemHealthController::index
* @see app/Http/Controllers/Web/SystemHealthController.php:19
* @route '/settings/system'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\SystemHealthController::index
* @see app/Http/Controllers/Web/SystemHealthController.php:19
* @route '/settings/system'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\SystemHealthController::poll
* @see app/Http/Controllers/Web/SystemHealthController.php:33
* @route '/settings/system/poll'
*/
export const poll = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: poll.url(options),
    method: 'get',
})

poll.definition = {
    methods: ["get","head"],
    url: '/settings/system/poll',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\SystemHealthController::poll
* @see app/Http/Controllers/Web/SystemHealthController.php:33
* @route '/settings/system/poll'
*/
poll.url = (options?: RouteQueryOptions) => {
    return poll.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SystemHealthController::poll
* @see app/Http/Controllers/Web/SystemHealthController.php:33
* @route '/settings/system/poll'
*/
poll.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: poll.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\SystemHealthController::poll
* @see app/Http/Controllers/Web/SystemHealthController.php:33
* @route '/settings/system/poll'
*/
poll.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: poll.url(options),
    method: 'head',
})

const SystemHealthController = { index, poll }

export default SystemHealthController