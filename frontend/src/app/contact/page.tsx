import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, MapPin, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col bg-bg-app">
      <Navbar />
      
      <section className="pt-40 pb-20 px-6 relative z-10 flex-1">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 tracking-tight text-white">
              Contact <span className="text-gradient-gold">Concierge</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Our dedicated investment support team is available during standard business hours to assist you with elite asset acquisition and vault management.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-emerald-950/60 backdrop-blur-xl border border-gold-500/20 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
              <h3 className="text-2xl font-heading font-semibold text-white mb-6">Send a Direct Message</h3>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                    <input type="text" placeholder="John Doe" className="w-full bg-bg-app/50 border border-gold-500/20 focus:border-gold-500/60 text-text-primary rounded-xl py-3.5 px-4 outline-none transition-all placeholder:text-gray-600 focus:shadow-gold-glow" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Phone Number</label>
                    <input type="tel" placeholder="+91 9065 415 619" className="w-full bg-emerald-1000/50 border border-gold-500/20 focus:border-gold-500/60 text-white rounded-xl py-3.5 px-4 outline-none transition-all placeholder:text-gray-600 focus:shadow-gold-glow" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                  <input type="email" placeholder="invest@example.com" className="w-full bg-emerald-1000/50 border border-gold-500/20 focus:border-gold-500/60 text-white rounded-xl py-3.5 px-4 outline-none transition-all placeholder:text-gray-600 focus:shadow-gold-glow" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Your Message</label>
                  <textarea rows={4} placeholder="How can we assist you with your investment?" className="w-full bg-emerald-1000/50 border border-gold-500/20 focus:border-gold-500/60 text-white rounded-xl py-3 px-4 outline-none transition-all placeholder:text-gray-600 resize-none focus:shadow-gold-glow"></textarea>
                </div>
                <Button className="w-full py-4 text-base">Send Inquiry <MessageSquare className="w-4 h-4 ml-2" /></Button>
              </form>
            </div>

            {/* Direct Info & Map */}
            <div className="flex flex-col gap-8 flex-1">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-emerald-950/40 border border-gold-500/10 p-6 rounded-2xl flex flex-col items-start gap-4 hover:border-gold-500/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-bg-app border border-gold-500/20 flex items-center justify-center text-gold-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium mb-1">Direct Line</p>
                    <p className="text-lg font-semibold text-white">+91 9065 415 619</p>
                  </div>
                </div>
                
                <div className="bg-emerald-950/40 border border-gold-500/10 p-6 rounded-2xl flex flex-col items-start gap-4 hover:border-gold-500/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-emerald-1000 border border-gold-500/20 flex items-center justify-center text-gold-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium mb-1">Email Desk</p>
                    <p className="text-md font-semibold text-white break-all">contact@royalgoldtraders.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-950/40 border border-gold-500/10 p-8 rounded-2xl flex-1 flex flex-col">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-1000 border border-gold-500/20 shrink-0 flex items-center justify-center text-gold-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Headquarters</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      B-19, 2nd Floor, Above Airtel Office<br />
                      PC Colony, Near Lohiya Park<br />
                      Kankarbagh, Patna - 800020
                    </p>
                  </div>
                </div>

                <div className="w-full h-[250px] lg:h-[280px] rounded-xl overflow-hidden border border-gold-500/20 shadow-lg shadow-black/50 relative mt-2">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3598.140465404367!2d85.14619647448752!3d25.600248277453648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed59b596e3bf81%3A0x988ccb3ba5c45119!2sRoyal%20Gold%20Traders!5e0!3m2!1sen!2sin!4v1773363664091!5m2!1sen!2sin" 
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}


