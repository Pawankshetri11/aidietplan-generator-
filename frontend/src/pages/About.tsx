import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Star, Users, Award } from "lucide-react";

const About = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 pb-16">
                {/* Hero Section */}
                <section className="container mx-auto px-6 mb-20">
                    <div className="max-w-4xl mx-auto text-center" data-aos="fade-up">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">About <span className="gold-text">Dr. Kanchan Suthar</span></h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Empowering individuals to achieve their health goals through science-backed nutrition and personalized care.
                        </p>
                    </div>
                </section>

                {/* Profile Section */}
                <section className="container mx-auto px-6 mb-20" data-aos="fade-up" data-aos-delay="100">
                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                        <div className="bg-card border border-gold/20 rounded-2xl p-8 shadow-xl">
                            <h3 className="text-2xl font-bold mb-4 gold-text">Dr. Kanchan Suthar</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Award className="w-5 h-5 text-gold mt-1" />
                                    <span>Specialist in Diabetes, Thyroid, and PCOS Reversal</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Users className="w-5 h-5 text-gold mt-1" />
                                    <span>Helped 1500+ clients transform their lives</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Star className="w-5 h-5 text-gold mt-1" />
                                    <span>5-Star Rated Plans based on Evidence-Based Science</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">Our Philosophy</h2>
                            <p className="text-muted-foreground">
                                We believe that diet shouldn't be about starvation. It should be about nourishment.
                                Our approach focuses on correcting hormonal imbalances and metabolism through right food choices,
                                not just calorie counting.
                            </p>
                            <p className="text-muted-foreground">
                                Whether you are struggling with weight loss, PCOS, or managing diabetes, our plans are designed
                                to fit your lifestyle and deliver sustainable results.
                            </p>
                            <ul className="space-y-2">
                                {["No Starvation Diets", "Home-Cooked Meals", "Sustainable Lifestyle Changes", "24/7 Support"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default About;
