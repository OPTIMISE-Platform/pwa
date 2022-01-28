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

export const environment = {
  production: true,
  keycloak: {
    url: 'KEYCLOAK_URL',
    realm: 'KEYCLOAK_REALM',
    clientId: 'KEYCLOAK_CLIENT_ID'
  },
  apiUrl: 'API_URL',
  functions: {
    getOnOff: 'urn:infai:ses:measuring-function:20d3c1d3-77d7-4181-a9f3-b487add58cd0',
    setOn: 'urn:infai:ses:controlling-function:79e7914b-f303-4a7d-90af-dee70db05fd9',
    setOff: 'urn:infai:ses:controlling-function:2f35150b-9df7-4cad-95bc-165fa00219fd',
    getBattery: 'urn:infai:ses:measuring-function:00549f18-88b5-44c7-adb1-f558e8d53d1d',
    getEnergyConsumption: 'urn:infai:ses:measuring-function:57dfd369-92db-462c-aca4-a767b52c972e',
    getPowerConsumption: 'urn:infai:ses:measuring-function:1c7c90fb-73b6-4690-aac2-72e9735e68d0',
    getTemperature: 'urn:infai:ses:measuring-function:f2769eb9-b6ad-4f7e-bd28-e4ea043d2f8b',
    getTargetTemperature: 'urn:infai:ses:measuring-function:132ceb17-df28-44c2-9771-e1a610d6a13f',
  },
};
