/*
 * Copyright 2022 InfAI (CC SES)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Injectable} from '@angular/core';
import {catchError, map, Observable, of, timeout} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ErrorHandlerService} from "../../core/services/error-handler.service";
import {DevicesService} from "./devices.service";
import {CustomDeviceInstance} from "./devices.model";
import {MetadataService} from "./metadata.service";

@Injectable({
  providedIn: 'root'
})
export class DevicesCommandService {

  constructor(private http: HttpClient,
              private devicesService: DevicesService,
              private errorHandlerService: ErrorHandlerService,
              private metadataService: MetadataService,
  ) {
  }

  fillDeviceState(devices: CustomDeviceInstance[], onlySpecificFunctions: string[] = []): Observable<CustomDeviceInstance[]> {
    const commands: { function_id: string; device_id: string; service_id: string; input?: any }[] = [];
    const commandFunctionMapper: string[] = [];
    const commandDeviceMapper: number[] = [];

    devices.forEach((device, i) => {
      if (device.annotations?.connected !== true) {
        return;
      }

      device.functionServices.forEach((services, functionId) => {
        const f = this.metadataService.getFunction(functionId);
        if (!this.metadataService.isMeasuringFunction(f)) {
          return;
        }
        if (onlySpecificFunctions.length === 0 || onlySpecificFunctions.some(t => t === functionId)) {
          services.forEach(service => {
            commands.push({function_id: functionId, device_id: device.id, service_id: service.id});
            commandFunctionMapper.push(functionId);
            commandDeviceMapper.push(i);
          });
        }
      });
    });


    if (commands.length === 0) {
      return of(devices);
    }

    return this.runCommands(commands).pipe(map(results => {
      results.forEach((result: any, i: number) => {
        if (!devices[commandDeviceMapper[i]].functionStates.has(commandFunctionMapper[i])) {
          devices[commandDeviceMapper[i]].functionStates.set(commandFunctionMapper[i], []);
        }
        devices[commandDeviceMapper[i]].functionStates.get(commandFunctionMapper[i])?.push(result);
      });
      return devices;
    }));
  }

  runCommands(commands: { function_id: string; device_id: string; service_id: string; input?: any }[]): Observable<any[]> {
    return this.http.post<{ status_code: number; message: any[] }[]>(environment.apiUrl + "/device-command/commands/batch?timeout=25s", commands).pipe(timeout(30000), map(v => {
      const results: any[] = [];
      v.forEach(result => {
        if (result.status_code !== 200) {
          results.push(undefined);
        } else {
          results.push(result.message[0]); // may be more entries if device group, but not used currently
        }
      });
      return results;
    }), catchError(this.errorHandlerService.handleError(DevicesService.name, 'runCommands', Array(commands.length).fill(undefined), true)));
  }
}
