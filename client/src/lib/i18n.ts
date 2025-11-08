/**
 * Internationalization (i18n) System
 * Multi-language support for UI components
 */

export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'zh' | 'ar';

export interface TranslationKeys {
  // Navigation
  'nav.home': string;
  'nav.dashboard': string;
  'nav.projects': string;
  'nav.chatbot': string;
  'nav.marketplace': string;
  'nav.pricing': string;
  'nav.admin': string;
  'nav.settings': string;

  // Common
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.cancel': string;
  'common.save': string;
  'common.delete': string;
  'common.edit': string;
  'common.view': string;
  'common.export': string;
  'common.import': string;
  'common.search': string;
  'common.filter': string;
  'common.sort': string;

  // Chatbot
  'chatbot.title': string;
  'chatbot.subtitle': string;
  'chatbot.new_chat': string;
  'chatbot.send_message': string;
  'chatbot.escalated': string;
  'chatbot.chat_history': string;
  'chatbot.close_chat': string;

  // Marketplace
  'marketplace.title': string;
  'marketplace.subtitle': string;
  'marketplace.discover_apps': string;
  'marketplace.install': string;
  'marketplace.uninstall': string;
  'marketplace.rating': string;
  'marketplace.reviews': string;
  'marketplace.category': string;
  'marketplace.search_apps': string;

  // Pricing
  'pricing.title': string;
  'pricing.subtitle': string;
  'pricing.revenue_forecast': string;
  'pricing.profit_margin': string;
  'pricing.acceptance_rate': string;
  'pricing.recommendation': string;
  'pricing.ab_test': string;
  'pricing.strategy_a': string;
  'pricing.strategy_b': string;

  // Admin
  'admin.title': string;
  'admin.subtitle': string;
  'admin.pending_approvals': string;
  'admin.approve': string;
  'admin.reject': string;
  'admin.moderate_reviews': string;
  'admin.user_management': string;
  'admin.analytics': string;

  // Notifications
  'notification.escalated': string;
  'notification.app_installed': string;
  'notification.pricing_alert': string;
  'notification.review_submitted': string;
  'notification.app_approved': string;

  // Export
  'export.title': string;
  'export.subtitle': string;
  'export.select_report': string;
  'export.format': string;
  'export.date_range': string;
  'export.generate': string;
  'export.preview': string;
}

// English translations
const en: TranslationKeys = {
  'nav.home': 'Home',
  'nav.dashboard': 'Dashboard',
  'nav.projects': 'Projects',
  'nav.chatbot': 'Support Chat',
  'nav.marketplace': 'Marketplace',
  'nav.pricing': 'Pricing',
  'nav.admin': 'Admin',
  'nav.settings': 'Settings',

  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.view': 'View',
  'common.export': 'Export',
  'common.import': 'Import',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.sort': 'Sort',

  'chatbot.title': 'Support Chat',
  'chatbot.subtitle': 'Get instant help from our AI-powered chatbot',
  'chatbot.new_chat': 'New Chat',
  'chatbot.send_message': 'Send Message',
  'chatbot.escalated': 'Chat Escalated',
  'chatbot.chat_history': 'Chat History',
  'chatbot.close_chat': 'Close Chat',

  'marketplace.title': 'Marketplace',
  'marketplace.subtitle': 'Discover and install powerful integrations',
  'marketplace.discover_apps': 'Discover Apps',
  'marketplace.install': 'Install',
  'marketplace.uninstall': 'Uninstall',
  'marketplace.rating': 'Rating',
  'marketplace.reviews': 'Reviews',
  'marketplace.category': 'Category',
  'marketplace.search_apps': 'Search Apps',

  'pricing.title': 'Pricing Analytics',
  'pricing.subtitle': 'AI-powered pricing recommendations',
  'pricing.revenue_forecast': 'Revenue Forecast',
  'pricing.profit_margin': 'Profit Margin',
  'pricing.acceptance_rate': 'Acceptance Rate',
  'pricing.recommendation': 'Recommendation',
  'pricing.ab_test': 'A/B Test',
  'pricing.strategy_a': 'Strategy A',
  'pricing.strategy_b': 'Strategy B',

  'admin.title': 'Admin Dashboard',
  'admin.subtitle': 'Manage marketplace and user content',
  'admin.pending_approvals': 'Pending Approvals',
  'admin.approve': 'Approve',
  'admin.reject': 'Reject',
  'admin.moderate_reviews': 'Moderate Reviews',
  'admin.user_management': 'User Management',
  'admin.analytics': 'Analytics',

  'notification.escalated': 'Chat Escalated',
  'notification.app_installed': 'App Installed',
  'notification.pricing_alert': 'Pricing Alert',
  'notification.review_submitted': 'Review Submitted',
  'notification.app_approved': 'App Approved',

  'export.title': 'Export & Reports',
  'export.subtitle': 'Generate and download reports',
  'export.select_report': 'Select Report',
  'export.format': 'Format',
  'export.date_range': 'Date Range',
  'export.generate': 'Generate Report',
  'export.preview': 'Preview',
};

