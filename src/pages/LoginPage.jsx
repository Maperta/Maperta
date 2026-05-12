import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, registerUser } from '../lib/storage';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('请填写用户名和密码');
      return;
    }

    if (isRegister) {
      const result = registerUser(username, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } else {
      const result = loginUser(username, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    }
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-96 bg-[#1a1a2e] border border-white/10 rounded-xl p-8">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          {isRegister ? '注册' : '登录'}
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">用户名</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-[#e94560] text-white rounded-lg font-medium cursor-pointer border-none hover:bg-[#c0392b] transition-colors"
          >
            {isRegister ? '注册' : '登录'}
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
            {isRegister ? '已有账号？点此登录' : '没有账号？点此注册'}
          </button>
        </div>

        <div className="text-center mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-600">
            注意：这是一个模拟登录系统，数据存储在浏览器本地。
          </p>
        </div>
      </div>
    </div>
  );
}
