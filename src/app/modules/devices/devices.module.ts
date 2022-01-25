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


const devices = {path: 'devices/list', pathMatch: 'full', component: DeviceListComponent};

@NgModule({
  declarations: [
    DeviceListComponent,
  ],
  imports: [
    RouterModule.forChild([devices]),
    CommonModule,
    HttpClientModule,
    MatListModule,
    MatIconModule,
    MatPaginatorModule,
  ]
})
export class DevicesModule {
}
