import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\CallController::index
* @see app/Http/Controllers/Web/CallController.php:19
* @route '/calls'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/calls',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\CallController::index
* @see app/Http/Controllers/Web/CallController.php:19
* @route '/calls'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\CallController::index
* @see app/Http/Controllers/Web/CallController.php:19
* @route '/calls'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\CallController::index
* @see app/Http/Controllers/Web/CallController.php:19
* @route '/calls'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\CallController::exportCsv
* @see app/Http/Controllers/Web/CallController.php:129
* @route '/calls/export/csv'
*/
export const exportCsv = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportCsv.url(options),
    method: 'get',
})

exportCsv.definition = {
    methods: ["get","head"],
    url: '/calls/export/csv',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\CallController::exportCsv
* @see app/Http/Controllers/Web/CallController.php:129
* @route '/calls/export/csv'
*/
exportCsv.url = (options?: RouteQueryOptions) => {
    return exportCsv.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\CallController::exportCsv
* @see app/Http/Controllers/Web/CallController.php:129
* @route '/calls/export/csv'
*/
exportCsv.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportCsv.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\CallController::exportCsv
* @see app/Http/Controllers/Web/CallController.php:129
* @route '/calls/export/csv'
*/
exportCsv.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportCsv.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\CallController::show
* @see app/Http/Controllers/Web/CallController.php:58
* @route '/calls/{call}'
*/
export const show = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/calls/{call}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\CallController::show
* @see app/Http/Controllers/Web/CallController.php:58
* @route '/calls/{call}'
*/
show.url = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { call: args }
    }

    if (Array.isArray(args)) {
        args = {
            call: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        call: args.call,
    }

    return show.definition.url
            .replace('{call}', parsedArgs.call.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\CallController::show
* @see app/Http/Controllers/Web/CallController.php:58
* @route '/calls/{call}'
*/
show.get = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\CallController::show
* @see app/Http/Controllers/Web/CallController.php:58
* @route '/calls/{call}'
*/
show.head = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\CallController::updateNotes
* @see app/Http/Controllers/Web/CallController.php:75
* @route '/calls/{call}/notes'
*/
export const updateNotes = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateNotes.url(args, options),
    method: 'patch',
})

updateNotes.definition = {
    methods: ["patch"],
    url: '/calls/{call}/notes',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Web\CallController::updateNotes
* @see app/Http/Controllers/Web/CallController.php:75
* @route '/calls/{call}/notes'
*/
updateNotes.url = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { call: args }
    }

    if (Array.isArray(args)) {
        args = {
            call: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        call: args.call,
    }

    return updateNotes.definition.url
            .replace('{call}', parsedArgs.call.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\CallController::updateNotes
* @see app/Http/Controllers/Web/CallController.php:75
* @route '/calls/{call}/notes'
*/
updateNotes.patch = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateNotes.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Web\CallController::retry
* @see app/Http/Controllers/Web/CallController.php:92
* @route '/calls/{call}/retry'
*/
export const retry = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retry.url(args, options),
    method: 'post',
})

retry.definition = {
    methods: ["post"],
    url: '/calls/{call}/retry',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\CallController::retry
* @see app/Http/Controllers/Web/CallController.php:92
* @route '/calls/{call}/retry'
*/
retry.url = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { call: args }
    }

    if (Array.isArray(args)) {
        args = {
            call: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        call: args.call,
    }

    return retry.definition.url
            .replace('{call}', parsedArgs.call.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\CallController::retry
* @see app/Http/Controllers/Web/CallController.php:92
* @route '/calls/{call}/retry'
*/
retry.post = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retry.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\CallController::destroy
* @see app/Http/Controllers/Web/CallController.php:179
* @route '/calls/{call}'
*/
export const destroy = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/calls/{call}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Web\CallController::destroy
* @see app/Http/Controllers/Web/CallController.php:179
* @route '/calls/{call}'
*/
destroy.url = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { call: args }
    }

    if (Array.isArray(args)) {
        args = {
            call: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        call: args.call,
    }

    return destroy.definition.url
            .replace('{call}', parsedArgs.call.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\CallController::destroy
* @see app/Http/Controllers/Web/CallController.php:179
* @route '/calls/{call}'
*/
destroy.delete = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const CallController = { index, exportCsv, show, updateNotes, retry, destroy }

export default CallController