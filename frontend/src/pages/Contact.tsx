import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MapPin, Phone } from "lucide-react";

const Contact = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 pb-16">
                <section className="container mx-auto px-6 mb-16">
                    <div className="max-w-4xl mx-auto text-center mb-12" data-aos="fade-up">
                        <h1 className="text-4xl font-bold mb-4">Contact <span className="gold-text">Us</span></h1>
                        <p className="text-muted-foreground">We'd love to hear from you. Reach out to us for any queries.</p>
                    </div>

                    <div className="max-w-2xl mx-auto grid gap-8" data-aos="fade-up" data-aos-delay="100">
                        <div className="bg-card p-6 rounded-xl border border-border flex items-center gap-4">
                            <div className="bg-gold/10 p-3 rounded-full">
                                <Mail className="h-6 w-6 text-gold" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Email Support</h3>
                                <p className="text-muted-foreground">director@4amtech.in</p>
                                <p className="text-muted-foreground">contact@drkanchan.in</p>
                            </div>
                        </div>

                        <div className="bg-card p-6 rounded-xl border border-border flex items-center gap-4">
                            <div className="bg-gold/10 p-3 rounded-full">
                                <MapPin className="h-6 w-6 text-gold" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Location</h3>
                                <p className="text-muted-foreground">Mumbai, India</p>
                            </div>
                        </div>

                        <div className="bg-card p-6 rounded-xl border border-border flex items-center gap-4">
                            <div className="bg-gold/10 p-3 rounded-full">
                                <Phone className="h-6 w-6 text-gold" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">WhatsApp Support</h3>
                                <p className="text-muted-foreground">+91 9004941194</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Contact;
