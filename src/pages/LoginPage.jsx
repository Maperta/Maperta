import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, registerUser } from '../lib/storage';
import { useI18n } from '../lib/i18n';

export default function LoginPage() {
  const { t } = useI18n();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError(t('login_error_empty'));
      return;
    }

    if (isRegister) {
      const result = registerUser(username, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(t('login_error_duplicate'));
      }
    } else {
      const result = loginUser(username, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(t('login_error_wrong'));
      }
    }
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-96 bg-[#1a1a2e] border border-white/10 rounded-xl p-8">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          {isRegister ? t('register_title') : t('login_title')}
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">{t('login_username')}</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('login_placeholder_username')}
              className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">{t('login_password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login_placeholder_password')}
              className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-[#e94560] text-white rounded-lg font-medium cursor-pointer border-none hover:bg-[#c0392b] transition-colors"
          >
            {isRegister ? t('register_btn') : t('login_btn')}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-sm text-gray-400 hover:text-white bg-transparent border-none cursor-pointer"
          >
            {isRegister ? t('login_switch_login') : t('login_switch_register')}
          </button>
        </div>

        <div className="text-center mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-600">{t('login_notice')}</p>
        </div>
      </div>
    </div>
  );
}
