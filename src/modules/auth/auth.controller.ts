import { Body, Controller, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { Response, Request } from "express";
import { UserService } from "../user/user.service";
import { SignupDto } from "./auth.dto";
import { AuthService } from "./auth.service";

import * as bcrypt from "bcrypt";

import { jwtConstants, emailRegex, nameRegex } from "src/constants";
interface LooseObject {
  [key: string]: any;
}
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post("/login")
  async login(@Req() req: Request, @Res() res: Response) {
    try {
      const response = await this.authService.login(req.body);

      if (!response)
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ status: "UNAUTHORIZED", message: "Wrong Credentials " });
      return res.json({
        status: "success",
        message: "Successfully LoggedIn",
        data: response,
      });
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ status: "error", message: "Something went wrong " });
    }
  }

  @Post("signup")
  async signup(@Body() signupDto: SignupDto, @Res() res: Response) {
    try {
      const [body, errors] = await this.checkSignUpValidation(signupDto);

      if (Object.keys(errors).length > 0) {
        return res.status(401).json(errors);
      }

      await this.userService.create({
        ...signupDto,
        // roles: [signupDto.role],
        password: bcrypt.hashSync(signupDto.password, jwtConstants.salt),
      });
      const user = await this.authService.login({
        identifier: signupDto.email,
        password: signupDto.password,
      });

      await this.userService.sendEmail(
        signupDto.email,
        "Your account has been registered successfully"
      );
      return res.status(201).json({
        status: "success",
        message: "Successfully SignUp",
        data: user,
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: "error", message: "Something went wrong!.", error });
    }
  }

  @Post("forget-password")
  async forgetPassword(@Body() body: any, @Res() res: Response) {
    try {
      const checkUserWithEmail = await this.userService.findByEmail(body.email);
      if (!checkUserWithEmail) {
        return res
          .status(400)
          .json({ status: "error", msg: "User Not Found!" });
      }
      const verificationProcess = await this.authService.forgetPassword(
        body.email
      );
      res.status(201).json(verificationProcess);
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: "error", message: "Something went wrong!." });
    }
  }

  @Post("verify-pin")
  async verifyPinCode(@Body() body: any, @Res() res: Response) {
    const { email, pin } = body;
    const verifiedUpdate = await this.authService.checkPin(email, pin);
    res.json(verifiedUpdate);
  }
  @Post("reset-password")
  async resetPassword(@Body() body: any, @Res() res: Response) {
    const { email, newPassword } = body;
    const updatePassword = await this.authService.updatePassword(
      email,
      newPassword
    );
    res.json(updatePassword);
  }

  // helper functions
  checkSignUpValidation = async (body) => {
    let errors: any = {};

    //email
    const checkUser = await this.userService.findByEmail(body.email);
    if (checkUser && checkUser.email) {
      errors.email = `${checkUser.email} already registered`;
    } else {
      const re = emailRegex;
      if (!re.test(String(body.email).toLowerCase())) {
        errors.email = "Invalid Email Format";
      }
    }
    //name
    const letters = nameRegex;
    if (!body.fullName.match(letters)) {
      errors.username = "Name must be string";
    }
    // username
    const checkUserWithUsername = await this.userService.findByUsername(
      body.username
    );
    if (checkUserWithUsername && checkUserWithUsername.username) {
      errors.username = "Username Already Registered";
    }

    const checkUserPhoneNumber = await this.userService.findOneByPhone(
      body.phone
    );

    if (checkUserPhoneNumber && checkUserPhoneNumber.phone) {
      errors.phone = "Phone Number Already Used";
    }

    return [body, errors];
  };
}
