/* Spans parser */
export function parseTraces(request) {
    const resources = [];
    const traces = [];

    // Parse traces
    request.resource_spans.forEach(({scope_spans, resource}) => {

        /* Add resource to array */
        const rsrc = _parseResource(resource?.attributes);
        resources.push(rsrc);
        
        /* Parse spans and add to tarce array */
        scope_spans.forEach(({spans, scope, schema_url}) => {
            const spanScope = `${scope.name}@${scope.version}`;
            traces.push(...spans.map((span) => 
                ({name: span.name,
                span_id: span.span_id?.toString('hex'),
                trace_id: span.trace_id?.toString('hex'),
                parent_span_id: span.parent_span_id?.toString('hex'),
                start_time: new Date(parseInt(span.start_time_unix_nano, 10) / 1000000),
                end_time: new Date(parseInt(span.end_time_unix_nano, 10) / 1000000),
                attributes: _parseTraceAttributes(span.attributes, spanScope),
                metadata: {
                    resource_id: rsrc['service.name'],
                    scope: spanScope,
                    schema_url
                }})          
            ));
        });
    });
    return {traces, resources};
}

function _parseTraceAttributes(attributes, scope) {
    if (scope.includes('opentelemetry/instrumentation-http')) {
        return {
            source: _parseAnyValueAttributes(attributes?.filter(({key}) => key.startsWith("net.host"))),
            target: _parseAnyValueAttributes(attributes?.filter(({key}) => key.startsWith("net.peer"))),
            operation: _parseAnyValueAttributes(attributes?.filter(({key}) => key.startsWith("http")))
        }
    } else {
        return _parseAnyValueAttributes(attributes);
    }
}

/* Metrics parser */
export function parseMetrics(request) {
    const resources = [];
    const metricsArr = [];

    // Parse metrics
    request.resource_metrics.forEach(({scope_metrics, resource}) => {

        /* Add resource to array */
        const rsrc = _parseResource(resource?.attributes);
        resources.push(rsrc);

        /* Parse metrics and add to metrics array */
        scope_metrics.forEach(({metrics, scope, schema_url}) => {
            const metricScope = `${scope.name}@${scope.version}`;
            metrics.forEach((metric) => {
                metricsArr.push({
                    name: metric.name,
                    description: metric.description,
                    unit: metric.unit,
                    type: metric.data,
                    data: _parseMetricDataPoints(metric[metric.data]?.data_points),
                    metadata: {
                        resource_id: rsrc['service.name'],
                        scope: metricScope,
                        schema_url
                    }
                });
            });
        });
    });
    return {metrics: metricsArr, resources};
}

function _parseMetricDataPoints(datapoints) {
    return datapoints.map((dp) => ({
        from: new Date(parseInt(dp.start_time_unix_nano, 10) / 1000000),
        to: new Date(parseInt(dp.time_unix_nano, 10) / 1000000),
        value: dp[dp.value] ?? dp.value,
        attributes: _parseAnyValueAttributes(dp.attributes)
    }))
}

/* Aux Functions */
function _parseResource(attributes) {
    return Object.fromEntries(attributes
        ?.map(({key, value}) => [key, value[value.value] ?? value.value])
        ?.map(([key, value]) => [key, key === "process.command_args" ? value.values?.map(v => v[v.value] ?? v.value)  : value]) ?? []);
}

function _parseAnyValueAttributes(attributes) {
    return Object.fromEntries(attributes?.map(({key, value}) => [key, value[value.value] ?? value.value]) ?? []);
}

/* Default export */
export default { parseTraces, parseMetrics }