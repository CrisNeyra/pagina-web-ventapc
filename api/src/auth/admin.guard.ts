import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: string; email?: string } | undefined;

    if (user?.role === "admin") return true;

    const admins = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (user?.email && admins.includes(user.email.toLowerCase())) {
      return true;
    }

    throw new ForbiddenException("UNAUTHORIZED");
  }
}
