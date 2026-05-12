import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getContributions, submitContribution, getCurrentUser } from '../lib/storage';
import { useI18n } from '../lib/i18n';

export default function CommunityPage() {
  const { t } = useI18n();
  const [contributions, setContributions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    targetType: 'building',
    targetName: '',
    field: '',
    newValue: '',
    summary: '',
  });

  const user = getCurrentUser();

  useEffect(() => {
    setContributions(getContributions());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert(t('community_login_first'));
      return;
    }
    if (!form.targetName || !form.field || !form.newValue) {
      alert(t('login_error_empty'));
      return;
    }
    submitContribution({
      username: user.username,
      ...form,
    });
    setContributions(getContributions());
    setShowForm(false);
    setForm({ targetType: 'building', targetName: '', field: '', newValue: '', summary: '' });
  };

  const statusMap = {
    pending: { label: t('community_status_pending'), color: 'text-yellow-400' },
    approved: { label: t('community_status_approved'), color: 'text-green-400' },
    rejected: { label: t('community_status_rejected'), color: 'text-red-400' },
  };

  const typeMap = {
    building: t('community_type_building'),
    district: t('community_type_district'),
    page: t('community_type_page'),
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] px-8 py-12">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white m-0">{t('community_title')}</h1>
            <p className="text-gray-400 text-lg mt-3">{t('community_subtitle')}</p>
          </div>
          {user ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-5 py-2.5 bg-[#e94560] text-white rounded-xl font-medium cursor-pointer border-none hover:bg-[#c0392b] transition-colors"
            >
              {showForm ? t('community_cancel') : t('community_submit_new')}
            </button>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 bg-[#e94560] text-white rounded-xl font-medium no-underline"
            >
              {t('community_login_first')}
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        {showForm && user && (
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4">{t('community_submit_new')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('community_target_type')}</label>
                  <select
                    value={form.targetType}
                    onChange={(e) => setForm({ ...form, targetType: e.target.value })}
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="building">{t('community_type_building')}</option>
                    <option value="district">{t('community_type_district')}</option>
                    <option value="page">{t('community_type_page')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('community_target_name')}</label>
                  <input
                    value={form.targetName}
                    onChange={(e) => setForm({ ...form, targetName: e.target.value })}
                    placeholder={t('community_target_name')}
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('community_field')}</label>
                  <input
                    value={form.field}
                    onChange={(e) => setForm({ ...form, field: e.target.value })}
                    placeholder={t('community_field')}
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('community_new_value')}</label>
                  <input
                    value={form.newValue}
                    onChange={(e) => setForm({ ...form, newValue: e.target.value })}
                    placeholder={t('community_new_value')}
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t('community_summary')}</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder={t('community_summary_placeholder')}
                  rows={3}
                  className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#e94560] text-white rounded-lg font-medium cursor-pointer border-none hover:bg-[#c0392b] transition-colors"
              >
                {t('community_submit_btn')}
              </button>
            </form>
          </div>
        )}

        <h2 className="text-lg font-bold text-white mb-4">{t('community_records')}</h2>
        {contributions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">{t('community_empty')}</p>
            <p className="text-sm">{t('community_empty_hint')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contributions.map((c) => (
              <div
                key={c.id}
                className="bg-[#1a1a2e] border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">{c.username}</span>
                    <span className={`text-xs ${statusMap[c.status]?.color}`}>
                      {statusMap[c.status]?.label}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {new Date(c.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  <span className="text-gray-500">{t('community_target')}</span>
                  {c.targetName} ({typeMap[c.targetType] || c.targetType})
                </div>
                <div className="text-sm text-gray-400">
                  <span className="text-gray-500">{t('community_modify')}</span>
                  {c.field} → {c.newValue}
                </div>
                {c.summary && (
                  <div className="text-sm text-gray-500 mt-1">{t('community_note')}{c.summary}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
