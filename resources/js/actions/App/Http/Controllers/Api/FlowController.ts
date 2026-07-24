import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\FlowController::index
* @see app/Http/Controllers/Api/FlowController.php:20
* @route '/api/v1/flows'
*/
const indexc35984c720085d7c5d8b725421f868cf = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexc35984c720085d7c5d8b725421f868cf.url(options),
    method: 'get',
})

indexc35984c720085d7c5d8b725421f868cf.definition = {
    methods: ["get","head"],
    url: '/api/v1/flows',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\FlowController::index
* @see app/Http/Controllers/Api/FlowController.php:20
* @route '/api/v1/flows'
*/
indexc35984c720085d7c5d8b725421f868cf.url = (options?: RouteQueryOptions) => {
    return indexc35984c720085d7c5d8b725421f868cf.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\FlowController::index
* @see app/Http/Controllers/Api/FlowController.php:20
* @route '/api/v1/flows'
*/
indexc35984c720085d7c5d8b725421f868cf.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexc35984c720085d7c5d8b725421f868cf.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\FlowController::index
* @see app/Http/Controllers/Api/FlowController.php:20
* @route '/api/v1/flows'
*/
indexc35984c720085d7c5d8b725421f868cf.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexc35984c720085d7c5d8b725421f868cf.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\FlowController::index
* @see app/Http/Controllers/Api/FlowController.php:20
* @route '/api/v2/flows'
*/
const index34e13dcb7f35384e4aa67e891f3fa69b = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index34e13dcb7f35384e4aa67e891f3fa69b.url(options),
    method: 'get',
})

index34e13dcb7f35384e4aa67e891f3fa69b.definition = {
    methods: ["get","head"],
    url: '/api/v2/flows',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\FlowController::index
* @see app/Http/Controllers/Api/FlowController.php:20
* @route '/api/v2/flows'
*/
index34e13dcb7f35384e4aa67e891f3fa69b.url = (options?: RouteQueryOptions) => {
    return index34e13dcb7f35384e4aa67e891f3fa69b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\FlowController::index
* @see app/Http/Controllers/Api/FlowController.php:20
* @route '/api/v2/flows'
*/
index34e13dcb7f35384e4aa67e891f3fa69b.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index34e13dcb7f35384e4aa67e891f3fa69b.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\FlowController::index
* @see app/Http/Controllers/Api/FlowController.php:20
* @route '/api/v2/flows'
*/
index34e13dcb7f35384e4aa67e891f3fa69b.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index34e13dcb7f35384e4aa67e891f3fa69b.url(options),
    method: 'head',
})

/**
* Multiple routes resolve to \App\Http\Controllers\Api\FlowController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/api/v1/flows': indexc35984c720085d7c5d8b725421f868cf,
    '/api/v2/flows': index34e13dcb7f35384e4aa67e891f3fa69b,
}

/**
* @see \App\Http\Controllers\Api\FlowController::store
* @see app/Http/Controllers/Api/FlowController.php:28
* @route '/api/v1/flows'
*/
const storec35984c720085d7c5d8b725421f868cf = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storec35984c720085d7c5d8b725421f868cf.url(options),
    method: 'post',
})

storec35984c720085d7c5d8b725421f868cf.definition = {
    methods: ["post"],
    url: '/api/v1/flows',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\FlowController::store
* @see app/Http/Controllers/Api/FlowController.php:28
* @route '/api/v1/flows'
*/
storec35984c720085d7c5d8b725421f868cf.url = (options?: RouteQueryOptions) => {
    return storec35984c720085d7c5d8b725421f868cf.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\FlowController::store
* @see app/Http/Controllers/Api/FlowController.php:28
* @route '/api/v1/flows'
*/
storec35984c720085d7c5d8b725421f868cf.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storec35984c720085d7c5d8b725421f868cf.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\FlowController::store
* @see app/Http/Controllers/Api/FlowController.php:28
* @route '/api/v2/flows'
*/
const store34e13dcb7f35384e4aa67e891f3fa69b = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store34e13dcb7f35384e4aa67e891f3fa69b.url(options),
    method: 'post',
})

store34e13dcb7f35384e4aa67e891f3fa69b.definition = {
    methods: ["post"],
    url: '/api/v2/flows',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\FlowController::store
* @see app/Http/Controllers/Api/FlowController.php:28
* @route '/api/v2/flows'
*/
store34e13dcb7f35384e4aa67e891f3fa69b.url = (options?: RouteQueryOptions) => {
    return store34e13dcb7f35384e4aa67e891f3fa69b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\FlowController::store
* @see app/Http/Controllers/Api/FlowController.php:28
* @route '/api/v2/flows'
*/
store34e13dcb7f35384e4aa67e891f3fa69b.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store34e13dcb7f35384e4aa67e891f3fa69b.url(options),
    method: 'post',
})

/**
* Multiple routes resolve to \App\Http\Controllers\Api\FlowController::store, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `store['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const store = {
    '/api/v1/flows': storec35984c720085d7c5d8b725421f868cf,
    '/api/v2/flows': store34e13dcb7f35384e4aa67e891f3fa69b,
}

/**
* @see \App\Http\Controllers\Api\FlowController::show
* @see app/Http/Controllers/Api/FlowController.php:55
* @route '/api/v1/flows/{flow}'
*/
const show12c6df2eac3668c4470b5b0b9f1c61a9 = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show12c6df2eac3668c4470b5b0b9f1c61a9.url(args, options),
    method: 'get',
})

