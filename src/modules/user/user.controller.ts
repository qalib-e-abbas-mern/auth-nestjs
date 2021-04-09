import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get("/")
  async getProfile(@Req() req, @Res() res) {
    const user = await this.userService.findById(req.user.userId);
    return res.json({ data: user });
  }
}
