import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Users, Clock, Shield, Star } from "lucide-react";
import heroFood from "@/assets/hero-food.jpg";

const stats = [
  { icon: Users, value: "1500+", label: "Clients Helped" },
  { icon: Clock, value: "24h", label: "Delivery Time" },
  { icon: Shield, value: "100%", label: "Doctor Reviewed" },
  { icon: Star, value: "5★", label: "Rated Plans" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroFood}
          alt="Premium healthy food arrangement"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60" />
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      {/* Gold accent lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Column: Content */}
          <div className="text-center lg:text-left space-y-6">
            {/* Doctor Name */}
            <div
              data-aos="fade-down"
              data-aos-delay="100"
              className="mb-2"
            >
              <span className="text-xl md:text-2xl font-semibold gold-text">Dr. Kanchan Suthar</span>
            </div>

            {/* Main Heading */}
            <h1
              data-aos="fade-up"
              data-aos-delay="200"
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
            >
              Personalised <span className="gold-text">30-Day</span><br className="hidden lg:block" /> Diet Plan
            </h1>

            {/* Subheading */}
            <p
              data-aos="fade-up"
              data-aos-delay="300"
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0"
            >
              Medical-grade nutrition for PCOS, Thyroid, Diabetes, Fatty Liver & sustainable
              fat-loss — no starvation, only science.
            </p>

            {/* Badges */}
            <div
              data-aos="fade-up"
              data-aos-delay="350"
              className="flex flex-wrap justify-center lg:justify-start gap-3"
            >
              {["Doctor-reviewed", "Evidence-based", "Delivered in 24h"].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 backdrop-blur-sm">
                  <Check className="h-4 w-4 text-gold" />
                  <span className="text-sm text-foreground font-medium">{badge}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div
              data-aos="fade-up"
              data-aos-delay="400"
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-4"
            >
              <Link to="/get-started">
                <Button variant="luxury" size="xl" className="group">
                  BOOK PLAN — ₹499
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="luxuryOutline" size="xl">
                  View All Plans
                </Button>
              </a>
            </div>
          </div>

          {/* Right Column: Special Offer Card */}
          <div
            data-aos="fade-left"
            data-aos-delay="450"
            className="w-full max-w-md mx-auto lg:max-w-sm lg:ml-auto"
          >
            <div className="relative p-6 md:p-8 rounded-3xl border-2 border-gold bg-card/80 backdrop-blur-md shadow-2xl hover:shadow-gold/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full text-center">
                <span className="px-6 py-2 rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light text-primary-foreground text-sm font-bold shadow-lg">
                  SPECIAL LAUNCH OFFER
                </span>
              </div>

              <div className="mt-4 text-center space-y-4">
                <h3 className="text-2xl font-bold">30-Day Custom Plan</h3>

                <div className="flex items-center justify-center gap-4">
                  <span className="text-xl text-muted-foreground line-through decoration-red-500/50">₹1499</span>
                  <div className="flex flex-col items-start">
                    <span className="text-5xl font-bold gold-text">₹499</span>
                    <span className="text-xs text-green-500 font-medium">Save 66% Today</span>
                  </div>
                </div>

                <div className="space-y-3 text-left bg-background/50 p-4 rounded-xl border border-border/50">
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-gold mt-1 shrink-0" />
                    <span>Lifetime Access PDF</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-gold mt-1 shrink-0" />
                    <span>Personalized for your body type</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-gold mt-1 shrink-0" />
                    <span>Detailed Meal Timeline</span>
                  </div>
                </div>

                <Link to="/get-started" className="block w-full">
                  <Button variant="luxury" size="lg" className="w-full text-lg shadow-gold/20 shine-effect">
                    Claim Offer Now
                  </Button>
                </Link>

                <p className="text-xs text-center text-muted-foreground">
                  Offer expires soon. Secure your spot.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats - Full Width Below */}
        <div className="max-w-4xl mx-auto mt-16 lg:mt-24">
          <div
            data-aos="fade-up"
            data-aos-delay="500"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 md:p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-gold/10 hover:border-gold/30 transition-all hover:bg-card/50">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gold/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-gold" />
                </div>
                <div className="text-2xl md:text-3xl font-bold gold-text mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
