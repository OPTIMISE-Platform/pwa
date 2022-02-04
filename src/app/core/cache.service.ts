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

interface CacheEntryModel {
  value: any;
  expires: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  cacheVersion = '2'; // increase anytime cache needs to be wiped after an update

  constructor() {
    const cacheVersion = localStorage.getItem('cacheVersion');
    if (cacheVersion !== this.cacheVersion) {
      localStorage.clear();
    }
    localStorage.setItem('cacheVersion', this.cacheVersion)
  }


  fromCache<T>(key: string): (T | undefined) {
    let local = localStorage.getItem(key);
    if (local === null) {
      return undefined;
    }
    const localParsed = JSON.parse(local) as CacheEntryModel;
    if ((new Date().valueOf()) < localParsed.expires) {
      return localParsed.value as T;
    }
    // expired
    localStorage.removeItem(key);
    return undefined;
  }

  toCache(key: string, value: any, timeoutMs: number): void {
    const expires = new Date();
    const entry: CacheEntryModel = {
      value,
      expires: expires.valueOf() + timeoutMs,
    }
    localStorage.setItem(key, JSON.stringify(entry));
  }

  clearCache() {
    localStorage.clear();
  }
}
