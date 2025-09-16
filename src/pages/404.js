import Link from 'next/link';
import { Home } from 'lucide-react';

export default function Custom404() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Non Trouvée</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Désolé, la page que vous recherchez n'existe pas.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Home className="mr-2 h-5 w-5" />
                    Retour à l'accueil
                </Link>
            </div>
        </div>
    );
}