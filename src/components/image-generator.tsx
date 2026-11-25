"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Download, Image as ImageIcon, Loader2, RefreshCw } from 'lucide-react';
import Image from 'next/image';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { generateImageAction } from '@/app/actions';

const formSchema = z.object({
  prompt: z.string().min(1, { message: 'Prompt cannot be empty.' }),
});

export default function ImageGenerator() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const handleGenerate = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setImageUrl(null);
    setErrorMessage(null);
    try {
      const result = await generateImageAction({ prompt: values.prompt });
      if (result.error) {
        setErrorMessage(result.error);
        throw new Error(result.error);
      }
      setImageUrl(result.imageUrl || null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error generating image',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    form.reset({ prompt: '' });
    setImageUrl(null);
    setErrorMessage(null);
  };
  
  const handleDownload = () => {
    if (!imageUrl) return;
    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `imagined-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error downloading image',
        description: 'Could not download the image. Please try again.',
      });
    }
  };


  return (
    <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2">
      <Card className="shadow-lg border-border/60">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">ImaginAI</CardTitle>
          <CardDescription className="text-base">
            Turn your ideas into stunning visuals. Describe what you want to see, and let our AI bring it to life.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerate)}>
            <CardContent>
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Your Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., A majestic lion wearing a crown, studio lighting, detailed"
                        className="min-h-[120px] resize-none text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleClear} disabled={isLoading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Image
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <Card className="flex items-center justify-center p-4 shadow-lg aspect-square border-border/60">
        <div className="w-full h-full relative">
          {isLoading ? (
            <Skeleton className="h-full w-full rounded-lg" />
          ) : imageUrl ? (
            <div className="relative h-full w-full group">
              <Image
                src={imageUrl}
                alt={form.getValues('prompt') || 'Generated image'}
                fill
                className="object-contain rounded-lg"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-10 w-10"
                onClick={handleDownload}
                aria-label="Download image"
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-muted-foreground">
              {errorMessage ? (
                <Alert variant="destructive" className="text-left">
                  <AlertTitle>Could not generate an image</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : null}
              <ImageIcon size={64} className="stroke-1" />
              <div>
                <p className="text-lg font-medium">Your image will appear here</p>
                <p className="text-sm">Start by entering a prompt and clicking &quot;Generate&quot;.</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
