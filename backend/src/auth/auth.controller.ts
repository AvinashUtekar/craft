import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Res,
} from "@nestjs/common";
import { type AuthService } from "./auth.service";
import { type ConfigService } from "@nestjs/config";
import { InitMagicLinkLoginDto, type EmailSignupDto } from "./dto";
import { type Response } from "express";
import { CompleteMagicLinkLoginParam } from "./param";

@Controller("auth")
export class AuthController {
    constructor(
        private service: AuthService,
        private configService: ConfigService,
    ) {}

    @Post("email-signup")
    @HttpCode(HttpStatus.CREATED)
    async emailSignup(
        @Body() dto: EmailSignupDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.service.emailSignup(dto);

        // This key should be same as the one used in RefreshTokenStrategy
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: Number(
                this.configService.get("REFRESH_TOKEN_COOKIE_EXPIRES_IN_MS"),
            ),
        });

        return { user: result.user, accessToken: result.accessToken };
    }

    @Post("email-login")
    @HttpCode(HttpStatus.OK)
    async initMagicLinkLogin(@Body() dto: InitMagicLinkLoginDto) {
        await this.service.initMagicLinkLogin(dto);
        return { message: "Login link sent to your email" };
    }

    @Post("email-login/:token")
    @HttpCode(HttpStatus.OK)
    async completeMagicLinkLogin(
        // @Param("token") token: string,
        @Param() params: CompleteMagicLinkLoginParam,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.service.completeMagicLinkLogin(params.token);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: Number(
                this.configService.get("REFRESH_TOKEN_COOKIE_EXPIRES_IN_MS"),
            ),
        });

        return { user: result.user, accessToken: result.accessToken };
    }
}