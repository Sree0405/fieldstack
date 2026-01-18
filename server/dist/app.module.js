"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const prisma_module_1 = require("./prisma/prisma.module");
const bootstrap_module_1 = require("./bootstrap/bootstrap.module");
const auth_module_1 = require("./auth/auth.module");
const collections_module_1 = require("./collections/collections.module");
const crud_module_1 = require("./crud/crud.module");
const users_module_1 = require("./users/users.module");
const permissions_module_1 = require("./permissions/permissions.module");
const system_module_1 = require("./system/system.module");
const roles_module_1 = require("./roles/roles.module");
const notifications_module_1 = require("./notifications/notifications.module");
const files_module_1 = require("./files/files.module");
const site_info_module_1 = require("./site-info/site-info.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            prisma_module_1.PrismaModule,
            bootstrap_module_1.BootstrapModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
                signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' },
            }),
            auth_module_1.AuthModule,
            notifications_module_1.NotificationsModule,
            collections_module_1.CollectionsModule,
            crud_module_1.CrudModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            permissions_module_1.PermissionsModule,
            system_module_1.SystemModule,
            files_module_1.FilesModule,
            site_info_module_1.SiteInfoModule,
        ],
    })
], AppModule);
