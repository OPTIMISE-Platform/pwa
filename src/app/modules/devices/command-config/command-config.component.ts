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

import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";
import {DeviceTypeCharacteristicsModel, DeviceTypeExtendedFunctionModel, Type} from "../devices.model";

@Component({
  selector: 'app-command-config',
  templateUrl: './command-config.component.html',
  styleUrls: ['./command-config.component.css']
})
export class CommandConfigComponent {
  functionConfig: DeviceTypeExtendedFunctionModel;
  value: any | undefined;

  form: FormGroup;
  formIsGroup = false;

  fields: { characteristic: DeviceTypeCharacteristicsModel, path: string }[] = [];

  type = Type;


  constructor(
    private dialogRef: MatDialogRef<CommandConfigComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) data: { function: DeviceTypeExtendedFunctionModel; value: any },
  ) {
    this.functionConfig = data.function;
    this.value = data.value;
    this.form = this.fb.group({});
    if (this.functionConfig.concept.base_characteristic.sub_characteristics !== null
      && this.functionConfig.concept.base_characteristic.sub_characteristics !== undefined
      && this.functionConfig.concept.base_characteristic.sub_characteristics.length > 0) {
      this.functionConfig.concept.base_characteristic.sub_characteristics?.forEach(sub => {
        this.form.addControl(sub.name, this.walkTree(sub.name, sub));
      });
      this.formIsGroup = true;
    } else {
      this.form.addControl('', this.walkTree('', this.functionConfig.concept.base_characteristic));
    }
  }

  private walkTree(path: string, characteristic: DeviceTypeCharacteristicsModel): AbstractControl {
    switch (characteristic.type) {
      case Type.INTEGER:
      case Type.FLOAT:
        this.fields.push({characteristic: characteristic, path: path});
        return this.fb.control(characteristic.name, this.fb.control(characteristic.value || 0));
      case Type.STRING:
        this.fields.push({characteristic: characteristic, path: path});
        return this.fb.control(characteristic.name, this.fb.control(characteristic.value || ''));
      case Type.BOOLEAN:
        this.fields.push({characteristic: characteristic, path: path});
        return this.fb.control(characteristic.name, this.fb.control(characteristic.value || false));
      case Type.STRUCTURE:
        const group = this.fb.group({});
        characteristic.sub_characteristics?.forEach(sub => {
          let subPath = characteristic.name;
          if (path.length > 0) {
            subPath = path + '.' + subPath;
          }
          group.addControl(characteristic.name, this.walkTree(subPath, sub));
        });
        return group;
      default:
        this.dialogRef.close();
        throw 'Not implemented';
    }
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.formIsGroup ? this.form.getRawValue() : this.form.get('')?.value);
  }
}
