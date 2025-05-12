
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from 'next';
import { Building, FileText, Gavel, Info, Lightbulb, ShieldCheck, Target, Users, Languages, BrainCircuit } from "lucide-react";

export const metadata: Metadata = {
  title: 'About Plagiax',
  description: 'Learn more about Plagiax, our technology, commitment, and legal information.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-primary mb-4">
          About Plagiax
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover the story, technology, and commitment behind Plagiax – your trusted partner in ensuring content originality.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <InfoCard
          icon={<Building className="h-8 w-8 text-primary" />}
          title="Our Story"
          description="Plagiax is a revolutionary plagiarism detection platform born from the critical need to protect intellectual integrity in the digital age. Launched in 2024, our cutting-edge technology leverages advanced artificial intelligence and natural language processing to provide comprehensive originality scanning across academic, professional, and creative domains. We empower writers, researchers, and content creators with sophisticated tools that instantly detect similarities, track citations, and ensure the highest standards of original content creation, bridging the gap between technological innovation and academic excellence."
        />
        <InfoCard
          icon={<Lightbulb className="h-8 w-8 text-primary" />}
          title="Our Technology"
          description="Our proprietary algorithm combines advanced machine learning techniques with an extensive global database of academic papers, publications, online content, and historical documents. This allows us to provide:"
          items={[
            "Comprehensive similarity scanning",
            "Multi-language support",
            "Detailed originality reports",
            "Intelligent citation tracking",
            "Contextual content analysis",
          ]}
        />
        <InfoCard
          icon={<Target className="h-8 w-8 text-primary" />}
          title="Key Features"
          items={[
            "Instant plagiarism detection",
            "Detailed similarity percentage",
            "Source identification",
            "Academic and professional grade reports",
            "Seamless integration with learning management systems",
            "Cross-platform compatibility",
          ]}
        />
         <InfoCard
          icon={<Languages className="h-8 w-8 text-primary" />}
          title="Multi-Language Support"
          items={[
            "Comprehensive plagiarism checking across 50+ languages",
            "Intelligent translation and cross-linguistic similarity detection",
            "Preserves linguistic nuances and context",
          ]}
        />
        <InfoCard
          icon={<BrainCircuit className="h-8 w-8 text-primary" />}
          title="AI-Powered Content Analysis"
          items={[
            "Deep learning algorithms for contextual understanding",
            "Semantic similarity detection",
            "Paraphrase and disguised plagiarism identification",
          ]}
        />
      </div>

      <Card className="mb-16 shadow-lg rounded-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-10 w-10 text-primary" />
            <CardTitle className="text-3xl font-semibold">Our Commitment</CardTitle>
          </div>
          <CardDescription className="text-lg">
            We are committed to:
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
          <p>Protecting intellectual property.</p>
          <p>Supporting academic and professional integrity.</p>
          <p>Continuous technological innovation.</p>
          <p>User privacy and data security.</p>
          <p>Affordable and accessible plagiarism solutions.</p>
        </CardContent>
      </Card>
      
      <Card className="mb-16 shadow-lg rounded-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-10 w-10 text-primary" />
            <CardTitle className="text-3xl font-semibold">Our Team</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed">
            Plagiax is powered by a dynamic team of technology innovators, academic experts, and data scientists who are passionate about maintaining intellectual integrity. Our multidisciplinary professionals bring together expertise in artificial intelligence, machine learning, academic research, and software engineering to create a robust and intelligent plagiarism detection platform that serves educational and professional communities worldwide.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
           <div className="flex items-center gap-3 mb-2">
            <Gavel className="h-10 w-10 text-primary" />
            <CardTitle className="text-3xl font-semibold">Legal Information</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Important legal details regarding the use of Plagiax services.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <LegalSection title="Terms of Service">
            <p>By using Plagiax, users agree to our comprehensive Terms of Service, which outline responsible use, data handling, and platform guidelines.</p>
          </LegalSection>
          <Separator />
          <LegalSection title="Privacy Policy">
            <p>We are committed to protecting user data with state-of-the-art security measures and transparent data practices.</p>
          </LegalSection>
          <Separator />
          <LegalSection title="Intellectual Property">
           <p> All content, algorithms, software, and unique methodologies developed by Plagiax are protected under international intellectual property laws.</p>
          </LegalSection>
          <Separator />
          <LegalSection title="Copyright and Trademark">
            <p>© 2024-2025 Plagiax Technologies, Inc. All Rights Reserved.</p>
            <p className="mt-2"><strong>Trademark Notice:</strong> Plagiax™ is a registered trademark of Plagiax Technologies, Inc. All associated logos, software, and service names are exclusive trademarks of the company.</p>
          </LegalSection>
          <Separator />
          <LegalSection title="Disclaimer">
            <p>Plagiax provides originality detection tools. While we strive for maximum accuracy, users are responsible for final content verification and academic/professional compliance.</p>
          </LegalSection>
          <Separator />
          <LegalSection title="Licensing">
            <p>Our software is licensed, not sold. Usage is subject to our strict licensing agreements and terms of use.</p>
          </LegalSection>
          <Separator />
          <LegalSection title="Global Compliance">
            <p>Plagiax adheres to international data protection regulations, including GDPR, CCPA, and other global privacy standards.</p>
          </LegalSection>
          <Separator />
          <LegalSection title="Innovation Pledge">
            <p>We continuously evolve our technology to stay ahead of emerging writing technologies and maintain the highest standards of originality detection.</p>
          </LegalSection>
        </CardContent>
      </Card>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  items?: string[];
}

function InfoCard({ icon, title, description, items }: InfoCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl h-full flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4">
        <span className="p-3 bg-primary/10 rounded-full mt-1">
          {icon}
        </span>
        <div>
          <CardTitle className="text-2xl font-semibold mb-1">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {description && <p className="text-muted-foreground mb-4 text-base">{description}</p>}
        {items && (
          <ul className="space-y-2 text-base">
            {items.map((item, index) => (
              <li key={index} className="flex items-start">
                <Info className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
}

function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
      <div className="text-muted-foreground prose prose-sm sm:prose max-w-none dark:prose-invert">
        {children}
      </div>
    </div>
  );
}

