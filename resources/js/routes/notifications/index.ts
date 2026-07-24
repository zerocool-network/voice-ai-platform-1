import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Web\NotificationController::index
* @see app/Http/Controllers/Web/NotificationController.php:15
* @route '/notifications'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\NotificationController::index
* @see app/Http/Controllers/Web/NotificationController.php:15
* @route '/notifications'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\NotificationController::index
* @see app/Http/Controllers/Web/NotificationController.php:15
* @route '/notifications'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\NotificationController::index
* @see app/Http/Controllers/Web/NotificationController.php:15
* @route '/notifications'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\NotificationController::unread
* @see app/Http/Controllers/Web/NotificationController.php:37
* @route '/notifications/unread'
*/
export const unread = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: unread.url(options),
    method: 'get',
})

unread.definition = {
    methods: ["get","head"],
    url: '/notifications/unread',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\NotificationController::unread
* @see app/Http/Controllers/Web/NotificationController.php:37
* @route '/notifications/unread'
*/
unread.url = (options?: RouteQueryOptions) => {
    return unread.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\NotificationController::unread
* @see app/Http/Controllers/Web/NotificationController.php:37
* @route '/notifications/unread'
*/
unread.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: unread.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\NotificationController::unread
* @see app/Http/Controllers/Web/NotificationController.php:37
* @route '/notifications/unread'
*/
unread.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: unread.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\NotificationController::read
* @see app/Http/Controllers/Web/NotificationController.php:51
* @route '/notifications/{id}/read'
*/
export const read = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: read.url(args, options),
    method: 'post',
})

read.definition = {
    methods: ["post"],
    url: '/notifications/{id}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\NotificationController::read
* @see app/Http/Controllers/Web/NotificationController.php:51
* @route '/notifications/{id}/read'
*/
read.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return read.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\NotificationController::read
* @see app/Http/Controllers/Web/NotificationController.php:51
* @route '/notifications/{id}/read'
*/
read.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: read.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\NotificationController::markAllRead
* @see app/Http/Controllers/Web/NotificationController.php:60
* @route '/notifications/mark-all-read'
*/
export const markAllRead = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead.url(options),
    method: 'post',
})

markAllRead.definition = {
    methods: ["post"],
    url: '/notifications/mark-all-read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\NotificationController::markAllRead
* @see app/Http/Controllers/Web/NotificationController.php:60
* @route '/notifications/mark-all-read'
*/
markAllRead.url = (options?: RouteQueryOptions) => {
    return markAllRead.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\NotificationController::markAllRead
* @see app/Http/Controllers/Web/NotificationController.php:60
* @route '/notifications/mark-all-read'
*/
markAllRead.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead.url(options),
    method: 'post',
})

const notifications = {
    index: Object.assign(index, index),
    unread: Object.assign(unread, unread),
    read: Object.assign(read, read),
    markAllRead: Object.assign(markAllRead, markAllRead),
}

export default notifications