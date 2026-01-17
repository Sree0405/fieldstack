import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed default roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Full access to all features',
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'editor' },
    update: {},
    create: {
      name: 'editor',
      displayName: 'Editor',
      description: 'Can create and edit content',
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: 'viewer' },
    update: {},
    create: {
      name: 'viewer',
      displayName: 'Viewer',
      description: 'Read-only access',
    },
  });

  console.log('✅ Created default roles: admin, editor, viewer');

  // Create default collections
  const posts = await prisma.collection.upsert({
    where: { name: 'posts' },
    update: {},
    create: {
      name: 'posts',
      displayName: 'Blog Posts',
      tableName: 'posts_collection',
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Created collection: ${posts.displayName}`);

  // Create fields for posts
  const titleField = await prisma.field.upsert({
    where: {
      collectionId_name: {
        collectionId: posts.id,
        name: 'title',
      },
    },
    update: {},
    create: {
      collectionId: posts.id,
      name: 'title',
      dbColumn: 'title',
      type: 'TEXT',
      required: true,
      uiComponent: 'text-input',
    },
  });

  const contentField = await prisma.field.upsert({
    where: {
      collectionId_name: {
        collectionId: posts.id,
        name: 'content',
      },
    },
    update: {},
    create: {
      collectionId: posts.id,
      name: 'content',
      dbColumn: 'content',
      type: 'TEXT',
      required: false,
      uiComponent: 'rich-text-editor',
    },
  });

  const statusField = await prisma.field.upsert({
    where: {
      collectionId_name: {
        collectionId: posts.id,
        name: 'status',
      },
    },
    update: {},
    create: {
      collectionId: posts.id,
      name: 'status',
      dbColumn: 'status',
      type: 'TEXT',
      required: true,
      defaultValue: 'draft',
      uiComponent: 'select',
    },
  });

  console.log(`✅ Created fields for ${posts.displayName}`);

  // Create admin user
  const adminEmail = 'admin@novacms.local';
  const adminPassword = 'NovaCMS@Admin123!';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
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

  console.log(`✅ Created admin user: ${adminEmail}`);
  console.log(`   ⚠️  DEFAULT PASSWORD: ${adminPassword}`);

  // Create editor and viewer users
  const editorPassword = 'Editor@Password123!';
  const editorHashedPassword = await bcrypt.hash(editorPassword, 12);

  const editor = await prisma.user.upsert({
    where: { email: 'editor@novacms.local' },
    update: {},
    create: {
      email: 'editor@novacms.local',
      password: editorHashedPassword,
      profile: {
        create: {
          email: 'editor@novacms.local',
          displayName: 'Editor',
        },
      },
      roles: {
        create: {
          roleId: editorRole.id,
        },
      },
    },
  });

  console.log(`✅ Created editor user: editor@novacms.local`);

  const viewerPassword = 'Viewer@Password123!';
  const viewerHashedPassword = await bcrypt.hash(viewerPassword, 12);

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@novacms.local' },
    update: {},
    create: {
      email: 'viewer@novacms.local',
      password: viewerHashedPassword,
      profile: {
        create: {
          email: 'viewer@novacms.local',
          displayName: 'Viewer',
        },
      },
      roles: {
        create: {
          roleId: viewerRole.id,
        },
      },
    },
  });

  console.log(`✅ Created viewer user: viewer@novacms.local`);

  // Create default permissions
  const adminPerms = ['READ', 'CREATE', 'UPDATE', 'DELETE'];
  const editorPerms = ['READ', 'CREATE', 'UPDATE'];
  const viewerPerms = ['READ'];

  for (const action of adminPerms) {
    await prisma.permission.upsert({
      where: {
        roleId_collectionId_action: {
          roleId: adminRole.id,
          collectionId: posts.id,
          action: action as any,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        collectionId: posts.id,
        action: action as any,
      },
    });
  }

  for (const action of editorPerms) {
    await prisma.permission.upsert({
      where: {
        roleId_collectionId_action: {
          roleId: editorRole.id,
          collectionId: posts.id,
          action: action as any,
        },
      },
      update: {},
      create: {
        roleId: editorRole.id,
        collectionId: posts.id,
        action: action as any,
      },
    });
  }

  for (const action of viewerPerms) {
    await prisma.permission.upsert({
      where: {
        roleId_collectionId_action: {
          roleId: viewerRole.id,
          collectionId: posts.id,
          action: action as any,
        },
      },
      update: {},
      create: {
        roleId: viewerRole.id,
        collectionId: posts.id,
        action: action as any,
      },
    });
  }

  console.log(`✅ Created default permissions for ${posts.displayName}`);
  console.log('\n✨ Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: any) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
