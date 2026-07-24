import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\WebhookDeliveryController::show
* @see app/Http/Controllers/Web/WebhookDeliveryController.php:67
* @route '/settings/webhooks/deliveries/{id}'
*/
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/settings/webhooks/deliveries/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\WebhookDeliveryController::show
* @see app/Http/Controllers/Web/WebhookDeliveryController.php:67
* @route '/settings/webhooks/deliveries/{id}'
*/
show.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return show.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\WebhookDeliveryController::show
* @see app/Http/Controllers/Web/WebhookDeliveryController.php:67
* @route '/settings/webhooks/deliveries/{id}'
*/
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\WebhookDeliveryController::show
* @see app/Http/Controllers/Web/WebhookDeliveryController.php:67
* @route '/settings/webhooks/deliveries/{id}'
*/
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\WebhookDeliveryController::retry
* @see app/Http/Controllers/Web/WebhookDeliveryController.php:77
* @route '/settings/webhooks/deliveries/{id}/retry'
*/
export const retry = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retry.url(args, options),
    method: 'post',
})

retry.definition = {
    methods: ["post"],
    url: '/settings/webhooks/deliveries/{id}/retry',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\WebhookDeliveryController::retry
* @see app/Http/Controllers/Web/WebhookDeliveryController.php:77
* @route '/settings/webhooks/deliveries/{id}/retry'
*/
retry.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return retry.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\WebhookDeliveryController::retry
* @see app/Http/Controllers/Web/WebhookDeliveryController.php:77
* @route '/settings/webhooks/deliveries/{id}/retry'
*/
retry.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retry.url(args, options),
    method: 'post',
})

const deliveries = {
    show: Object.assign(show, show),
    retry: Object.assign(retry, retry),
}

export default deliveries