// Spanish translations
const es: TranslationKeys = {
  'nav.home': 'Inicio',
  'nav.dashboard': 'Panel de Control',
  'nav.projects': 'Proyectos',
  'nav.chatbot': 'Chat de Soporte',
  'nav.marketplace': 'Mercado',
  'nav.pricing': 'Precios',
  'nav.admin': 'Administrador',
  'nav.settings': 'Configuración',

  'common.loading': 'Cargando...',
  'common.error': 'Error',
  'common.success': 'Éxito',
  'common.cancel': 'Cancelar',
  'common.save': 'Guardar',
  'common.delete': 'Eliminar',
  'common.edit': 'Editar',
  'common.view': 'Ver',
  'common.export': 'Exportar',
  'common.import': 'Importar',
  'common.search': 'Buscar',
  'common.filter': 'Filtrar',
  'common.sort': 'Ordenar',

  'chatbot.title': 'Chat de Soporte',
  'chatbot.subtitle': 'Obtén ayuda instantánea de nuestro chatbot impulsado por IA',
  'chatbot.new_chat': 'Nuevo Chat',
  'chatbot.send_message': 'Enviar Mensaje',
  'chatbot.escalated': 'Chat Escalado',
  'chatbot.chat_history': 'Historial de Chat',
  'chatbot.close_chat': 'Cerrar Chat',

  'marketplace.title': 'Mercado',
  'marketplace.subtitle': 'Descubre e instala integraciones poderosas',
  'marketplace.discover_apps': 'Descubrir Aplicaciones',
  'marketplace.install': 'Instalar',
  'marketplace.uninstall': 'Desinstalar',
  'marketplace.rating': 'Calificación',
  'marketplace.reviews': 'Reseñas',
  'marketplace.category': 'Categoría',
  'marketplace.search_apps': 'Buscar Aplicaciones',

  'pricing.title': 'Análisis de Precios',
  'pricing.subtitle': 'Recomendaciones de precios impulsadas por IA',
  'pricing.revenue_forecast': 'Pronóstico de Ingresos',
  'pricing.profit_margin': 'Margen de Ganancia',
  'pricing.acceptance_rate': 'Tasa de Aceptación',
  'pricing.recommendation': 'Recomendación',
  'pricing.ab_test': 'Prueba A/B',
  'pricing.strategy_a': 'Estrategia A',
  'pricing.strategy_b': 'Estrategia B',

  'admin.title': 'Panel de Administración',
  'admin.subtitle': 'Gestionar contenido del mercado y usuarios',
  'admin.pending_approvals': 'Aprobaciones Pendientes',
  'admin.approve': 'Aprobar',
  'admin.reject': 'Rechazar',
  'admin.moderate_reviews': 'Moderar Reseñas',
  'admin.user_management': 'Gestión de Usuarios',
  'admin.analytics': 'Análisis',

  'notification.escalated': 'Chat Escalado',
  'notification.app_installed': 'Aplicación Instalada',
  'notification.pricing_alert': 'Alerta de Precios',
  'notification.review_submitted': 'Reseña Enviada',
  'notification.app_approved': 'Aplicación Aprobada',

  'export.title': 'Exportar e Informes',
  'export.subtitle': 'Generar y descargar informes',
  'export.select_report': 'Seleccionar Informe',
  'export.format': 'Formato',
  'export.date_range': 'Rango de Fechas',
  'export.generate': 'Generar Informe',
  'export.preview': 'Vista Previa',
};

