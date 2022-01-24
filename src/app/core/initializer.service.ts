import {KeycloakEventType, KeycloakService} from "keycloak-angular";
import {environment} from "../../environments/environment";

export function initializerService(keycloak: KeycloakService): () => Promise<any> {
  keycloak.keycloakEvents$.subscribe({
    next: (e) => {
      if (e.type == KeycloakEventType.OnTokenExpired) {
        keycloak.updateToken(20);
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

