import { MessageCircle, UserCheck, CreditCard, FileText } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    title: "Smart Consultation",
    description: "Complete a quick 2-minute assessment of your body type, metabolism, and lifestyle.",
  },
  {
    icon: UserCheck,
    title: "Metabolic Analysis",
    description: "Our system instantly analyzes your data to formulate a precise 6-meal protocol.",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "Activate your journey with instant UPI/Card payment and get immediate access.",
  },
  {
    icon: FileText,
    title: "Instant Dashboard",
    description: "Access your personalized plan, professional summaries, and dynamic daily support instantly.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 relative" id="how-it-works">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/5 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2
            data-aos="fade-up"
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            How It <span className="gold-text">Works</span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/50 via-gold to-gold/50" />

            {steps.map((step, index) => (
              <div
                key={index}
                data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                data-aos-delay={100 + index * 100}
                className={`flex items-center gap-8 mb-12 last:mb-0 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>

                {/* Icon */}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-card border-2 border-gold flex items-center justify-center shadow-[0_0_30px_hsl(43_74%_49%_/_0.3)]">
                  <step.icon className="h-8 w-8 text-gold" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>

                {/* Spacer for alignment */}
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
