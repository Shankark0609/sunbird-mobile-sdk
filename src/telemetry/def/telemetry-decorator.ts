import {ProfileSession} from '../../profile';
import {TelemetryEvents} from './telemetry-model';
import Telemetry = TelemetryEvents.Telemetry;

export abstract class TelemetryDecorator {

    abstract decorate(event: Telemetry, profileSession: ProfileSession, groupSession: ProfileSession): any;

    abstract prepare(event: any): {
        event, event_type, timestamp, priority
    };

}
