import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CurrentUser } from "./current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  registrar(@Body() body: { email: string; password: string }) {
    return this.authService.registrar(body.email.toLowerCase(), body.password);
  }

  @Post("login")
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email.toLowerCase(), body.password);
  }

  @Post("firebase-exchange")
  firebaseExchange(@Body() body: { idToken: string }) {
    return this.authService.intercambiarFirebase(body.idToken);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: { sub: string }) {
    return this.authService.me(user.sub);
  }
}
