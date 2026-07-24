import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\TenantController::store
* @see app/Http/Controllers/Api/TenantController.php:19
* @route '/api/v1/tenants'
*/
const store9b90207fb9b386ac26712ba99ca3c773 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store9b90207fb9b386ac26712ba99ca3c773.url(options),
    method: 'post',
})

store9b90207fb9b386ac26712ba99ca3c773.definition = {
    methods: ["post"],
    url: '/api/v1/tenants',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\TenantController::store
* @see app/Http/Controllers/Api/TenantController.php:19
* @route '/api/v1/tenants'
*/
store9b90207fb9b386ac26712ba99ca3c773.url = (options?: RouteQueryOptions) => {
    return store9b90207fb9b386ac26712ba99ca3c773.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TenantController::store
* @see app/Http/Controllers/Api/TenantController.php:19
* @route '/api/v1/tenants'
*/
store9b90207fb9b386ac26712ba99ca3c773.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store9b90207fb9b386ac26712ba99ca3c773.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TenantController::store
* @see app/Http/Controllers/Api/TenantController.php:19
* @route '/api/v2/tenants'
*/
const store97aed150dd883ed65b574132a83f92dc = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store97aed150dd883ed65b574132a83f92dc.url(options),
    method: 'post',
})

store97aed150dd883ed65b574132a83f92dc.definition = {
    methods: ["post"],
    url: '/api/v2/tenants',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\TenantController::store
* @see app/Http/Controllers/Api/TenantController.php:19
* @route '/api/v2/tenants'
*/
store97aed150dd883ed65b574132a83f92dc.url = (options?: RouteQueryOptions) => {
    return store97aed150dd883ed65b574132a83f92dc.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TenantController::store
* @see app/Http/Controllers/Api/TenantController.php:19
* @route '/api/v2/tenants'
*/
store97aed150dd883ed65b574132a83f92dc.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store97aed150dd883ed65b574132a83f92dc.url(options),
    method: 'post',
})

/**
* Multiple routes resolve to \App\Http\Controllers\Api\TenantController::store, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `store['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const store = {
    '/api/v1/tenants': store9b90207fb9b386ac26712ba99ca3c773,
    '/api/v2/tenants': store97aed150dd883ed65b574132a83f92dc,
}

/**
* @see \App\Http\Controllers\Api\TenantController::show
* @see app/Http/Controllers/Api/TenantController.php:40
* @route '/api/v1/tenants/{tenant}'
*/
const show525f2f3f4a134c7918c9257cfe85119f = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show525f2f3f4a134c7918c9257cfe85119f.url(args, options),
    method: 'get',
})

show525f2f3f4a134c7918c9257cfe85119f.definition = {
    methods: ["get","head"],
    url: '/api/v1/tenants/{tenant}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\TenantController::show
* @see app/Http/Controllers/Api/TenantController.php:40
* @route '/api/v1/tenants/{tenant}'
*/
show525f2f3f4a134c7918c9257cfe85119f.url = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show525f2f3f4a134c7918c9257cfe85119f.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TenantController::show
* @see app/Http/Controllers/Api/TenantController.php:40
* @route '/api/v1/tenants/{tenant}'
*/
show525f2f3f4a134c7918c9257cfe85119f.get = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show525f2f3f4a134c7918c9257cfe85119f.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\TenantController::show
* @see app/Http/Controllers/Api/TenantController.php:40
* @route '/api/v1/tenants/{tenant}'
*/
show525f2f3f4a134c7918c9257cfe85119f.head = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show525f2f3f4a134c7918c9257cfe85119f.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\TenantController::show
* @see app/Http/Controllers/Api/TenantController.php:40
* @route '/api/v2/tenants/{tenant}'
*/
const show6b93ad1f8e4110f8348a3d3af70d926f = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show6b93ad1f8e4110f8348a3d3af70d926f.url(args, options),
    method: 'get',
})

