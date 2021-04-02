import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { MailerService } from "@nestjs-modules/mailer";
import { USER_REPOSITORY } from "src/constants";
import { IUserDocument } from "./user.schema";

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: Model<IUserDocument>,
    private readonly mailerService: MailerService
  ) {}

  public sendEmail(to, text): void {
    this.mailerService
      .sendMail({
        to: to, // list of receivers
        from: "noreply@renesistech.com", // sender address
        subject: "Testing Email Service ✔", // Subject line
        text: text, // plaintext body
        html: `<b>welcome<br><p>${text}</p></b>`, // HTML body content
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async findOneByPhone(phone: string): Promise<IUserDocument | undefined> {
    return this.userRepository.findOne({ phone });
  }

  async findOneByEmailOrUsername(
    identifier: string
  ): Promise<IUserDocument | undefined> {
    return this.userRepository.findOne({
      $or: [
        { email: identifier },
        { username: identifier },
        { phone: identifier },
      ],
    });
  }

  async findByEmail(email: string): Promise<IUserDocument | undefined> {
    return this.userRepository.findOne({ email: email });
  }

  async findByUsername(username: string): Promise<IUserDocument | undefined> {
    return this.userRepository.findOne({ username: username });
  }

  async create(body: any) {
    return this.userRepository.create(body);
  }

  async updatePassword(body: any) {
    await this.userRepository.updateOne(
      { email: body.email },
      { password: body.password }
    );
  }
}
