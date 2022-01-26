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
import {debounceTime, forkJoin, map, Observable} from "rxjs";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {DevicesCommandService} from "../device-command.service";
import {environment} from "../../../../environments/environment";
import {Scroll} from "@angular/router";
import {FormControl} from "@angular/forms";

export interface CustomDeviceInstance extends DeviceInstancesPermSearchModel {
  getOnOffServices: string[];
  setOnServices: string[];
  setOffServices: string[];
  onOffStates: (string | undefined)[];
}

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.css']
})
export class DeviceListComponent implements OnInit {
  devices: CustomDeviceInstance[] = [];
  classIdToTypeMap: Map<string, DeviceTypePermSearchModel[]> = new Map();
  classIdToClassMap: Map<string, DeviceTypeDeviceClassModel> = new Map();
  typeIdToTypeMap: Map<string, DeviceTypePermSearchModel> = new Map();
  deviceClassIdArr: string[] = [];
  deviceClassIdArrIndex = 0;
  classOffset = 0;

  lastPageEvent: PageEvent | undefined;

  pageSize = 20;
  maxElements = 0;
  lowerOffset = 0;
  upperOffset = this.pageSize - 1;

  scrollPercentage = 0;
  searchOpen = false;
  searchFormControl = new FormControl();

  @ViewChild('searchInput', {static: true}) searchInput!: ElementRef;
  @ViewChild('paginator', {static: true}) paginator!: MatPaginator;
  constructor(
    private devicesService: DevicesService,
    private devicesCommandService: DevicesCommandService,
  ) { }

  ngOnInit(): void {
    this.devicesService.getTotalNumberDevices().subscribe(d => this.maxElements = d);
    this.buildList().subscribe(_ => this.loadDevices(this.pageSize));
    this.searchFormControl.valueChanges.pipe(debounceTime(300)).subscribe(value => {
      this.paginator.firstPage();
      this.devices = [];
      this.lowerOffset = 0;
      this.upperOffset = this.pageSize - 1;
      this.deviceClassIdArrIndex = 0;
      this.classOffset = 0;
      this.loadDevices(this.pageSize);
      this.devicesService.getTotalNumberDevices(value).subscribe(d => this.maxElements = d);
    });
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
    this.devicesService.getDeviceInstances(this.searchFormControl.value,  limit, this.classOffset, 'device_type_id', deviceTypeIds || []).subscribe(devices => {
      if (devices.length > 0) {
        this.classOffset += devices.length;
        devices.forEach(device => {
          const idx = this.devices.length; // ensures correct position
          const customDevice = device as CustomDeviceInstance;
          customDevice.getOnOffServices = [];
          customDevice.setOnServices = [];
          customDevice.setOffServices = [];
          customDevice.onOffStates = [];
          this.devices.push(customDevice as CustomDeviceInstance); // ensures correct position

          this.devicesCommandService.fillDeviceFunctionServiceIds(customDevice).subscribe(customDevice => {
            this.devicesCommandService.fillDeviceState(customDevice).subscribe(customDevice => {
              this.devices[idx] = customDevice;
            });
          })
        })
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
    this.upperOffset = (($event.pageIndex + 1) * $event.pageSize);
    const limit = this.upperOffset - this.devices.length;
    if (limit > 0) {
      this.loadDevices(limit);
    }
  }

  getDevices() {
    return this.devices.slice(this.lowerOffset, Math.min(this.upperOffset, this.devices.length));
  }


  toggleOnOff(deviceIndex: number, onOffStateIndex: number) {
    deviceIndex += this.lowerOffset;
    const device = this.devices[deviceIndex];

    if (device.onOffStates[onOffStateIndex] === undefined) { // TODO I dont now, if getOnOff and setOn/Off are related
      console.warn("Can't toggle device with unknown status");
      return;
    }

    let functionId = '';
    let serviceId = '';
    if (device.onOffStates[onOffStateIndex] === 'on') { // TODO
      functionId = environment.functions.setOff;
      serviceId = device.setOffServices[onOffStateIndex]; // TODO
    } else {
      functionId = environment.functions.setOn;
      serviceId = device.setOnServices[onOffStateIndex]; // TODO
    }
    this.devicesCommandService.runCommand(functionId, device.id, serviceId).subscribe(result => {
      const currentIndex = this.devices.findIndex(x => x.id === device.id); // pagination might have changed this
      if (currentIndex !== -1) {
        this.devices[currentIndex].onOffStates[onOffStateIndex] = result as string | undefined; // TODO
      }
    });
  }

  scrolled($event: any) {
    this.scrollPercentage = ($event.target.scrollTop / $event.target.offsetHeight) * 100;
  }

  openSearch() {
    this.searchOpen = true;
    setTimeout(() => this.searchInput.nativeElement.focus(), 100); // delay until element shown
  }

  cancelSearch() {
    this.searchFormControl.setValue('');
    this.searchOpen = false;
  }
}
