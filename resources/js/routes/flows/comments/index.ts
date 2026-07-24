import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\FlowCommentController::index
* @see app/Http/Controllers/Web/FlowCommentController.php:14
* @route '/flows/{flow}/comments'
*/
export const index = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/flows/{flow}/comments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\FlowCommentController::index
* @see app/Http/Controllers/Web/FlowCommentController.php:14
* @route '/flows/{flow}/comments'
*/
index.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return index.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\FlowCommentController::index
* @see app/Http/Controllers/Web/FlowCommentController.php:14
* @route '/flows/{flow}/comments'
*/
index.get = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\FlowCommentController::index
* @see app/Http/Controllers/Web/FlowCommentController.php:14
* @route '/flows/{flow}/comments'
*/
index.head = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\FlowCommentController::store
* @see app/Http/Controllers/Web/FlowCommentController.php:31
* @route '/flows/{flow}/comments'
*/
export const store = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/flows/{flow}/comments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\FlowCommentController::store
* @see app/Http/Controllers/Web/FlowCommentController.php:31
* @route '/flows/{flow}/comments'
*/
store.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\FlowCommentController::store
* @see app/Http/Controllers/Web/FlowCommentController.php:31
* @route '/flows/{flow}/comments'
*/
store.post = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

const comments = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
}

export default comments