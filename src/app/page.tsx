import Image from 'next/image';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const loginImage = PlaceHolderImages.find(
    (img) => img.id === 'login-background'
  );

  async function login(formData: FormData) {
    'use server';
    // In a real app, you would validate credentials and create a session.
    // For this demo, we'll set a mock cookie.
    const name = formData.get('name') as string;
    cookies().set('user_name', name || 'Guest', { secure: true, httpOnly: true });
    redirect('/dashboard');
  }

  return (
    <main className="relative min-h-screen w-full">
      {loginImage && (
        <Image
          src={loginImage.imageUrl}
          alt={loginImage.description}
          fill
          className="object-cover"
          data-ai-hint={loginImage.imageHint}
          priority
        />
      )}
      <div className="relative z-10 flex min-h-screen items-center justify-center bg-background/50 backdrop-blur-sm">
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Logo />
            </div>
            <CardTitle className="font-headline text-3xl">Welcome to MindScript</CardTitle>
            <CardDescription>
              Your personal AI-powered mental wellness companion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={login} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-headline">Your Name</Label>
                <Input id="name" name="name" placeholder="Enter your name" required />
              </div>
              <Button type="submit" className="w-full font-headline text-lg">
                Begin Session
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
