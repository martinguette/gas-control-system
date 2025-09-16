'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Fuel, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const emailFromUrl = searchParams.get('email') || '';
  const { login, authState } = useSupabaseAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailFromUrl,
      password: '',
    },
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      router.push('/dashboard');
    }
  }, [authState.isAuthenticated, authState.user, router]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await login(data.email, data.password);
      // La redirección se maneja automáticamente en el useEffect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Fuel className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              Gas Control
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {message && (
            <Alert
              variant={
                message.includes('exitosamente') ? 'default' : 'destructive'
              }
            >
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form
              className="space-y-4"
              autoComplete="off"
              data-form-type="other"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="h-11"
                        disabled={isSubmitting}
                        autoComplete="email"
                        data-form-type="other"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          className="h-11 pr-10"
                          disabled={isSubmitting}
                          autoComplete="current-password"
                          data-form-type="other"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isSubmitting}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-normal text-primary hover:underline"
                onClick={() => router.push('/sign-up')}
              >
                Regístrate aquí
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
