import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getContributions, submitContribution, getCurrentUser } from '../lib/storage';

export default function CommunityPage() {
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
      alert('请先登录再提交贡献');
      return;
    }
    if (!form.targetName || !form.field || !form.newValue) {
      alert('请填写完整的贡献信息');
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
    pending: { label: '审核中', color: 'text-yellow-400' },
    approved: { label: '已通过', color: 'text-green-400' },
    rejected: { label: '已拒绝', color: 'text-red-400' },
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] px-8 py-12">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white m-0">社区贡献</h1>
            <p className="text-gray-400 text-lg mt-3">
              参与编辑深圳城市信息，共同完善历史资料
            </p>
          </div>
          {user ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-5 py-2.5 bg-[#e94560] text-white rounded-xl font-medium cursor-pointer border-none hover:bg-[#c0392b] transition-colors"
            >
              {showForm ? '取消' : '提交新贡献'}
            </button>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 bg-[#e94560] text-white rounded-xl font-medium no-underline"
            >
              登录后参与编辑
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* 提交表单 */}
        {showForm && user && (
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4">提交新贡献</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">目标类型</label>
                  <select
                    value={form.targetType}
                    onChange={(e) => setForm({ ...form, targetType: e.target.value })}
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="building">建筑</option>
                    <option value="district">区域</option>
                    <option value="page">介绍页</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">目标名称</label>
                  <input
                    value={form.targetName}
                    onChange={(e) => setForm({ ...form, targetName: e.target.value })}
                    placeholder="如：平安金融中心"
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">修改字段</label>
                  <input
                    value={form.field}
                    onChange={(e) => setForm({ ...form, field: e.target.value })}
                    placeholder="如：建成时间、高度"
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">修改内容</label>
                  <input
                    value={form.newValue}
                    onChange={(e) => setForm({ ...form, newValue: e.target.value })}
                    placeholder="新的信息内容"
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">修改说明</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="请说明为什么需要修改这条信息..."
                  rows={3}
                  className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#e94560] text-white rounded-lg font-medium cursor-pointer border-none hover:bg-[#c0392b] transition-colors"
              >
                提交贡献
              </button>
            </form>
          </div>
        )}

        {/* 贡献列表 */}
        <h2 className="text-lg font-bold text-white mb-4">贡献记录</h2>
        {contributions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">暂无贡献记录</p>
            <p className="text-sm">成为第一个参与编辑的用户吧</p>
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
                  <span className="text-gray-500">目标：</span>
                  {c.targetName} ({c.targetType === 'building' ? '建筑' : c.targetType === 'district' ? '区域' : '页面'})
                </div>
                <div className="text-sm text-gray-400">
                  <span className="text-gray-500">修改：</span>
                  {c.field} → {c.newValue}
                </div>
                {c.summary && (
                  <div className="text-sm text-gray-500 mt-1">说明：{c.summary}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
