import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Button variant="outline" asChild className="mb-8">
        <Link href="/signup">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign Up
        </Link>
      </Button>
      <Card className="w-full max-w-3xl mx-auto shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold text-center">Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert">
          <p>Welcome to Plagiax!</p>
          
          <p>These terms and conditions outline the rules and regulations for the use of Plagiax's Website, located at [Your Website URL].</p>

          <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use Plagiax if you do not agree to take all of the terms and conditions stated on this page.</p>

          <h2 className="text-xl font-semibold mt-6">1. Interpretation and Definitions</h2>
          <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
          
          <h2 className="text-xl font-semibold mt-6">2. Intellectual Property Rights</h2>
          <p>Other than the content you own, under these Terms, Plagiax and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted limited license only for purposes of viewing the material contained on this Website.</p>

          <h2 className="text-xl font-semibold mt-6">3. Restrictions</h2>
          <p>You are specifically restricted from all of the following:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>publishing any Website material in any other media;</li>
            <li>selling, sublicensing and/or otherwise commercializing any Website material;</li>
            <li>publicly performing and/or showing any Website material;</li>
            <li>using this Website in any way that is or may be damaging to this Website;</li>
            <li>using this Website in any way that impacts user access to this Website;</li>
            <li>using this Website contrary to applicable laws and regulations, or in any way may cause harm to the Website, or to any person or business entity;</li>
            <li>engaging in any data mining, data harvesting, data extracting or any other similar activity in relation to this Website;</li>
            <li>using this Website to engage in any advertising or marketing.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">4. Your Content</h2>
          <p>In these Website Standard Terms and Conditions, “Your Content” shall mean any audio, video text, images or other material you choose to display on this Website. By displaying Your Content, you grant Plagiax a non-exclusive, worldwide irrevocable, sub licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.</p>
          <p>Your Content must be your own and must not be invading any third-party's rights. Plagiax reserves the right to remove any of Your Content from this Website at any time without notice.</p>
          
          <h2 className="text-xl font-semibold mt-6">5. No warranties</h2>
          <p>This Website is provided “as is,” with all faults, and Plagiax express no representations or warranties, of any kind related to this Website or the materials contained on this Website. Also, nothing contained on this Website shall be interpreted as advising you.</p>

          <h2 className="text-xl font-semibold mt-6">6. Limitation of liability</h2>
          <p>In no event shall Plagiax, nor any of its officers, directors and employees, shall be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. Plagiax, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.</p>

          <p className="mt-8 text-center text-muted-foreground">
            This is a placeholder document. Please replace with your actual Terms and Conditions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
