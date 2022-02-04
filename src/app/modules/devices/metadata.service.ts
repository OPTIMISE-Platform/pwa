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
import {catchError, forkJoin, map, Observable, of, Subject} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ErrorHandlerService} from "../../core/services/error-handler.service";
import {
  CustomDeviceInstance,
  DeviceTypeDeviceClassModel,
  DeviceTypeModel,
  DeviceTypePermSearchModel
} from "./devices.model";
import {measuringFunctions} from "../../core/function-configs";
import {CacheService} from "../../core/cache.service";

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  getFullDeviceTypeSubjects: Map<string, Subject<DeviceTypeModel>> = new Map();


  localstoragePrefixDeviceTypeClass = "deviceTypeClass/"
  localstoragePrefixDeviceType = "deviceType/"

  constructor(private http: HttpClient,
              private errorHandlerService: ErrorHandlerService,
              private cacheService: CacheService,
  ) {
  }


  fillDeviceFunctionServiceIds(devices: CustomDeviceInstance[]): Observable<CustomDeviceInstance[]> {
    const obs: Observable<CustomDeviceInstance>[] = [];

    devices.forEach(device => {
      obs.push(this.getFullDeviceType(device.device_type_id).pipe(map(deviceType => {
        measuringFunctions.forEach(functionConfig => {
          device.measuringServices.set(functionConfig.id, deviceType.services.filter(service => service.function_ids.some(functionId => functionId === functionConfig.id)));
        });


        device.setOffServices = deviceType.services.filter(service => service.function_ids.some(functionId => functionId === environment.functions.setOff));
        device.setOnServices = deviceType.services.filter(service => service.function_ids.some(functionId => functionId === environment.functions.setOn));
        return device;
      })));
    });
    return forkJoin(obs);
  }

  getDeviceTypeList(limit: number,
                    offset: number,
                    sortBy: string,
                    sortOrder: string): Observable<DeviceTypePermSearchModel[]> {
    const key = 'deviceTypeList';
    const local = this.cacheService.fromCache<DeviceTypePermSearchModel[]>(key);
    if (local !== undefined) {
      return of(local);
    }

    return this.http
      .get<DeviceTypePermSearchModel[]>(
        environment.apiUrl + "/permissions/query/v3/resources" +
        "/device-types?limit=" +
        limit +
        '&offset=' +
        offset +
        '&sort=' +
        sortBy +
        '.' +
        sortOrder).pipe(
        map((resp) => resp || []),
        map(resp => {
          this.cacheService.toCache(key, resp,  60 * 60 * 1000); // cache for one hour
          return resp;
        }),
        catchError(this.errorHandlerService.handleError(MetadataService.name, 'getDeviceTypeList', [])),
      );
  }

  getDeviceTypeClass(id: string): Observable<DeviceTypeDeviceClassModel> {
    const key = this.localstoragePrefixDeviceTypeClass + id;

    const local = this.cacheService.fromCache<DeviceTypeDeviceClassModel>(key);
    if (local !== undefined) {
      return of(local);
    }

    return this.http
      .get<DeviceTypeDeviceClassModel[] | null>(
        environment.apiUrl + "/permissions/query/v3/resources" +
        "/device-classes?ids=" + id).pipe(map(resp => {
          if (resp === null || resp.length === 0) {
            return {} as DeviceTypeDeviceClassModel;
          } else {
            this.cacheService.toCache(key, resp[0], 48 * 60 * 60 * 1000) // cache for two days
            return resp[0];
          }
        }),
        catchError(this.errorHandlerService.handleError(MetadataService.name, 'getDeviceTypeList', {} as DeviceTypeDeviceClassModel)),);
  }

  getFullDeviceType(id: string): Observable<DeviceTypeModel> {
    const key = this.localstoragePrefixDeviceType + id;

    let s = this.getFullDeviceTypeSubjects.get(key);
    if (s !== undefined) {
      return s;
    }

    const local = this.cacheService.fromCache<DeviceTypeModel>(key);
    if (local !== undefined) {
      return of(local);
    }

    s = new Subject<DeviceTypeModel>();
    this.http.get<DeviceTypeModel | null>(
      environment.apiUrl + "/device-manager/device-types/" + id
    ).subscribe(resp => {
        if (s === undefined) {
          console.error("subject undefined");
          return;
        }
        this.getFullDeviceTypeSubjects.delete(key);
        if (resp === null) {
          s.complete();
          return;
        } else {
          this.cacheService.toCache(key, resp, 48 * 60 * 60 * 1000) // cache for two days
          s.next(resp);
          s.complete();
        }
      },
      catchError(this.errorHandlerService.handleError(MetadataService.name, 'getDeviceTypeList', {} as DeviceTypeModel)),
    );

    this.getFullDeviceTypeSubjects.set(key, s);
    return s;
  }
}
