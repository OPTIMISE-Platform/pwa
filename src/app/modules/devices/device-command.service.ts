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

  fillDeviceFunctionServiceIds(devices: CustomDeviceInstance[]): Observable<CustomDeviceInstance[]> {
    const obs: Observable<CustomDeviceInstance>[] = [];

    devices.forEach(device => {
      obs.push(this.devicesService.getFullDeviceType(device.device_type_id).pipe(map(deviceType => {
        device.onOffStates = [];

        device.setOffServices = deviceType.services.filter(service => service.function_ids.some(functionId => functionId === environment.functions.setOff));
        device.setOnServices = deviceType.services.filter(service => service.function_ids.some(functionId => functionId === environment.functions.setOn));
        device.getOnOffServices = deviceType.services.filter(service => service.function_ids.some(functionId => functionId === environment.functions.getOnOff));
        device.getBatteryServices = deviceType.services.filter(service => service.function_ids.some(functionId => functionId === environment.functions.getBattery));
        device.getEnergyConsumptionServices = deviceType.services.filter(service => service.function_ids.some(functionId => functionId === environment.functions.getEnergyConsumption));
        device.getPowerConsumptionServices = deviceType.services.filter(service => service.function_ids.some(functionId => functionId === environment.functions.getPowerConsumption));
        device.getTemperatureServices = deviceType.services.filter(service => service.function_ids.some(functionId => functionId === environment.functions.getTemperature));
        return device;
      })));
    });
    return forkJoin(obs);
  }

  fillDeviceState(devices: CustomDeviceInstance[], onlySpecificType: string[] = []): Observable<CustomDeviceInstance[]> {
    const commands: { function_id: string; device_id: string; service_id: string; input?: any }[] = [];
    const commandFunctionMapper: string[] = [];
    const commandDeviceMapper: number[] = [];

    devices.forEach((device, i) => {
      if (device.annotations?.connected !== true) {
        return;
      }
      if (onlySpecificType.length === 0 || onlySpecificType.some(f => f === environment.functions.getOnOff)) {
        device.getOnOffServices.forEach(service => {
          commands.push({function_id: environment.functions.getOnOff, device_id: device.id, service_id: service.id});
          commandFunctionMapper.push(environment.functions.getOnOff);
          commandDeviceMapper.push(i);
        });
      }

      if (onlySpecificType.length === 0 || onlySpecificType.some(f => f === environment.functions.getBattery)) {
        device.getBatteryServices.forEach(service => {
          commands.push({function_id: environment.functions.getBattery, device_id: device.id, service_id: service.id});
          commandFunctionMapper.push(environment.functions.getBattery);
          commandDeviceMapper.push(i);
        });
      }

      if (onlySpecificType.length === 0 || onlySpecificType.some(f => f === environment.functions.getEnergyConsumption)) {
        device.getEnergyConsumptionServices.forEach(service => {
          commands.push({
            function_id: environment.functions.getEnergyConsumption,
            device_id: device.id,
            service_id: service.id
          });
          commandFunctionMapper.push(environment.functions.getEnergyConsumption);
          commandDeviceMapper.push(i);
        });
      }

      if (onlySpecificType.length === 0 || onlySpecificType.some(f => f === environment.functions.getPowerConsumption)) {
        device.getEnergyConsumptionServices.forEach(service => {
          commands.push({
            function_id: environment.functions.getPowerConsumption,
            device_id: device.id,
            service_id: service.id
          });
          commandFunctionMapper.push(environment.functions.getPowerConsumption);
          commandDeviceMapper.push(i);
        });
      }

      if (onlySpecificType.length === 0 || onlySpecificType.some(f => f === environment.functions.getTemperature)) {
        device.getTemperatureServices.forEach(service => {
          commands.push({
            function_id: environment.functions.getTemperature,
            device_id: device.id,
            service_id: service.id
          });
          commandFunctionMapper.push(environment.functions.getTemperature);
          commandDeviceMapper.push(i);
        });
      }
    });


    if (commands.length === 0) {
      return of(devices);
    }

    return this.runCommands(commands).pipe(map(results => {
      results.forEach((result: any, i: number) => {
        switch (commandFunctionMapper[i]) {
          case environment.functions.getOnOff:
            devices[commandDeviceMapper[i]].onOffStates.push(result);
            break;
          case environment.functions.getBattery:
            devices[commandDeviceMapper[i]].batteryStates.push(result);
            break;
          case environment.functions.getEnergyConsumption:
            devices[commandDeviceMapper[i]].energyConsumptionStates.push(result);
            break;
          case environment.functions.getPowerConsumption:
            devices[commandDeviceMapper[i]].powerConsumptionStates.push(result);
            break;
          case environment.functions.getTemperature:
            devices[commandDeviceMapper[i]].temperatureStates.push(result);
            break;
          default:
            console.error("got result for service, but no value mapping defined", devices[commandDeviceMapper[i]].id, result.function);
        }
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
    }), catchError(this.errorHandlerService.handleError(DevicesService.name, 'runCommands', Array(commands.length).fill(undefined))));
  }
}
