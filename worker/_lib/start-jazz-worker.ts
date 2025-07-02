import { PureJSCrypto } from 'cojson/dist/crypto/PureJSCrypto';
import { Config, Data, Effect } from 'effect';
import { startWorker } from 'jazz-tools/worker';

class JazzWorkerStartError extends Data.TaggedError('JazzWorkerStartError')<{
  cause: unknown;
}> {}

class JazzWorkerCryptoError extends Data.TaggedError('JazzWorkerCryptoError')<{
  cause: unknown;
}> {}

// export function startJazzWorker(env: Env) {
//   return Effect.tryPromise({
//     try: async () =>
//       startWorker({
//         accountID: env.JAZZ_WORKER_ACCOUNT,
//         accountSecret: env.JAZZ_WORKER_SECRET,
//         syncServer: 'wss://cloud.jazz.tools/?key=cedric.cogell@gmail.com',
//         crypto: await PureJSCrypto.create(),
//       }),
//     catch: (error) => new JazzWorkerStartError({ cause: error }),
//   });
// }

export function startJazzWorker() {
  return Effect.gen(function* () {
    const jazzWorkerAccountID = yield* Config.string('JAZZ_WORKER_ACCOUNT');
    const jazzWorkerAccountSecret = yield* Config.string('JAZZ_WORKER_SECRET');
    const syncServer = yield* Config.string('JAZZ_WORKER_SYNC_SERVER');

    const crypto = yield* Effect.tryPromise({
      try: async () => await PureJSCrypto.create(),
      catch: (error) => new JazzWorkerCryptoError({ cause: error }),
    });

    const worker = yield* Effect.tryPromise({
      try: async () =>
        startWorker({
          accountID: jazzWorkerAccountID,
          accountSecret: jazzWorkerAccountSecret,
          syncServer,
          crypto,
        }),
      catch: (error) => new JazzWorkerStartError({ cause: error }),
    });

    return worker;
  });
}
