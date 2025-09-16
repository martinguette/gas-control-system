#!/usr/bin/env node

/**
 * Script para configurar datos de prueba en el sistema de control de gas
 * Ejecuta el archivo SQL de datos ficticios
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(
  '🚀 Configurando datos de prueba para el sistema de control de gas...\n'
);

// Verificar que el archivo SQL existe
const sqlFile = path.join(__dirname, 'insert-test-data.sql');
if (!fs.existsSync(sqlFile)) {
  console.error('❌ Error: No se encontró el archivo insert-test-data.sql');
  process.exit(1);
}

try {
  // Verificar si Supabase CLI está instalado
  try {
    execSync('supabase --version', { stdio: 'pipe' });
    console.log('✅ Supabase CLI detectado');
  } catch (error) {
    console.log('⚠️  Supabase CLI no detectado, intentando con psql...');
  }

  // Intentar ejecutar con Supabase CLI primero
  try {
    console.log('📦 Ejecutando datos de prueba con Supabase CLI...');
    execSync(
      `supabase db reset --db-url ${
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:54322/postgres'
      }`,
      {
        stdio: 'inherit',
        cwd: process.cwd(),
      }
    );

    // Ejecutar el archivo SQL
    execSync(
      `supabase db push --db-url ${
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:54322/postgres'
      } < ${sqlFile}`,
      {
        stdio: 'inherit',
        cwd: process.cwd(),
      }
    );

    console.log(
      '✅ Datos de prueba configurados exitosamente con Supabase CLI'
    );
  } catch (supabaseError) {
    console.log('⚠️  Falló con Supabase CLI, intentando con psql...');

    // Intentar con psql
    const dbUrl =
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:54322/postgres';
    execSync(`psql "${dbUrl}" -f "${sqlFile}"`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log('✅ Datos de prueba configurados exitosamente con psql');
  }

  console.log('\n🎉 ¡Datos de prueba configurados exitosamente!');
  console.log('\n📋 Resumen de datos insertados:');
  console.log('   👥 Usuarios: 4 (1 jefe, 3 vendedores)');
  console.log('   📦 Inventario lleno: 3 tipos de cilindros');
  console.log('   🗂️  Inventario vacío: 12 combinaciones marca-color');
  console.log('   👤 Clientes: 8 con precios personalizados');
  console.log('   💰 Ventas de ejemplo: 3 transacciones');
  console.log('   💸 Gastos de ejemplo: 3 gastos');
  console.log('   🚛 Llegadas de camión: 2 registros');
  console.log('   📊 Metas: 6 metas (3 generales, 3 individuales)');

  console.log('\n🔑 Credenciales de prueba:');
  console.log('   👨‍💼 Jefe: jefe@gascontrol.com');
  console.log('   👨‍💻 Vendedor 1: vendedor1@gascontrol.com');
  console.log('   👨‍💻 Vendedor 2: vendedor2@gascontrol.com');
  console.log('   👨‍💻 Vendedor 3: vendedor3@gascontrol.com');

  console.log('\n💡 Próximos pasos:');
  console.log('   1. Inicia el servidor de desarrollo: npm run dev');
  console.log('   2. Ve a http://localhost:3000/log-in');
  console.log('   3. Inicia sesión con las credenciales de prueba');
  console.log('   4. Explora el sistema de ventas y inventario');
} catch (error) {
  console.error('❌ Error configurando datos de prueba:', error.message);
  console.log('\n🔧 Soluciones posibles:');
  console.log('   1. Verifica que PostgreSQL esté ejecutándose');
  console.log('   2. Verifica la variable de entorno DATABASE_URL');
  console.log('   3. Asegúrate de que Supabase CLI esté instalado');
  console.log('   4. Verifica que el archivo insert-test-data.sql existe');
  process.exit(1);
}
