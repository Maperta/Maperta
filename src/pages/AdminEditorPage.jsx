import { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n';

const STORAGE_KEY = 'maperta_edited_pages';

export default function AdminEditorPage() {
  const { t, lang } = useI18n();
  const [pages, setPages] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [editData, setEditData] = useState(null);
  const [saved, setSaved] = useState(false);

  // 加载原始页面数据
  useEffect(() => {
    fetch('/data/pages.json')
      .then((r) => r.json())
      .then((originalPages) => {
        // 检查 localStorage 是否有编辑过的版本
        const savedPages = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        setPages(savedPages || originalPages);
      })
      .catch(console.error);
  }, []);

  // 选择页面进行编辑
  const handleSelectPage = (slug) => {
    setSelectedSlug(slug);
    const page = pages.find((p) => p.slug === slug);
    setEditData(page ? JSON.parse(JSON.stringify(page)) : null);
    setSaved(false);
  };

  // 修改页面标题
  const handleTitleChange = (value) => {
    setEditData((prev) => ({ ...prev, title: value }));
    setSaved(false);
  };

  // 修改页面副标题
  const handleSubtitleChange = (value) => {
    setEditData((prev) => ({ ...prev, subtitle: value }));
    setSaved(false);
  };

  // 修改章节标题
  const handleSectionTitleChange = (index, value) => {
    setEditData((prev) => {
      const sections = [...prev.sections];
      sections[index] = { ...sections[index], title: value };
      return { ...prev, sections };
    });
    setSaved(false);
  };

  // 修改章节内容
  const handleSectionContentChange = (index, value) => {
    setEditData((prev) => {
      const sections = [...prev.sections];
      sections[index] = { ...sections[index], content: value };
      return { ...prev, sections };
    });
    setSaved(false);
  };

  // 添加新章节
  const handleAddSection = () => {
    setEditData((prev) => ({
      ...prev,
      sections: [...prev.sections, { title: '', content: '' }],
    }));
    setSaved(false);
  };

  // 删除章节
  const handleDeleteSection = (index) => {
    setEditData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
    setSaved(false);
  };

  // 保存到 localStorage
  const handleSave = () => {
    const updatedPages = pages.map((p) =>
      p.slug === editData.slug ? editData : p
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPages));
    setPages(updatedPages);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // 导出 JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(editData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editData.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 恢复原始内容
  const handleReset = async () => {
    const resp = await fetch('/data/pages.json');
    const originalPages = await resp.json();
    const original = originalPages.find((p) => p.slug === selectedSlug);
    if (original) {
      setEditData(JSON.parse(JSON.stringify(original)));
      const updatedPages = pages.map((p) =>
        p.slug === original.slug ? original : p
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPages));
      setPages(updatedPages);
    }
  };

  const selectedPage = editData;

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] px-8 py-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white m-0">{t('editor_title')}</h1>
            <p className="text-gray-400 text-lg mt-3">{t('editor_subtitle')}</p>
          </div>
          {selectedPage && (
            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-green-400 text-sm">{t('editor_saved')}</span>
              )}
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-white/10 text-gray-400 rounded-lg cursor-pointer bg-transparent hover:bg-white/5 transition-colors text-sm"
              >
                {t('editor_reset')}
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 border border-[#e94560]/30 text-[#e94560] rounded-lg cursor-pointer bg-transparent hover:bg-[#e94560]/10 transition-colors text-sm"
              >
                {t('editor_export')}
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-[#e94560] text-white rounded-lg font-medium cursor-pointer border-none hover:bg-[#c0392b] transition-colors"
              >
                {t('editor_save')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* 页面选择器 */}
        <div className="mb-6 flex items-center gap-3">
          <label className="text-sm text-gray-400">{t('editor_select_page')}:</label>
          <select
            value={selectedSlug}
            onChange={(e) => handleSelectPage(e.target.value)}
            className="bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-2 text-white text-sm min-w-[200px]"
          >
            <option value="">-- {t('editor_select_page')} --</option>
            {pages.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title} ({p.slug})
              </option>
            ))}
          </select>
        </div>

        {/* 编辑器 */}
        {selectedPage ? (
          <div className="grid grid-cols-2 gap-6">
            {/* 编辑区 */}
            <div className="space-y-4">
              <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-medium text-gray-400 mb-4">
                  📝 {lang === 'zh' ? '编辑内容' : 'Edit Content'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      {lang === 'zh' ? '页面标题' : 'Page Title'}
                    </label>
                    <input
                      value={selectedPage.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      {lang === 'zh' ? '副标题' : 'Subtitle'}
                    </label>
                    <input
                      value={selectedPage.subtitle || ''}
                      onChange={(e) => handleSubtitleChange(e.target.value)}
                      className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 章节编辑 */}
              {selectedPage.sections?.map((section, i) => (
                <div
                  key={i}
                  className="bg-[#1a1a2e] border border-white/10 rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">
                      {lang === 'zh' ? '章节' : 'Section'} {i + 1}
                    </span>
                    <button
                      onClick={() => handleDeleteSection(i)}
                      className="text-xs text-red-400 hover:text-red-300 bg-transparent border-none cursor-pointer"
                    >
                      ✕ {lang === 'zh' ? '删除' : 'Delete'}
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        {t('editor_section_title')}
                      </label>
                      <input
                        value={section.title}
                        onChange={(e) => handleSectionTitleChange(i, e.target.value)}
                        className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        {t('editor_section_content')}
                      </label>
                      <textarea
                        value={section.content}
                        onChange={(e) => handleSectionContentChange(i, e.target.value)}
                        rows={6}
                        className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddSection}
                className="w-full py-2.5 border border-dashed border-white/20 text-gray-400 rounded-lg cursor-pointer bg-transparent hover:bg-white/5 transition-colors text-sm"
              >
                + {t('editor_add_section')}
              </button>
            </div>

            {/* 预览区 */}
            <div>
              <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-5 sticky top-8">
                <h3 className="text-sm font-medium text-gray-400 mb-4">
                  👁️ {t('editor_preview')}
                </h3>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {selectedPage.title}
                    </h2>
                    {selectedPage.subtitle && (
                      <p className="text-gray-400 text-sm">{selectedPage.subtitle}</p>
                    )}
                  </div>
                  {selectedPage.sections?.map((section, i) => (
                    <div key={i} className="border-t border-white/10 pt-4">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {section.title || `[${t('editor_section_title')}]`}
                      </h3>
                      <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                        {section.content || `[${t('editor_section_content')}]`}
                      </div>
                    </div>
                  ))}
                  {(!selectedPage.sections || selectedPage.sections.length === 0) && (
                    <p className="text-gray-600 text-sm">{t('community_empty')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-4">📝</p>
            <p className="text-lg">{lang === 'zh' ? '请选择一个页面开始编辑' : 'Select a page to start editing'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
