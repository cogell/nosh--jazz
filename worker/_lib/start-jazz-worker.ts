import { PureJSCrypto } from 'cojson/dist/crypto/PureJSCrypto';
import { Config, Console, Data, Effect, Redacted } from 'effect';
import { startWorker } from 'jazz-tools/worker';

class JazzWorkerStartError extends Data.TaggedError('JazzWorkerStartError')<{
  cause: unknown;
}> {}

class JazzWorkerCryptoError extends Data.TaggedError('JazzWorkerCryptoError')<{
  cause: unknown;
}> {}

export const startJazzWorker = Effect.fn('startJazzWorker')(function* () {
  yield* Effect.log('gonna start jazz worker');
  const jazzWorkerAccountID = yield* Config.string('JAZZ_WORKER_ACCOUNT');
  const jazzWorkerAccountSecret = yield* Config.redacted('JAZZ_WORKER_SECRET');
  const syncServer = yield* Config.string('JAZZ_WORKER_SYNC_SERVER');

  const crypto = yield* Effect.tryPromise({
    try: async () => await PureJSCrypto.create(),
    catch: (error) => new JazzWorkerCryptoError({ cause: error }),
  });

  const worker = yield* Effect.tryPromise({
    try: async () =>
      startWorker({
        accountID: jazzWorkerAccountID,
        accountSecret: Redacted.value(jazzWorkerAccountSecret),
        syncServer,
        crypto,
      }),
    catch: (error) => new JazzWorkerStartError({ cause: error }),
  });

  return worker;
});
