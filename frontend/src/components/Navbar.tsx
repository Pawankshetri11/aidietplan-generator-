import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("luxediet_auth_user");
    localStorage.removeItem("luxediet_user");
    setUser(null);
    navigate("/");
  };

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("luxediet_auth_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    checkUser();
    checkUser();
  }, [location.pathname]);

  // Handle Hash Scroll
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#faqs", label: "FAQs" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Leaf className="h-8 w-8 text-gold transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold gold-text leading-tight">Dr. Kanchan</span>
              <span className="text-xs text-muted-foreground leading-tight">Diet Plans</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors duration-300 hover:text-gold ${location.pathname === link.href ? "text-gold" : "text-foreground/80"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors duration-300 hover:text-gold ${location.pathname === "/dashboard" ? "text-gold" : "text-foreground/80"
                    }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className={`text-sm font-medium transition-colors duration-300 hover:text-gold ${location.pathname === "/auth" ? "text-gold" : "text-foreground/80"
                  }`}
              >
                Login
              </Link>
            )}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link to="/get-started">
              <Button variant="luxury" size="lg">
                Book Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-foreground/80 hover:text-gold transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium text-foreground/80 hover:text-gold transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="text-sm font-medium text-foreground/80 hover:text-gold transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              )}
              <Link to="/get-started" onClick={() => setIsOpen(false)}>
                <Button variant="luxury" size="lg" className="w-full">
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
