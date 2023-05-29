import protoLoader from "@grpc/proto-loader";
import exporter from "./utils/exporter.js"
import grpc from "@grpc/grpc-js";
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const METRICS_PROTO_PATH = "./opentelemetry/proto/collector/metrics/v1/metrics_service.proto";
const TRACES_PROTO_PATH = "./opentelemetry/proto/collector/trace/v1/trace_service.proto";
const LOGS_PROTO_PATH = "./opentelemetry/proto/collector/logs/v1/logs_service.proto";

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [__dirname],
};

const metricsPackageDefinition = protoLoader.loadSync(METRICS_PROTO_PATH, options);
const tracesPackageDefinition = protoLoader.loadSync(TRACES_PROTO_PATH, options);
const logsPackageDefinition = protoLoader.loadSync(LOGS_PROTO_PATH, options);

const metricsProto = grpc.loadPackageDefinition(metricsPackageDefinition);
const tracesProto = grpc.loadPackageDefinition(tracesPackageDefinition);
const logsProto = grpc.loadPackageDefinition(logsPackageDefinition);

export async function deploy(env) {
  const server = new grpc.Server();
  
  /* Configure OTLP/GRPC server */
  server.addService(metricsProto.opentelemetry.proto.collector.metrics.v1.MetricsService.service, {
      export: (m, callback) => exporter.exportMetrics(m, callback),
  });
  
  server.addService(tracesProto.opentelemetry.proto.collector.trace.v1.TraceService.service, {
      export: (t, callback) => exporter.exportTraces(t, callback),
  });
  
  server.addService(logsProto.opentelemetry.proto.collector.logs.v1.LogsService.service, {
      export: (_, callback) => exporter.exportLogs(_, callback),
  });
  
  /* Init GRPC server */
  server.bindAsync(`127.0.0.1:${env.PORT ?? 4317}`, grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error(error);
      } else {
        server.start();
        console.log(`Server running at http://127.0.0.1:${port}`);
      }
    }
  );
}

export async function undeploy() {
  process.exit(0);
}

export default { deploy, undeploy }