import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="text-indigo-700 font-bold text-xl">
              CECOR
            </Link>
            <p className="text-gray-600 text-sm mt-1">
              Sistema de Gestão Educacional
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-gray-800 font-medium mb-2">Links Rápidos</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-indigo-600 text-sm">
                    Início
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-600 hover:text-indigo-600 text-sm">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-gray-600 hover:text-indigo-600 text-sm">
                    Cadastro
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="text-center md:text-left">
              <h3 className="text-gray-800 font-medium mb-2">Contato</h3>
              <ul className="space-y-1">
                <li className="text-gray-600 text-sm">contato@cecor.edu.br</li>
                <li className="text-gray-600 text-sm">(11) 9999-9999</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} CECOR. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;