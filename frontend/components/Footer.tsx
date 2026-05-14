export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-800 border-t border-brand-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-brand-400">
          <p>© {currentYear} NBA Draft Model. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
