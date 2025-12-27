import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Star } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "30-Day Custom",
    planKey: "starter",
    price: Number(import.meta.env.VITE_PLAN_STARTER_PRICE) || 499,
    originalPrice: 1499,
    description: "Ideal for weight-loss, PCOS, thyroid, diabetes, hormonal imbalance.",
    features: [
      "Daily meal structure with exact portions",
      "Swap options for flexibility",
      "Water & lifestyle schedule",
      "Lifetime access PDF",
    ],
    featured: true,
    badge: "MOST POPULAR",
  },
  {
    name: "7-Day Ultimate",
    planKey: "premium",
    price: Number(import.meta.env.VITE_PLAN_PREMIUM_PRICE) || 799,
    originalPrice: 1899,
    description: "Deep analysis & quick reset. Full macro-breakdown.",
    features: [
      "Complete macro & micro nutrient breakdown",
      "Hormonal optimization strategies",
      "Scientific explanations for each meal",
    ],
    featured: false,
    badge: null,
  },
  {
    name: "30-Day Ultimate",
    planKey: "elite",
    price: Number(import.meta.env.VITE_PLAN_ELITE_PRICE) || 2499,
    originalPrice: 5999,
    description: "Deep structure + weekly metabolic tweaks. Best for complex issues.",
    features: [
      "Detailed 30-day meal structure",
      "Weekly metabolic adjustments",
      "Priority doctor review",
      "Follow-up guidance notes",
    ],
    featured: false,
    badge: "PREMIUM",
  },
];

const PricingSection = () => {
  return (
    <section className="py-24 relative" id="pricing">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2
            data-aos="fade-up"
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Choose Your <span className="gold-text">Strategy</span>
          </h2>
          <p
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            All plans manually reviewed by Dr. Kanchan.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              variant={plan.featured ? "featured" : "pricing"}
              data-aos="fade-up"
              data-aos-delay={100 + index * 100}
              className={`relative flex flex-col h-full ${plan.featured ? "md:scale-105 z-10 border-gold shadow-2xl" : ""}`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light text-primary-foreground text-sm font-semibold whitespace-nowrap">
                    {plan.badge === "PREMIUM" ? <Star className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
                    {plan.badge}
                  </div>
                </div>
              )}

              <CardHeader className="text-center pt-10">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="mt-2 min-h-[40px]">{plan.description}</CardDescription>
                <div className="mt-6">
                  <span className="text-lg text-muted-foreground line-through mr-2">₹{plan.originalPrice}</span>
                  <span className="text-5xl font-bold gold-text">₹{plan.price}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-6 flex-grow">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-gold" />
                      </div>
                      <span className="text-sm text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6 mt-auto">
                <Link to={`/get-started?plan=${plan.planKey}`} className="w-full">
                  <Button
                    variant={plan.featured ? "luxury" : "luxuryOutline"}
                    size="lg"
                    className="w-full"
                  >
                    {plan.badge === "PREMIUM" ? "Go Premium" : "Select Plan"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
