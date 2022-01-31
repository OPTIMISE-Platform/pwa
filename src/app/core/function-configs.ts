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

  getIcon?(value?: any): ({ icon: string, class: string });
  transform?(value?: any): string;
}

export const measuringFunctions: FunctionConfigModel[] = [
  {
    id: environment.functions.getOnOff,
    displayName: 'On/Off',
    getIcon(value?: boolean): { icon: string; class: string } {
      if (value) {
        return {class: 'green', icon: 'offline_bolt'};
      }
      return {class: 'red', icon: 'offline_bolt'};
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
        return {icon: 'battery_full', class: 'mat-accent'};
      }
      return {icon: 'battery_' + Math.floor(value * 7 / 100) + '_bar', class: 'mat-accent'};
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
  {
    id: environment.functions.getAlarm,
    displayName: 'Alarm',
    getIcon(value?: boolean): { icon: string; class: string } {
      if (value) {
        return {class: 'green', icon: 'notifications_none'};
      }
      return {class: 'red', icon: 'notification_important'};
    }
  },
  {
    id: environment.functions.getBrightness,
    displayName: 'Brightness',
    unit: '%'
  },
  {
    id: environment.functions.getCarbonDioxid,
    displayName: 'CO₂',
    unit: 'ppm'
  },
  {
    id: environment.functions.getCarbonMonoxid,
    displayName: 'CO',
    unit: 'µg/m³'
  },
  {
    id: environment.functions.getColor,
    displayName: 'Color',
    transform(value?: any): string {
      if (value === undefined) {
        return 'unknown';
      }
      return JSON.stringify(value);
    }
  },
  {
    id: environment.functions.getContact,
    displayName: 'Contact',
  },
  {
    id: environment.functions.getCurrentConsumption,
    displayName: 'Current Consumption',
    unit: 'A',
  },
  {
    id: environment.functions.getCurrent,
    displayName: 'Current',
    unit: 'V',
  },
  {
    id: environment.functions.getEnergyProduction,
    displayName: 'Energy Production',
    unit: 'kWh',
  },
  {
    id: environment.functions.getFrequency,
    displayName: 'Frequency',
    unit: 'Hz',
  },
  {
    id: environment.functions.getHumidity,
    displayName: 'Humidity (rel.)',
    unit: '%',
  },
  {
    id: environment.functions.getLatitude,
    displayName: 'Latitude',
    unit: '°',
  },
  {
    id: environment.functions.getLongitude,
    displayName: 'Longitude',
    unit: '°',
  },
  {
    id: environment.functions.getLuminiscence,
    displayName: 'Luminiscence',
    unit: 'lx',
  },
  {
    id: environment.functions.getMotionState,
    displayName: 'Motion State',
  },
  {
    id: environment.functions.getNitrogenDioxide,
    displayName: 'Nitrogen Dioxide',
    unit: 'µg/m³'
  },
  {
    id: environment.functions.getOscillationState,
    displayName: 'Oscillation State',
  },
  {
    id: environment.functions.getOzone,
    displayName: 'Ozone',
    unit: 'µg/m³'
  },
  {
    id: environment.functions.getParticleAmountPM1,
    displayName: 'PM1',
    unit: 'ppm'
  },
  {
    id: environment.functions.getParticleAmountPM10,
    displayName: 'PM 10',
    unit: 'ppm'
  },
  {
    id: environment.functions.getParticleAmountPM10AS,
    displayName: 'PM 10 AS',
    unit: 'ppm'
  },
  {
    id: environment.functions.getParticleAmountPM10BAP,
    displayName: 'PM 10 BAP',
    unit: 'ppm'
  },
  {
    id: environment.functions.getParticleAmountPM10CD,
    displayName: 'PM 10 CD',
    unit: 'ppm'
  },
  {
    id: environment.functions.getParticleAmountPM10NI,
    displayName: 'PM 10 NI',
    unit: 'ppm'
  },
  {
    id: environment.functions.getParticleAmountPM10PB,
    displayName: 'PM 10 PB',
    unit: 'ppm'
  },
  {
    id: environment.functions.getParticleAmountPM25,
    displayName: 'PM 2.5',
    unit: 'ppm'
  },
  {
    id: environment.functions.getPowerFactorFunction,
    displayName: 'Power Factor',
    unit: 'cos ᵠ'
  },
  {
    id: environment.functions.getPressureFunction,
    displayName: 'Pressure',
    unit: 'hPa'
  },
  {
    id: environment.functions.getSpeedFunction,
    displayName: 'Speed',
    unit: 'm/s'
  },
  {
    id: environment.functions.getSpeedLevelFunction,
    displayName: 'Speed Level',
    unit: 'rpm'
  },
  {
    id: environment.functions.getTamperStateFunction,
    displayName: 'Tamper State',
  },
  {
    id: environment.functions.getTimestampFunction,
    displayName: 'Timestamp',
    transform(value?: any): string {
      if (value === undefined) {
        return 'unknown';
      }
      return new Date(Date.parse(value)).toLocaleString();
    }
  },
  {
    id: environment.functions.getUptimeFunction,
    displayName: 'Uptime',
    unit: 's',
  },
  {
    id: environment.functions.getVoltageFunction,
    displayName: 'Voltage',
    unit: 'V',
  },
  {
    id: environment.functions.getVolumeFlowFunction,
    displayName: 'Volume Flow',
    unit: 'm³/h',
  },
  {
    id: environment.functions.getVolumeFunction,
    displayName: 'Volume',
    unit: 'm³',
  },
  {
    id: environment.functions.getWaterLevelFunction,
    displayName: 'Water Level',
    unit: 'cm',
  },
  {
    id: environment.functions.getUltravioletFunction,
    displayName: 'UV Index',
  },

];
