import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
import autoReplies from './auto-replies'
import campaigns from './campaigns'
/**
* @see \App\Http\Controllers\Web\SmsController::index
* @see app/Http/Controllers/Web/SmsController.php:22
* @route '/sms'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/sms',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\SmsController::index
* @see app/Http/Controllers/Web/SmsController.php:22
* @route '/sms'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SmsController::index
* @see app/Http/Controllers/Web/SmsController.php:22
* @route '/sms'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\SmsController::index
* @see app/Http/Controllers/Web/SmsController.php:22
* @route '/sms'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\SmsController::conversation
* @see app/Http/Controllers/Web/SmsController.php:93
* @route '/sms/conversation/{contactNumber}'
*/
export const conversation = (args: { contactNumber: string | number } | [contactNumber: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversation.url(args, options),
    method: 'get',
})

conversation.definition = {
    methods: ["get","head"],
    url: '/sms/conversation/{contactNumber}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\SmsController::conversation
* @see app/Http/Controllers/Web/SmsController.php:93
* @route '/sms/conversation/{contactNumber}'
*/
conversation.url = (args: { contactNumber: string | number } | [contactNumber: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { contactNumber: args }
    }

    if (Array.isArray(args)) {
        args = {
            contactNumber: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        contactNumber: args.contactNumber,
    }

    return conversation.definition.url
            .replace('{contactNumber}', parsedArgs.contactNumber.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SmsController::conversation
* @see app/Http/Controllers/Web/SmsController.php:93
* @route '/sms/conversation/{contactNumber}'
*/
conversation.get = (args: { contactNumber: string | number } | [contactNumber: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversation.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\SmsController::conversation
* @see app/Http/Controllers/Web/SmsController.php:93
* @route '/sms/conversation/{contactNumber}'
*/
conversation.head = (args: { contactNumber: string | number } | [contactNumber: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: conversation.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\SmsController::send
* @see app/Http/Controllers/Web/SmsController.php:109
* @route '/sms/send'
*/
export const send = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/sms/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\SmsController::send
* @see app/Http/Controllers/Web/SmsController.php:109
* @route '/sms/send'
*/
send.url = (options?: RouteQueryOptions) => {
    return send.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SmsController::send
* @see app/Http/Controllers/Web/SmsController.php:109
* @route '/sms/send'
*/
send.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

const sms = {
    index: Object.assign(index, index),
    conversation: Object.assign(conversation, conversation),
    send: Object.assign(send, send),
    autoReplies: Object.assign(autoReplies, autoReplies),
    campaigns: Object.assign(campaigns, campaigns),
}

export default sms