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
import {catchError, map, Observable, of} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ErrorHandlerService} from "../../core/services/error-handler.service";
import {DeviceInstancesPermSearchModel, DeviceTypeDeviceClassModel, DeviceTypePermSearchModel} from "./devices.model";

@Injectable({
  providedIn: 'root'
})
export class DevicesService {

  localstoragePrefixDeviceTypeClass = "deviceTypeClass/"

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

  getDeviceTypeList(limit: number,
                    offset: number,
                    sortBy: string,
                    sortOrder: string): Observable<DeviceTypePermSearchModel[]> {
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
        catchError(this.errorHandlerService.handleError(DevicesService.name, 'getDeviceTypeList', [])),
      );
  }

  getDeviceTypeClass(id: string): Observable<DeviceTypeDeviceClassModel> {
    const local = localStorage.getItem(this.localstoragePrefixDeviceTypeClass + id);
    if (local !== null) {
      const localParsed = JSON.parse(local)
      if ((new Date().valueOf()) < localParsed.expires) {
        delete localParsed.expires;
        return of(localParsed);
      }
    }
    return this.http
      .get<DeviceTypeDeviceClassModel[] | null>(
        environment.apiUrl + "/permissions/query/v3/resources" +
        "/device-classes?ids=" + id).pipe(map(resp => {
          if (resp === null || resp.length === 0) {
            return {} as DeviceTypeDeviceClassModel;
          } else {
            const result = resp[0] as any;
            const expires = new Date();
            result.expires = expires.valueOf() + 48 * 60 * 60 * 1000; // cache for two days
            localStorage.setItem(this.localstoragePrefixDeviceTypeClass + id, JSON.stringify(result));
            delete result.expires;
            return result as DeviceTypeDeviceClassModel;
          }
        }),
        catchError(this.errorHandlerService.handleError(DevicesService.name, 'getDeviceTypeList', {} as DeviceTypeDeviceClassModel)),);
  }

  getNumberDevicesPerType(): Observable<({ term: string, count: number })[]> {
    return this.http
      .get<({ term: string, count: number })[]>(
        environment.apiUrl + "/permissions/query/v3/aggregates/term/devices/features.device_type_id?limit=9999"
      ).pipe(
        map((resp) => resp || []),
        catchError(this.errorHandlerService.handleError(DevicesService.name, 'getDeviceTypeList', [])),
      )
  }
}
