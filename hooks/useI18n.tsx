"use client"
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Dict = Record<string, any>

const baseDict: Record<string, Dict> = {
  // en expanded with about keys
  en: {
    plans: 'Plans', about: 'About', contact: 'Contact', register: 'Register', login: 'Login', how_it_works: 'How It Works', choose_plan: 'Choose Plan', get_started: 'Get Started', safety: 'Safety', faqs: 'FAQs', privacy: 'Privacy', terms: 'Terms',
    live_activity: 'Live platform activity', users_joined: 'Users joined', aum: 'AUM', active_online: 'Active traders online', signals: 'Signals', risk_controls: 'Risk controls', compliance: 'Compliance', streams_title: 'Hybrid Revenue Streams', deposit: 'Deposit', pool: 'Central Investment Pool (segregated)', pipeline: 'Revenue Streams → Profit Calculator → Dashboard',
    notifications_title: 'Notifications', notifications_mark_all: 'Mark all as read', notifications_global_tag: 'global', notifications_new_tag: 'new', notifications_mark_one: 'Mark read', notifications_empty: 'No notifications.', notifications_bell: 'Notifications', notifications_unread_count: 'Unread',
    prev: 'Prev', next: 'Next', page_of: 'Page {page} / {pages}', close: 'Close', retry: 'Retry', remove: 'Remove',
    admin_queue_title: 'Admin Queue Dashboard', admin_queue_filter_status: 'Status', admin_queue: { status: { waiting: 'waiting', active: 'active', completed: 'completed', failed: 'failed', delayed: 'delayed', paused: 'paused' }, table: { id: 'ID', name: 'Name', progress: 'Progress', state: 'State', updated: 'Updated' } }, admin_queue_empty: 'No jobs',
    admin_rl_title: 'Admin Rate-Limit Buckets', admin_rl_tokens: 'Tokens', admin_rl_timestamp: 'Timestamp', admin_rl_empty: 'No buckets',
    admin_job_title: 'Job {id}', admin_job_state_label: 'State', admin_job_progress_label: 'Progress', admin_job_attempts_label: 'Attempts', admin_job_processed_label: 'Processed', admin_job_finished_label: 'Finished', admin_job_data: 'Data', admin_job_logs: 'Logs', admin_job_logs_empty: 'No logs',
    admin_queue_filter_name: 'Search name', admin_queue_filter_queue: 'Queue',
    plans_title: 'Choose Your Investment Plan',
    nav_dashboard: 'Dashboard', nav_plans: 'Plans', nav_profile: 'Profile', nav_deposit: 'Deposit', nav_withdraw: 'Withdraw', nav_transactions: 'Transactions', nav_support: 'Support',
    plans_intro: 'Review allocations, streams, and projected weekly ranges. Profits are calculated automatically per plan.',
    plan_starter_title: 'STARTER PLAN — $100–$500 (Conservative)',
    plan_pro_title: 'PRO PLAN — $501–$2,000 (Balanced)',
    plan_elite_title: 'ELITE PLAN — $2,001–$10,000 (Aggressive & Diversified)',
    allocation_label: 'Allocation', expected_weekly_label: 'Expected Weekly Contributions',
    projected_weekly_range: 'Projected Weekly Range: {range} (variable)', streams_label: 'Streams', benefits_label: 'Benefits', invest_with_plan: 'Invest with this Plan',
    returns_variable_disclaimer: 'All returns are variable.',
    insufficient_funds_deposit_prompt: 'Insufficient funds. Would you like to deposit now?',
    investment_activated: 'Investment activated successfully',
    deposit_title: 'Deposit', amount_placeholder: 'Amount', provider_paystack: 'Paystack', provider_nowpayments: 'NOWPayments (Crypto)', provider_flutterwave: 'Flutterwave', provider_crypto: 'Crypto', plan_starter: 'Starter', plan_pro: 'Pro', plan_elite: 'Elite', proceed: 'Proceed', invalid_deposit: 'Invalid deposit', please_login_first: 'Please login first', deposit_recorded: 'Deposit recorded', kyc_required_for_deposits: 'You need an approved KYC to deposit into investment plans.', kyc_level_too_low_for_plan: 'Your KYC level does not allow this plan yet.', kyc_level_too_low_for_amount: 'Your KYC level does not allow this deposit amount.', plan_amount_out_of_range: 'The amount does not match the allowed range for this plan.',
    withdraw_title: 'Withdraw', invalid_withdraw: 'Invalid withdraw', request_submitted: 'Request submitted', withdrawal_recorded: 'Withdrawal recorded', kyc_required_for_withdrawals: 'You need an approved KYC to request withdrawals.', kyc_insufficient_level_for_amount: 'Your KYC level does not allow this withdrawal amount.',
    overview_title: 'Overview', currency_label: 'Currency:', card_wallet_selected: 'Wallet balance (selected)', card_all_wallets_usd: 'All wallets total (USD)', card_all_wallets_currency: 'All wallets total ({currency})', card_invested_active: 'Invested amount (active in pool)', card_withdrawable_profits: 'Withdrawable profits', card_referral_earnings: 'Referral earnings', card_estimated_weekly_roi: 'Estimated weekly ROI', card_sub_based_on_plan: 'Based on current plan', actions_title: 'Actions', deposit_amount_placeholder: 'Deposit amount', withdraw_amount_placeholder: 'Withdraw amount', btn_deposit: 'Deposit', btn_withdraw: 'Withdraw', ai_assistant_title: 'AI Assistant', ai_assistant_desc: 'Live responses will appear here. Use the floating chatbot for now.',
    profile_title: 'Your Profile', user_id_label: 'User ID:', referral_title: 'Referral', referral_code_label: 'Code:', referral_link_label: 'Link:', btn_copy_link: 'Copy Link', btn_share: 'Share', copied_feedback: 'Copied!', btn_generate_referral: 'Generate Referral Code', generating: 'Generating…', share_title: 'Join HybridTradeAI', unable_to_share: 'Unable to share',
    privacy_title: 'Privacy Policy', privacy_p1: 'We collect the minimum necessary information to operate your account, provide services, and comply with KYC/AML requirements.', privacy_p2: 'Data is stored securely and used for authentication, transactions, notifications, and compliance. We do not sell personal data.', privacy_p3: 'You may request data access or deletion subject to legal and regulatory obligations.',
    faqs_title: 'FAQs', faqs_q1_title: 'How do I get started?', faqs_q1_body: 'Register an account, complete KYC, choose a plan, and deposit.', faqs_q2_title: 'When are profits credited?', faqs_q2_body: 'Weekly credits occur on Day 7 of each 14‑day cycle.', faqs_q3_title: 'When can I withdraw principal?', faqs_q3_body: 'Principal unlocks at Day 14 after the cycle completes.', faqs_q4_title: 'Which payment methods are supported?', faqs_q4_body: 'Cards, local gateways, bank transfer, and crypto where available.', faqs_q5_title: 'Where can I see transparency details?', faqs_q5_body: 'Visit the Proof‑of‑Reserves page.',
    terms_title: 'Terms & Conditions and Risk Disclosure', terms_p1: 'By using HybridTradeAI, you acknowledge that investing involves risk. All returns are variable. You should only invest what you can afford to lose.', terms_p2: 'Hybrid cycles run for 14 days. Profits are credited at Day 7 to your Withdrawable Balance. Principal unlocks at Day 14 and can be withdrawn thereafter. Principal remains locked during the cycle.', terms_p3: 'Withdrawals from the Withdrawable Balance can be requested at any time, subject to KYC approval and rate limits. Large withdrawals may be subject to manual review and temporary holds per AML policies.', terms_p4: 'The platform applies a configurable service fee (5–10%) deducted from gross profits before distribution. Plan ROI ranges are displayed as expectations and may be adjusted based on weekly performance inputs.', terms_p5: 'By proceeding, you agree to our privacy policy, AML/KYC requirements, and the outlined operational processes. For any queries or compliance-related concerns, contact support.',
    kyc_title: 'KYC Verification', kyc_subtitle: 'Securely verify your identity to unlock withdrawals and advanced features.', status_label: 'Status:', submitted_label: 'Submitted:', step_of: 'Step {step} of {total}', full_name_label: 'Full Name', dob_label: 'Date of Birth', address_label: 'Address', kyc_level_label: 'KYC Level', level_value: 'Level {l}', gov_id_type_label: 'Government ID Type', country_label: 'Country', id_type_label: 'ID Type', gov_id_number_label: 'Government ID Number', id_expiry_label: 'ID Expiry Date', upload_gov_id_label: 'Upload Government ID', accepted_files_note: 'Accepted: JPG, PNG, PDF up to 10MB', selfie_liveness_label: 'Selfie Liveness', start_camera: 'Start Camera', capture_neutral: 'Capture Neutral', capture_smile: 'Capture Smile', capture_left: 'Capture Left', capture_right: 'Capture Right', review_and_submit: 'Review and submit.', submit_kyc: 'Submit KYC', already_approved: 'Already Approved', submitting: 'Submitting…', kyc_submitted_msg: 'KYC submitted for review', selfie_instructions: 'Please capture the following in order: 1) Neutral face, 2) Smile, 3) Turn head left, 4) Turn head right. You can also upload photos instead of live capture.', use_camera: 'Use camera', captured: 'Captured', auto_capture: 'Auto capture all', capturing: 'Capturing...', camera_on: 'Camera active', camera_off: 'Camera off', auto_capture_hint: 'Auto mode captures Neutral, Smile, Left, Right with a 3‑second pose check', current: 'Current', countdown: 'Capturing in', pose_neutral: 'Look straight with a neutral face', pose_smile: 'Look straight and smile', pose_left: 'Turn your head slightly to the left', pose_right: 'Turn your head slightly to the right',
    admin_withdrawals_title: 'Withdrawals', loading_ellipsis: 'Loading…', table_user: 'User', table_amount: 'Amount', table_currency: 'Currency', table_to_address: 'To Address', table_status: 'Status', table_created: 'Created', table_actions: 'Actions', confirm: 'Confirm', reject: 'Reject', withdrawal_status_confirmed: 'Withdrawal confirmed', withdrawal_status_rejected: 'Withdrawal rejected',
    toggle_theme: 'Toggle theme', theme_label: 'Theme', theme_light: 'Light', theme_dark: 'Dark', language_label: 'Language',
    filter_currency: 'Currency', filter_date_from: 'From date', filter_date_to: 'To date', export_csv: 'Export CSV', empty_rows: 'No rows'
    , homepage: {
      title: 'AI‑powered hybrid investing',
      subtitle: 'Diversify across trading, staking, copy‑trading, ads and tasks with automated profit allocation and real‑time transparency.',
      hero_title: 'Discover the plan that fits your strategy',
      hero_cta: 'Get started',
      reviews_title: 'Excellent',
      reviews_based_on: 'Based on live reviews',
      broker_title: 'A broker built for traders, by traders',
      trade_now: 'Trade now',
      new_to_trading_title: 'New to trading?',
      start_copy_trading: 'Start copy‑trading now',
      platforms_title: 'Platforms you can trust',
      one_platform: 'One platform for all your needs',
      trading_made: 'Trading made effortless'
    },
    about_page: {
      title: 'About HybridTradeAI',
      overview: 'HybridTradeAI is a next-generation decentralized finance platform that combines high-frequency algorithmic trading, copy-trading, and staking into a unified, transparent investment ecosystem. Our mission is to democratize access to institutional-grade trading strategies through AI-driven allocation.',
      revenue_streams: 'Our Hybrid Revenue Streams',
      investment_plans: 'Investment Tiers',
      profit_allocation: 'Profit Allocation Logic',
      company_revenue_model: 'Sustainability Model',
      streams: {
        alg_trading: { title: 'Algorithmic Trading', desc: 'High-frequency AI bots executing trades across crypto and forex markets with sub-millisecond latency to capture micro-inefficiencies.' },
        staking_yield: { title: 'DeFi Staking', desc: 'Secure yield farming and liquidity provision across major protocols (AAVE, Curve, Uniswap) to ensure a stable baseline return.' },
        copy_trading: { title: 'Social Copy Trading', desc: 'Automatically mirroring the positions of top-ranked human traders with a proven track record of high ROI and low drawdown.' },
        ads_affiliate: { title: 'Ad & Affiliate Network', desc: 'Revenue generated from strategic partnerships and premium ad placements within our high-traffic ecosystem.' },
        task_engagement: { title: 'Task & Engagement', desc: 'Community-driven value creation where users earn rewards for data validation, social engagement, and platform growth.' },
        ai_allocator: { title: 'AI Risk Allocator', desc: 'Our proprietary "Neural Allocator" dynamically shifts capital between high-risk trading and low-risk staking based on real-time market volatility.' },
        fees: { title: 'Performance Fees', desc: 'We only succeed when you do. A small performance fee is deducted from profits to fund ongoing development and the reserve pool.' }
      },
      plans: {
        starter: { title: 'Starter', allocation: '60% Staking / 40% Trading', streams: 'Access to basic Algo & Staking', weekly: 'Consistent stable growth', benefits: 'Ideal for beginners minimizing risk.' },
        pro: { title: 'Pro', allocation: '40% Staking / 60% Trading', streams: 'Full Algo, Staking & Copy Trading', weekly: 'Enhanced yield potential', benefits: 'Balanced risk-reward for serious investors.' },
        elite: { title: 'Elite', allocation: '20% Staking / 80% Trading', streams: 'Priority access to all streams + Beta strategies', weekly: 'Maximum aggressive growth', benefits: 'Institutional-grade tools and priority support.' }
      }
    },
    contact_page: {
      title: 'Contact Us',
      support_title: 'Support',
      email_label: 'Email',
      phone_label: 'Phone',
      address_label: 'Address',
      hours_label: 'Hours',
      contact_cta: 'Email support'
    }
  },
  // contact page
  // leave other languages to remote JSON overrides
  es: { plans: 'Planes', about: 'Acerca de', contact: 'Contacto', register: 'Registrarse', login: 'Iniciar sesión', how_it_works: 'Cómo Funciona', choose_plan: 'Elegir Plan', get_started: 'Comenzar', safety: 'Seguridad', faqs: 'Preguntas', privacy: 'Privacidad', terms: 'Términos', homepage: { title: 'Inversión híbrida impulsada por IA.', subtitle: 'HybridTradeAI distribuye su capital entre trading, staking, copy‑trading, anuncios y tareas con cálculo de beneficios automatizado y transparencia en tiempo real.', hero_title: '¿Quieres mejores retornos? Descubre si el copy trading o el trading manual se ajusta a tu estrategia en 10 minutos', hero_cta: 'Hablar con mi gestor de cuenta', reviews_title: 'Excelente', reviews_based_on: 'Basado en 1.596 reseñas', broker_title: 'Un bróker hecho para traders, por traders', trade_now: 'Operar ahora', new_to_trading_title: '¿Nuevo en trading?', start_copy_trading: 'Comenzar Copy Trading ahora', platforms_title: 'Plataformas en las que puedes confiar', one_platform: 'Una plataforma para todas tus necesidades de trading', trading_made: 'Trading sin esfuerzo', live_activity: 'Actividad en tiempo real', users_joined: 'Usuarios registrados', aum: 'AUM', active_online: 'Traders activos en línea', signals: 'Señales', risk_controls: 'Controles de riesgo', compliance: 'Cumplimiento', streams_title: 'Fuentes de ingresos híbridas', deposit: 'Depósito', pool: 'Pool de inversión central (segregado)', pipeline: 'Fuentes de ingresos → Calculadora de beneficios → Panel' }, about_page: { title: 'Acerca de HybridTradeAI', overview: 'Descripción general del modelo de ingresos diversificado de la plataforma, planes transparentes, fórmula de asignación de beneficios y estructura de ingresos de la empresa.', revenue_streams: 'Fuentes de ingresos', investment_plans: 'Planes de inversión — Asignaciones y beneficios', profit_allocation: 'Asignación de beneficios — Fórmula y ejemplo', company_revenue_model: 'Modelo de ingresos de la empresa', admin_controls: 'Controles y operaciones de administración', transparency_backup: 'Transparencia y planes de respaldo — Seguridad primero', payment_systems: 'Sistemas de pago — Depósitos y retiros', deposit_withdrawal_flow: 'Flujo de depósito y retiro', streams: { alg_trading: { title: 'Trading Algorítmico', desc: 'Estrategias automatizadas en forex, cripto e índices. Contribución esperada: 40% del pool activo en Pro/Elite. Aporte semanal potencial: 8–20% según el mercado. Riesgo: Medio—gestionado con stop‑loss y tamaño de posición.' }, staking_yield: { title: 'Staking y Rendimiento Cripto', desc: 'Bloquear activos en protocolos de staking/préstamo para recompensas. Contribución esperada: 20–30% en Elite, 10–15% en Pro. Aporte semanal: 2–8%. Riesgo: Bajo–Medio—riesgo de protocolo; apoyarse en auditorías.' }, copy_trading: { title: 'Red de Copy‑Trading', desc: 'Asignación a traders profesionales verificados. Contribución esperada: 20–30% en Pro/Elite. Aporte semanal: 10–30% (alta variancia). Riesgo: Alto—riguroso proceso y límites.' }, ads_affiliate: { title: 'Ingresos por Anuncios y Afiliados', desc: 'Monetizar tráfico con anuncios, contenido patrocinado y ofertas de afiliados. Contribución esperada: 10–20% (fuerte en Starter). Aporte semanal: 1–5%. Riesgo: Bajo—menor pero estable.' }, task_engagement: { title: 'Ingresos por Tareas y Participación', desc: 'Tareas patrocinadas (videos, encuestas) con reparto en la plataforma. Contribución esperada: 5–10%. Aporte semanal: 0.5–3%. Riesgo: Bajo—dependiente de la demanda publicitaria.' }, ai_allocator: { title: 'Asignador de Fondos IA', desc: 'Reasignación adaptativa que orienta 5–15% semanal hacia streams con mejor desempeño para mejorar el ROI.' }, fees: { title: 'Comisiones de Servicio y Transacción', desc: 'Comisión de gestión sugerida del 10% de las ganancias, más pequeñas comisiones de depósito/retiro como ingreso operativo estable.' } }, plans: { starter: { title: 'Starter — $100–$500 (Conservador)', allocation: 'Asignación: 70% Anuncios y Tareas, 30% Trading Algorítmico Básico', streams: 'Streams: Anuncios y Afiliados, Ingresos por Tareas, Trading Básico', weekly: 'Aportes semanales: Anuncios 0.5–2%, Tareas 0.5–1.5%, Trading 4–12%', benefits: 'Beneficios: Baja volatilidad, incorporación rápida, tareas educativas, entrada mínima baja' }, pro: { title: 'Pro — $501–$2,000 (Equilibrado)', allocation: 'Asignación: 60% Trading Algorítmico, 25% Copy‑Trading, 15% Anuncios y Tareas', streams: 'Streams: Trading, Copy‑Trading, Anuncios, Tareas, Créditos por referidos', weekly: 'Aportes semanales: Trading 6–18%, Copy‑Trading 8–25%, Anuncios/Tareas 1–4%', benefits: 'Beneficios: Acceso a traders verificados, mayor potencial de retorno, liquidez moderada' }, elite: { title: 'Elite — $2,001–$10,000 (Agresivo y Diversificado)', allocation: 'Asignación: 50% Trading Algorítmico, 30% Staking/Rendimiento, 20% Asignador IA y Copy‑Trading', streams: 'Streams: Trading, Staking/Rendimiento, Asignador IA, Copy‑Trading, Anuncios/Tareas', weekly: 'Aportes semanales: Trading 8–20%, Staking 2–8%, Copy/IA 10–30%', benefits: 'Beneficios: Máximo potencial de retorno, soporte premium, resúmenes de auditoría mensuales, asignaciones opcionales a medida' } }, profit: { steps: { s1: 'Paso 1 — Medir desempeño de streams: p.ej., Trading 12%, Staking 3%, Anuncios 1%.', s2: 'Paso 2 — Aplicar pesos del plan: multiplicar cada resultado por su % de asignación.', s3: 'Paso 3 — Sumar tasas ponderadas: la tasa semanal del plan es la suma de aportes ponderados.', s4: 'Paso 4 — Aplicar al capital: ganancia = monto invertido × tasa semanal del plan.', s5: 'Paso 5 — Comisión de la empresa: deducir comisión de gestión (p.ej., 10% de la ganancia) antes de acreditar la ganancia neta.' } }, company: { items: { mgt_fee: 'Comisión de gestión: 10% sugerido de ganancias netas semanales', perf_carry: 'Rendimiento/Carry: participación opcional sobre un umbral (p.ej., 10% sobre 8% semanal)', txn_fees: 'Comisiones de transacción: pequeñas tarifas de depósito/retiro (p.ej., $1–$3 + 0.5–1.5%)', ads_affiliate: 'Comisiones por anuncios y afiliados: 60–80% del ingreso retenido', premium_services: 'Servicios premium: suscripciones para retiros más rápidos y soporte prioritario' } }, admin: { items: { deposit_confirmation: 'Confirmación de depósito: verificar recibos y marcar fondos activos', withdrawal_approval: 'Aprobación de retiro: revisar KYC, saldos y aprobar pagos; insumos de desempeño si es necesario', verification: 'Verificación: aprobar feeds automatizados o ingresar métricas manualmente', compliance: 'Cumplimiento: monitorear actividad sospechosa, presentar reportes, asegurar KYC/AML', support: 'Soporte al cliente: manejar escalaciones, disputas y reembolsos' } }, transparency: { measures: { segregated_custody: 'Custodia segregada: fondos de clientes separados de fondos operativos', audit_reports: 'Informes de auditoría: auditorías trimestrales independientes y reportes mensuales', realtime_dashboard: 'Panel en tiempo real: asignaciones, NAV, desglose semanal del rendimiento', proof_of_reserves: 'Prueba de reservas (opcional): atestaciones on‑chain o de terceros', logs: 'Registros: trazas inmutables de asignaciones y cálculos' } }, backup: { items: { reserve_buffer: 'Reserva: mantener 5–15% del AUM como reserva de liquidez', conservative_mode: 'Modo conservador: cambio automático a asignaciones más seguras durante estrés de mercado', withdrawal_limits: 'Límites de retiro: topes temporales en estrés extremo para proteger a todos', insurance_custody: 'Seguro y custodia: explorar seguro de activos en custodia', emergency_communication: 'Comunicación de emergencia: páginas de estado y actualizaciones regulares' } }, supported_payments: 'Métodos de pago admitidos', payments: { stripe: 'Stripe: tarjetas globales; comisión ~2.9% + fija; usar Radar + confirmación manual', paystack: 'Paystack: pagos locales para Naira; transferencias bancarias y tarjetas; webhooks', flutterwave: 'Flutterwave: similar a Paystack; admite tarjetas/transferencias; algunos corredores tienen pagos bancarios directos', crypto: 'Cripto (BTC, ETH, stablecoins): transferencias rápidas; usar stablecoins o convertir a activo de custodia; KYC para depósitos grandes', wire: 'Transferencias bancarias: fiables para montos grandes; liquidación 1–5 días; menores comisiones en valores altos' }, flow_items: { deposit_process: 'Depósito: usuario inicia → factura/dirección → paga → admin confirma → fondos activos y asignados por plan', withdrawal_process: 'Retiro: usuario solicita → sistema bloquea monto → admin verifica KYC y saldo → aprueba y paga por el riel elegido', crypto_payouts: 'Pagos cripto: listas blancas de wallets; pagos fiat cumplen validaciones bancarias y AML' } } },
  de: { plans: 'Pläne', about: 'Über uns', contact: 'Kontakt', register: 'Registrieren', login: 'Anmelden', how_it_works: 'So funktioniert’s', choose_plan: 'Plan wählen', get_started: 'Loslegen', safety: 'Sicherheit', faqs: 'FAQs', privacy: 'Datenschutz', terms: 'AGB' },
  pt: { plans: 'Planos', about: 'Sobre', contact: 'Contato', register: 'Registrar', login: 'Entrar', how_it_works: 'Como Funciona', choose_plan: 'Escolher Plano', get_started: 'Começar', safety: 'Segurança', faqs: 'FAQs', privacy: 'Privacidade', terms: 'Termos' },
  zh: { plans: '方案', about: '关于', contact: '联系', register: '注册', login: '登录', how_it_works: '工作原理', choose_plan: '选择方案', get_started: '开始', safety: '安全', faqs: '常见问题', privacy: '隐私', terms: '条款' },
  ja: { plans: 'プラン', about: '概要', contact: '連絡先', register: '登録', login: 'ログイン', how_it_works: '仕組み', choose_plan: 'プランを選択', get_started: '開始', safety: '安全', faqs: 'FAQ', privacy: 'プライバシー', terms: '規約' },
  ko: { plans: '플랜', about: '소개', contact: '문의', register: '등록', login: '로그인', how_it_works: '작동 방식', choose_plan: '플랜 선택', get_started: '시작하기', safety: '안전', faqs: 'FAQ', privacy: '개인정보', terms: '이용약관' },
  ar: { plans: 'الخطط', about: 'نبذة', contact: 'اتصال', register: 'تسجيل', login: 'تسجيل الدخول', how_it_works: 'كيف يعمل', choose_plan: 'اختر خطة', get_started: 'ابدأ', safety: 'الأمان', faqs: 'الأسئلة', privacy: 'الخصوصية', terms: 'الشروط' },
  hi: { plans: 'योजनाएँ', about: 'के बारे में', contact: 'संपर्क', register: 'रजिस्टर', login: 'लॉगिन', how_it_works: 'यह कैसे काम करता है', choose_plan: 'योजना चुनें', get_started: 'शुरू करें', safety: 'सुरक्षा', faqs: 'प्रश्न', privacy: 'गोपनीयता', terms: 'नियम' }
}

