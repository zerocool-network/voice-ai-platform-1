import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\FlowController::index
* @see app/Http/Controllers/Web/FlowController.php:30
* @route '/flows'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/flows',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\FlowController::index
* @see app/Http/Controllers/Web/FlowController.php:30
* @route '/flows'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\FlowController::index
* @see app/Http/Controllers/Web/FlowController.php:30
* @route '/flows'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\FlowController::index
* @see app/Http/Controllers/Web/FlowController.php:30
* @route '/flows'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\FlowController::create
* @see app/Http/Controllers/Web/FlowController.php:44
* @route '/flows/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/flows/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\FlowController::create
* @see app/Http/Controllers/Web/FlowController.php:44
* @route '/flows/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\FlowController::create
* @see app/Http/Controllers/Web/FlowController.php:44
* @route '/flows/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\FlowController::create
* @see app/Http/Controllers/Web/FlowController.php:44
* @route '/flows/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\FlowController::store
* @see app/Http/Controllers/Web/FlowController.php:51
* @route '/flows'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/flows',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\FlowController::store
* @see app/Http/Controllers/Web/FlowController.php:51
* @route '/flows'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\FlowController::store
* @see app/Http/Controllers/Web/FlowController.php:51
* @route '/flows'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\FlowController::edit
* @see app/Http/Controllers/Web/FlowController.php:105
* @route '/flows/{flow}/edit'
*/
export const edit = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/flows/{flow}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\FlowController::edit
* @see app/Http/Controllers/Web/FlowController.php:105
* @route '/flows/{flow}/edit'
*/
edit.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return edit.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\FlowController::edit
* @see app/Http/Controllers/Web/FlowController.php:105
* @route '/flows/{flow}/edit'
*/
edit.get = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\FlowController::edit
* @see app/Http/Controllers/Web/FlowController.php:105
* @route '/flows/{flow}/edit'
*/
edit.head = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\FlowController::show
* @see app/Http/Controllers/Web/FlowController.php:234
* @route '/flows/{flow}'
*/
export const show = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/flows/{flow}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\FlowController::show
* @see app/Http/Controllers/Web/FlowController.php:234
* @route '/flows/{flow}'
*/
show.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\FlowController::show
* @see app/Http/Controllers/Web/FlowController.php:234
* @route '/flows/{flow}'
*/
show.get = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\FlowController::show
* @see app/Http/Controllers/Web/FlowController.php:234
* @route '/flows/{flow}'
*/
show.head = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\FlowController::update
* @see app/Http/Controllers/Web/FlowController.php:118
* @route '/flows/{flow}'
*/
export const update = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/flows/{flow}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Web\FlowController::update
* @see app/Http/Controllers/Web/FlowController.php:118
* @route '/flows/{flow}'
*/
update.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\FlowController::update
* @see app/Http/Controllers/Web/FlowController.php:118
* @route '/flows/{flow}'
*/
update.patch = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Web\FlowController::test
* @see app/Http/Controllers/Web/FlowController.php:320
* @route '/flows/{flow}/test'
*/
export const test = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

test.definition = {
    methods: ["post"],
    url: '/flows/{flow}/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\FlowController::test
* @see app/Http/Controllers/Web/FlowController.php:320
* @route '/flows/{flow}/test'
*/
test.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return test.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\FlowController::test
* @see app/Http/Controllers/Web/FlowController.php:320
* @route '/flows/{flow}/test'
*/
test.post = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\FlowController::duplicate
* @see app/Http/Controllers/Web/FlowController.php:247
* @route '/flows/{flow}/duplicate'
*/
export const duplicate = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: duplicate.url(args, options),
    method: 'post',
})

duplicate.definition = {
    methods: ["post"],
    url: '/flows/{flow}/duplicate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\FlowController::duplicate
* @see app/Http/Controllers/Web/FlowController.php:247
* @route '/flows/{flow}/duplicate'
*/
duplicate.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return duplicate.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\FlowController::duplicate
* @see app/Http/Controllers/Web/FlowController.php:247
* @route '/flows/{flow}/duplicate'
*/
duplicate.post = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: duplicate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\FlowController::exportMethod
* @see app/Http/Controllers/Web/FlowController.php:270
* @route '/flows/{flow}/export'
*/
export const exportMethod = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/flows/{flow}/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\FlowController::exportMethod
* @see app/Http/Controllers/Web/FlowController.php:270
* @route '/flows/{flow}/export'
*/
exportMethod.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return exportMethod.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\FlowController::exportMethod
* @see app/Http/Controllers/Web/FlowController.php:270
* @route '/flows/{flow}/export'
*/
exportMethod.get = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\FlowController::exportMethod
* @see app/Http/Controllers/Web/FlowController.php:270
* @route '/flows/{flow}/export'
*/
exportMethod.head = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\FlowController::importMethod
* @see app/Http/Controllers/Web/FlowController.php:291
* @route '/flows/import'
*/
export const importMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

importMethod.definition = {
    methods: ["post"],
    url: '/flows/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\FlowController::importMethod
* @see app/Http/Controllers/Web/FlowController.php:291
* @route '/flows/import'
*/
importMethod.url = (options?: RouteQueryOptions) => {
    return importMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\FlowController::importMethod
* @see app/Http/Controllers/Web/FlowController.php:291
* @route '/flows/import'
*/
importMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\FlowController::destroy
* @see app/Http/Controllers/Web/FlowController.php:220
* @route '/flows/{flow}'
*/
export const destroy = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/flows/{flow}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Web\FlowController::destroy
* @see app/Http/Controllers/Web/FlowController.php:220
* @route '/flows/{flow}'
*/
destroy.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\FlowController::destroy
* @see app/Http/Controllers/Web/FlowController.php:220
* @route '/flows/{flow}'
*/
destroy.delete = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Web\FlowController::versions
* @see app/Http/Controllers/Web/FlowController.php:165
* @route '/flows/{flow}/versions'
*/
export const versions = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: versions.url(args, options),
    method: 'get',
})

versions.definition = {
    methods: ["get","head"],
    url: '/flows/{flow}/versions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\FlowController::versions
* @see app/Http/Controllers/Web/FlowController.php:165
* @route '/flows/{flow}/versions'
*/
versions.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return versions.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\FlowController::versions
* @see app/Http/Controllers/Web/FlowController.php:165
* @route '/flows/{flow}/versions'
*/
versions.get = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: versions.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\FlowController::versions
* @see app/Http/Controllers/Web/FlowController.php:165
* @route '/flows/{flow}/versions'
*/
versions.head = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: versions.url(args, options),
    method: 'head',
})

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

const FlowController = { index, create, store, edit, show, update, test, duplicate, exportMethod, importMethod, destroy, versions, restore, export: exportMethod, import: importMethod }

export default FlowController