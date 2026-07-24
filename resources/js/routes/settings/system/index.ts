import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\SystemHealthController::poll
* @see app/Http/Controllers/Web/SystemHealthController.php:33
* @route '/settings/system/poll'
*/
export const poll = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: poll.url(options),
    method: 'get',
})

poll.definition = {
    methods: ["get","head"],
    url: '/settings/system/poll',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\SystemHealthController::poll
* @see app/Http/Controllers/Web/SystemHealthController.php:33
* @route '/settings/system/poll'
*/
poll.url = (options?: RouteQueryOptions) => {
    return poll.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SystemHealthController::poll
* @see app/Http/Controllers/Web/SystemHealthController.php:33
* @route '/settings/system/poll'
*/
poll.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: poll.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\SystemHealthController::poll
* @see app/Http/Controllers/Web/SystemHealthController.php:33
* @route '/settings/system/poll'
*/
poll.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: poll.url(options),
    method: 'head',
})

const system = {
    poll: Object.assign(poll, poll),
}

export default system