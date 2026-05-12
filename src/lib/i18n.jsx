import { createContext, useContext, useState, useCallback } from 'react';

// 翻译字典
const translations = {
  zh: {
    // 导航
    nav_3dmap: '3D地图',
    nav_overview: '深圳概览',
    nav_systems: '城市系统',
    nav_districts: '各区历史',
    nav_community: '社区',
    nav_login: '登录',
    nav_logout: '退出',
    nav_profile: '个人主页',
    nav_register: '注册',

    // 首页
    home_timeline: '时间轴',
    home_period_1980s: '八十年代',
    home_period_1990s: '九十年代',
    home_period_2000s: '零零年代',
    home_period_present: '现在',
    home_range_1980s: '1980-1989',
    home_range_1990s: '1990-1999',
    home_range_2000s: '2000-2009',
    home_range_present: '2010-至今',
    home_building_detail: '查看详细介绍 →',

    // 建筑详情
    bldg_not_found: '建筑未找到',
    bldg_back_to_map: '返回地图',
    bldg_height: '高度',
    bldg_floors: '层数',
    bldg_year_built: '建成时间',
    bldg_district: '所在区域',
    bldg_meters: '米',
    bldg_floors_unit: '层',
    bldg_intro: '建筑简介',
    bldg_history: '建筑历史',
    bldg_status_exist: '存在',
    bldg_status_not_exist: '不存在',
    bldg_view_on_map: '在3D地图上查看 →',
    bldg_loading: '加载中...',

    // 概览页
    overview_title: '深圳概览',
    overview_subtitle: '从小渔村到国际化大都市',
    overview_more: '了解更多',
    overview_established: '建市时间',
    overview_population: '人口',
    overview_area: '面积',
    overview_back: '← 返回概览',

    // 系统页
    system_not_found: '页面不存在',
    system_back: '← 返回概览',

    // 各区页
    district_title: '各区历史',
    district_subtitle: '深圳下辖9个行政区+1个新区，每个区都有其独特的发展故事',
    district_established: '设立于',
    district_area: '面积',
    district_population: '人口',
    district_established_label: '设立时间',
    district_intro: '区域简介',
    district_history_label: '历史沿革',
    district_buildings: '标志性建筑',
    district_back: '← 返回各区列表',

    // 社区页
    community_title: '社区贡献',
    community_subtitle: '参与编辑深圳城市信息，共同完善历史资料',
    community_login_first: '登录后参与编辑',
    community_submit_new: '提交新贡献',
    community_cancel: '取消',
    community_target_type: '目标类型',
    community_target_name: '目标名称',
    community_field: '修改字段',
    community_new_value: '修改内容',
    community_summary: '修改说明',
    community_summary_placeholder: '请说明为什么需要修改这条信息...',
    community_submit_btn: '提交贡献',
    community_records: '贡献记录',
    community_empty: '暂无贡献记录',
    community_empty_hint: '成为第一个参与编辑的用户吧',
    community_status_pending: '审核中',
    community_status_approved: '已通过',
    community_status_rejected: '已拒绝',
    community_target: '目标：',
    community_modify: '修改：',
    community_note: '说明：',
    community_type_building: '建筑',
    community_type_district: '区域',
    community_type_page: '页面',

    // 登录页
    login_title: '登录',
    register_title: '注册',
    login_username: '用户名',
    login_password: '密码',
    login_placeholder_username: '请输入用户名',
    login_placeholder_password: '请输入密码',
    login_btn: '登录',
    register_btn: '注册',
    login_switch_login: '已有账号？点此登录',
    login_switch_register: '没有账号？点此注册',
    login_error_empty: '请填写用户名和密码',
    login_error_duplicate: '用户名已存在',
    login_error_wrong: '用户名或密码错误',
    login_notice: '这是一个模拟登录系统，数据存储在浏览器本地。',

    // 个人主页
    profile_title: '个人主页',
    profile_joined: '加入于',
    profile_contributions: '总贡献数',
    profile_approved: '已通过',
    profile_my_contributions: '我的贡献',
    profile_empty: '还没有贡献记录',
    profile_go_contribute: '去提交第一条贡献 →',
    profile_logout: '退出登录',

    // 编辑器
    editor_title: '内容编辑器',
    editor_subtitle: '编辑深圳介绍页内容',
    editor_select_page: '选择页面',
    editor_section_title: '章节标题',
    editor_section_content: '章节内容',
    editor_add_section: '添加章节',
    editor_preview: '预览',
    editor_save: '保存修改',
    editor_export: '导出JSON',
    editor_saved: '已保存（存储在本地浏览器）',
    editor_reset: '恢复原始内容',

    // 语言切换
    lang_switch: 'English',
  },

  en: {
    // Navigation
    nav_3dmap: '3D Map',
    nav_overview: 'Overview',
    nav_systems: 'City Systems',
    nav_districts: 'Districts',
    nav_community: 'Community',
    nav_login: 'Login',
    nav_logout: 'Logout',
    nav_profile: 'Profile',
    nav_register: 'Register',

    // Homepage
    home_timeline: 'Timeline',
    home_period_1980s: '1980s',
    home_period_1990s: '1990s',
    home_period_2000s: '2000s',
    home_period_present: 'Present',
    home_range_1980s: '1980-1989',
    home_range_1990s: '1990-1999',
    home_range_2000s: '2000-2009',
    home_range_present: '2010-Present',
    home_building_detail: 'View Details →',

    // Building detail
    bldg_not_found: 'Building Not Found',
    bldg_back_to_map: '← Back to Map',
    bldg_height: 'Height',
    bldg_floors: 'Floors',
    bldg_year_built: 'Year Built',
    bldg_district: 'District',
    bldg_meters: 'm',
    bldg_floors_unit: 'F',
    bldg_intro: 'Introduction',
    bldg_history: 'Building History',
    bldg_status_exist: 'Exists',
    bldg_status_not_exist: 'Does not exist',
    bldg_view_on_map: 'View on 3D Map →',
    bldg_loading: 'Loading...',

    // Overview
    overview_title: 'Shenzhen Overview',
    overview_subtitle: 'From Fishing Village to Global Metropolis',
    overview_more: 'Learn More',
    overview_established: 'Established',
    overview_population: 'Population',
    overview_area: 'Area',
    overview_back: '← Back to Overview',

    // System pages
    system_not_found: 'Page Not Found',
    system_back: '← Back to Overview',

    // Districts
    district_title: 'District History',
    district_subtitle: 'Shenzhen has 9 districts + 1 new area, each with its unique story',
    district_established: 'Est.',
    district_area: 'Area',
    district_population: 'Pop.',
    district_established_label: 'Established',
    district_intro: 'Introduction',
    district_history_label: 'History',
    district_buildings: 'Landmark Buildings',
    district_back: '← Back to Districts',

    // Community
    community_title: 'Community Contributions',
    community_subtitle: 'Help improve Shenzhen city information together',
    community_login_first: 'Login to Contribute',
    community_submit_new: 'New Contribution',
    community_cancel: 'Cancel',
    community_target_type: 'Target Type',
    community_target_name: 'Target Name',
    community_field: 'Field',
    community_new_value: 'New Value',
    community_summary: 'Summary',
    community_summary_placeholder: 'Explain why this change is needed...',
    community_submit_btn: 'Submit',
    community_records: 'Contribution Records',
    community_empty: 'No contributions yet',
    community_empty_hint: 'Be the first to contribute!',
    community_status_pending: 'Pending',
    community_status_approved: 'Approved',
    community_status_rejected: 'Rejected',
    community_target: 'Target: ',
    community_modify: 'Modify: ',
    community_note: 'Note: ',
    community_type_building: 'Building',
    community_type_district: 'District',
    community_type_page: 'Page',

    // Login
    login_title: 'Login',
    register_title: 'Register',
    login_username: 'Username',
    login_password: 'Password',
    login_placeholder_username: 'Enter username',
    login_placeholder_password: 'Enter password',
    login_btn: 'Login',
    register_btn: 'Register',
    login_switch_login: 'Already have an account? Login',
    login_switch_register: 'No account? Register',
    login_error_empty: 'Please fill in all fields',
    login_error_duplicate: 'Username already exists',
    login_error_wrong: 'Incorrect username or password',
    login_notice: 'This is a demo login system. Data is stored locally in your browser.',

    // Profile
    profile_title: 'Profile',
    profile_joined: 'Joined',
    profile_contributions: 'Total Contributions',
    profile_approved: 'Approved',
    profile_my_contributions: 'My Contributions',
    profile_empty: 'No contributions yet',
    profile_go_contribute: 'Make your first contribution →',
    profile_logout: 'Logout',

    // Editor
    editor_title: 'Content Editor',
    editor_subtitle: 'Edit Shenzhen introduction page content',
    editor_select_page: 'Select Page',
    editor_section_title: 'Section Title',
    editor_section_content: 'Section Content',
    editor_add_section: 'Add Section',
    editor_preview: 'Preview',
    editor_save: 'Save Changes',
    editor_export: 'Export JSON',
    editor_saved: 'Saved (stored locally in browser)',
    editor_reset: 'Restore Original',

    // Language switch
    lang_switch: '中文',
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('maperta_lang') || 'zh';
  });

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'zh' ? 'en' : 'zh';
      localStorage.setItem('maperta_lang', next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key) => {
      return translations[lang]?.[key] || translations.zh[key] || key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, t, toggleLang, translations: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
