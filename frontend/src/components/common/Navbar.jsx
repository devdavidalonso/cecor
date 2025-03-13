import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { HiMenu, HiX, HiHome, HiAcademicCap, HiUserCircle, HiLogout } from 'react-icons/hi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-indigo-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo e links de navegação principal */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-white font-bold text-xl">
                CECOR
              </Link>
            </div>
            {/* Links de navegação para desktop */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              {user && (
                <>
                  <Link 
                    href={isAdmin() ? "/admin/dashboard" : "/student/dashboard"} 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      router.pathname.includes('/dashboard') 
                        ? 'bg-indigo-800 text-white' 
                        : 'text-indigo-100 hover:bg-indigo-600'
                    }`}
                  >
                    <span className="flex items-center">
                      <HiHome className="mr-1" /> Dashboard
                    </span>
                  </Link>
                  
                  {isAdmin() ? (
                    <>
                      <Link 
                        href="/admin/courses" 
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          router.pathname.includes('/admin/courses') 
                            ? 'bg-indigo-800 text-white' 
                            : 'text-indigo-100 hover:bg-indigo-600'
                        }`}
                      >
                        <span className="flex items-center">
                          <HiAcademicCap className="mr-1" /> Cursos
                        </span>
                      </Link>
                      <Link 
                        href="/admin/users" 
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          router.pathname.includes('/admin/users') 
                            ? 'bg-indigo-800 text-white' 
                            : 'text-indigo-100 hover:bg-indigo-600'
                        }`}
                      >
                        <span className="flex items-center">
                          <HiUserCircle className="mr-1" /> Usuários
                        </span>
                      </Link>
                      <Link 
                        href="/admin/enrollments" 
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          router.pathname.includes('/admin/enrollments') 
                            ? 'bg-indigo-800 text-white' 
                            : 'text-indigo-100 hover:bg-indigo-600'
                        }`}
                      >
                        <span className="flex items-center">
                          <HiAcademicCap className="mr-1" /> Matrículas
                        </span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/student/courses" 
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          router.pathname.includes('/student/courses') 
                            ? 'bg-indigo-800 text-white' 
                            : 'text-indigo-100 hover:bg-indigo-600'
                        }`}
                      >
                        <span className="flex items-center">
                          <HiAcademicCap className="mr-1" /> Cursos
                        </span>
                      </Link>
                      <Link 
                        href="/student/enrollments" 
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          router.pathname.includes('/student/enrollments') 
                            ? 'bg-indigo-800 text-white' 
                            : 'text-indigo-100 hover:bg-indigo-600'
                        }`}
                      >
                        <span className="flex items-center">
                          <HiAcademicCap className="mr-1" /> Minhas Matrículas
                        </span>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Menu de usuário e botão de menu móvel */}
          <div className="flex items-center">
            {user ? (
              <div className="hidden md:ml-4 md:flex md:items-center">
                <div className="relative ml-3">
                  <div className="flex items-center">
                    <Link
                      href={isAdmin() ? "/admin/profile" : "/student/profile"}
                      className="text-indigo-100 hover:bg-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                    >
                      <HiUserCircle className="h-6 w-6 mr-1" />
                      <span>{user.name}</span>
                    </Link>
                    <button
                      onClick={logout}
                      className="ml-4 text-indigo-100 hover:bg-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                    >
                      <HiLogout className="mr-1" /> Sair
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex md:items-center md:ml-6">
                <Link 
                  href="/login" 
                  className="text-indigo-100 hover:bg-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="ml-3 bg-white text-indigo-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Registrar
                </Link>
              </div>
            )}
            
            {/* Botão do menu móvel */}
            <div className="flex md:hidden ml-2">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-indigo-100 hover:bg-indigo-600 focus:outline-none"
              >
                <span className="sr-only">Abrir menu</span>
                {isOpen ? <HiX className="block h-6 w-6" /> : <HiMenu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu móvel */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <Link 
                  href={isAdmin() ? "/admin/dashboard" : "/student/dashboard"} 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    router.pathname.includes('/dashboard') 
                      ? 'bg-indigo-800 text-white' 
                      : 'text-indigo-100 hover:bg-indigo-600'
                  }`}
                  onClick={toggleMenu}
                >
                  <span className="flex items-center">
                    <HiHome className="mr-2" /> Dashboard
                  </span>
                </Link>
                
                {isAdmin() ? (
                  <>
                    <Link 
                      href="/admin/courses" 
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        router.pathname.includes('/admin/courses') 
                          ? 'bg-indigo-800 text-white' 
                          : 'text-indigo-100 hover:bg-indigo-600'
                      }`}
                      onClick={toggleMenu}
                    >
                      <span className="flex items-center">
                        <HiAcademicCap className="mr-2" /> Cursos
                      </span>
                    </Link>
                    <Link 
                      href="/admin/users" 
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        router.pathname.includes('/admin/users') 
                          ? 'bg-indigo-800 text-white' 
                          : 'text-indigo-100 hover:bg-indigo-600'
                      }`}
                      onClick={toggleMenu}
                    >
                      <span className="flex items-center">
                        <HiUserCircle className="mr-2" /> Usuários
                      </span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/student/courses" 
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        router.pathname.includes('/student/courses') 
                          ? 'bg-indigo-800 text-white' 
                          : 'text-indigo-100 hover:bg-indigo-600'
                      }`}
                      onClick={toggleMenu}
                    >
                      <span className="flex items-center">
                        <HiAcademicCap className="mr-2" /> Cursos
                      </span>
                    </Link>
                    <Link 
                      href="/student/enrollments" 
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        router.pathname.includes('/student/enrollments') 
                          ? 'bg-indigo-800 text-white' 
                          : 'text-indigo-100 hover:bg-indigo-600'
                      }`}
                      onClick={toggleMenu}
                    >
                      <span className="flex items-center">
                        <HiAcademicCap className="mr-2" /> Minhas Matrículas
                      </span>
                    </Link>
                  </>
                )}
                
                <Link 
                  href={isAdmin() ? "/admin/profile" : "/student/profile"} 
                  className="block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-600"
                  onClick={toggleMenu}
                >
                  <span className="flex items-center">
                    <HiUserCircle className="mr-2" /> Perfil
                  </span>
                </Link>
                
                <button
                  onClick={() => {
                    logout();
                    toggleMenu();
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-600"
                >
                  <span className="flex items-center">
                    <HiLogout className="mr-2" /> Sair
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-600"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-600"
                  onClick={toggleMenu}
                >
                  Registrar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;