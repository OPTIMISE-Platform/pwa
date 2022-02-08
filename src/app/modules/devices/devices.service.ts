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
import {catchError, map, Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ErrorHandlerService} from "../../core/services/error-handler.service";
import {CustomDeviceInstance, DeviceInstancesPermSearchModel} from "./devices.model";
import {CacheService} from "../../core/cache.service";

@Injectable({
  providedIn: 'root'
})
export class DevicesService {
  cachePrefixDevices = 'devices/';
  cachePrefixDeviceCount = 'devices-count/';

  constructor(private http: HttpClient,
              private errorHandlerService: ErrorHandlerService,
              private cacheService: CacheService,
  ) {
  }

  getDeviceInstances(
    searchText: string,
    limit: number,
    offset: number,
    sortBy: string,
    byDeviceTypes: string[],
  ): Observable<DeviceInstancesPermSearchModel[]> {
    return this.http.post<DeviceInstancesPermSearchModel[]>(
      environment.apiUrl + "/permissions/query/v3/query",
      {
        ressource: "devices",
        find: {
          limit: limit,
          offset: offset,
          sortBy: sortBy,
          search: searchText,
          filter: {
            condition: {
              feature: "features.device_type_id",
              operation: "any_value_in_feature",
              value: byDeviceTypes,
            }
          }
        }
      }
    ).pipe(
      map((resp) => resp || []),
      map(resp => {
        resp.forEach(r => {
          const cacheEntry = JSON.parse(JSON.stringify(r));
          if (cacheEntry.annotations?.connected !== undefined) {
            delete cacheEntry.annotations.connected;
          }
          this.cacheService.toCache(this.cachePrefixDevices + r.id, cacheEntry, 365 * 24 * 60 * 60 * 1000); // cache for up to one year
        });
        return resp;
      }),
      catchError(this.errorHandlerService.handleError(DevicesService.name, 'getDeviceInstances',
        this.cacheService.fromCacheListByPrefix<DeviceInstancesPermSearchModel>(this.cachePrefixDevices).filter(d => {
          return byDeviceTypes.some(dtId => dtId === d.device_type_id)
            && (searchText !== null ? d.name.toLowerCase().includes(searchText.toLowerCase()) : true);
        }), false)),
    );
  }

  getDeviceInstance(id: string): Observable<DeviceInstancesPermSearchModel | undefined> {
    return this.http.get<DeviceInstancesPermSearchModel[] | null>(
      environment.apiUrl + "/permissions/query/v3/resources/devices?ids=" + id,
    ).pipe(
      map((resp) => resp || []),
      map(resp => {
        if (resp.length !== 1) {
          throw "could not get device";
        }
        return resp[0];
      }),
      map(resp => {
          const cacheEntry = JSON.parse(JSON.stringify(resp));
          if (cacheEntry.annotations?.connected !== undefined) {
            delete cacheEntry.annotations.connected;
          }
          this.cacheService.toCache(this.cachePrefixDevices + resp.id, cacheEntry, 365 * 24 * 60 * 60 * 1000); // cache for up to one year
        return resp;
      }),
      catchError(this.errorHandlerService.handleError(DevicesService.name, 'getDeviceInstances',
        this.cacheService.fromCache(this.cachePrefixDevices + id) || undefined, true)),
    );
  }



  getTotalNumberDevices(searchText: string|null = ''): Observable<number> {
    return this.http
      .get<number>(
        environment.apiUrl + "/permissions/query/v3/total/devices"
        + (searchText !== null && searchText.length > 0 ? ('?search=' + searchText): '')
      ).pipe(
        map((resp) => resp || 0),
        map(resp => {
          this.cacheService.toCache(this.cachePrefixDeviceCount + searchText, resp, 365 * 24 * 60 * 60 * 1000); // cache for up to one year
          return resp;
        }),
        catchError(this.errorHandlerService.handleError(DevicesService.name, 'getDeviceTypeList',
          this.cacheService.fromCache(this.cachePrefixDeviceCount + searchText) || 0, false)),
      )
  }




  permInstanceToCustom(device: DeviceInstancesPermSearchModel): CustomDeviceInstance {
    const customDevice = device as CustomDeviceInstance;
    customDevice.functionServices = new Map();
    customDevice.functionStates = new Map();

    return customDevice;
  }

  resetStates(device: CustomDeviceInstance): CustomDeviceInstance {
    device.functionStates = new Map();
    return device;
  }
}