// French translations
const fr: TranslationKeys = {
  'nav.home': 'Accueil',
  'nav.dashboard': 'Tableau de Bord',
  'nav.projects': 'Projets',
  'nav.chatbot': 'Chat Support',
  'nav.marketplace': 'Marché',
  'nav.pricing': 'Tarification',
  'nav.admin': 'Admin',
  'nav.settings': 'Paramètres',

  'common.loading': 'Chargement...',
  'common.error': 'Erreur',
  'common.success': 'Succès',
  'common.cancel': 'Annuler',
  'common.save': 'Enregistrer',
  'common.delete': 'Supprimer',
  'common.edit': 'Modifier',
  'common.view': 'Afficher',
  'common.export': 'Exporter',
  'common.import': 'Importer',
  'common.search': 'Rechercher',
  'common.filter': 'Filtrer',
  'common.sort': 'Trier',

  'chatbot.title': 'Chat Support',
  'chatbot.subtitle': 'Obtenez une aide instantanée de notre chatbot alimenté par l\'IA',
  'chatbot.new_chat': 'Nouveau Chat',
  'chatbot.send_message': 'Envoyer un Message',
  'chatbot.escalated': 'Chat Escaladé',
  'chatbot.chat_history': 'Historique du Chat',
  'chatbot.close_chat': 'Fermer le Chat',

  'marketplace.title': 'Marché',
  'marketplace.subtitle': 'Découvrez et installez des intégrations puissantes',
  'marketplace.discover_apps': 'Découvrir les Applications',
  'marketplace.install': 'Installer',
  'marketplace.uninstall': 'Désinstaller',
  'marketplace.rating': 'Évaluation',
  'marketplace.reviews': 'Avis',
  'marketplace.category': 'Catégorie',
  'marketplace.search_apps': 'Rechercher des Applications',

  'pricing.title': 'Analyse des Prix',
  'pricing.subtitle': 'Recommandations tarifaires alimentées par l\'IA',
  'pricing.revenue_forecast': 'Prévisions de Revenus',
  'pricing.profit_margin': 'Marge Bénéficiaire',
  'pricing.acceptance_rate': 'Taux d\'Acceptation',
  'pricing.recommendation': 'Recommandation',
  'pricing.ab_test': 'Test A/B',
  'pricing.strategy_a': 'Stratégie A',
  'pricing.strategy_b': 'Stratégie B',

  'admin.title': 'Tableau de Bord Admin',
  'admin.subtitle': 'Gérer le contenu du marché et les utilisateurs',
  'admin.pending_approvals': 'Approbations en Attente',
  'admin.approve': 'Approuver',
  'admin.reject': 'Rejeter',
  'admin.moderate_reviews': 'Modérer les Avis',
  'admin.user_management': 'Gestion des Utilisateurs',
  'admin.analytics': 'Analyse',

  'notification.escalated': 'Chat Escaladé',
  'notification.app_installed': 'Application Installée',
  'notification.pricing_alert': 'Alerte Tarifaire',
  'notification.review_submitted': 'Avis Soumis',
  'notification.app_approved': 'Application Approuvée',

  'export.title': 'Exporter et Rapports',
  'export.subtitle': 'Générer et télécharger des rapports',
  'export.select_report': 'Sélectionner un Rapport',
  'export.format': 'Format',
  'export.date_range': 'Plage de Dates',
  'export.generate': 'Générer un Rapport',
  'export.preview': 'Aperçu',
};

