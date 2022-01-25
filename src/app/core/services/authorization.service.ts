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

import {Injectable} from '@angular/core';
import {KeycloakService} from 'keycloak-angular';
import {KeycloakProfile} from "keycloak-js";

@Injectable({
    providedIn: 'root',
})
export class AuthorizationService {
    constructor(private keycloakService: KeycloakService) {}

    getUserId(): string | Error {
        const sub = localStorage.getItem('sub');
        if (sub !== null) {
            return sub;
        } else {
            return Error('Could not load sub');
        }
    }

    getUserName(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.keycloakService
                .loadUserProfile()
                .then(() => resolve(this.keycloakService.getUsername()))
                .catch(() => reject(undefined));
        });
    }

    getProfile(): KeycloakProfile | undefined {
        return this.keycloakService.getKeycloakInstance().profile;
    }

    getToken(): Promise<string> {
        return this.keycloakService.getToken().then((resp) => 'bearer ' + resp);
    }

    updateToken(): void {
        this.keycloakService.getKeycloakInstance().loadUserProfile();
    }

    logout() {
        this.keycloakService.logout();
    }
}
