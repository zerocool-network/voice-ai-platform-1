import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Web\QualityController::index
* @see app/Http/Controllers/Web/QualityController.php:17
* @route '/quality'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/quality',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\QualityController::index
* @see app/Http/Controllers/Web/QualityController.php:17
* @route '/quality'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\QualityController::index
* @see app/Http/Controllers/Web/QualityController.php:17
* @route '/quality'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\QualityController::index
* @see app/Http/Controllers/Web/QualityController.php:17
* @route '/quality'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\QualityController::show
* @see app/Http/Controllers/Web/QualityController.php:149
* @route '/quality/{call}'
*/
export const show = (args: { call: string | { id: string } } | [call: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/quality/{call}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\QualityController::show
* @see app/Http/Controllers/Web/QualityController.php:149
* @route '/quality/{call}'
*/
show.url = (args: { call: string | { id: string } } | [call: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { call: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { call: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            call: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        call: typeof args.call === 'object'
        ? args.call.id
        : args.call,
    }

    return show.definition.url
            .replace('{call}', parsedArgs.call.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\QualityController::show
* @see app/Http/Controllers/Web/QualityController.php:149
* @route '/quality/{call}'
*/
show.get = (args: { call: string | { id: string } } | [call: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\QualityController::show
* @see app/Http/Controllers/Web/QualityController.php:149
* @route '/quality/{call}'
*/
show.head = (args: { call: string | { id: string } } | [call: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

const quality = {
    index: Object.assign(index, index),
    show: Object.assign(show, show),
}

export default quality