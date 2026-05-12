import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, getContributions, logoutUser } from '../lib/storage';
import { useI18n } from '../lib/i18n';

export default function ProfilePage() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [contributions, setContributions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      navigate('/login');
      return;
    }
    setUser(u);
    const all = getContributions();
    setContributions(all.filter((c) => c.username === u.username));
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  if (!user) return null;

  const statusMap = {
    pending: { label: t('community_status_pending'), color: 'text-yellow-400' },
    approved: { label: t('community_status_approved'), color: 'text-green-400' },
    rejected: { label: t('community_status_rejected'), color: 'text-red-400' },
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#e94560] rounded-full flex items-center justify-center text-2xl text-white">
              👤
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white m-0">{user.username}</h1>
              <p className="text-gray-500 mt-1">
                {t('profile_joined')} {new Date(user.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-[#e94560]">
              {user.contributions || 0}
            </div>
            <div className="text-gray-500 text-sm mt-1">{t('profile_contributions')}</div>
          </div>
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-[#e94560]">
              {contributions.filter((c) => c.status === 'approved').length}
            </div>
            <div className="text-gray-500 text-sm mt-1">{t('profile_approved')}</div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-4">{t('profile_my_contributions')}</h2>
        {contributions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>{t('profile_empty')}</p>
            <Link
              to="/community"
              className="text-[#e94560] no-underline hover:underline text-sm mt-2 inline-block"
            >
              {t('profile_go_contribute')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {contributions.map((c) => (
              <div
                key={c.id}
                className="bg-[#1a1a2e] border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${statusMap[c.status]?.color}`}>
                      {statusMap[c.status]?.label}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {new Date(c.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {t('community_target')}{c.targetName} | {t('community_modify')}{c.field} → {c.newValue}
                </div>
                {c.summary && (
                  <div className="text-sm text-gray-500 mt-1">{t('community_note')}{c.summary}</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center pt-8 pb-4">
          <button
            onClick={handleLogout}
            className="px-6 py-2 border border-red-500/30 text-red-400 rounded-lg cursor-pointer bg-transparent hover:bg-red-500/10 transition-colors"
          >
            {t('profile_logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
