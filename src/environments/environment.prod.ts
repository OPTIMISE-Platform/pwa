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
    setOn: 'urn:infai:ses:controlling-function:79e7914b-f303-4a7d-90af-dee70db05fd9',
    setOff: 'urn:infai:ses:controlling-function:2f35150b-9df7-4cad-95bc-165fa00219fd',
    getOnOff: 'urn:infai:ses:measuring-function:20d3c1d3-77d7-4181-a9f3-b487add58cd0',
    getBattery: 'urn:infai:ses:measuring-function:00549f18-88b5-44c7-adb1-f558e8d53d1d',
    getEnergyConsumption: 'urn:infai:ses:measuring-function:57dfd369-92db-462c-aca4-a767b52c972e',
    getPowerConsumption: 'urn:infai:ses:measuring-function:1c7c90fb-73b6-4690-aac2-72e9735e68d0',
    getTemperature: 'urn:infai:ses:measuring-function:f2769eb9-b6ad-4f7e-bd28-e4ea043d2f8b',
    getTargetTemperature: 'urn:infai:ses:measuring-function:132ceb17-df28-44c2-9771-e1a610d6a13f',
    getAlarm: 'urn:infai:ses:measuring-function:e59bbee4-32a4-456b-99b9-dea8c3545dfc',
    getBrightness: 'urn:infai:ses:measuring-function:c51a6ea5-90c3-4223-9052-6fe4136386cd',
    getCarbonDioxid: 'urn:infai:ses:measuring-function:ad89a222-75a2-47e1-9fe3-969094320881',
    getCarbonMonoxid: 'urn:infai:ses:measuring-function:76423a12-eac2-4f6c-8f79-0216360e2e61',
    getColor: 'urn:infai:ses:measuring-function:bdb6a7c8-4a3d-4fe0-bab3-ce02e09b5869',
    getContact: 'urn:infai:ses:measuring-function:90f05fa4-b765-4998-a09c-448f83a5e8c5',
    getCurrentConsumption: 'urn:infai:ses:measuring-function:6a04430c-0b40-4d26-8851-2401e13edfd6',
    getCurrent: 'urn:infai:ses:measuring-function:28326e5a-69fa-439b-baa9-0e63c453186f',
    getEnergyProduction: 'urn:infai:ses:measuring-function:826e5a04-71cc-4935-9fd4-92c930dc06bb',
    getFrequency: 'urn:infai:ses:measuring-function:9f180351-e83b-437f-b13f-1ad030703036',
    getHumidity: 'urn:infai:ses:measuring-function:53bb96e5-1fb1-4409-89a6-ae6c7332eae4',
    getLatitude: 'urn:infai:ses:measuring-function:f9f2b270-8c74-4289-b822-649e96b39206',
    getLongitude: 'urn:infai:ses:measuring-function:26508f1a-ad3c-4850-8731-dbf966b96335',
    getLuminiscence: 'urn:infai:ses:measuring-function:d7bd8d39-92f7-49da-9dd9-5445c45f2e27',
    getMotionState: 'urn:infai:ses:measuring-function:64dfd53a-f288-40f7-a3ef-a6a7f7c8a7c3',
    getNitrogenDioxide: 'urn:infai:ses:measuring-function:43525897-6a9c-4501-86ad-768dcbcb7c57',
    getOscillationState: 'urn:infai:ses:measuring-function:61b1f2db-3cff-49d8-b22d-424073269f35',
    getOzone: 'urn:infai:ses:measuring-function:56d6b5c6-9b95-4181-ad8f-d0b109cedb18',
    getParticleAmountPM1: 'urn:infai:ses:measuring-function:0e19d094-70c6-402c-8523-3aaff2ce6dd9',
    getParticleAmountPM10: 'urn:infai:ses:measuring-function:f2c1a22f-a49e-4549-9833-62f0994afec0',
    getParticleAmountPM10AS: 'urn:infai:ses:controlling-function:8335e851-05e2-479d-8c17-1cf8174e90e9',
    getParticleAmountPM10BAP: 'urn:infai:ses:measuring-function:29cb52fe-e2d9-446b-8be1-f5447ee7967f',
    getParticleAmountPM10CD: 'urn:infai:ses:measuring-function:cd475584-1b23-4879-ab72-e879f90ade91',
    getParticleAmountPM10NI: 'urn:infai:ses:measuring-function:cee9e218-2bdd-4bfd-bfab-2bcd6dd75bb7',
    getParticleAmountPM10PB: 'urn:infai:ses:measuring-function:dd0c3b2f-3a04-430c-8b39-4e8b927cf20e',
    getParticleAmountPM25: 'urn:infai:ses:measuring-function:22bbaa27-595c-4f53-bdda-8b9614ecdf76',
    getPowerFactorFunction: 'urn:infai:ses:measuring-function:4f3cbfb4-ccb0-4233-a7c3-61760a069c02',
    getPressureFunction: 'urn:infai:ses:measuring-function:2acad12c-8983-4655-9a2d-e2359a706101',
    getSpeedFunction: 'urn:infai:ses:measuring-function:f3865739-6de2-41ce-83f7-b878d7c63bcc',
    getSpeedLevelFunction: 'urn:infai:ses:measuring-function:f6066d39-ed16-4c69-82aa-e18bcf2be2a7',
    getSulfurDioxideFunction: 'urn:infai:ses:measuring-function:cfefc207-44f9-4a25-b40b-162a96846599',
    getTamperStateFunction: 'urn:infai:ses:measuring-function:531efa86-f476-4c9f-8181-8753b7fb938c',
    getTimestampFunction: 'urn:infai:ses:measuring-function:3b4e0766-0d67-4658-b249-295902cd3290',
    getUptimeFunction: 'urn:infai:ses:measuring-function:77dbfd2c-770a-4c0c-bc5a-c2dcda878107',
    getVoltageFunction: 'urn:infai:ses:measuring-function:65c32809-d693-4ac5-bb4e-3875ca25f709',
    getVolumeFlowFunction: 'urn:infai:ses:measuring-function:0179b0e5-1bcf-4057-9a8a-fa195660db60',
    getVolumeFunction: 'urn:infai:ses:measuring-function:cfa56e75-8e8f-4f0d-a3fa-ed2758422b2a',
    getWaterLevelFunction: 'urn:infai:ses:measuring-function:487b35ef-4a10-4305-9514-a00f71c5850a',
    getUltravioletFunction: 'urn:infai:ses:measuring-function:be920197-3eae-4625-8373-ae82b86f21da',
  },
};
