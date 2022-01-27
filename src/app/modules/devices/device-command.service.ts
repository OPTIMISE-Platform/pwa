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
import {catchError, forkJoin, map, Observable, of, timeout} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ErrorHandlerService} from "../../core/services/error-handler.service";
import {DevicesService} from "./devices.service";
import {CustomDeviceInstance} from "./devices.model";

@Injectable({
  providedIn: 'root'
})
export class DevicesCommandService {

  constructor(private http: HttpClient,
              private devicesService: DevicesService,
              private errorHandlerService: ErrorHandlerService,
  ) {
  }

  fillDeviceFunctionServiceIds(device: CustomDeviceInstance): Observable<CustomDeviceInstance> {
    return this.devicesService.getFullDeviceType(device.device_type_id).pipe(map(deviceType => {
      device.setOffServices = deviceType.services.filter(service => service.function_ids.some(functionId => functionId === environment.functions.setOff)).map(service => service.id);
      device.setOnServices = deviceType.services.filter(service => service.function_ids.some(functionId => functionId === environment.functions.setOn)).map(service => service.id);
      device.getOnOffServices = deviceType.services.filter(service => service.function_ids.some(functionId => functionId === environment.functions.getOnOff)).map(service => service.id);

      device.onOffStates = [];
      return device;
    }));
  }

  fillDeviceState(device: CustomDeviceInstance): Observable<CustomDeviceInstance> {
    if (device.annotations?.connected !== true) {
      return of(device);
    }

    const obs: Observable<{function: string; value: any}>[] = [];
    device.getOnOffServices.forEach(serviceId => obs.push(this.runCommand(environment.functions.getOnOff, device.id, serviceId).pipe(map(value => {
     return {function: environment.functions.getOnOff, value};
    }))));


    if (obs.length === 0) {
      return of(device);
    }

    return forkJoin(obs).pipe(map(results => {
      results.forEach(result => {
        switch(result.function) {
          case environment.functions.getOnOff:
            device.onOffStates.push(result.value);
            break;
          default:
            console.error("got result for service, but no value mapping defined", device.id, result.function);
        }
      });

      return device;
    }));
  }

  runCommand(functionId: string, deviceId: string, serviceId: string, input: any = undefined): Observable<unknown> {
    return this.http.post(environment.apiUrl + "/device-command/commands", {
      function_id: functionId,
      input,
      device_id: deviceId,
      service_id: serviceId,
    }).pipe(timeout(30000), map(v => {
      if (Array.isArray(v) && v.length === 1) {
        return v[0];
      }
      return v;
    }),catchError(this.errorHandlerService.handleError(DevicesService.name, 'runCommand', undefined)));
  }
}
