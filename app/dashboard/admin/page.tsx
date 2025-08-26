"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, TrendingUp, AlertTriangle } from "lucide-react"
import AdminLayout from "@/components/layout/admin-layout"
import { useAuth } from "@/hooks/use-auth"

export default function AdminDashboard() {
  const { authState } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push("/")
    } else if (authState.user?.role !== "jefe") {
      router.push("/dashboard/vendor")
    }
  }, [authState, router])

  if (authState.isLoading || !authState.isAuthenticated || authState.user?.role !== "jefe") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">¡Bienvenido Admin!</h1>
          <p className="text-lg text-muted-foreground">Tus credenciales fueron verificadas exitosamente</p>
          <Badge variant="secondary" className="text-sm">
            Rol: Jefe - Acceso Completo
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">+20.1% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">+180.1% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Órdenes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">+19% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 críticas, 1 advertencia</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Panel de Control Principal</CardTitle>
              <CardDescription>Gestión completa del sistema de gas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Funciones Administrativas</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Gestión de usuarios y permisos</li>
                  <li>• Configuración del sistema</li>
                  <li>• Reportes avanzados</li>
                  <li>• Monitoreo en tiempo real</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximas Integraciones</CardTitle>
              <CardDescription>Funcionalidades preparadas para desarrollo backend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Arquitectura Escalable</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• API REST endpoints</li>
                  <li>• Base de datos SQL</li>
                  <li>• Autenticación JWT</li>
                  <li>• Middleware de seguridad</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
