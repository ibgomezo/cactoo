const pino = require("pino");
const HyperDX = require("@hyperdx/node-opentelemetry");

let logger = pino();

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  logger = pino({
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
      },
    }
  });
}
if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "sandbox" ) {
  const hyperLogger = pino(pino.transport({
    mixin: HyperDX.getPinoMixinFunction,
    targets: [
      HyperDX.getPinoTransport("info", { // Send logs info and above
        detectResources: true,
      }),
    ],
  }));
  logger = new Proxy(hyperLogger, {
    get: (target, prop, receiver) => {
      if (prop === "error") {
        return (obj, msg, ...args) => {
          if (obj.cause) {
            obj.message = `${obj.message} Cause: ${obj.cause}`;
          }
          target.error(obj, msg, ...args);
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

module.exports = logger;
