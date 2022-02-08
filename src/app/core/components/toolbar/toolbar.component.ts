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

import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from "../../services/authorization.service";
import {ToolbarService} from "./toolbar.service";
import {ConfirmationDialogService} from "../confirmation-dialog/confirmation-dialog.service";
import {CacheService} from "../../cache.service";
import {SwUpdate} from "@angular/service-worker";
import {ErrorHandlerService} from "../../services/error-handler.service";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  userName = '';
  loading = false;
  hasUpdate = false;

  constructor(
    private authorizationService: AuthorizationService,
    private toolBarService: ToolbarService,
    private confirmationDialogService: ConfirmationDialogService,
    private cacheService: CacheService,
    private errorHandlerService: ErrorHandlerService,
    private updates: SwUpdate,
  ) {
    this.updates.versionUpdates.subscribe(event => {
      switch (event.type) {
        case "VERSION_DETECTED":
          console.log("Detected new version " + event.version.hash);
          break;
        case "VERSION_INSTALLATION_FAILED":
          console.error("Installation failed", event.error);
          break;
        case "VERSION_READY":
          console.log("New Version ready! Current: " + event.currentVersion + ", Latest: " + event.latestVersion);
          this.hasUpdate = true;
          break;
      }
    });
  }

  ngOnInit(): void {
    if (this.updates.isEnabled) {
      this.updates.checkForUpdate().then(hasUpdate => this.hasUpdate = hasUpdate);
    }
    this.authorizationService.getUserName().then(u => this.userName = u);
    this.toolBarService.loading.subscribe(loading => this.loading = loading);
  }

  logout() {
    this.authorizationService.logout();
  }

  clearCache() {
    this.confirmationDialogService.openConfirmationDialog("Clear Cache", "Do you want to clear the cache?").subscribe(resp => {
      if (resp) {
        this.cacheService.clearCache();
        window.location.reload();
      }
    })
  }

  update() {
    this.updates.activateUpdate().then(() => {
        debugger;
        this.hasUpdate = false;
        window.location.reload();
      }, (reason) => {
        this.errorHandlerService.handleError<void>(ToolbarComponent.name, 'update', undefined, true)(reason).subscribe();
      }
    );
  }
}
