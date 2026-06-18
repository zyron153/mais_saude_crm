import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface JwtUser {
  sub: string;
  email: string;
  preferred_username: string;
  realm_access: { roles: string[] };
  /** Present only when the Keycloak user is a patient (set via patient-id-mapper protocol mapper) */
  patient_id?: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtUser;
  }
);
