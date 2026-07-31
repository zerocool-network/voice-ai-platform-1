import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\CallController::index
* @see app/Http/Controllers/Api/CallController.php:17
* @route '/api/v1/calls'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/calls',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CallController::index
* @see app/Http/Controllers/Api/CallController.php:17
* @route '/api/v1/calls'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CallController::index
* @see app/Http/Controllers/Api/CallController.php:17
* @route '/api/v1/calls'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\CallController::index
* @see app/Http/Controllers/Api/CallController.php:17
* @route '/api/v1/calls'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\CallController::show
* @see app/Http/Controllers/Api/CallController.php:25
* @route '/api/v1/calls/{call}'
*/
export const show = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/calls/{call}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CallController::show
* @see app/Http/Controllers/Api/CallController.php:25
* @route '/api/v1/calls/{call}'
*/
show.url = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { call: args }
    }

    if (Array.isArray(args)) {
        args = {
            call: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        call: args.call,
    }

    return show.definition.url
            .replace('{call}', parsedArgs.call.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CallController::show
* @see app/Http/Controllers/Api/CallController.php:25
* @route '/api/v1/calls/{call}'
*/
show.get = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\CallController::show
* @see app/Http/Controllers/Api/CallController.php:25
* @route '/api/v1/calls/{call}'
*/
show.head = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

const calls = {
    index: Object.assign(index, index),
    show: Object.assign(show, show),
}

export default calls