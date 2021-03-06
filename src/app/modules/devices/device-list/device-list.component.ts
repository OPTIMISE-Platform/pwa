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

import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CustomDeviceInstance} from "../devices.model";
import {DevicesService} from "../devices.service";
import {debounceTime, forkJoin, map, mergeAll, Observable} from "rxjs";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {DevicesCommandService} from "../device-command.service";
import {Router} from "@angular/router";
import {FormControl} from "@angular/forms";
import {getEmptyState, SharedStateModel} from "../state.model";
import {ToolbarService} from "../../../core/components/toolbar/toolbar.service";
import {environment} from "../../../../environments/environment";
import {MetadataService} from "../metadata.service";
import {functionConfigs} from "../../../core/function-configs";


@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.css']
})
export class DeviceListComponent implements OnInit, AfterViewInit {
  state: SharedStateModel;

  pageSize = 20;
  lowerOffset = 0;
  upperOffset = this.pageSize - 1;

  scrollPercentage = 0;
  searchOpen = false;
  searchFormControl = new FormControl();

  loading = true;

  @ViewChild('searchInput', {static: true}) searchInput!: ElementRef;
  @ViewChild('paginator', {static: true}) paginator!: MatPaginator;

  constructor(
    private devicesService: DevicesService,
    private devicesCommandService: DevicesCommandService,
    private metadataService: MetadataService,
    private toolbarService: ToolbarService,
    private router: Router,
  ) {
    this.state = (this.router.getCurrentNavigation()?.extras?.state || [])['state'];
  }

  ngOnInit(): void {
    this.toolbarService.loading.subscribe(loading => this.loading = loading);

    if (this.state !== undefined) {
      this.paginator.pageIndex = this.state.page;
      this.movePage({pageIndex: this.state.page, pageSize: this.pageSize} as PageEvent);
      this.searchFormControl.setValue(this.state.searchText);
      this.toolbarService.setLoading(false);
    } else {
      this.state = getEmptyState();
      this.devicesService.getTotalNumberDevices(this.searchFormControl.value).subscribe(d => this.state.maxElements = d);
      this.reset();
      this.buildList().subscribe(_ => this.loadDevices(this.pageSize));
    }
    this.searchFormControl.valueChanges.pipe(debounceTime(300)).subscribe(value => {
      if (value === this.state.searchText) {
        return;
      }
      this.state.searchText = value;
      this.reset();
      this.loadDevices(this.pageSize);
      this.devicesService.getTotalNumberDevices(value).subscribe(d => this.state.maxElements = d);
    });
  }

  ngAfterViewInit() {
    const target = this.state.listScrollOffset;
    const scroll = () => {
      const container = document.getElementById('container');
      if (container === null) {
        setTimeout(scroll, 10)
      } else {
        container.scrollTo(0, target);
        setTimeout(() => {
          if (container.scrollTop !== target) {
            setTimeout(scroll, 10)
          }
        }, 10);
      }
    }
    scroll();
  }

  reset() {
    this.paginator.firstPage();
    this.state.devices = [];
    this.lowerOffset = 0;
    this.upperOffset = this.pageSize - 1;
    this.state.deviceClassIdArrIndex = 0;
    this.state.classOffset = 0;
  }

  getDeviceId(d: any) {
    return d.id;
  }

