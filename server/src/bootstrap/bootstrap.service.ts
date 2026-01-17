import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BootstrapService {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(private prisma: PrismaService) {}

  async init() {
    try {
      this.logger.log('🚀 Starting NovaCMS Bootstrap...');

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
    } catch (error) {
      this.logger.error('❌ Bootstrap failed:', error);
      throw error;
    }
  }

  private async checkDatabase() {
    try {
      this.logger.log('🔍 Checking database connection...');
      const result = await this.prisma.$queryRaw`SELECT NOW()`;
      this.logger.log('✅ Database connection successful');
      return result;
    } catch (error: any) {
      this.logger.error('❌ Database connection failed:', error?.message || String(error));
      throw error;
    }
  }

  private async seedRoles() {
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
    } catch (error: any) {
      this.logger.error('❌ Failed to seed roles:', error?.message || String(error));
      throw error;
    }
  }

  private async seedCollections() {
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
      } else {
        this.logger.log(`✅ Collections already exist (${existingCollections} found)`);
      }
    } catch (error: any) {
      this.logger.error('❌ Failed to seed collections:', error?.message || String(error));
      throw error;
    }
  }

  private async seedAdminUser() {
    try {
      this.logger.log('👤 Seeding admin user...');

      const adminEmail = 'admin@novacms.local';
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
      const defaultPassword = 'NovaCMS@Admin123!';
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
    } catch (error: any) {
      this.logger.error('❌ Failed to seed admin user:', error?.message || String(error));
      throw error;
    }
  }

  private async seedPermissions() {
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
          const actions: Array<'READ' | 'CREATE' | 'UPDATE' | 'DELETE'> = [
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
                  action: action as any,
                },
              },
              update: {},
              create: {
                roleId: adminRole.id,
                collectionId: postsCollection.id,
                action: action as any,
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
                  action: action as any,
                },
              },
              update: {},
              create: {
                roleId: editorRole.id,
                collectionId: postsCollection.id,
                action: action as any,
              },
            });
          }

          // Viewers can only read
          await this.prisma.permission.upsert({
            where: {
              roleId_collectionId_action: {
                roleId: viewerRole.id,
                collectionId: postsCollection.id,
                action: 'READ' as any,
              },
            },
            update: {},
            create: {
              roleId: viewerRole.id,
              collectionId: postsCollection.id,
              action: 'READ' as any,
            },
          });
        }

        this.logger.log('✅ Default permissions seeded');
      } else {
        this.logger.log(`✅ Permissions already exist (${existingPermissions} found)`);
      }
    } catch (error: any) {
      this.logger.error('❌ Failed to seed permissions:', error?.message || String(error));
      throw error;
    }
  }
}