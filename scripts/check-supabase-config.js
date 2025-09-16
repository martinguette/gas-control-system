// Script para verificar la configuración de Supabase
const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Verificando configuración de Supabase...\n');

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

console.log('📋 Variables de entorno:');
console.log(
  'NEXT_PUBLIC_SUPABASE_URL:',
  supabaseUrl ? '✅ Configurada' : '❌ No configurada'
);
console.log(
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:',
  supabaseKey ? '✅ Configurada' : '❌ No configurada'
);

if (!supabaseUrl || !supabaseKey) {
  console.log(
    '\n❌ Error: Variables de entorno no configuradas correctamente.'
  );
  console.log('📝 Asegúrate de que tu archivo .env.local contenga:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_anon_key');
  process.exit(1);
}

// Verificar formato de URL
if (
  !supabaseUrl.startsWith('https://') ||
  !supabaseUrl.includes('.supabase.co')
) {
  console.log('\n❌ Error: URL de Supabase no tiene el formato correcto.');
  console.log('📝 Debe ser: https://tu-proyecto-id.supabase.co');
  process.exit(1);
}

// Verificar formato de key
if (!supabaseKey.startsWith('eyJ')) {
  console.log('\n❌ Error: Clave de Supabase no tiene el formato correcto.');
  console.log('📝 Debe empezar con "eyJ" (JWT token)');
  process.exit(1);
}

// Probar conexión
console.log('\n🔗 Probando conexión con Supabase...');

const supabase = createClient(supabaseUrl, supabaseKey);

supabase.auth
  .getSession()
  .then(({ data, error }) => {
    if (error) {
      console.log('❌ Error de conexión:', error.message);
      if (error.message.includes('Invalid API key')) {
        console.log(
          '📝 La clave API no es válida. Verifica tu NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
        );
      } else if (error.message.includes('Invalid URL')) {
        console.log(
          '📝 La URL no es válida. Verifica tu NEXT_PUBLIC_SUPABASE_URL'
        );
      }
    } else {
      console.log('✅ Conexión exitosa con Supabase');
      console.log('📊 Sesión actual:', data.session ? 'Activa' : 'Inactiva');
    }
  })
  .catch((error) => {
    console.log('❌ Error inesperado:', error.message);
  });

console.log('\n📋 Configuración actual:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');
