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

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DeviceListComponent} from './device-list/device-list.component';
import {RouterModule} from "@angular/router";
import {HttpClientModule} from "@angular/common/http";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatTooltipModule} from "@angular/material/tooltip";
import {FlexLayoutModule, FlexModule} from "@angular/flex-layout";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {DeviceDetailsComponent} from "./device-details/device-details.component";
import {MatCardModule} from "@angular/material/card";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import { CommandConfigComponent } from './command-config/command-config.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatSliderModule} from "@angular/material/slider";


const devices = {path: 'devices', pathMatch: 'full', component: DeviceListComponent, data: {animation: 'devices'}};
const deviceDetails = {path: 'devices/:id', pathMatch: 'full', component: DeviceDetailsComponent, data: {animation: 'device-details'}};

@NgModule({
  declarations: [
    DeviceListComponent,
    DeviceDetailsComponent,
    CommandConfigComponent,
  ],
  imports: [
    RouterModule.forChild([devices, deviceDetails]),
    CommonModule,
    HttpClientModule,
    MatListModule,
    MatIconModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    MatTooltipModule,
    FlexModule,
    MatButtonModule,
    FlexLayoutModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCardModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSliderModule,
  ],
})
export class DevicesModule {
}