function deepGet(obj: Dict, path: string) {
  return path.split('.').reduce((o, k) => (o && k in o ? o[k] : undefined), obj)
}

export function formatStr(s: string, vars?: Record<string, any>) {
  if (!vars) return s
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`))
}

const I18nContext = createContext<{ lang: string; setLang: (v: string) => void; t: (key: string, vars?: Record<string, any>) => string; nf: (n: number, opts?: Intl.NumberFormatOptions) => string; df: (d: Date, opts?: Intl.DateTimeFormatOptions) => string }>({ lang: 'en', setLang: () => {}, t: (k: string) => k, nf: (n: number) => String(n), df: (d: Date) => d.toISOString() })
const warnedKeys = new Set<string>()

export function I18nProvider({ children, initialLang }: { children: React.ReactNode; initialLang?: string }) {
  const [lang, setLang] = useState<string>(initialLang || 'en')
  const [remoteDict, setRemoteDict] = useState<Dict | null>(null)
  useEffect(() => {
    try {
      const cookieLang = (() => { try { const m = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/); return m ? decodeURIComponent(m[1]) : '' } catch { return '' } })()
      const raw = initialLang || cookieLang || document.documentElement.lang || localStorage.getItem('lang') || (navigator.language || 'en').split('-')[0]
      setLang(raw)
      document.documentElement.lang = raw
    } catch {}
  }, [initialLang])
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch(`/i18n/${lang}.json`, { cache: 'no-store' })
        if (!res.ok) { setRemoteDict(null); return }
        const json = await res.json()
        if (active) setRemoteDict(json || null)
      } catch { setRemoteDict(null) }
    })()
    return () => { active = false }
  }, [lang])
  const dict = useMemo(() => ({ ...(baseDict[lang] || baseDict.en), ...(remoteDict || {}) }), [lang, remoteDict])
  const t = (key: string, vars?: Record<string, any>) => {
    const resolved = deepGet(dict, key)
    const found = resolved ?? deepGet(baseDict.en, key) ?? undefined
    if (found === undefined && typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      if (!warnedKeys.has(key)) { console.warn(`[i18n] missing key: ${key}`); warnedKeys.add(key) }
      return key
    }
    return typeof found === 'string' ? formatStr(found, vars) : key
  }
  const nf = (n: number, opts?: Intl.NumberFormatOptions) => {
    try { return new Intl.NumberFormat(lang, opts).format(n) } catch { return String(n) }
  }
  const df = (d: Date, opts?: Intl.DateTimeFormatOptions) => {
    const options = opts || { dateStyle: 'medium', timeStyle: 'short' }
    try { return new Intl.DateTimeFormat(lang, options).format(d) } catch { return d.toLocaleString() }
  }
  const setLangWrapped = (v: string) => {
    setLang(v)
    try { localStorage.setItem('lang', v) } catch {}
    try { document.cookie = `lang=${encodeURIComponent(v)}; path=/; max-age=${60*60*24*365}` } catch {}
    document.documentElement.lang = v
  }
  return <I18nContext.Provider value={{ lang, setLang: setLangWrapped, t, nf, df }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
