import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\VoiceController::index
* @see app/Http/Controllers/Web/VoiceController.php:23
* @route '/settings/voices'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/voices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\VoiceController::index
* @see app/Http/Controllers/Web/VoiceController.php:23
* @route '/settings/voices'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\VoiceController::index
* @see app/Http/Controllers/Web/VoiceController.php:23
* @route '/settings/voices'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\VoiceController::index
* @see app/Http/Controllers/Web/VoiceController.php:23
* @route '/settings/voices'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\VoiceController::store
* @see app/Http/Controllers/Web/VoiceController.php:34
* @route '/settings/voices'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/settings/voices',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\VoiceController::store
* @see app/Http/Controllers/Web/VoiceController.php:34
* @route '/settings/voices'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\VoiceController::store
* @see app/Http/Controllers/Web/VoiceController.php:34
* @route '/settings/voices'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\VoiceController::library
* @see app/Http/Controllers/Web/VoiceController.php:199
* @route '/settings/voices/library'
*/
export const library = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: library.url(options),
    method: 'get',
})

library.definition = {
    methods: ["get","head"],
    url: '/settings/voices/library',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\VoiceController::library
* @see app/Http/Controllers/Web/VoiceController.php:199
* @route '/settings/voices/library'
*/
library.url = (options?: RouteQueryOptions) => {
    return library.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\VoiceController::library
* @see app/Http/Controllers/Web/VoiceController.php:199
* @route '/settings/voices/library'
*/
library.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: library.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\VoiceController::library
* @see app/Http/Controllers/Web/VoiceController.php:199
* @route '/settings/voices/library'
*/
library.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: library.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\VoiceController::addFromLibrary
* @see app/Http/Controllers/Web/VoiceController.php:241
* @route '/settings/voices/library'
*/
export const addFromLibrary = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addFromLibrary.url(options),
    method: 'post',
})

addFromLibrary.definition = {
    methods: ["post"],
    url: '/settings/voices/library',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\VoiceController::addFromLibrary
* @see app/Http/Controllers/Web/VoiceController.php:241
* @route '/settings/voices/library'
*/
addFromLibrary.url = (options?: RouteQueryOptions) => {
    return addFromLibrary.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\VoiceController::addFromLibrary
* @see app/Http/Controllers/Web/VoiceController.php:241
* @route '/settings/voices/library'
*/
addFromLibrary.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addFromLibrary.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\VoiceController::destroy
* @see app/Http/Controllers/Web/VoiceController.php:115
* @route '/settings/voices/{voice}'
*/
export const destroy = (args: { voice: string | number } | [voice: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/settings/voices/{voice}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Web\VoiceController::destroy
* @see app/Http/Controllers/Web/VoiceController.php:115
* @route '/settings/voices/{voice}'
*/
destroy.url = (args: { voice: string | number } | [voice: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { voice: args }
    }

    if (Array.isArray(args)) {
        args = {
            voice: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        voice: args.voice,
    }

    return destroy.definition.url
            .replace('{voice}', parsedArgs.voice.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\VoiceController::destroy
* @see app/Http/Controllers/Web/VoiceController.php:115
* @route '/settings/voices/{voice}'
*/
destroy.delete = (args: { voice: string | number } | [voice: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Web\VoiceController::show
* @see app/Http/Controllers/Web/VoiceController.php:178
* @route '/settings/voices/{voice}'
*/
export const show = (args: { voice: string | number } | [voice: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/settings/voices/{voice}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\VoiceController::show
* @see app/Http/Controllers/Web/VoiceController.php:178
* @route '/settings/voices/{voice}'
*/
show.url = (args: { voice: string | number } | [voice: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { voice: args }
    }

    if (Array.isArray(args)) {
        args = {
            voice: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        voice: args.voice,
    }

    return show.definition.url
            .replace('{voice}', parsedArgs.voice.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\VoiceController::show
* @see app/Http/Controllers/Web/VoiceController.php:178
* @route '/settings/voices/{voice}'
*/
show.get = (args: { voice: string | number } | [voice: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\VoiceController::show
* @see app/Http/Controllers/Web/VoiceController.php:178
* @route '/settings/voices/{voice}'
*/
show.head = (args: { voice: string | number } | [voice: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\VoiceController::setDefault
* @see app/Http/Controllers/Web/VoiceController.php:156
* @route '/settings/voices/{voice}/default'
*/
export const setDefault = (args: { voice: string | number } | [voice: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: setDefault.url(args, options),
    method: 'patch',
})

setDefault.definition = {
    methods: ["patch"],
    url: '/settings/voices/{voice}/default',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Web\VoiceController::setDefault
* @see app/Http/Controllers/Web/VoiceController.php:156
* @route '/settings/voices/{voice}/default'
*/
setDefault.url = (args: { voice: string | number } | [voice: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { voice: args }
    }

    if (Array.isArray(args)) {
        args = {
            voice: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        voice: args.voice,
    }

    return setDefault.definition.url
            .replace('{voice}', parsedArgs.voice.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\VoiceController::setDefault
* @see app/Http/Controllers/Web/VoiceController.php:156
* @route '/settings/voices/{voice}/default'
*/
setDefault.patch = (args: { voice: string | number } | [voice: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: setDefault.url(args, options),
    method: 'patch',
})

const voices = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    library: Object.assign(library, library),
    addFromLibrary: Object.assign(addFromLibrary, addFromLibrary),
    destroy: Object.assign(destroy, destroy),
    show: Object.assign(show, show),
    setDefault: Object.assign(setDefault, setDefault),
}

export default voices