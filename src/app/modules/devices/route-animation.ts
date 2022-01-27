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

import {animate, group, query, style, transition, trigger} from '@angular/animations';


const speed = '0.2s';

export const slideInAnimation =
  trigger('routeAnimations', [
    transition('devices => device-details', [
      query(':enter, :leave',
        style({ position: 'fixed',  width: '100%' }),
        { optional: true }),
      group([
        query(':enter', [
          style({ transform: 'translateY(-100%)' }),
          animate(speed + ' ease-in-out',
            style({ transform: 'translateY(0%)' }))
        ], { optional: true }),
        query(':leave', [
          style({ transform: 'translateY(0%)' }),
          animate(speed + ' ease-in-out',
            style({ transform: 'translateY(100%)' }))
        ], { optional: true }),
      ])
    ]),
    transition('device-details => devices', [
      query(':enter, :leave',
        style({ position: 'fixed',  width: '100%' }),
        { optional: true }),
      group([
        query(':enter', [
          style({ transform: 'translateY(100%)' }),
          animate(speed + ' ease-in-out',
            style({ transform: 'translateY(0%)' }))
        ], { optional: true }),
        query(':leave', [
          style({ transform: 'translateY(0%)' }),
          animate(speed + ' ease-in-out',
            style({ transform: 'translateY(-100%)' }))
        ], { optional: true }),
      ])
    ]),
  ]);
