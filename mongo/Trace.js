import { Schema, model } from "mongoose";

const TraceSchema = new Schema({
    "name": {type: String, required: true},
    "span_id": {type: String, required: true},
    "trace_id": {type: String, required: true},
    "parent_span_id": String,
    "start_time": {type: Date, required: true},
    "end_time": {type: Date, required: true},
    "attributes": {
        "source": {
            "net.host.ip": String,  // Required on response
            "net.host.port": String // Required on response
        },
        "target": {
            "net.peer.ip": {type: String, required: true},
            "net.peer.port": {type: String, required: true},
        },
        "operation": {
            "http.method": {type: String, required: true},
            "http.url": {type: String, required: true},
            "http.host": {type: String, required: true},
            "http.status_code": {type: Number, required: true},
            "http.status_text": {type: String, required: true},
            "http.user_agent": String,                          // Only on response
            "http.request_content_length_uncompressed": Number, // Only on request
            "http.response_content_length_uncompressed": Number // Only on response
        }
    },
    "metadata": {
        "scope": {type: String, required: true},
        "resource_id": {
            type: Schema.Types.ObjectId,
            ref: "Resource",
            required: true
        },
        "schema_url": String
    }
});

export default model("Trace", TraceSchema, "traces");