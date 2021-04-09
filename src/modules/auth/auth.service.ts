import { Inject, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { use } from "passport";
import { FORGET_PASSWORD_REPOSITORY, jwtConstants } from "src/constants";
import { Model } from "mongoose";
import { IForgetPasswordDocument } from "../user/user.schema";
import { env } from "process";

@Injectable()
export class AuthService {
  constructor(
    @Inject(FORGET_PASSWORD_REPOSITORY)
    private readonly passwordRepository: Model<IForgetPasswordDocument>,
    private readonly userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(identifier: string, password: string): Promise<any> {
    const user = await this.userService.findOneByEmailOrUsername(identifier);

    if (user && bcrypt.compareSync(password, user.password)) {
      return user.toJSON();
    }
    return null;
  }

  async login(user: any) {
    const data = await this.validateUser(user.identifier, user.password);

    if (!data) {
      return null;
    }

    const payload = {
      email: data.email,
      _id: data._id,
      username: data.username,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgetPassword(email: any) {
    const random = Math.floor(Math.random() * 1000 + 10300);

    const check = await this.passwordRepository.findOne({ email: email });
    if (check) {
      await this.passwordRepository.updateOne(
        { email: email },
        { pin: random, createdAt: new Date() }
      );
    } else {
      await this.passwordRepository.create({
        email: email,
        pin: random,
      });
    }
    this.userService.sendEmail(
      email,
      `Here is your verification code to reset password <a href="${env.FRONTEND_BASE_URL}/reset-password/${email}/${random}">Click here</a> reset your password`
    );
    return {
      status: "success",
      message: "verification code sent to user email",
    };
  }

  async checkPin(email, pin) {
    const verify = await this.passwordRepository.findOne({
      email: email,
      pin: pin,
      createdAt: { $gt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    });
    if (verify) {
      return { status: "success", message: "Pin Code Verified" };
    } else {
      return { status: "error", message: "Link Expired" };
    }
  }
  async updatePassword(email, password) {
    const pass = bcrypt.hashSync(password, jwtConstants.salt);
    await this.userService.updatePassword({ email, password: pass });
    return {
      status: "success",
      message: "password updated",
    };
  }
}
