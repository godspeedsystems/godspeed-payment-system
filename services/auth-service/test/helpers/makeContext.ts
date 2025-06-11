import { GSContext, logger } from '@godspeedsystems/core';
import { makeEvent } from './makeEvent';

export function makeContext(app: any, data: Record<string, any>) {
  const event = makeEvent(data);
  const childLogger = logger.child(app.getCommonAttrs(event));

  return new GSContext(
    app.config,
    app.datasources,
    event,
    app.mappings,
    app.nativeFunctions,
    app.plugins,
    logger,
    childLogger
  );
}