// German translations
const de: TranslationKeys = {
  'nav.home': 'Startseite',
  'nav.dashboard': 'Dashboard',
  'nav.projects': 'Projekte',
  'nav.chatbot': 'Support-Chat',
  'nav.marketplace': 'Marktplatz',
  'nav.pricing': 'Preisgestaltung',
  'nav.admin': 'Admin',
  'nav.settings': 'Einstellungen',

  'common.loading': 'Wird geladen...',
  'common.error': 'Fehler',
  'common.success': 'Erfolg',
  'common.cancel': 'Abbrechen',
  'common.save': 'Speichern',
  'common.delete': 'Löschen',
  'common.edit': 'Bearbeiten',
  'common.view': 'Anzeigen',
  'common.export': 'Exportieren',
  'common.import': 'Importieren',
  'common.search': 'Suchen',
  'common.filter': 'Filtern',
  'common.sort': 'Sortieren',

  'chatbot.title': 'Support-Chat',
  'chatbot.subtitle': 'Erhalten Sie sofortige Hilfe von unserem KI-gestützten Chatbot',
  'chatbot.new_chat': 'Neuer Chat',
  'chatbot.send_message': 'Nachricht Senden',
  'chatbot.escalated': 'Chat Eskaliert',
  'chatbot.chat_history': 'Chat-Verlauf',
  'chatbot.close_chat': 'Chat Schließen',

  'marketplace.title': 'Marktplatz',
  'marketplace.subtitle': 'Entdecken und installieren Sie leistungsstarke Integrationen',
  'marketplace.discover_apps': 'Apps Entdecken',
  'marketplace.install': 'Installieren',
  'marketplace.uninstall': 'Deinstallieren',
  'marketplace.rating': 'Bewertung',
  'marketplace.reviews': 'Bewertungen',
  'marketplace.category': 'Kategorie',
  'marketplace.search_apps': 'Apps Suchen',

  'pricing.title': 'Preisanalyse',
  'pricing.subtitle': 'KI-gestützte Preisempfehlungen',
  'pricing.revenue_forecast': 'Umsatzprognose',
  'pricing.profit_margin': 'Gewinnmarge',
  'pricing.acceptance_rate': 'Akzeptanzrate',
  'pricing.recommendation': 'Empfehlung',
  'pricing.ab_test': 'A/B-Test',
  'pricing.strategy_a': 'Strategie A',
  'pricing.strategy_b': 'Strategie B',

  'admin.title': 'Admin-Dashboard',
  'admin.subtitle': 'Verwalten Sie Marktplatzinhalte und Benutzer',
  'admin.pending_approvals': 'Ausstehende Genehmigungen',
  'admin.approve': 'Genehmigen',
  'admin.reject': 'Ablehnen',
  'admin.moderate_reviews': 'Bewertungen Moderieren',
  'admin.user_management': 'Benutzerverwaltung',
  'admin.analytics': 'Analytik',

  'notification.escalated': 'Chat Eskaliert',
  'notification.app_installed': 'App Installiert',
  'notification.pricing_alert': 'Preiswarnung',
  'notification.review_submitted': 'Bewertung Eingereicht',
  'notification.app_approved': 'App Genehmigt',

  'export.title': 'Exportieren und Berichte',
  'export.subtitle': 'Berichte generieren und herunterladen',
  'export.select_report': 'Bericht Auswählen',
  'export.format': 'Format',
  'export.date_range': 'Datumsbereich',
  'export.generate': 'Bericht Generieren',
  'export.preview': 'Vorschau',
};

// Portuguese translations
const pt: TranslationKeys = {
  'nav.home': 'Início',
  'nav.dashboard': 'Painel',
  'nav.projects': 'Projetos',
  'nav.chatbot': 'Chat de Suporte',
  'nav.marketplace': 'Mercado',
  'nav.pricing': 'Preços',
  'nav.admin': 'Admin',
  'nav.settings': 'Configurações',

  'common.loading': 'Carregando...',
  'common.error': 'Erro',
  'common.success': 'Sucesso',
  'common.cancel': 'Cancelar',
  'common.save': 'Salvar',
  'common.delete': 'Excluir',
  'common.edit': 'Editar',
  'common.view': 'Visualizar',
  'common.export': 'Exportar',
  'common.import': 'Importar',
  'common.search': 'Pesquisar',
  'common.filter': 'Filtrar',
  'common.sort': 'Ordenar',

  'chatbot.title': 'Chat de Suporte',
  'chatbot.subtitle': 'Obtenha ajuda instantânea do nosso chatbot alimentado por IA',
  'chatbot.new_chat': 'Novo Chat',
  'chatbot.send_message': 'Enviar Mensagem',
  'chatbot.escalated': 'Chat Escalado',
  'chatbot.chat_history': 'Histórico de Chat',
  'chatbot.close_chat': 'Fechar Chat',

  'marketplace.title': 'Mercado',
  'marketplace.subtitle': 'Descubra e instale integrações poderosas',
  'marketplace.discover_apps': 'Descobrir Aplicativos',
  'marketplace.install': 'Instalar',
  'marketplace.uninstall': 'Desinstalar',
  'marketplace.rating': 'Classificação',
  'marketplace.reviews': 'Avaliações',
  'marketplace.category': 'Categoria',
  'marketplace.search_apps': 'Pesquisar Aplicativos',

  'pricing.title': 'Análise de Preços',
  'pricing.subtitle': 'Recomendações de preços alimentadas por IA',
  'pricing.revenue_forecast': 'Previsão de Receita',
  'pricing.profit_margin': 'Margem de Lucro',
  'pricing.acceptance_rate': 'Taxa de Aceitação',
  'pricing.recommendation': 'Recomendação',
  'pricing.ab_test': 'Teste A/B',
  'pricing.strategy_a': 'Estratégia A',
  'pricing.strategy_b': 'Estratégia B',

  'admin.title': 'Painel de Administração',
  'admin.subtitle': 'Gerenciar conteúdo do mercado e usuários',
  'admin.pending_approvals': 'Aprovações Pendentes',
  'admin.approve': 'Aprovar',
  'admin.reject': 'Rejeitar',
  'admin.moderate_reviews': 'Moderar Avaliações',
  'admin.user_management': 'Gerenciamento de Usuários',
  'admin.analytics': 'Análise',

  'notification.escalated': 'Chat Escalado',
  'notification.app_installed': 'Aplicativo Instalado',
  'notification.pricing_alert': 'Alerta de Preço',
  'notification.review_submitted': 'Avaliação Enviada',
  'notification.app_approved': 'Aplicativo Aprovado',

  'export.title': 'Exportar e Relatórios',
  'export.subtitle': 'Gerar e baixar relatórios',
  'export.select_report': 'Selecionar Relatório',
  'export.format': 'Formato',
  'export.date_range': 'Intervalo de Datas',
  'export.generate': 'Gerar Relatório',
  'export.preview': 'Visualizar',
};

