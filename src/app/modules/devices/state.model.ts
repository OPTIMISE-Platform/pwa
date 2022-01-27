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


import {CustomDeviceInstance, DeviceTypeDeviceClassModel, DeviceTypePermSearchModel} from "./devices.model";

export interface SharedStateModel {
  device?: CustomDeviceInstance;
  devices: CustomDeviceInstance[];
  page: number;
  maxElements: number;
  classIdToTypeMap: Map<string, DeviceTypePermSearchModel[]>;
  classIdToClassMap: Map<string, DeviceTypeDeviceClassModel>;
  typeIdToTypeMap: Map<string, DeviceTypePermSearchModel>;
  deviceClassIdArr: string[];
  deviceClassIdArrIndex: number;
  classOffset: number;
  searchText: string;
}

export function getEmptyState(): SharedStateModel {
  return {
    devices: [],
    page: 0,
    maxElements: 0,
    classIdToTypeMap: new Map(),
    classIdToClassMap: new Map(),
    typeIdToTypeMap: new Map(),
    deviceClassIdArr: [],
    deviceClassIdArrIndex: 0,
    classOffset: 0,
    searchText: '',
  };
}
