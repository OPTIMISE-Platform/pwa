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
import {DeviceTypeDeviceClassModel, DeviceTypeModel, DeviceTypePermSearchModel} from "../devices.model";
import {DevicesService} from "../devices.service";
import {DevicesCommandService} from "../device-command.service";
import {ActivatedRoute, Router} from "@angular/router";
import {map, mergeAll, Observable, of} from "rxjs";
import {getEmptyState, SharedStateModel} from "../state.model";
import {SnackbarService} from "../../../core/services/snackbar.service";
import {ToolbarService} from "../../../core/components/toolbar/toolbar.service";


@Component({
  selector: 'app-device-details',
  templateUrl: './device-details.component.html',
  styleUrls: ['./device-details.component.css'],
})
export class DeviceDetailsComponent implements OnInit {
  state: SharedStateModel;
  deviceTypeClass: DeviceTypeDeviceClassModel | undefined;
  deviceType: DeviceTypePermSearchModel | DeviceTypeModel | undefined;
  stateCreated = false;

  touches: Touch[] = [];
  swipeUpThreshold = 100;

  @ViewChild('container', {static: true}) container!: ElementRef;

  constructor(
    private devicesService: DevicesService,
    private devicesCommandService: DevicesCommandService,
    private snackBarService: SnackbarService,
    private toolBarService: ToolbarService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.state = (this.router.getCurrentNavigation()?.extras?.state || [])['state'];
  }

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      this.toolBarService.setLoading(true);
      const id = url[url.length - 1].path;

      if (this.state?.device?.id !== id) {
        this.state = getEmptyState();
        this.stateCreated = true;
        this.devicesService.getDeviceInstance(id).subscribe(device => {
          if (device === undefined) {
            this.toList();
            return;
          }
          const customDevice = this.devicesService.permInstanceToCustom(device);
          this.state.device = customDevice; // show basic info during loading
          this.getDeviceType().subscribe(deviceType => this.deviceType = deviceType);
          this.getClass().subscribe(deviceTypeClass => this.deviceTypeClass = deviceTypeClass);
          this.devicesCommandService.fillDeviceFunctionServiceIds([customDevice]).subscribe(customDevices => {
            this.devicesCommandService.fillDeviceState(customDevices).subscribe(customDevices => {
              this.state.device = customDevices[0];
              this.toolBarService.setLoading(false);
            });
          });
        });

      } else {
        this.state.device = this.devicesService.resetStates(this.state.device);
        this.devicesCommandService.fillDeviceState([this.state.device])
          .subscribe(devices => {
            this.state.device = devices[0];
            this.toolBarService.setLoading(false);
          });
        this.deviceType = this.state.typeIdToTypeMap.get(this.state.device.device_type_id);
        this.deviceTypeClass = this.state.classIdToClassMap.get(this.deviceType?.device_class_id || '');
      }
    })
  }

  toList() {
    this.router.navigate(['/devices'], {state: (this.stateCreated ? undefined : {'state': this.state})});
  }

  getClass(): Observable<DeviceTypeDeviceClassModel | undefined> {
    if (this.deviceTypeClass !== undefined) {
      return of(this.deviceTypeClass);
    }
    return this.getDeviceType().pipe(
      map(type => this.devicesService.getDeviceTypeClass(type?.device_class_id || '')),
      mergeAll(),
      map(typeClass => typeClass)
    );
  }

  getDeviceType(): Observable<DeviceTypePermSearchModel | DeviceTypeModel | undefined> {
    if (this.deviceType !== undefined) {
      return of(this.deviceType);
    }
    const typeId = this.state.device?.device_type_id;
    if (typeId === undefined) {
      return of(undefined);
    }
    return this.devicesService.getFullDeviceType(typeId);
  }

  onTouchAdd($event: TouchEvent) {
    for (let i = 0; i < $event.changedTouches.length && this.touches.length <= 50; i++) { // no point in collecting more points
      this.touches.push($event.changedTouches.item(i) as Touch);
    }
    this.checkSwipedUp();
  }

  onTouchEnd($event: TouchEvent) {
    this.onTouchAdd($event); // add points and check swipe event
    this.onTouchCancel(); // reset touches
  }

  onTouchCancel() {
    this.touches = [];
  }

  checkSwipedUp() {
    if (this.touches.length === 0) {
      return;
    }
    if (this.container.nativeElement.scrollHeight > this.container.nativeElement.offsetHeight) {
      return; // element is scrollable, user wants to scroll!
    }
    let firstTouchY = this.touches[0].screenY;
    let lastTouchY = this.touches[0].screenY;
    for (let i = 0; i < this.touches.length; i++) {
      if (this.touches[i].screenY > lastTouchY) { // swiped down
        return;
      }
      lastTouchY = this.touches[i].screenY;
      if (firstTouchY - lastTouchY > this.swipeUpThreshold) {
        this.toList();
        return;
      }
    }
  }

  getBatteryIcon(battery: number | undefined): string {
    if (battery === undefined) {
      return 'battery_unknown';
    }
    if (battery >= 95) {
      return 'battery_full';
    }
    return 'battery_' + Math.floor(battery * 7 /100) + '_bar';
  }

  snack(message: string) {
    this.snackBarService.snack(message);
  }
}
