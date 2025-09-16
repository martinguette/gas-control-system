// =====================================================
// SCRIPT DE PRUEBA PARA SISTEMA DE INVENTARIO
// =====================================================
// Ejecutar con: node scripts/test-inventory.js

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (usa tus propias credenciales)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.log('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInventorySystem() {
  console.log('🧪 Iniciando pruebas del sistema de inventario...\n');

  try {
    // 1. Verificar conexión a la base de datos
    console.log('1️⃣ Verificando conexión a la base de datos...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Error de conexión:', profilesError.message);
      return;
    }
    console.log('✅ Conexión exitosa a la base de datos\n');

    // 2. Verificar estructura de tablas
    console.log('2️⃣ Verificando estructura de tablas...');
    
    // Verificar inventory_full
    const { data: fullInventory, error: fullError } = await supabase
      .from('inventory_full')
      .select('*');
    
    if (fullError) {
      console.error('❌ Error en inventory_full:', fullError.message);
    } else {
      console.log('✅ Tabla inventory_full accesible');
      console.log(`   - Registros encontrados: ${fullInventory.length}`);
    }

    // Verificar inventory_empty
    const { data: emptyInventory, error: emptyError } = await supabase
      .from('inventory_empty')
      .select('*');
    
    if (emptyError) {
      console.error('❌ Error en inventory_empty:', emptyError.message);
    } else {
      console.log('✅ Tabla inventory_empty accesible');
      console.log(`   - Registros encontrados: ${emptyInventory.length}`);
    }

    // 3. Verificar datos iniciales
    console.log('\n3️⃣ Verificando datos iniciales...');
    
    const expectedTypes = ['33lb', '40lb', '100lb'];
    const fullTypes = fullInventory.map(item => item.type);
    const emptyTypes = emptyInventory.map(item => item.type);
    
    console.log('Tipos esperados:', expectedTypes);
    console.log('Tipos en inventory_full:', fullTypes);
    console.log('Tipos en inventory_empty:', emptyTypes);
    
    const missingFullTypes = expectedTypes.filter(type => !fullTypes.includes(type));
    const missingEmptyTypes = expectedTypes.filter(type => !emptyTypes.includes(type));
    
    if (missingFullTypes.length === 0) {
      console.log('✅ Todos los tipos están en inventory_full');
    } else {
      console.log('❌ Tipos faltantes en inventory_full:', missingFullTypes);
    }
    
    if (missingEmptyTypes.length === 0) {
      console.log('✅ Todos los tipos están en inventory_empty');
    } else {
      console.log('❌ Tipos faltantes en inventory_empty:', missingEmptyTypes);
    }

    // 4. Mostrar resumen actual
    console.log('\n4️⃣ Resumen actual del inventario:');
    
    console.log('\n📦 Cilindros Llenos:');
    fullInventory.forEach(item => {
      console.log(`   - ${item.type}: ${item.quantity} unidades ($${item.unit_cost} c/u)`);
    });
    
    console.log('\n📦 Cilindros Vacíos:');
    emptyInventory.forEach(item => {
      console.log(`   - ${item.type} ${item.brand} ${item.color}: ${item.quantity} unidades`);
    });

    // 5. Calcular estadísticas
    console.log('\n5️⃣ Estadísticas calculadas:');
    
    const totalFull = fullInventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalEmpty = emptyInventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = fullInventory.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    
    console.log(`   - Total cilindros llenos: ${totalFull}`);
    console.log(`   - Total cilindros vacíos: ${totalEmpty}`);
    console.log(`   - Valor total del inventario: $${totalValue.toLocaleString()}`);

    console.log('\n🎉 Pruebas completadas exitosamente!');
    console.log('\n📝 Próximos pasos para probar en la UI:');
    console.log('   1. Ve a http://localhost:3000/dashboard/admin/inventory');
    console.log('   2. Haz clic en "Gestionar Inventario"');
    console.log('   3. Prueba agregar, restar y establecer cantidades');
    console.log('   4. Verifica que los stats se actualicen en tiempo real');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
}

// Ejecutar las pruebas
testInventorySystem();
