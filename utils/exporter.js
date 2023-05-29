import Resource from "../mongo/Resource.js";
import Metric from "../mongo/Metric.js";
import Trace from "../mongo/Trace.js";
import parser from "./parser.js";

export function exportTraces(t, callback) {
  const { traces, resources } = parser.parseTraces(t.request);

  /* Add traces and resources to DB */
  _exportResources(resources, (res) => {
    traces.filter((trace) => trace.metadata.resource_id === res.service.name).forEach((trace) => {
      trace.metadata.resource_id = res._id;
    });
  }).then(() => {
    Trace.insertMany(traces).catch((err) => console.error(err));
  }).catch(err => {
    console.error(err);
  }).finally(() => {
    callback(null, {});
  });
}

export function exportMetrics(m, callback) {
  const { metrics, resources } = parser.parseMetrics(m.request);
  
  /* Add metrics and resources to DB */
  _exportResources(resources, (res) => {
    metrics.filter((metric) => metric.metadata.resource_id === res.service.name).forEach((metric) => {
      metric.metadata.resource_id = res._id;
    });
  }).then(async () => {
    await Promise.all(metrics.map((metric) => {
      return Metric.updateOne(
        { name: metric.name },
        { $set: {
            name: metric.name,
            description: metric.description,
            unit: metric.unit,
            type: metric.type,
            metadata: metric.metadata,
          }, $push: { data: { $each: metric.data } }
        }, { upsert: true }
      ).catch((err) => console.error(err));
    }));
  }).catch(err => {
    console.error(err);
  }).finally(() => {
    callback(null, {});
  });
}

export function exportLogs(l, callback) {
  console.error("Logs export not implemented yet"); //TODO implement logs export
  callback(null, {});
}

function _exportResources(resources, callback) {
  return Promise.all(resources.map((resource) => {
    return Resource.findOneAndUpdate({ "service.name": resource['service.name'] }, resource, { upsert: true, new: true })
      .then((res) => {
        callback(res);
      })
      .catch((err) => {
        console.error(err);
      });
  }));
}

export default { exportTraces, exportMetrics, exportLogs }