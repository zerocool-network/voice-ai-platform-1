import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
import deliveries5c6093 from './deliveries'
/**
* @see \App\Http\Controllers\Web\WebhookDestinationController::index
* @see app/Http/Controllers/Web/WebhookDestinationController.php:16
* @route '/settings/webhooks'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/webhooks',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\WebhookDestinationController::index
* @see app/Http/Controllers/Web/WebhookDestinationController.php:16
* @route '/settings/webhooks'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\WebhookDestinationController::index
* @see app/Http/Controllers/Web/WebhookDestinationController.php:16
* @route '/settings/webhooks'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\WebhookDestinationController::index
* @see app/Http/Controllers/Web/WebhookDestinationController.php:16
* @route '/settings/webhooks'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\WebhookDestinationController::store
* @see app/Http/Controllers/Web/WebhookDestinationController.php:32
* @route '/settings/webhooks'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/settings/webhooks',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\WebhookDestinationController::store
* @see app/Http/Controllers/Web/WebhookDestinationController.php:32
* @route '/settings/webhooks'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\WebhookDestinationController::store
* @see app/Http/Controllers/Web/WebhookDestinationController.php:32
* @route '/settings/webhooks'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\WebhookDestinationController::update
* @see app/Http/Controllers/Web/WebhookDestinationController.php:60
* @route '/settings/webhooks/{webhook}'
*/
export const update = (args: { webhook: string | number } | [webhook: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/settings/webhooks/{webhook}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Web\WebhookDestinationController::update
* @see app/Http/Controllers/Web/WebhookDestinationController.php:60
* @route '/settings/webhooks/{webhook}'
*/
update.url = (args: { webhook: string | number } | [webhook: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { webhook: args }
    }

    if (Array.isArray(args)) {
        args = {
            webhook: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        webhook: args.webhook,
    }

    return update.definition.url
            .replace('{webhook}', parsedArgs.webhook.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\WebhookDestinationController::update
* @see app/Http/Controllers/Web/WebhookDestinationController.php:60
* @route '/settings/webhooks/{webhook}'
*/
update.patch = (args: { webhook: string | number } | [webhook: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Web\WebhookDestinationController::destroy
* @see app/Http/Controllers/Web/WebhookDestinationController.php:81
* @route '/settings/webhooks/{webhook}'
*/
export const destroy = (args: { webhook: string | number } | [webhook: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/settings/webhooks/{webhook}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Web\WebhookDestinationController::destroy
* @see app/Http/Controllers/Web/WebhookDestinationController.php:81
* @route '/settings/webhooks/{webhook}'
*/
destroy.url = (args: { webhook: string | number } | [webhook: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { webhook: args }
    }

    if (Array.isArray(args)) {
        args = {
            webhook: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        webhook: args.webhook,
    }

    return destroy.definition.url
            .replace('{webhook}', parsedArgs.webhook.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\WebhookDestinationController::destroy
* @see app/Http/Controllers/Web/WebhookDestinationController.php:81
* @route '/settings/webhooks/{webhook}'
*/
destroy.delete = (args: { webhook: string | number } | [webhook: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Web\WebhookDestinationController::test
* @see app/Http/Controllers/Web/WebhookDestinationController.php:93
* @route '/settings/webhooks/{webhook}/test'
*/
export const test = (args: { webhook: string | { id: string } } | [webhook: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

test.definition = {
    methods: ["post"],
    url: '/settings/webhooks/{webhook}/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\WebhookDestinationController::test
* @see app/Http/Controllers/Web/WebhookDestinationController.php:93
* @route '/settings/webhooks/{webhook}/test'
*/
test.url = (args: { webhook: string | { id: string } } | [webhook: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { webhook: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { webhook: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            webhook: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        webhook: typeof args.webhook === 'object'
        ? args.webhook.id
        : args.webhook,
    }

    return test.definition.url
            .replace('{webhook}', parsedArgs.webhook.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\WebhookDestinationController::test
* @see app/Http/Controllers/Web/WebhookDestinationController.php:93
* @route '/settings/webhooks/{webhook}/test'
*/
test.post = (args: { webhook: string | { id: string } } | [webhook: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\WebhookDeliveryController::deliveries
* @see app/Http/Controllers/Web/WebhookDeliveryController.php:17
* @route '/settings/webhooks/deliveries'
*/
export const deliveries = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: deliveries.url(options),
    method: 'get',
})

deliveries.definition = {
    methods: ["get","head"],
    url: '/settings/webhooks/deliveries',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\WebhookDeliveryController::deliveries
* @see app/Http/Controllers/Web/WebhookDeliveryController.php:17
* @route '/settings/webhooks/deliveries'
*/
deliveries.url = (options?: RouteQueryOptions) => {
    return deliveries.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\WebhookDeliveryController::deliveries
* @see app/Http/Controllers/Web/WebhookDeliveryController.php:17
* @route '/settings/webhooks/deliveries'
*/
deliveries.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: deliveries.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\WebhookDeliveryController::deliveries
* @see app/Http/Controllers/Web/WebhookDeliveryController.php:17
* @route '/settings/webhooks/deliveries'
*/
deliveries.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: deliveries.url(options),
    method: 'head',
})

const webhooks = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    test: Object.assign(test, test),
    deliveries: Object.assign(deliveries, deliveries5c6093),
}

export default webhooks