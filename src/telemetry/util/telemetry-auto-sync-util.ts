import {InteractSubType, InteractType, TelemetryService, TelemetrySyncStat} from '..';
import {TelemetryLogger} from './telemetry-logger';
import {Observable, interval} from 'rxjs';
import {filter, mergeMap, tap, finalize, mapTo} from 'rxjs/operators';

export class TelemetryAutoSyncUtil {
    private shouldSync = false;

    private static async generateDownloadSpeedTelemetry(intervalTime: number): Promise<void> {
        const downloadSpeedLog: DownloadSpeedLog = await new Promise<any>((resolve, reject) => {
            if (downloadManager.fetchSpeedLog) {
                downloadManager.fetchSpeedLog(resolve, reject);
            } else {
                cordova['exec'](resolve, reject, 'DownloadManagerPlugin', 'fetchSpeedLog', []);
            }
        });

        const rangeMap = {
            '32': '0-32',
            '64': '32-64',
            '128': '64-128',
            '256': '128-256',
            '512': '256-512',
            '1024': '512-1024',
            '1536': '1024-1536',
            '2048': '1536-2048',
            '2560': '2048-2560',
            '3072': '2560-3072',
            '3584': '3072-3584',
            '4096' : '3584-above'
        };

        if (!Object.keys(downloadSpeedLog.distributionInKBPS).length) {
            return undefined;
        }

        const valueMap = {
            duration: intervalTime / 1000,
            totalKBDownloaded: downloadSpeedLog.totalKBdownloaded,
            distributionInKBPS: Object.keys(rangeMap).reduce<{ [key: string]: number }>((acc, key) => {
                if (downloadSpeedLog.distributionInKBPS[key]) {
                    acc[rangeMap[key]] = downloadSpeedLog.distributionInKBPS[key];
                } else {
                    acc[rangeMap[key]] = 0;
                }

                return acc;
            }, {})
        };

        return TelemetryLogger.log.interact({
            type: InteractType.OTHER,
            subType: InteractSubType.NETWORK_SPEED,
            env: 'sdk',
            pageId: 'sdk',
            id: 'sdk',
            valueMap
        }).pipe(
            mapTo(undefined)
        ).toPromise();
    }

    constructor(private telemetryService: TelemetryService) {
    }

    start(intervalTime: number): Observable<TelemetrySyncStat> {
        this.shouldSync = true;

        return interval(intervalTime).pipe(
            tap(() => TelemetryAutoSyncUtil.generateDownloadSpeedTelemetry(intervalTime)),
            filter(() => this.shouldSync),
            tap(() => this.shouldSync = false),
            mergeMap(() => this.telemetryService.sync().pipe(
                finalize(() => this.shouldSync = true)
            ))
        );
    }

    pause(): void {
        this.shouldSync = false;
    }

    continue(): void {
        this.shouldSync = true;
    }
}