  buildList(): Observable<null> {
    return new Observable<null>(obs => {
      this.metadataService.getDeviceTypeList(9999, 0, "name", "asc").subscribe(deviceTypes => {
        deviceTypes.forEach(deviceType => {
          if (!this.state.classIdToTypeMap.has(deviceType.device_class_id)) {
            this.state.classIdToTypeMap.set(deviceType.device_class_id, []);
            this.state.deviceClassIdArr.push(deviceType.device_class_id);
          }
          this.state.classIdToTypeMap.get(deviceType.device_class_id)?.push(deviceType);
          this.state.typeIdToTypeMap.set(deviceType.id, deviceType);
        });
        const obsList: Observable<any>[] = [];
        this.state.classIdToTypeMap.forEach((_, id) => {
          obsList.push(this.metadataService.getDeviceTypeClass(id).pipe(map(deviceTypeDeviceClass => this.state.classIdToClassMap.set(id, deviceTypeDeviceClass))));
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
    if (this.state.deviceClassIdArrIndex >= this.state.deviceClassIdArr.length) {
      this.toolbarService.setLoading(false);
      return; // list exhausted
    }
    this.toolbarService.setLoading(true);
    const deviceTypeIds = this.state.classIdToTypeMap.get(this.state.deviceClassIdArr[this.state.deviceClassIdArrIndex])?.map(x => x.id);
    this.devicesService.getDeviceInstances(this.searchFormControl.value, limit, this.state.classOffset, 'device_type_id', deviceTypeIds || []).subscribe(devices => {
      if (devices.length > 0) {
        this.state.classOffset += devices.length;
        const customDevices = devices.map(x => this.devicesService.permInstanceToCustom(x));
        this.metadataService.fillDeviceFunctionServiceIds(customDevices).subscribe(customDevices => {
          this.devicesCommandService.fillDeviceState(customDevices, [environment.functions.getOnOff]).subscribe(customDevices => {
            this.state.devices.push(...customDevices);
            this.toolbarService.setLoading(false);
          });
        })
      }
      if (devices.length < limit) {
        this.state.classOffset = 0;
        this.state.deviceClassIdArrIndex++;
        this.loadDevices(limit - devices.length); // try with next device class
      }
    });
  }


  needsClassHeader(i: number): boolean {
    i += this.lowerOffset;
    return i === this.lowerOffset || this.state.typeIdToTypeMap.get(this.state.devices[i].device_type_id)?.device_class_id !== this.state.typeIdToTypeMap.get(this.state.devices[i - 1].device_type_id)?.device_class_id;
  }

  getClassHeader(i: number) {
    i += this.lowerOffset;
    return this.state.classIdToClassMap.get(this.state.typeIdToTypeMap.get(this.state.devices[i].device_type_id)?.device_class_id || '')?.name;
  }

  needsTypeHeader(i: number): boolean {
    i += this.lowerOffset;
    return i === this.lowerOffset || this.state.devices[i].device_type_id !== this.state.devices[i - 1].device_type_id;
  }

  getTypeHeader(i: number) {
    i += this.lowerOffset;
    return this.state.typeIdToTypeMap.get(this.state.devices[i].device_type_id)?.name;
  }

  movePage($event: PageEvent) {
    this.lowerOffset = $event.pageIndex * $event.pageSize;
    this.upperOffset = (($event.pageIndex + 1) * $event.pageSize);
    const limit = this.upperOffset - this.state.devices.length;
    if (limit > 0) {
      this.loadDevices(limit);
    }
    this.state.page = $event.pageIndex;
  }

  getDevices() {
    return this.state.devices.slice(this.lowerOffset, Math.min(this.upperOffset, this.state.devices.length));
  }


  toggleOnOff(deviceIndex: number) {
    deviceIndex += this.lowerOffset;
    const device = this.state.devices[deviceIndex];

    if ((device.functionStates.get(environment.functions.getOnOff) || [])[0] === undefined) {
      console.warn("Can't toggle device with unknown status");
      return;
    }

    let functionId;
    let serviceId;
    if ((device.functionStates.get(environment.functions.getOnOff) || [])[0] === true) {
      functionId = environment.functions.setOff;
      const services = device.functionServices.get(environment.functions.setOff);
      if (services?.length !== 1) {
        console.warn("Can't turn device off: incorrect number of services", services);
        return;
      }
      serviceId = services[0].id;
    } else {
      functionId = environment.functions.setOn;
      const services = device.functionServices.get(environment.functions.setOn);
      if (services?.length !== 1) {
        console.warn("Can't turn device on: incorrect number of services", services);
        return;
      }
      serviceId = services[0].id;
    }
    if (serviceId === undefined) {
      console.warn("Device is missing setOn or setOff service!");
      return;
    }
    this.devicesCommandService.runCommands([{
      function_id: functionId,
      device_id: device.id,
      service_id: serviceId
    }]).subscribe(result => {
      const currentIndex = this.state.devices.findIndex(x => x.id === device.id); // pagination might have changed this
      if (currentIndex !== -1) {
        (this.state.devices[currentIndex].functionStates.get(environment.functions.getOnOff) || [{}])[0] = result[0];
      }
    });
  }

  scrolled($event: any) {
    this.state.listScrollOffset = $event.target.scrollTop;
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

  openDetails(device: CustomDeviceInstance) {
    this.state.device = device;

    this.router.navigate(['devices/' + device.id], {state: {'state': this.state}});
  }

  getOnOffToggles(device: CustomDeviceInstance): { state?: boolean, controllingServiceId: string, measuringServiceId: string, controllingFunctionId: string, measuringFunctionId: string, stateIndex: number }[] {
    const res: { state?: boolean, controllingServiceId: string, measuringServiceId: string, controllingFunctionId: string, stateIndex: number }[] = [];
    const states = device.functionStates.get(environment.functions.getOnOff);
    if (states === undefined) {
      return res.map(r => ({measuringFunctionId: environment.functions.getOnOff, ...r}));
    }
    const f = functionConfigs[environment.functions.getOnOff]?.getRelatedControllingFunction;
    device.functionServices.get(environment.functions.getOnOff)?.forEach((measuringService, i) => {
      if (states.length <= i) {
        return;
      }

      let controllingFunctionId: string | undefined;
      if (f !== undefined) {
        controllingFunctionId = f(states[i]);
      }
      const controllingServices: { serviceId: string, functionId: string }[] = [];
      if (controllingFunctionId !== undefined) {
        // mapping via config
        controllingServices.push(...(device.functionServices.get(controllingFunctionId) || [])
          .filter(s => s.service_group_key === measuringService.service_group_key).map(s => ({
            functionId: controllingFunctionId || '',
            serviceId: s.id
          })));
      } else {
        // mapping via conceptId
        const conceptId = this.metadataService.getFunction(environment.functions.getOnOff)?.concept.id;
        device.functionServices.forEach((services, functionId) => {
          if (this.metadataService.getFunction(functionId)?.concept.id === conceptId) {
            controllingServices.push(...services.filter(s => s.service_group_key === measuringService.service_group_key).map(s => ({
              functionId: functionId,
              serviceId: s.id
            })));
          }
        });
      }
      if (controllingServices.length === 1) {
        res.push({
          measuringServiceId: measuringService.id,
          controllingServiceId: controllingServices[0].serviceId,
          controllingFunctionId: controllingServices[0].functionId,
          state: states[i],
          stateIndex: i,
        });
      }
    });
    return res.map(r => ({measuringFunctionId: environment.functions.getOnOff, ...r}));
  }

  runTask(controllingFunctionId: string, controllingServiceId: string, deviceId: string, measuringFunctionId: string, stateIndex: number, measuringServiceId: string) {
    const i = this.state.devices.findIndex(d => d.id === deviceId);
    (this.state.devices[i].functionStates.get(measuringFunctionId) || Array(stateIndex + 1))[stateIndex] = undefined;
    this.devicesCommandService.runCommands([{
      function_id: controllingFunctionId,
      device_id: deviceId,
      service_id: controllingServiceId
    }]).pipe(
      map(() => {
        return this.devicesCommandService.runCommands([{
          function_id: measuringFunctionId,
          device_id: deviceId,
          service_id: measuringServiceId
        }]);
      }),
      mergeAll(),
      map(res => {
        const i = this.state.devices.findIndex(d => d.id === deviceId);
        if (i === -1) {
          return;
        }
        (this.state.devices[i].functionStates.get(measuringFunctionId) || Array(stateIndex + 1))[stateIndex] = res[0];
      }),
    ).subscribe();
  }

  getOnOffIcon(value: any) {
    const f = functionConfigs[environment.functions.getOnOff];
    if (f === undefined || f.getIcon === undefined) {
      return {icon: '', class: ''};
    }
    return f.getIcon(value);
  }

  trackJSONString(d: any) {
    return JSON.stringify(d);
  }
}
