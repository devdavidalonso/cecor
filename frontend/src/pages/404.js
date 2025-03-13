import Link from 'next/link';
import Head from 'next/head';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Página Não Encontrada | CECOR</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-100 p-3 rounded-full">
              <HiOutlineExclamationCircle className="h-16 w-16 text-yellow-600" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Página Não Encontrada
          </h1>
          
          <p className="text-gray-600 mb-8">
            A página que você está procurando não existe ou foi removida.
          </p>
          
          <div className="space-y-4">
            <Button
              as={Link}
              href="/"
              variant="primary"
              className="w-full"
            >
              Voltar para Página Inicial
            </Button>
            
            <Button
              as="a"
              href="mailto:suporte@cecor.edu.br"
              variant="secondary"
              className="w-full"
            >
              Contatar Suporte
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}