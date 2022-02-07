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


export const measuringFunctions = {
  [environment.functions.getOnOff]: {
    displayName: 'On/Off',
    getIcon(value?: boolean): { icon: string; class: string } {
      if (value) {
        return {class: 'green', icon: 'offline_bolt'};
      }
      return {class: 'red', icon: 'offline_bolt'};
    }
  },
  [environment.functions.getBattery]: {
    displayName: 'Battery',
    getIcon(value?: number): { icon: string; class: string } {
      if (value === undefined) {
        return {icon: 'battery_unknown', class: 'mat-accent'};
      }
      if (value >= 95) {
        return {icon: 'battery_full', class: 'mat-accent'};
      }
      return {icon: 'battery_' + Math.floor(value * 7 / 100) + '_bar', class: 'mat-accent'};
    },
    unit: '%'
  },
  [environment.functions.getAlarm]: {
    displayName: 'Alarm',
    getIcon(value?: boolean): { icon: string; class: string } {
      if (value) {
        return {class: 'green', icon: 'notifications_none'};
      }
      return {class: 'red', icon: 'notification_important'};
    }
  },
  [environment.functions.getColor]: {
    displayName: 'Color',
    transform(value?: any): string {
      if (value === undefined) {
        return 'unknown';
      }
      return JSON.stringify(value);
    }
  },
  [environment.functions.getTimestampFunction]: {
    displayName: 'Timestamp',
    transform(value?: any): string {
      if (value === undefined) {
        return 'unknown';
      }
      return new Date(Date.parse(value)).toLocaleString(undefined, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "numeric",
          minute: "numeric",
          second: "numeric"
        }
      );
    }
  },
};
