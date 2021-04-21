import {Context, ContextBuilder} from "js-context"

const loggerSym = Symbol("winston-logger")
/**
 * adds winston log functions to context, adding context values to the log
 * i.e. ctx.info("message goes here")
 * @param {Context|ContextBuilder} ctx
 * @param {Object} logger winston logger
 */
export function withLogger(ctx, logger) {
    const builder = new ContextBuilder()

    //add our logger
    builder.with(loggerSym, logger)

    //add the 'log' function
    builder.withCtxFunction('log', (ctx, ...args) => {
        const obj = buildCtxLogObject(ctx)
        const logger = getLogger(ctx).child(obj)
        logger.log(...args)
    })

    //add any custom levels/default levels
    for(const level in logger.levels) {
        builder.withCtxFunction(level, (ctx, ...args) => {
            const obj = buildCtxLogObject(ctx)
            const logger = getLogger(ctx).child(obj)
            logger[level](...args)
        })
    }

    return builder.build(ctx)
}

function buildCtxLogObject(ctx) {
    const val = {}
    for(const key in ctx) {
        if(ctx[key] instanceof Context) {
            ctx[key] = buildCtxLogObject(ctx[key])
        } else {
            val[key] = ctx[key]
        }
    }
    return val
}

function getLogger(ctx) {
    const logger = ctx[loggerSym]
    if(!logger) {
        throw new Error("Winston logger not defined on context")
    }
    return logger
}