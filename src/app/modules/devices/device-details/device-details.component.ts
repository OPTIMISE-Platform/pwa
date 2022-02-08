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
import {
  DeviceTypeDeviceClassModel,
  DeviceTypeModel,
  DeviceTypePermSearchModel,
  DeviceTypeServiceModel
} from "../devices.model";
import {DevicesService} from "../devices.service";
import {DevicesCommandService} from "../device-command.service";
import {ActivatedRoute, Router} from "@angular/router";
import {map, mergeAll, Observable, of} from "rxjs";
import {getEmptyState, SharedStateModel} from "../state.model";
import {SnackbarService} from "../../../core/services/snackbar.service";
import {ToolbarService} from "../../../core/components/toolbar/toolbar.service";
import {functionConfigs} from "../../../core/function-configs";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {CommandConfigComponent} from "../command-config/command-config.component";
import {MetadataService} from "../metadata.service";
import {environment} from "../../../../environments/environment";


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
  emptyMap = new Map();

  touches: Touch[] = [];
  swipeUpThreshold = 100;

  @ViewChild('container', {static: true}) container!: ElementRef;

  constructor(
    private devicesService: DevicesService,
    private devicesCommandService: DevicesCommandService,
    private metadataService: MetadataService,
    private snackBarService: SnackbarService,
    private toolBarService: ToolbarService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
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
          this.metadataService.fillDeviceFunctionServiceIds([customDevice]).subscribe(customDevices => {
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
      map(type => this.metadataService.getDeviceTypeClass(type?.device_class_id || '')),
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
    return this.metadataService.getFullDeviceType(typeId);
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
    return 'battery_' + Math.floor(battery * 7 / 100) + '_bar';
  }

  snack(message: string) {
    this.snackBarService.snack(message);
  }

  getMeasuringFunctionConfigs() {
    return functionConfigs;
  }

  getDisplayName(functionId: string) {
    const f = this.metadataService.getFunction(functionId);
    return f?.display_name || f?.name;
  }

  getDisplayUnit(functionId: string) {
    return this.metadataService.getFunction(functionId)?.concept.base_characteristic.display_unit;
  }

  hasIcon(functionId: string) {
    return functionConfigs[functionId]?.getIcon !== undefined;
  }

  getIcon(functionId: string, value: any): {icon: string, class: string} {
    const f = functionConfigs[functionId];
    if (f === undefined || f.getIcon === undefined) {
      return {icon: '', class: ''};
    }
    return f.getIcon(value);
  }

  getControllingFunctions(): Map<string, DeviceTypeServiceModel[]> {
    const m: Map<string, DeviceTypeServiceModel[]> = new Map();
    this.state.device?.functionServices.forEach((v, k) => {
      if (k.startsWith(environment.controllingFunctionPrefix)) {
        m.set(k, v);
      }
    });
    return m;
  }

  hasInput(controllingFunctioned: string) {
    return this.metadataService.getFunction(controllingFunctioned)?.concept.base_characteristic.type !== "";
  }

  runTask(functionId: string, service: DeviceTypeServiceModel) {
    if (this.state.device === undefined) {
      return;
    }
    const f = this.metadataService.getFunction(functionId);
    if (f?.concept.base_characteristic.type === undefined || f.concept.base_characteristic.type === '') {
      this.devicesCommandService.runCommands([{
        function_id: functionId,
        device_id: this.state.device.id,
        service_id: service.id,
      }]).subscribe(() => this.reloadStatesWithConcept(f?.concept.id));
    } else {
      const values: any[] = [];
      this.state.device.functionStates.forEach((state, measuringFunctionId) => {
        if (this.metadataService.getFunction(measuringFunctionId)?.concept.id === f.concept.id) {
          values.push(...state);
        }
      });

      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '80%';
      dialogConfig.disableClose = false;
      dialogConfig.data = {
        function: f,
        value: values.length === 1 ? values[0]: undefined,
      };
      const editDialogRef = this.dialog.open(CommandConfigComponent, dialogConfig);

      editDialogRef.afterClosed().subscribe((result: any) => {
        if (result === undefined) {
          return;
        }
        if (this.state.device === undefined) {
          return;
        }
        this.devicesCommandService.runCommands([{
          function_id: functionId,
          device_id: this.state.device.id,
          service_id: service.id,
          input: result
        }]).subscribe(() => this.reloadStatesWithConcept(f.concept.id));
      });
    }
  }

  getDisplayValue(functionId: string, value: any) {
    const config = functionConfigs[functionId];
    if (config?.transformDisplay === undefined) {
      return value;
    }
    return config.transformDisplay(value);
  }

  reloadStatesWithConcept(conceptId?: string) {
    if (conceptId === undefined) {
      return;
    }
    const matchingMeasuringFunctionIds: string[] = [];
    const commands: {
      function_id: string;
      device_id: string;
      service_id: string;
    }[] = [];
    this.state.device?.functionServices.forEach((services, functionId) => {
      if (functionId.startsWith(environment.measuringFunctionPrefix) && this.metadataService.getFunction(functionId)?.concept.id === conceptId) {
        matchingMeasuringFunctionIds.push(functionId);
        services.forEach(service => {
          commands.push({function_id: functionId, device_id: this.state.device?.id || '', service_id: service.id});
        });
      }
    });
    this.devicesCommandService.runCommands(commands).subscribe(results => {
      matchingMeasuringFunctionIds.forEach(functionId => this.state.device?.functionStates.set(functionId, []));
      results.forEach((result, i) => {
        this.state.device?.functionStates.get(commands[i].function_id)?.push(result);
      });
    });
  }
}
