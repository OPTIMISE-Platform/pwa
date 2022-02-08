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

import {Injectable, OnDestroy} from '@angular/core';
import {catchError, forkJoin, map, mergeAll, Observable, of, Subject} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ErrorHandlerService} from "../../core/services/error-handler.service";
import {
  CustomDeviceInstance,
  DeviceTypeDeviceClassModel,
  DeviceTypeExtendedFunctionModel,
  DeviceTypeModel,
  DeviceTypePermSearchModel
} from "./devices.model";
import {CacheService} from "../../core/cache.service";

@Injectable({
  providedIn: 'root'
})
export class MetadataService implements OnDestroy {
  getFullDeviceTypeSubjects: Map<string, Subject<DeviceTypeModel>> = new Map();
  getFunctionsSubject: Subject<DeviceTypeExtendedFunctionModel[]> | undefined;


  cachePrefixDeviceTypeClass = "deviceTypeClass/"
  cachePrefixDeviceType = "deviceType/"
  cachePrefixFunction = "function/"
  cacheKeyFunctionList = "function-list"

  constructor(private http: HttpClient,
              private errorHandlerService: ErrorHandlerService,
              private cacheService: CacheService,
  ) {
  }

  ngOnDestroy() {
    this.getFunctionsSubject?.complete();
    this.getFullDeviceTypeSubjects.forEach(s => s.complete());
  }


  fillDeviceFunctionServiceIds(devices: CustomDeviceInstance[]): Observable<CustomDeviceInstance[]> {
    return new Observable<CustomDeviceInstance[]>(o => {
      this.getFunctions().pipe(map(functions => {
          const obs: Observable<CustomDeviceInstance>[] = [];
          devices.forEach(device => {
            obs.push(this.getFullDeviceType(device.device_type_id).pipe(map(deviceType => {
              functions.forEach(functionConfig => {
                const services = deviceType.services.filter(service => service.function_ids.some(functionId => functionId === functionConfig.id)); // possible improvement: generate once per device type
                if (services.length > 0) {
                  device.functionServices.set(functionConfig.id, services);
                }
              });
              return device;
            })));
          });
          return forkJoin(obs);
        }),
        mergeAll(),
        map(devices => {
          o.next(devices);
          o.complete();
        })).subscribe();
    });
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
          this.cacheService.toCache(key, resp, 60 * 60 * 1000); // cache for one hour
          return resp;
        }),
        catchError(this.errorHandlerService.handleError(MetadataService.name, 'getDeviceTypeList', [], true)),
      );
  }

  getDeviceTypeClass(id: string): Observable<DeviceTypeDeviceClassModel> {
    const key = this.cachePrefixDeviceTypeClass + id;

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
        catchError(this.errorHandlerService.handleError(MetadataService.name, 'getDeviceTypeList', {} as DeviceTypeDeviceClassModel, true)),);
  }

  getFullDeviceType(id: string): Observable<DeviceTypeModel> {
    const key = this.cachePrefixDeviceType + id;

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
      catchError(this.errorHandlerService.handleError(MetadataService.name, 'getDeviceTypeList', {} as DeviceTypeModel, true)),
    );

    this.getFullDeviceTypeSubjects.set(key, s);
    return s;
  }

  getFunctions(): Observable<DeviceTypeExtendedFunctionModel[]> {
    if (this.getFunctionsSubject !== undefined) {
      return this.getFunctionsSubject;
    }

    const needsReload = this.cacheService.fromCache(this.cacheKeyFunctionList) === undefined;
    if (!needsReload) {
      return of(this.cacheService.fromCacheListByPrefix<DeviceTypeExtendedFunctionModel>(this.cachePrefixFunction));
    }

    this.getFunctionsSubject = new Subject<DeviceTypeExtendedFunctionModel[]>();

    this.http.get<DeviceTypeExtendedFunctionModel[] | null>(
      environment.apiUrl + "/api-aggregator/nested-function-infos"
    ).pipe(map(resp => resp || []),
      map(resp => {
        resp.forEach(r => {
          this.cacheService.toCache(this.cachePrefixFunction + r.id, r, 48 * 60 * 60 * 1000) // cache for two days
        });
        this.cacheService.toCache(this.cacheKeyFunctionList, null, 48 * 60 * 60 * 1000); // cache for two days
        return resp;
      }),
      catchError(this.errorHandlerService.handleError(MetadataService.name, 'getFunctions', this.cacheService.fromCacheListByPrefix<DeviceTypeExtendedFunctionModel>(this.cachePrefixFunction), true)),
    ).subscribe(result => {
      this.getFunctionsSubject?.next(result);
      this.getFunctionsSubject?.complete();
      this.getFunctionsSubject = undefined;
    });
    return this.getFunctionsSubject;
  }

  getFunction(id: string): DeviceTypeExtendedFunctionModel | undefined {
    return this.cacheService.fromCache(this.cachePrefixFunction + id);
  }

  isMeasuringFunction(f?: DeviceTypeExtendedFunctionModel) {
    return f !== undefined && f.id.startsWith(environment.measuringFunctionPrefix);
  }
}
