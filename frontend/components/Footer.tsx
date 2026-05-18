import { ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-border mt-auto bg-card/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
              © {currentYear} NBA Draft Model <span className="text-primary mx-2">▪</span> Built with XGBoost & Next.js
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors font-bold uppercase tracking-wider"
            >
              <ExternalLink size={14} />
              GitHub
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors font-bold uppercase tracking-wider"
            >
              <ExternalLink size={14} />
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
