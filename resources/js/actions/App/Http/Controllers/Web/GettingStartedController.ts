import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\GettingStartedController::index
* @see app/Http/Controllers/Web/GettingStartedController.php:16
* @route '/getting-started'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/getting-started',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\GettingStartedController::index
* @see app/Http/Controllers/Web/GettingStartedController.php:16
* @route '/getting-started'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\GettingStartedController::index
* @see app/Http/Controllers/Web/GettingStartedController.php:16
* @route '/getting-started'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\GettingStartedController::index
* @see app/Http/Controllers/Web/GettingStartedController.php:16
* @route '/getting-started'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\GettingStartedController::complete
* @see app/Http/Controllers/Web/GettingStartedController.php:50
* @route '/getting-started/completed'
*/
export const complete = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: complete.url(options),
    method: 'post',
})

complete.definition = {
    methods: ["post"],
    url: '/getting-started/completed',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\GettingStartedController::complete
* @see app/Http/Controllers/Web/GettingStartedController.php:50
* @route '/getting-started/completed'
*/
complete.url = (options?: RouteQueryOptions) => {
    return complete.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\GettingStartedController::complete
* @see app/Http/Controllers/Web/GettingStartedController.php:50
* @route '/getting-started/completed'
*/
complete.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: complete.url(options),
    method: 'post',
})

const GettingStartedController = { index, complete }

export default GettingStartedController