import { Schema, model } from "mongoose";

const ResourceSchema = new Schema({
    "service.name": {type: String, required: true},
    "service.version": {type: String, required: true},
    "service.ip_addr": {type: String, required: true},
    "telemetry.sdk.language": {type: String, required: true},
    "telemetry.sdk.name": {type: String, required: true},
    "telemetry.sdk.version": {type: String, required: true},
    "process.pid": {type: String, required: true},
    "process.owner": {type: String, required: true},
    "process.executable.name": {type: String, required: true},
    "process.executable.path": {type: String, required: true},
    "process.runtime.name": {type: String, required: true},
    "process.runtime.version": {type: String, required: true},
    "process.runtime.description": {type: String, required: true},
    "process.command": {type: String, required: true},
    "process.command_args": {type: [String], required: true},
});

export default model("Resource", ResourceSchema, "resources");