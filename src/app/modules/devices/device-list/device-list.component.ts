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

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DeviceInstancesPermSearchModel, DeviceTypeDeviceClassModel, DeviceTypePermSearchModel} from "../devices.model";
import {DevicesService} from "../devices.service";
import {forkJoin, map, Observable} from "rxjs";
import {PageEvent} from "@angular/material/paginator";

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.css']
})
export class DeviceListComponent implements OnInit {
  devices: DeviceInstancesPermSearchModel[] = [];
  classIdToTypeMap: Map<string, DeviceTypePermSearchModel[]> = new Map();
  classIdToClassMap: Map<string, DeviceTypeDeviceClassModel> = new Map();
  typeIdToTypeMap: Map<string, DeviceTypePermSearchModel> = new Map();
  deviceClassIdArr: string[] = [];
  deviceClassIdArrIndex = 0;
  classOffset = 0;

  lastPageEvent: PageEvent | undefined;

  pageSize = 50;
  maxElements = 0;
  lowerOffset = 0;
  upperOffset = this.pageSize - 1;


  @ViewChild('list', {read: ElementRef, static: true}) list!: ElementRef;
  constructor(
    private devicesService: DevicesService,
  ) { }

  ngOnInit(): void {
    this.devicesService.getNumberDevicesPerType().subscribe(d => {
      d.forEach(c => this.maxElements += c.count);
    })
    this.buildList().subscribe(_ => this.loadDevices(this.pageSize));

  }

  getDeviceId(d: any) {
    return d.id;
  }

  buildList(): Observable<null> {
    return new Observable<null>(obs => {
      this.devicesService.getDeviceTypeList(9999, 0, "name", "asc").subscribe(deviceTypes => {
        deviceTypes.forEach(deviceType => {
          if (!this.classIdToTypeMap.has(deviceType.device_class_id)) {
            this.classIdToTypeMap.set(deviceType.device_class_id, []);
            this.deviceClassIdArr.push(deviceType.device_class_id);
          }
          this.classIdToTypeMap.get(deviceType.device_class_id)?.push(deviceType);
          this.typeIdToTypeMap.set(deviceType.id, deviceType);
        });
        const obsList: Observable<any>[] = [];
        this.classIdToTypeMap.forEach((_, id) => {
          obsList.push(this.devicesService.getDeviceTypeClass(id).pipe(map(deviceTypeDeviceClass => this.classIdToClassMap.set(id, deviceTypeDeviceClass))));
        });
        if (obsList.length === 0) {
          obs.complete();
          return;
        }
        forkJoin(obsList).subscribe(_ => {
          obs.next(null);
          obs.complete();
        })
      })
    })
  }

  loadDevices(limit: number) {
    if (this.deviceClassIdArrIndex >= this.deviceClassIdArr.length) {
      return; // list exhausted
    }
    const deviceTypeIds = this.classIdToTypeMap.get(this.deviceClassIdArr[this.deviceClassIdArrIndex])?.map(x => x.id);
    this.devicesService.getDeviceInstances('',  limit, this.classOffset, 'device_type_id', deviceTypeIds || []).subscribe(devices => {
      if (devices.length > 0) {
        this.classOffset += devices.length;
        this.devices.push(...devices);
      }
      if (devices.length < limit) {
        this.classOffset = 0;
        this.deviceClassIdArrIndex++;
        this.loadDevices(limit - devices.length); // try with next device class
      }
    });
  }


  needsClassHeader(i: number): boolean {
    i += this.lowerOffset;
    return i === this.lowerOffset || this.typeIdToTypeMap.get(this.devices[i].device_type_id)?.device_class_id !== this.typeIdToTypeMap.get(this.devices[i-1].device_type_id)?.device_class_id;
  }

  getClassHeader(i: number) {
    i += this.lowerOffset;
    return this.classIdToClassMap.get(this.typeIdToTypeMap.get(this.devices[i].device_type_id)?.device_class_id || '')?.name;
  }

  needsTypeHeader(i: number): boolean {
    i += this.lowerOffset;
    return i === this.lowerOffset || this.devices[i].device_type_id !== this.devices[i-1].device_type_id;
  }

  getTypeHeader(i: number) {
    i += this.lowerOffset;
    return this.typeIdToTypeMap.get(this.devices[i].device_type_id)?.name;
  }

  movePage($event: PageEvent) {
    this.lowerOffset = $event.pageIndex * $event.pageSize;
    this.upperOffset = (($event.pageIndex + 1) * $event.pageSize) - 1;
    this.loadDevices(this.upperOffset + 1 - this.devices.length);
  }

  getDevices() {
    return this.devices.slice(this.lowerOffset, Math.min(this.upperOffset, this.devices.length - 1));
  }


}