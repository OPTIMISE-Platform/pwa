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

export interface DeviceTypeBaseModel {
  id: string;
  name: string;
  description: string;
  attributes?: Attribute[];
}

export interface DeviceTypePermSearchModel extends DeviceTypeBaseModel {
  creator: string;
  device_class_id: string;
  service: string[] | string;
  permissions: PermissionsModel;
}

export interface PermissionsModel {
  a: boolean;
  x: boolean;
  r: boolean;
  w: boolean;
}

export interface Attribute {
  key: string;
  value: string;
  origin: string;
}

export interface DeviceInstancesBaseModel {
  id: string;
  local_id: string;
  name: string;
  attributes?: Attribute[];
}

export interface DeviceInstancesIntermediateModel extends DeviceInstancesBaseModel {
  creator: string;
  permissions: PermissionsModel;
  shared: boolean;
}

export interface DeviceInstancesPermSearchModel extends DeviceInstancesIntermediateModel {
  device_type_id: string;
  annotations: {
    connected?: boolean;
  };
}

export interface DeviceInstancesModel extends DeviceInstancesIntermediateModel {
  device_type: DeviceTypePermSearchModel;
  log_state: boolean;
}

export interface DeviceTypeDeviceClassModel {
  id: string;
  image: string;
  name: string;
}
