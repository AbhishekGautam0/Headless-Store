import { Banner } from '@/components/shared/banner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Metadata } from 'next';
import { Mail, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - Shopify Headless Express',
  description: 'Get in touch with us for any inquiries or support.',
};

export default function ContactPage() {
  // This is a UI-only form. For actual submission, use Server Actions or an API.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert('Form submitted (demo only)!');
  };

  return (
    <>
      <Banner
        title="Get In Touch"
        subtitle="We'd love to hear from you. Reach out with any questions or feedback."
      />

      <section className="py-12 md:py-20">
        <div className="page-width grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Contact Information</h2>
            <p className="text-lg text-muted-foreground">
              Fill out the form or contact us directly through one of the channels below. Our team is ready to assist you.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:support@shopifyexpress.com" className="hover:text-primary">support@shopifyexpress.com</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <a href="tel:+1234567890" className="hover:text-primary">+1 (234) 567-890</a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span>123 Fashion Ave, Style City, NY 10001</span>
              </div>
            </div>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>We typically respond within 24-48 hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john.doe@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Question about an order" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Your message..." rows={5} required />
                </div>
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
