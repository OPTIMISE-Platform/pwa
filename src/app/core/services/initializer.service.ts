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

import {KeycloakEventType, KeycloakService} from "keycloak-angular";
import {environment} from "../../../environments/environment";

export function initializerService(keycloak: KeycloakService): () => Promise<any> {
  keycloak.keycloakEvents$.subscribe({
    next: (e) => {
      if (e.type == KeycloakEventType.OnTokenExpired) {
        keycloak.updateToken(20);
      }
      if (e.type == KeycloakEventType.OnAuthRefreshError) {
        localStorage.clear();
      }
    }
  });

  return (): Promise<any> =>
    keycloak
      .init({
        config: {
          url: environment.keycloak.url + '/auth',
          realm: environment.keycloak.realm,
          clientId: environment.keycloak.clientId,
        },
        initOptions: {
          onLoad: 'login-required',
          checkLoginIframe: false,
          // token: token,
        },
        bearerPrefix: 'Bearer',
      });
}

