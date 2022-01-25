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
import {MatSnackBar} from "@angular/material/snack-bar";
import {Observable, of} from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class ErrorHandlerService {
    constructor(private snackBar: MatSnackBar) {}

  handleError<T>(service: string, method: string, result?: T) {
    return (error: any): Observable<T> => {
      console.error('Service: ' + service + ' =>> Method: ' + method);
      console.error(error);

      this.snackBar.open("An error occurred", "OK", {duration: 2000});
      return of(result as T);
    };
  }
}