show12c6df2eac3668c4470b5b0b9f1c61a9.definition = {
    methods: ["get","head"],
    url: '/api/v1/flows/{flow}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\FlowController::show
* @see app/Http/Controllers/Api/FlowController.php:55
* @route '/api/v1/flows/{flow}'
*/
show12c6df2eac3668c4470b5b0b9f1c61a9.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show12c6df2eac3668c4470b5b0b9f1c61a9.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\FlowController::show
* @see app/Http/Controllers/Api/FlowController.php:55
* @route '/api/v1/flows/{flow}'
*/
show12c6df2eac3668c4470b5b0b9f1c61a9.get = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show12c6df2eac3668c4470b5b0b9f1c61a9.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\FlowController::show
* @see app/Http/Controllers/Api/FlowController.php:55
* @route '/api/v1/flows/{flow}'
*/
show12c6df2eac3668c4470b5b0b9f1c61a9.head = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show12c6df2eac3668c4470b5b0b9f1c61a9.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\FlowController::show
* @see app/Http/Controllers/Api/FlowController.php:55
* @route '/api/v2/flows/{flow}'
*/
const show06a2f28608fbb3b67351fde67640e54b = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show06a2f28608fbb3b67351fde67640e54b.url(args, options),
    method: 'get',
})

show06a2f28608fbb3b67351fde67640e54b.definition = {
    methods: ["get","head"],
    url: '/api/v2/flows/{flow}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\FlowController::show
* @see app/Http/Controllers/Api/FlowController.php:55
* @route '/api/v2/flows/{flow}'
*/
show06a2f28608fbb3b67351fde67640e54b.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show06a2f28608fbb3b67351fde67640e54b.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\FlowController::show
* @see app/Http/Controllers/Api/FlowController.php:55
* @route '/api/v2/flows/{flow}'
*/
show06a2f28608fbb3b67351fde67640e54b.get = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show06a2f28608fbb3b67351fde67640e54b.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\FlowController::show
* @see app/Http/Controllers/Api/FlowController.php:55
* @route '/api/v2/flows/{flow}'
*/
show06a2f28608fbb3b67351fde67640e54b.head = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show06a2f28608fbb3b67351fde67640e54b.url(args, options),
    method: 'head',
})

/**
* Multiple routes resolve to \App\Http\Controllers\Api\FlowController::show, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `show['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const show = {
    '/api/v1/flows/{flow}': show12c6df2eac3668c4470b5b0b9f1c61a9,
    '/api/v2/flows/{flow}': show06a2f28608fbb3b67351fde67640e54b,
}

/**
* @see \App\Http\Controllers\Api\FlowController::update
* @see app/Http/Controllers/Api/FlowController.php:66
* @route '/api/v1/flows/{flow}'
*/
const update12c6df2eac3668c4470b5b0b9f1c61a9 = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update12c6df2eac3668c4470b5b0b9f1c61a9.url(args, options),
    method: 'put',
})

update12c6df2eac3668c4470b5b0b9f1c61a9.definition = {
    methods: ["put","patch"],
    url: '/api/v1/flows/{flow}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\FlowController::update
* @see app/Http/Controllers/Api/FlowController.php:66
* @route '/api/v1/flows/{flow}'
*/
update12c6df2eac3668c4470b5b0b9f1c61a9.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update12c6df2eac3668c4470b5b0b9f1c61a9.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\FlowController::update
* @see app/Http/Controllers/Api/FlowController.php:66
* @route '/api/v1/flows/{flow}'
*/
update12c6df2eac3668c4470b5b0b9f1c61a9.put = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update12c6df2eac3668c4470b5b0b9f1c61a9.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\FlowController::update
* @see app/Http/Controllers/Api/FlowController.php:66
* @route '/api/v1/flows/{flow}'
*/
update12c6df2eac3668c4470b5b0b9f1c61a9.patch = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update12c6df2eac3668c4470b5b0b9f1c61a9.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Api\FlowController::update
* @see app/Http/Controllers/Api/FlowController.php:66
* @route '/api/v2/flows/{flow}'
*/
const update06a2f28608fbb3b67351fde67640e54b = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update06a2f28608fbb3b67351fde67640e54b.url(args, options),
    method: 'put',
})

update06a2f28608fbb3b67351fde67640e54b.definition = {
    methods: ["put","patch"],
    url: '/api/v2/flows/{flow}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\FlowController::update
* @see app/Http/Controllers/Api/FlowController.php:66
* @route '/api/v2/flows/{flow}'
*/
update06a2f28608fbb3b67351fde67640e54b.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update06a2f28608fbb3b67351fde67640e54b.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\FlowController::update
* @see app/Http/Controllers/Api/FlowController.php:66
* @route '/api/v2/flows/{flow}'
*/
update06a2f28608fbb3b67351fde67640e54b.put = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update06a2f28608fbb3b67351fde67640e54b.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\FlowController::update
* @see app/Http/Controllers/Api/FlowController.php:66
* @route '/api/v2/flows/{flow}'
*/
update06a2f28608fbb3b67351fde67640e54b.patch = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update06a2f28608fbb3b67351fde67640e54b.url(args, options),
    method: 'patch',
})

/**
* Multiple routes resolve to \App\Http\Controllers\Api\FlowController::update, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `update['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const update = {
    '/api/v1/flows/{flow}': update12c6df2eac3668c4470b5b0b9f1c61a9,
    '/api/v2/flows/{flow}': update06a2f28608fbb3b67351fde67640e54b,
}

const FlowController = { index, store, show, update }

export default FlowController