// Japanese translations
const ja: TranslationKeys = {
  'nav.home': 'ホーム',
  'nav.dashboard': 'ダッシュボード',
  'nav.projects': 'プロジェクト',
  'nav.chatbot': 'サポートチャット',
  'nav.marketplace': 'マーケットプレイス',
  'nav.pricing': '価格設定',
  'nav.admin': '管理者',
  'nav.settings': '設定',

  'common.loading': '読み込み中...',
  'common.error': 'エラー',
  'common.success': '成功',
  'common.cancel': 'キャンセル',
  'common.save': '保存',
  'common.delete': '削除',
  'common.edit': '編集',
  'common.view': '表示',
  'common.export': 'エクスポート',
  'common.import': 'インポート',
  'common.search': '検索',
  'common.filter': 'フィルター',
  'common.sort': 'ソート',

  'chatbot.title': 'サポートチャット',
  'chatbot.subtitle': 'AI搭載チャットボットから即座にサポートを受けます',
  'chatbot.new_chat': '新しいチャット',
  'chatbot.send_message': 'メッセージを送信',
  'chatbot.escalated': 'チャットがエスカレートされました',
  'chatbot.chat_history': 'チャット履歴',
  'chatbot.close_chat': 'チャットを閉じる',

  'marketplace.title': 'マーケットプレイス',
  'marketplace.subtitle': '強力な統合を発見してインストールします',
  'marketplace.discover_apps': 'アプリを発見',
  'marketplace.install': 'インストール',
  'marketplace.uninstall': 'アンインストール',
  'marketplace.rating': '評価',
  'marketplace.reviews': 'レビュー',
  'marketplace.category': 'カテゴリー',
  'marketplace.search_apps': 'アプリを検索',

  'pricing.title': '価格分析',
  'pricing.subtitle': 'AI搭載の価格設定推奨',
  'pricing.revenue_forecast': '収益予測',
  'pricing.profit_margin': '利益率',
  'pricing.acceptance_rate': '受け入れ率',
  'pricing.recommendation': '推奨',
  'pricing.ab_test': 'A/Bテスト',
  'pricing.strategy_a': '戦略A',
  'pricing.strategy_b': '戦略B',

  'admin.title': '管理ダッシュボード',
  'admin.subtitle': 'マーケットプレイスとユーザーコンテンツを管理',
  'admin.pending_approvals': '保留中の承認',
  'admin.approve': '承認',
  'admin.reject': '却下',
  'admin.moderate_reviews': 'レビューを管理',
  'admin.user_management': 'ユーザー管理',
  'admin.analytics': '分析',

  'notification.escalated': 'チャットがエスカレートされました',
  'notification.app_installed': 'アプリがインストールされました',
  'notification.pricing_alert': '価格アラート',
  'notification.review_submitted': 'レビューが送信されました',
  'notification.app_approved': 'アプリが承認されました',

  'export.title': 'エクスポートとレポート',
  'export.subtitle': 'レポートを生成してダウンロード',
  'export.select_report': 'レポートを選択',
  'export.format': 'フォーマット',
  'export.date_range': '日付範囲',
  'export.generate': 'レポートを生成',
  'export.preview': 'プレビュー',
};

