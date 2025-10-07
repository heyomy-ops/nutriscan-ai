import React from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const AuthScreen = () => {
    const [isLogin, setIsLogin] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const auth = getAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-500 tracking-tight">NutriScan AI</h1>
                    <p className="text-slate-400 mt-2">Your personal AI-powered nutrition coach.</p>
                </div>
                <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-100 text-center mb-6">{isLogin ? 'Log In' : 'Sign Up'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-slate-400 block mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-blue-500 outline-none text-slate-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-400 block mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-blue-500 outline-none text-slate-200"
                                required
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full p-4 bg-blue-600 text-white rounded-lg text-lg font-bold hover:bg-blue-500 transition-transform transform hover:scale-105 disabled:bg-slate-600"
                        >
                            {isLoading ? 'Processing...' : isLogin ? 'Log In' : 'Create Account'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-slate-400 mt-6">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-blue-400 hover:underline ml-1">
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;