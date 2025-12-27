import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <Link to="/" className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <Leaf className="h-6 w-6 text-gold" />
              <span className="text-xl font-bold gold-text">Dr. Kanchan Suthar</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Clinical Nutritionist
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/about" className="text-muted-foreground hover:text-gold transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-gold transition-colors">
              Contact
            </Link>
            <Link to="/privacy-policy" className="text-muted-foreground hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-gold transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Dr. Kanchan Suthar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