// Chinese (Simplified) translations
const zh: TranslationKeys = {
  'nav.home': '首页',
  'nav.dashboard': '仪表板',
  'nav.projects': '项目',
  'nav.chatbot': '支持聊天',
  'nav.marketplace': '市场',
  'nav.pricing': '定价',
  'nav.admin': '管理员',
  'nav.settings': '设置',

  'common.loading': '加载中...',
  'common.error': '错误',
  'common.success': '成功',
  'common.cancel': '取消',
  'common.save': '保存',
  'common.delete': '删除',
  'common.edit': '编辑',
  'common.view': '查看',
  'common.export': '导出',
  'common.import': '导入',
  'common.search': '搜索',
  'common.filter': '过滤',
  'common.sort': '排序',

  'chatbot.title': '支持聊天',
  'chatbot.subtitle': '从我们的AI驱动聊天机器人获得即时帮助',
  'chatbot.new_chat': '新聊天',
  'chatbot.send_message': '发送消息',
  'chatbot.escalated': '聊天已升级',
  'chatbot.chat_history': '聊天历史',
  'chatbot.close_chat': '关闭聊天',

  'marketplace.title': '市场',
  'marketplace.subtitle': '发现并安装强大的集成',
  'marketplace.discover_apps': '发现应用',
  'marketplace.install': '安装',
  'marketplace.uninstall': '卸载',
  'marketplace.rating': '评分',
  'marketplace.reviews': '评论',
  'marketplace.category': '类别',
  'marketplace.search_apps': '搜索应用',

  'pricing.title': '价格分析',
  'pricing.subtitle': 'AI驱动的定价建议',
  'pricing.revenue_forecast': '收入预测',
  'pricing.profit_margin': '利润率',
  'pricing.acceptance_rate': '接受率',
  'pricing.recommendation': '建议',
  'pricing.ab_test': 'A/B测试',
  'pricing.strategy_a': '策略A',
  'pricing.strategy_b': '策略B',

  'admin.title': '管理仪表板',
  'admin.subtitle': '管理市场和用户内容',
  'admin.pending_approvals': '待批准',
  'admin.approve': '批准',
  'admin.reject': '拒绝',
  'admin.moderate_reviews': '审核评论',
  'admin.user_management': '用户管理',
  'admin.analytics': '分析',

  'notification.escalated': '聊天已升级',
  'notification.app_installed': '应用已安装',
  'notification.pricing_alert': '价格警报',
  'notification.review_submitted': '评论已提交',
  'notification.app_approved': '应用已批准',

  'export.title': '导出和报告',
  'export.subtitle': '生成并下载报告',
  'export.select_report': '选择报告',
  'export.format': '格式',
  'export.date_range': '日期范围',
  'export.generate': '生成报告',
  'export.preview': '预览',
};

