import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\ElevenLabsAgentController::index
* @see app/Http/Controllers/Web/ElevenLabsAgentController.php:21
* @route '/settings/agents'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/agents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\ElevenLabsAgentController::index
* @see app/Http/Controllers/Web/ElevenLabsAgentController.php:21
* @route '/settings/agents'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ElevenLabsAgentController::index
* @see app/Http/Controllers/Web/ElevenLabsAgentController.php:21
* @route '/settings/agents'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\ElevenLabsAgentController::index
* @see app/Http/Controllers/Web/ElevenLabsAgentController.php:21
* @route '/settings/agents'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\ElevenLabsAgentController::store
* @see app/Http/Controllers/Web/ElevenLabsAgentController.php:33
* @route '/settings/agents'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/settings/agents',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\ElevenLabsAgentController::store
* @see app/Http/Controllers/Web/ElevenLabsAgentController.php:33
* @route '/settings/agents'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ElevenLabsAgentController::store
* @see app/Http/Controllers/Web/ElevenLabsAgentController.php:33
* @route '/settings/agents'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\ElevenLabsAgentController::update
* @see app/Http/Controllers/Web/ElevenLabsAgentController.php:79
* @route '/settings/agents/{agent}'
*/
export const update = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/settings/agents/{agent}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Web\ElevenLabsAgentController::update
* @see app/Http/Controllers/Web/ElevenLabsAgentController.php:79
* @route '/settings/agents/{agent}'
*/
update.url = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

    if (Array.isArray(args)) {
        args = {
            agent: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agent: args.agent,
    }

    return update.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ElevenLabsAgentController::update
* @see app/Http/Controllers/Web/ElevenLabsAgentController.php:79
* @route '/settings/agents/{agent}'
*/
update.patch = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Web\ElevenLabsAgentController::destroy
* @see app/Http/Controllers/Web/ElevenLabsAgentController.php:127
* @route '/settings/agents/{agent}'
*/
export const destroy = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/settings/agents/{agent}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Web\ElevenLabsAgentController::destroy
* @see app/Http/Controllers/Web/ElevenLabsAgentController.php:127
* @route '/settings/agents/{agent}'
*/
destroy.url = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

    if (Array.isArray(args)) {
        args = {
            agent: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agent: args.agent,
    }

    return destroy.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ElevenLabsAgentController::destroy
* @see app/Http/Controllers/Web/ElevenLabsAgentController.php:127
* @route '/settings/agents/{agent}'
*/
destroy.delete = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Web\ElevenLabsAgentController::sync
* @see app/Http/Controllers/Web/ElevenLabsAgentController.php:154
* @route '/settings/agents/sync'
*/
export const sync = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

sync.definition = {
    methods: ["post"],
    url: '/settings/agents/sync',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\ElevenLabsAgentController::sync
* @see app/Http/Controllers/Web/ElevenLabsAgentController.php:154
* @route '/settings/agents/sync'
*/
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ElevenLabsAgentController::sync
* @see app/Http/Controllers/Web/ElevenLabsAgentController.php:154
* @route '/settings/agents/sync'
*/
sync.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

const agents = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    sync: Object.assign(sync, sync),
}

export default agents