"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BootstrapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BootstrapService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let BootstrapService = BootstrapService_1 = class BootstrapService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(BootstrapService_1.name);
    }
    async init() {
        try {
            this.logger.log('🚀 Starting fieldstack Bootstrap...');
            // Step 1: Check DB connection
            await this.checkDatabase();
            // Step 2: Create default roles if missing
            await this.seedRoles();
            // Step 3: Create default collections if missing
            await this.seedCollections();
            // Step 4: Create admin user if missing
            await this.seedAdminUser();
            // Step 5: Seed default permissions
            await this.seedPermissions();
            this.logger.log('✅ Bootstrap completed successfully!');
        }
        catch (error) {
            this.logger.error('❌ Bootstrap failed:', error);
            throw error;
        }
    }
    async checkDatabase() {
        try {
            this.logger.log('🔍 Checking database connection...');
            const result = await this.prisma.$queryRaw `SELECT NOW()`;
            this.logger.log('✅ Database connection successful');
            return result;
        }
        catch (error) {
            this.logger.error('❌ Database connection failed:', error?.message || String(error));
            throw error;
        }
    }
    async seedRoles() {
        try {
            this.logger.log('🔄 Seeding default roles...');
            // Create default roles
            const roles = [
                { name: 'admin', displayName: 'Administrator', description: 'Full access to all features' },
                { name: 'editor', displayName: 'Editor', description: 'Can create and edit content' },
                { name: 'viewer', displayName: 'Viewer', description: 'Read-only access' },
            ];
            for (const roleData of roles) {
                await this.prisma.role.upsert({
                    where: { name: roleData.name },
                    update: {},
                    create: roleData,
                });
            }
            this.logger.log('✅ Default roles seeded');
        }
        catch (error) {
            this.logger.error('❌ Failed to seed roles:', error?.message || String(error));
            throw error;
        }
    }
    async seedCollections() {
        try {
            this.logger.log('📦 Seeding default collections...');
            // Check if any collections exist
            const existingCollections = await this.prisma.collection.count();
            if (existingCollections === 0) {
                // Create a default blog collection as example
                await this.prisma.collection.create({
                    data: {
                        name: 'posts',
                        displayName: 'Blog Posts',
                        tableName: 'posts_collection',
                        status: 'ACTIVE',
                        fields: {
                            create: [
                                {
                                    name: 'title',
                                    dbColumn: 'title',
                                    type: 'TEXT',
                                    required: true,
                                },
                                {
                                    name: 'content',
                                    dbColumn: 'content',
                                    type: 'TEXT',
                                    required: false,
                                },
                                {
                                    name: 'status',
                                    dbColumn: 'status',
                                    type: 'TEXT',
                                    required: true,
                                },
                            ],
                        },
                    },
                });
                this.logger.log('✅ Default collections seeded');
            }
            else {
                this.logger.log(`✅ Collections already exist (${existingCollections} found)`);
            }
        }
        catch (error) {
            this.logger.error('❌ Failed to seed collections:', error?.message || String(error));
            throw error;
        }
    }
    async seedAdminUser() {
        try {
            this.logger.log('👤 Seeding admin user...');
            const adminEmail = 'admin@fieldstack.local';
            const existingAdmin = await this.prisma.user.findUnique({
                where: { email: adminEmail },
            });
            if (existingAdmin) {
                this.logger.log(`✅ Admin user already exists: ${adminEmail}`);
                return;
            }
            // Get the admin role
            const adminRole = await this.prisma.role.findUnique({
                where: { name: 'admin' },
            });
            if (!adminRole) {
                throw new Error('Admin role not found');
            }
            // Generate a default password (should be changed on first login)
            const defaultPassword = 'fieldstack@Admin123!';
            const hashedPassword = await bcrypt.hash(defaultPassword, 12);
            const adminUser = await this.prisma.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    profile: {
                        create: {
                            email: adminEmail,
                            displayName: 'Administrator',
                        },
                    },
                    roles: {
                        create: {
                            roleId: adminRole.id,
                        },
                    },
                },
            });
            this.logger.log(`✅ Admin user created: ${adminEmail}`);
            this.logger.log(`   ⚠️  DEFAULT PASSWORD: ${defaultPassword}`);
            this.logger.log('   ⚠️  Please change this password after first login!');
        }
        catch (error) {
            this.logger.error('❌ Failed to seed admin user:', error?.message || String(error));
            throw error;
        }
    }
    async seedPermissions() {
        try {
            this.logger.log('🔐 Seeding default permissions...');
            // Check if any permissions exist
            const existingPermissions = await this.prisma.permission.count();
            if (existingPermissions === 0) {
                // Get the posts collection
                const postsCollection = await this.prisma.collection.findFirst({
                    where: { name: 'posts' },
                });
                if (postsCollection) {
                    // Get roles
                    const adminRole = await this.prisma.role.findUnique({ where: { name: 'admin' } });
                    const editorRole = await this.prisma.role.findUnique({ where: { name: 'editor' } });
                    const viewerRole = await this.prisma.role.findUnique({ where: { name: 'viewer' } });
                    if (!adminRole || !editorRole || !viewerRole) {
                        throw new Error('Required roles not found');
                    }
                    // Admin has all permissions
                    const actions = [
                        'READ',
                        'CREATE',
                        'UPDATE',
                        'DELETE',
                    ];
                    for (const action of actions) {
                        await this.prisma.permission.upsert({
                            where: {
                                roleId_collectionId_action: {
                                    roleId: adminRole.id,
                                    collectionId: postsCollection.id,
                                    action: action,
                                },
                            },
                            update: {},
                            create: {
                                roleId: adminRole.id,
                                collectionId: postsCollection.id,
                                action: action,
                            },
                        });
                    }
                    // Editors can read, create, update
                    for (const action of ['READ', 'CREATE', 'UPDATE']) {
                        await this.prisma.permission.upsert({
                            where: {
                                roleId_collectionId_action: {
                                    roleId: editorRole.id,
                                    collectionId: postsCollection.id,
                                    action: action,
                                },
                            },
                            update: {},
                            create: {
                                roleId: editorRole.id,
                                collectionId: postsCollection.id,
                                action: action,
                            },
                        });
                    }
                    // Viewers can only read
                    await this.prisma.permission.upsert({
                        where: {
                            roleId_collectionId_action: {
                                roleId: viewerRole.id,
                                collectionId: postsCollection.id,
                                action: 'READ',
                            },
                        },
                        update: {},
                        create: {
                            roleId: viewerRole.id,
                            collectionId: postsCollection.id,
                            action: 'READ',
                        },
                    });
                }
                this.logger.log('✅ Default permissions seeded');
            }
            else {
                this.logger.log(`✅ Permissions already exist (${existingPermissions} found)`);
            }
        }
        catch (error) {
            this.logger.error('❌ Failed to seed permissions:', error?.message || String(error));
            throw error;
        }
    }
};
exports.BootstrapService = BootstrapService;
exports.BootstrapService = BootstrapService = BootstrapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BootstrapService);
