import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\FlowController::index
* @see app/Http/Controllers/Api/FlowController.php:20
* @route '/api/v2/flows'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v2/flows',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\FlowController::index
* @see app/Http/Controllers/Api/FlowController.php:20
* @route '/api/v2/flows'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\FlowController::index
* @see app/Http/Controllers/Api/FlowController.php:20
* @route '/api/v2/flows'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\FlowController::index
* @see app/Http/Controllers/Api/FlowController.php:20
* @route '/api/v2/flows'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\FlowController::store
* @see app/Http/Controllers/Api/FlowController.php:28
* @route '/api/v2/flows'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v2/flows',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\FlowController::store
* @see app/Http/Controllers/Api/FlowController.php:28
* @route '/api/v2/flows'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\FlowController::store
* @see app/Http/Controllers/Api/FlowController.php:28
* @route '/api/v2/flows'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\FlowController::show
* @see app/Http/Controllers/Api/FlowController.php:55
* @route '/api/v2/flows/{flow}'
*/
export const show = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v2/flows/{flow}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\FlowController::show
* @see app/Http/Controllers/Api/FlowController.php:55
* @route '/api/v2/flows/{flow}'
*/
show.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { flow: args }
    }

    if (Array.isArray(args)) {
        args = {
            flow: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        flow: args.flow,
    }

    return show.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\FlowController::show
* @see app/Http/Controllers/Api/FlowController.php:55
* @route '/api/v2/flows/{flow}'
*/
show.get = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\FlowController::show
* @see app/Http/Controllers/Api/FlowController.php:55
* @route '/api/v2/flows/{flow}'
*/
show.head = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\FlowController::update
* @see app/Http/Controllers/Api/FlowController.php:66
* @route '/api/v2/flows/{flow}'
*/
export const update = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v2/flows/{flow}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\FlowController::update
* @see app/Http/Controllers/Api/FlowController.php:66
* @route '/api/v2/flows/{flow}'
*/
update.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { flow: args }
    }

    if (Array.isArray(args)) {
        args = {
            flow: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        flow: args.flow,
    }

    return update.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\FlowController::update
* @see app/Http/Controllers/Api/FlowController.php:66
* @route '/api/v2/flows/{flow}'
*/
update.put = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\FlowController::update
* @see app/Http/Controllers/Api/FlowController.php:66
* @route '/api/v2/flows/{flow}'
*/
update.patch = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

const flows = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    update: Object.assign(update, update),
}

export default flows