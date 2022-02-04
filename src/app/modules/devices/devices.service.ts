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

@Injectable({
  providedIn: 'root'
})
export class DevicesService {
  constructor(private http: HttpClient,
              private errorHandlerService: ErrorHandlerService,
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
      catchError(this.errorHandlerService.handleError(DevicesService.name, 'getDeviceInstances', [])),
    );
  }

  getDeviceInstance(id: string): Observable<DeviceInstancesPermSearchModel> {
    return this.http.get<DeviceInstancesPermSearchModel[]>(
      environment.apiUrl + "/permissions/query/v3/resources/devices?ids=" + id,
    ).pipe(
      map((resp) => resp || []),
      map(resp => resp[0]),
      catchError(this.errorHandlerService.handleError(DevicesService.name, 'getDeviceInstances', {} as DeviceInstancesPermSearchModel)),
    );
  }



  getTotalNumberDevices(searchText: string|null = ''): Observable<number> {
    return this.http
      .get<number>(
        environment.apiUrl + "/permissions/query/v3/total/devices"
        + (searchText !== null && searchText.length > 0 ? ('?search=' + searchText): '')
      ).pipe(
        map((resp) => resp || 0),
        catchError(this.errorHandlerService.handleError(DevicesService.name, 'getDeviceTypeList', 0)),
      )
  }




  permInstanceToCustom(device: DeviceInstancesPermSearchModel): CustomDeviceInstance {
    const customDevice = device as CustomDeviceInstance;
    customDevice.measuringServices = new Map();
    customDevice.measuringStates = new Map();


    customDevice.setOnServices = [];
    customDevice.setOffServices = [];
    return customDevice;
  }

  resetStates(device: CustomDeviceInstance): CustomDeviceInstance {
    device.measuringStates = new Map();
    return device;
  }
}
