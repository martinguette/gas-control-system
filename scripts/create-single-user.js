const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno del archivo .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};

  envContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });

  return env;
}

const env = loadEnvFile();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno no configuradas');
  process.exit(1);
}

// Usar service role key para crear usuarios
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUser() {
  const userData = {
    email: 'vendedorgas@yopmail.com',
    password: 'martin123',
    role: 'vendedor',
    name: 'Martin Vendedorsito',
    phone: '+57 300 000 0000',
  };

  console.log('🔐 Creando usuario en Supabase Auth...');
  console.log(`📝 Email: ${userData.email}`);
  console.log(`👤 Nombre: ${userData.name}`);
  console.log(`🔑 Rol: ${userData.role}`);

  try {
    // Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        role: userData.role,
        name: userData.name,
        phone: userData.phone,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('⚠️  Usuario ya existe, obteniendo datos...');

        // Obtener usuario existente
        const { data: existingUser } = await supabase.auth.admin.getUserByEmail(
          userData.email
        );
        if (existingUser.user) {
          console.log(
            `✅ Usuario encontrado: ${userData.email} (${existingUser.user.id})`
          );

          // Sincronizar con tabla users
          await syncUserToTable({
            ...userData,
            id: existingUser.user.id,
          });
        }
      } else {
        console.error('❌ Error creando usuario:', error.message);
        return;
      }
    } else {
      console.log(`✅ Usuario creado: ${userData.email} (${data.user.id})`);

      // Sincronizar con tabla users
      await syncUserToTable({
        ...userData,
        id: data.user.id,
      });
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

async function syncUserToTable(user) {
  console.log('\n🔄 Sincronizando usuario con tabla users...');

  try {
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('❌ Error sincronizando usuario:', error.message);
    } else {
      console.log(`✅ Usuario sincronizado: ${user.email} (${user.role})`);
      console.log('\n🎉 Usuario creado exitosamente!');
      console.log('\n📋 Credenciales de acceso:');
      console.log(`👨‍💻 Email: ${user.email}`);
      console.log(`🔑 Contraseña: ${user.password}`);
      console.log(`🔑 Rol: ${user.role}`);
    }
  } catch (error) {
    console.error('❌ Error inesperado sincronizando:', error.message);
  }
}

createUser();