show6b93ad1f8e4110f8348a3d3af70d926f.definition = {
    methods: ["get","head"],
    url: '/api/v2/tenants/{tenant}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\TenantController::show
* @see app/Http/Controllers/Api/TenantController.php:40
* @route '/api/v2/tenants/{tenant}'
*/
show6b93ad1f8e4110f8348a3d3af70d926f.url = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show6b93ad1f8e4110f8348a3d3af70d926f.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TenantController::show
* @see app/Http/Controllers/Api/TenantController.php:40
* @route '/api/v2/tenants/{tenant}'
*/
show6b93ad1f8e4110f8348a3d3af70d926f.get = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show6b93ad1f8e4110f8348a3d3af70d926f.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\TenantController::show
* @see app/Http/Controllers/Api/TenantController.php:40
* @route '/api/v2/tenants/{tenant}'
*/
show6b93ad1f8e4110f8348a3d3af70d926f.head = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show6b93ad1f8e4110f8348a3d3af70d926f.url(args, options),
    method: 'head',
})

/**
* Multiple routes resolve to \App\Http\Controllers\Api\TenantController::show, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `show['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const show = {
    '/api/v1/tenants/{tenant}': show525f2f3f4a134c7918c9257cfe85119f,
    '/api/v2/tenants/{tenant}': show6b93ad1f8e4110f8348a3d3af70d926f,
}

/**
* @see \App\Http\Controllers\Api\TenantController::update
* @see app/Http/Controllers/Api/TenantController.php:51
* @route '/api/v1/tenants/{tenant}'
*/
const update525f2f3f4a134c7918c9257cfe85119f = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update525f2f3f4a134c7918c9257cfe85119f.url(args, options),
    method: 'put',
})

update525f2f3f4a134c7918c9257cfe85119f.definition = {
    methods: ["put","patch"],
    url: '/api/v1/tenants/{tenant}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\TenantController::update
* @see app/Http/Controllers/Api/TenantController.php:51
* @route '/api/v1/tenants/{tenant}'
*/
update525f2f3f4a134c7918c9257cfe85119f.url = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update525f2f3f4a134c7918c9257cfe85119f.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TenantController::update
* @see app/Http/Controllers/Api/TenantController.php:51
* @route '/api/v1/tenants/{tenant}'
*/
update525f2f3f4a134c7918c9257cfe85119f.put = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update525f2f3f4a134c7918c9257cfe85119f.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\TenantController::update
* @see app/Http/Controllers/Api/TenantController.php:51
* @route '/api/v1/tenants/{tenant}'
*/
update525f2f3f4a134c7918c9257cfe85119f.patch = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update525f2f3f4a134c7918c9257cfe85119f.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Api\TenantController::update
* @see app/Http/Controllers/Api/TenantController.php:51
* @route '/api/v2/tenants/{tenant}'
*/
const update6b93ad1f8e4110f8348a3d3af70d926f = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update6b93ad1f8e4110f8348a3d3af70d926f.url(args, options),
    method: 'put',
})

update6b93ad1f8e4110f8348a3d3af70d926f.definition = {
    methods: ["put","patch"],
    url: '/api/v2/tenants/{tenant}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\TenantController::update
* @see app/Http/Controllers/Api/TenantController.php:51
* @route '/api/v2/tenants/{tenant}'
*/
update6b93ad1f8e4110f8348a3d3af70d926f.url = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update6b93ad1f8e4110f8348a3d3af70d926f.definition.url
            .replace('{tenant}', parsedArgs.tenant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TenantController::update
* @see app/Http/Controllers/Api/TenantController.php:51
* @route '/api/v2/tenants/{tenant}'
*/
update6b93ad1f8e4110f8348a3d3af70d926f.put = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update6b93ad1f8e4110f8348a3d3af70d926f.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\TenantController::update
* @see app/Http/Controllers/Api/TenantController.php:51
* @route '/api/v2/tenants/{tenant}'
*/
update6b93ad1f8e4110f8348a3d3af70d926f.patch = (args: { tenant: string | number } | [tenant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update6b93ad1f8e4110f8348a3d3af70d926f.url(args, options),
    method: 'patch',
})

/**
* Multiple routes resolve to \App\Http\Controllers\Api\TenantController::update, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `update['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const update = {
    '/api/v1/tenants/{tenant}': update525f2f3f4a134c7918c9257cfe85119f,
    '/api/v2/tenants/{tenant}': update6b93ad1f8e4110f8348a3d3af70d926f,
}

const TenantController = { store, show, update }

export default TenantController