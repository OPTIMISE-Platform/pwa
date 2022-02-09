#!/usr/bin/env sh

#
# Copyright 2021 InfAI (CC SES)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
export file=$(find '/usr/share/nginx/html' -name 'main*.js')
sed -i -e 's,KEYCLOAK_URL,'"$KEYCLOAK_URL"',g' ${file}
sed -i -e 's,KEYCLOAK_REALM,'"$KEYCLOAK_REALM"',g' ${file}
sed -i -e 's,KEYCLOAK_CLIENT_ID,'"$KEYCLOAK_CLIENT_ID"',g' ${file}
sed -i -e 's,API_URL,'"$API_URL"',g' ${file}

# update checksum
export fileSuffix=$(echo ${file} | sed -e "s/\/usr\/share\/nginx\/html//")
export sum=$(sha1sum ${file} | head -c 40)
jq '.hashTable."'${fileSuffix}'" |= "'${sum}'"' /usr/share/nginx/html/ngsw.json > /tmp/ngsw.json
mv /tmp/ngsw.json /usr/share/nginx/html/ngsw.json