// Arabic translations
const ar: TranslationKeys = {
  'nav.home': 'الرئيسية',
  'nav.dashboard': 'لوحة التحكم',
  'nav.projects': 'المشاريع',
  'nav.chatbot': 'دردشة الدعم',
  'nav.marketplace': 'السوق',
  'nav.pricing': 'التسعير',
  'nav.admin': 'مسؤول',
  'nav.settings': 'الإعدادات',

  'common.loading': 'جاري التحميل...',
  'common.error': 'خطأ',
  'common.success': 'نجاح',
  'common.cancel': 'إلغاء',
  'common.save': 'حفظ',
  'common.delete': 'حذف',
  'common.edit': 'تعديل',
  'common.view': 'عرض',
  'common.export': 'تصدير',
  'common.import': 'استيراد',
  'common.search': 'بحث',
  'common.filter': 'تصفية',
  'common.sort': 'ترتيب',

  'chatbot.title': 'دردشة الدعم',
  'chatbot.subtitle': 'احصل على مساعدة فورية من روبوت الدردشة الذي يعمل بالذكاء الاصطناعي',
  'chatbot.new_chat': 'دردشة جديدة',
  'chatbot.send_message': 'إرسال رسالة',
  'chatbot.escalated': 'تم تصعيد الدردشة',
  'chatbot.chat_history': 'سجل الدردشة',
  'chatbot.close_chat': 'إغلاق الدردشة',

  'marketplace.title': 'السوق',
  'marketplace.subtitle': 'اكتشف وثبت التكاملات القوية',
  'marketplace.discover_apps': 'اكتشف التطبيقات',
  'marketplace.install': 'تثبيت',
  'marketplace.uninstall': 'إلغاء التثبيت',
  'marketplace.rating': 'التقييم',
  'marketplace.reviews': 'المراجعات',
  'marketplace.category': 'الفئة',
  'marketplace.search_apps': 'البحث عن التطبيقات',

  'pricing.title': 'تحليل الأسعار',
  'pricing.subtitle': 'توصيات التسعير التي تعمل بالذكاء الاصطناعي',
  'pricing.revenue_forecast': 'توقعات الإيرادات',
  'pricing.profit_margin': 'هامش الربح',
  'pricing.acceptance_rate': 'معدل القبول',
  'pricing.recommendation': 'التوصية',
  'pricing.ab_test': 'اختبار A/B',
  'pricing.strategy_a': 'الاستراتيجية أ',
  'pricing.strategy_b': 'الاستراتيجية ب',

  'admin.title': 'لوحة تحكم المسؤول',
  'admin.subtitle': 'إدارة محتوى السوق والمستخدمين',
  'admin.pending_approvals': 'الموافقات المعلقة',
  'admin.approve': 'الموافقة',
  'admin.reject': 'رفض',
  'admin.moderate_reviews': 'إدارة المراجعات',
  'admin.user_management': 'إدارة المستخدمين',
  'admin.analytics': 'التحليلات',

  'notification.escalated': 'تم تصعيد الدردشة',
  'notification.app_installed': 'تم تثبيت التطبيق',
  'notification.pricing_alert': 'تنبيه السعر',
  'notification.review_submitted': 'تم إرسال المراجعة',
  'notification.app_approved': 'تمت الموافقة على التطبيق',

  'export.title': 'التصدير والتقارير',
  'export.subtitle': 'إنشاء وتحميل التقارير',
  'export.select_report': 'حدد التقرير',
  'export.format': 'الصيغة',
  'export.date_range': 'نطاق التاريخ',
  'export.generate': 'إنشاء تقرير',
  'export.preview': 'معاينة',
};

// Translation dictionary
const translations: Record<Language, TranslationKeys> = {
  en,
  es,
  fr,
  de,
  pt,
  ja,
  zh,
  ar,
};

// i18n Manager
class I18nManager {
  private currentLanguage: Language = 'en';
  private listeners: Set<() => void> = new Set();

  /**
   * Initialize i18n with language from localStorage or browser
   */
  public initialize(): void {
    const stored = localStorage.getItem('language') as Language | null;
    if (stored && translations[stored]) {
      this.currentLanguage = stored;
    } else {
      const browserLang = navigator.language.split('-')[0] as Language;
      this.currentLanguage = translations[browserLang] ? browserLang : 'en';
    }
  }

  /**
   * Get current language
   */
  public getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * Set language
   */
  public setLanguage(lang: Language): void {
    if (translations[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem('language', lang);
      this.notifyListeners();
    }
  }

  /**
   * Get translation for key
   */
  public t(key: keyof TranslationKeys): string {
    return translations[this.currentLanguage][key] || key;
  }

  /**
   * Get all translations for current language
   */
  public getTranslations(): TranslationKeys {
    return translations[this.currentLanguage];
  }

  /**
   * Subscribe to language changes
   */
  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of language change
   */
  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback());
  }

  /**
   * Get available languages
   */
  public getAvailableLanguages(): Language[] {
    return Object.keys(translations) as Language[];
  }

  /**
   * Get language name
   */
  public getLanguageName(lang: Language): string {
    const names: Record<Language, string> = {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
      pt: 'Português',
      ja: '日本語',
      zh: '中文',
      ar: 'العربية',
    };
    return names[lang];
  }
}

// Export singleton instance
export const i18n = new I18nManager();

// Initialize on import
i18n.initialize();

