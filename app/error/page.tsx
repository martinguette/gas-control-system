'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const message =
    searchParams.get('message') || 'Ha ocurrido un error inesperado';
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-destructive rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              Error
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {message}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push('/log-in')} className="w-full">
              Volver al Login
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/sign-up')}
              className="w-full"
            >
              Intentar Registrarse
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
