import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Web\GettingStartedController::complete
* @see app/Http/Controllers/Web/GettingStartedController.php:50
* @route '/getting-started/completed'
*/
export const complete = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: complete.url(options),
    method: 'post',
})

complete.definition = {
    methods: ["post"],
    url: '/getting-started/completed',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\GettingStartedController::complete
* @see app/Http/Controllers/Web/GettingStartedController.php:50
* @route '/getting-started/completed'
*/
complete.url = (options?: RouteQueryOptions) => {
    return complete.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\GettingStartedController::complete
* @see app/Http/Controllers/Web/GettingStartedController.php:50
* @route '/getting-started/completed'
*/
complete.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: complete.url(options),
    method: 'post',
})

const gettingStarted = {
    complete: Object.assign(complete, complete),
}

export default gettingStarted