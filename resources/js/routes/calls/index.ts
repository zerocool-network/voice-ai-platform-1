import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
import scheduled89e461 from './scheduled'
/**
* @see \App\Http\Controllers\Web\ScheduledCallController::scheduled
* @see app/Http/Controllers/Web/ScheduledCallController.php:16
* @route '/calls/scheduled'
*/
export const scheduled = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: scheduled.url(options),
    method: 'get',
})

scheduled.definition = {
    methods: ["get","head"],
    url: '/calls/scheduled',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\ScheduledCallController::scheduled
* @see app/Http/Controllers/Web/ScheduledCallController.php:16
* @route '/calls/scheduled'
*/
scheduled.url = (options?: RouteQueryOptions) => {
    return scheduled.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ScheduledCallController::scheduled
* @see app/Http/Controllers/Web/ScheduledCallController.php:16
* @route '/calls/scheduled'
*/
scheduled.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: scheduled.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\ScheduledCallController::scheduled
* @see app/Http/Controllers/Web/ScheduledCallController.php:16
* @route '/calls/scheduled'
*/
scheduled.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: scheduled.url(options),
    method: 'head',
})

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
* @see \App\Http\Controllers\Web\CallController::exportMethod
* @see app/Http/Controllers/Web/CallController.php:129
* @route '/calls/export/csv'
*/
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/calls/export/csv',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\CallController::exportMethod
* @see app/Http/Controllers/Web/CallController.php:129
* @route '/calls/export/csv'
*/
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\CallController::exportMethod
* @see app/Http/Controllers/Web/CallController.php:129
* @route '/calls/export/csv'
*/
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\CallController::exportMethod
* @see app/Http/Controllers/Web/CallController.php:129
* @route '/calls/export/csv'
*/
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
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
* @see \App\Http\Controllers\Web\CallController::notes
* @see app/Http/Controllers/Web/CallController.php:75
* @route '/calls/{call}/notes'
*/
export const notes = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: notes.url(args, options),
    method: 'patch',
})

notes.definition = {
    methods: ["patch"],
    url: '/calls/{call}/notes',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Web\CallController::notes
* @see app/Http/Controllers/Web/CallController.php:75
* @route '/calls/{call}/notes'
*/
notes.url = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return notes.definition.url
            .replace('{call}', parsedArgs.call.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\CallController::notes
* @see app/Http/Controllers/Web/CallController.php:75
* @route '/calls/{call}/notes'
*/
notes.patch = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: notes.url(args, options),
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

const calls = {
    scheduled: Object.assign(scheduled, scheduled89e461),
    index: Object.assign(index, index),
    export: Object.assign(exportMethod, exportMethod),
    show: Object.assign(show, show),
    notes: Object.assign(notes, notes),
    retry: Object.assign(retry, retry),
    destroy: Object.assign(destroy, destroy),
}

export default calls