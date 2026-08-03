import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\TenantController::store
* @see app/Http/Controllers/Api/TenantController.php:19
* @route '/api/v1/tenants'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/tenants',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\TenantController::store
* @see app/Http/Controllers/Api/TenantController.php:19
* @route '/api/v1/tenants'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TenantController::store
* @see app/Http/Controllers/Api/TenantController.php:19
* @route '/api/v1/tenants'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TenantController::show
* @see app/Http/Controllers/Api/TenantController.php:40
* @route '/api/v1/tenants/{tenant}'
*/
export const show = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/tenants/{tenant}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\TenantController::show
* @see app/Http/Controllers/Api/TenantController.php:40
* @route '/api/v1/tenants/{tenant}'
*/
show.url = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { tenant: args }
    }

    if (Array.isArray(args)) {
        args = {
            tenant: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        tenant: args.tenant,
    }

    return show.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TenantController::show
* @see app/Http/Controllers/Api/TenantController.php:40
* @route '/api/v1/tenants/{tenant}'
*/
show.get = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\TenantController::show
* @see app/Http/Controllers/Api/TenantController.php:40
* @route '/api/v1/tenants/{tenant}'
*/
show.head = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\TenantController::update
* @see app/Http/Controllers/Api/TenantController.php:51
* @route '/api/v1/tenants/{tenant}'
*/
export const update = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/tenants/{tenant}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\TenantController::update
* @see app/Http/Controllers/Api/TenantController.php:51
* @route '/api/v1/tenants/{tenant}'
*/
update.url = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { tenant: args }
    }

    if (Array.isArray(args)) {
        args = {
            tenant: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        tenant: args.tenant,
    }

    return update.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TenantController::update
* @see app/Http/Controllers/Api/TenantController.php:51
* @route '/api/v1/tenants/{tenant}'
*/
update.put = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\TenantController::update
* @see app/Http/Controllers/Api/TenantController.php:51
* @route '/api/v1/tenants/{tenant}'
*/
update.patch = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

const tenants = {
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    update: Object.assign(update, update),
}

export default tenants