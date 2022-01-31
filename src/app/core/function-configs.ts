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

import {environment} from "../../environments/environment";

export interface FunctionConfigModel {
  id: string;
  displayName: string;
  unit?: string;
  getIcon?(value?: any): ({icon: string, class: string});
}

export const measuringFunctions: FunctionConfigModel[] = [
  {
    id: environment.functions.getOnOff,
    displayName: 'On/Off',
    getIcon(value?: boolean): { icon: string; class: string } {
      if (value) {
        return {class: 'green', icon: 'offline_bolt'};
      }
      return  {class: 'red', icon: 'offline_bolt'};
    }
  },
  {
    id: environment.functions.getBattery,
    displayName: 'Battery',
    getIcon(value?: number): { icon: string; class: string } {
      if (value === undefined) {
        return {icon: 'battery_unknown', class: 'mat-accent'};
      }
      if (value >= 95) {
        return  {icon: 'battery_full', class: 'mat-accent'};
      }
      return  {icon: 'battery_' + Math.floor(value * 7 /100) + '_bar', class: 'mat-accent'};
    },
    unit: '%'
  },
  {
    id: environment.functions.getEnergyConsumption,
    displayName: 'Energy Consumption',
    unit: 'kWh'
  },
  {
    id: environment.functions.getPowerConsumption,
    displayName: 'Power Consumption',
    unit: 'W'
  },
  {
    id: environment.functions.getTemperature,
    displayName: 'Temperature',
    unit: '°C'
  },
  {
    id: environment.functions.getTargetTemperature,
    displayName: 'Target Temperature',
    unit: '°C'
  },
];
