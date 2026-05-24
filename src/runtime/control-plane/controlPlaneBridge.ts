import { eventTraceCollector } from "./eventTraceCollector";

export function traceApiCall(name: string, payload: any) {

  eventTraceCollector.record(name, payload);

}
