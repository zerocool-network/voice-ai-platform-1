import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\FlowController::restore
* @see app/Http/Controllers/Web/FlowController.php:182
* @route '/flows/{flow}/versions/{version}/restore'
*/
export const restore = (args: { flow: string | number, version: string | number } | [flow: string | number, version: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

restore.definition = {
    methods: ["post"],
    url: '/flows/{flow}/versions/{version}/restore',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\FlowController::restore
* @see app/Http/Controllers/Web/FlowController.php:182
* @route '/flows/{flow}/versions/{version}/restore'
*/
restore.url = (args: { flow: string | number, version: string | number } | [flow: string | number, version: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            flow: args[0],
            version: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        flow: args.flow,
        version: args.version,
    }

    return restore.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace('{version}', parsedArgs.version.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\FlowController::restore
* @see app/Http/Controllers/Web/FlowController.php:182
* @route '/flows/{flow}/versions/{version}/restore'
*/
restore.post = (args: { flow: string | number, version: string | number } | [flow: string | number, version: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

const versions = {
    restore: Object.assign(restore, restore),
}

export default versions