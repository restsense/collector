import { Schema, model } from "mongoose";
import Trace from "./Trace.js";

const _DataPointSchema = new Schema({
    "from": Date,
    "to": Date,
    "value": Number,
    "spans": [{
        type: Schema.Types.ObjectId,
        ref: "Trace"
    }],
    "attributes": Object
}, { _id: false });

const MetricSchema = new Schema({
    "name": String,
    "description": String,
    "unit": String,
    "type": String,
    "data": [_DataPointSchema],
    "metadata": {
        "scope": String,
        "resource_id": {
            type: Schema.Types.ObjectId,
            ref: "Resource"
        },
        "schema_url": String
    }
});

/* Populate traces before saving */
MetricSchema.pre("updateOne", function (next) {
    Promise.all(this.getUpdate().$push?.data?.$each?.map((data) => {
        return Trace.find({start_time: {$gte: data.from, $lte: data.to}}).then((traces) => {
            data.spans = [...data?.spans ?? [], ...traces.map((trace) => trace._id)];
        });
    }) ?? [])
    .catch((err) => {
        console.error(err);
    })
    .finally(() => {
        next();
    }); 
});

export default model("Metric", MetricSchema, "metrics");