import { useState, useEffect } from 'react'
import { Sun, Moon, Languages, ShieldCheck, CheckCircle2, XCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

const translations = {
  en: {
    title: 'RPKI Reference Guide',
    subtitle: 'Interactive guide to Resource Public Key Infrastructure: ROA, VRP, validation states, deployment steps and best practices.',
    sections: {
      what: 'What is RPKI?',
      roa: 'ROA – Route Origin Authorization',
      vrp: 'VRP – Validated ROA Payload',
      states: 'Validation States',
      deploy: 'Deployment Steps',
      bestPractices: 'Best Practices',
    },
    whatContent: 'RPKI (Resource Public Key Infrastructure) is a cryptographic framework that allows network operators to prove ownership of IP address blocks and ASNs. It uses X.509 certificates issued by Regional Internet Registries (RIRs) to authorize which ASNs are allowed to originate specific IP prefixes in BGP.',
    roaFields: [
      { label: 'IP Prefix', desc: 'The IP address block being authorized (e.g. 192.0.2.0/24)' },
      { label: 'ASN', desc: 'The Autonomous System Number authorized to originate the prefix' },
      { label: 'Max Length', desc: 'Maximum prefix length allowed. A /24 ROA with maxLength /24 does not cover /25 announcements.' },
      { label: 'Validity Period', desc: 'Certificate validity dates (typically 1 year, auto-renewed by RIR portal)' },
    ],
    vrpContent: 'A VRP (Validated ROA Payload) is the result of locally validating ROA objects from the RPKI repository. Routers obtain VRPs from an RPKI Validator (e.g. Routinator, FORT, OctoRPKI) via the RTR protocol (RFC 6810).',
    states: [
      {
        name: 'Valid',
        color: '#10b981',
        icon: 'check',
        desc: 'A matching VRP exists: the announcing ASN matches the ROA ASN, and the prefix length is within maxLength.',
        action: 'Accept the route (prefer over NotFound).',
      },
      {
        name: 'Invalid',
        color: '#ef4444',
        icon: 'x',
        desc: 'A ROA exists for the prefix but the announcing ASN does not match, OR the prefix length exceeds maxLength.',
        action: 'Drop the route (BGP RPKI Invalid = route hijack indicator).',
      },
      {
        name: 'NotFound',
        color: '#f59e0b',
        icon: '?',
        desc: 'No ROA exists for this prefix. The route is neither validated nor invalidated.',
        action: 'Accept (legacy behavior) but monitor. Aim to create ROAs for all your prefixes.',
      },
    ],
    deploySteps: [
      { n: 1, title: 'Create ROAs at your RIR', desc: 'Log into ARIN, RIPE NCC, APNIC, LACNIC, or AFRINIC portal and create ROA objects for all your prefixes.' },
      { n: 2, title: 'Deploy an RPKI Validator', desc: 'Install Routinator (NLnet Labs), FORT Validator, or Cloudflare OctoRPKI. Configure it to fetch from all 5 RIR repositories.' },
      { n: 3, title: 'Configure RTR Session on Router', desc: 'Point your BGP router to the validator via RTR protocol. Example: Cisco "rpki server 192.168.1.10 transport tcp port 3323".' },
      { n: 4, title: 'Enable Origin Validation', desc: 'Configure BGP to use RPKI: "bgp bestpath prefix-validate allow-invalid" for monitoring, then move to enforcement.' },
      { n: 5, title: 'Set Route Policies', desc: 'Apply route-maps to reject Invalid routes and optionally prefer Valid routes (higher local-pref).' },
      { n: 6, title: 'Monitor and Audit', desc: 'Check validator sync status, monitor Invalid route counts, subscribe to RPKI alerts from your RIR.' },
    ],
    bestPractices: [
      'Create ROAs for ALL your prefixes, not just the aggregates — include more-specifics you announce.',
      'Set maxLength equal to the exact prefix length unless you intentionally announce more-specifics.',
      'Use at least two geographically distributed RPKI validators for redundancy.',
      'Drop Invalid routes at eBGP edge — this is the most impactful step to stop BGP hijacks.',
      'Monitor for route origin changes that would flip a Valid prefix to Invalid.',
      'Keep ROA validity periods short and use auto-renewal features from your RIR portal.',
      'Test with "show bgp ipv4 unicast rpki" before enforcing to understand your Invalid route volume.',
      'Coordinate with your BGP community peers to also deploy RPKI.',
    ],
    builtBy: 'Built by',
    references: 'References',
    refList: [
      'RFC 6480 – An Infrastructure to Support Secure Internet Routing',
      'RFC 6482 – A Profile for Route Origin Authorizations (ROAs)',
      'RFC 6810 – The Resource Public Key Infrastructure (RPKI) to Router Protocol',
      'RFC 8210 – The Resource Public Key Infrastructure (RPKI) to Router Protocol, Version 1',
      'RFC 6811 – BGP Prefix Origin Validation',
    ],
  },
  pt: {
    title: 'Guia de Referencia RPKI',
    subtitle: 'Guia interativo sobre Resource Public Key Infrastructure: ROA, VRP, estados de validacao, etapas de implantacao e boas praticas.',
    sections: {
      what: 'O que e RPKI?',
      roa: 'ROA – Route Origin Authorization',
      vrp: 'VRP – Validated ROA Payload',
      states: 'Estados de Validacao',
      deploy: 'Etapas de Implantacao',
      bestPractices: 'Boas Praticas',
    },
    whatContent: 'RPKI (Resource Public Key Infrastructure) e um framework criptografico que permite operadores de rede provar a propriedade de blocos de enderecamento IP e ASNs. Utiliza certificados X.509 emitidos pelos Registros Regionais de Internet (RIRs) para autorizar quais ASNs podem originar prefixos IP especificos no BGP.',
    roaFields: [
      { label: 'Prefixo IP', desc: 'O bloco de enderecos IP sendo autorizado (ex: 192.0.2.0/24)' },
      { label: 'ASN', desc: 'O Numero de Sistema Autonomo autorizado a originar o prefixo' },
      { label: 'Tamanho Maximo', desc: 'Comprimento maximo de prefixo permitido. Um ROA /24 com maxLength /24 nao cobre anuncios /25.' },
      { label: 'Periodo de Validade', desc: 'Datas de validade do certificado (tipicamente 1 ano, renovado automaticamente pelo portal do RIR)' },
    ],
    vrpContent: 'Um VRP (Validated ROA Payload) e o resultado da validacao local de objetos ROA do repositorio RPKI. Os roteadores obtem VRPs de um Validador RPKI (ex: Routinator, FORT, OctoRPKI) via protocolo RTR (RFC 6810).',
    states: [
      {
        name: 'Valid',
        color: '#10b981',
        icon: 'check',
        desc: 'Existe um VRP correspondente: o ASN anunciante corresponde ao ASN do ROA e o comprimento do prefixo esta dentro do maxLength.',
        action: 'Aceitar a rota (preferir sobre NotFound).',
      },
      {
        name: 'Invalid',
        color: '#ef4444',
        icon: 'x',
        desc: 'Existe um ROA para o prefixo, mas o ASN anunciante nao corresponde, OU o comprimento do prefixo excede o maxLength.',
        action: 'Descartar a rota (BGP RPKI Invalid = indicador de sequestro de rota).',
      },
      {
        name: 'NotFound',
        color: '#f59e0b',
        icon: '?',
        desc: 'Nao existe ROA para este prefixo. A rota nao e validada nem invalidada.',
        action: 'Aceitar (comportamento legado) mas monitorar. Crie ROAs para todos os seus prefixos.',
      },
    ],
    deploySteps: [
      { n: 1, title: 'Crie ROAs no seu RIR', desc: 'Acesse o portal do ARIN, RIPE NCC, APNIC, LACNIC ou AFRINIC e crie objetos ROA para todos os seus prefixos.' },
      { n: 2, title: 'Implante um Validador RPKI', desc: 'Instale o Routinator (NLnet Labs), FORT Validator ou Cloudflare OctoRPKI. Configure para buscar dos 5 repositorios de RIR.' },
      { n: 3, title: 'Configure Sessao RTR no Roteador', desc: 'Aponte seu roteador BGP para o validador via protocolo RTR. Exemplo Cisco: "rpki server 192.168.1.10 transport tcp port 3323".' },
      { n: 4, title: 'Habilite Validacao de Origem', desc: 'Configure BGP para usar RPKI: "bgp bestpath prefix-validate allow-invalid" para monitoramento, depois mova para enforcement.' },
      { n: 5, title: 'Configure Politicas de Rota', desc: 'Aplique route-maps para rejeitar rotas Invalid e opcionalmente preferir rotas Valid (higher local-pref).' },
      { n: 6, title: 'Monitore e Audite', desc: 'Verifique o status de sincronizacao do validador, monitore contagens de rotas Invalid, assine alertas RPKI do seu RIR.' },
    ],
    bestPractices: [
      'Crie ROAs para TODOS os seus prefixos, nao apenas os agregados — inclua os more-specifics que voce anuncia.',
      'Defina maxLength igual ao comprimento exato do prefixo a menos que voce intencionalmente anuncie more-specifics.',
      'Use pelo menos dois validadores RPKI geograficamente distribuidos para redundancia.',
      'Descarte rotas Invalid na borda eBGP — esta e a etapa mais impactante para parar sequestros BGP.',
      'Monitore mudancas de origem de rota que possam converter um prefixo Valid em Invalid.',
      'Mantenha periodos de validade de ROA curtos e use renovacao automatica pelo portal do RIR.',
      'Teste com "show bgp ipv4 unicast rpki" antes de enforcar para entender o volume de rotas Invalid.',
      'Coordene com seus pares BGP para que eles tambem implantem RPKI.',
    ],
    builtBy: 'Criado por',
    references: 'Referencias',
    refList: [
      'RFC 6480 – Uma Infraestrutura para Suportar Roteamento Internet Seguro',
      'RFC 6482 – Um Perfil para Route Origin Authorizations (ROAs)',
      'RFC 6810 – Protocolo RPKI para Roteador',
      'RFC 8210 – Protocolo RPKI para Roteador, Versao 1',
      'RFC 6811 – Validacao de Origem de Prefixo BGP',
    ],
  },
} as const

type Lang = keyof typeof translations

export default function RpkiReference() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['what', 'states', 'deploy']))

  const t = translations[lang]
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const toggle = (key: string) => setExpanded(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n })

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
        <span className="font-semibold">{title}</span>
        {expanded.has(id) ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
      </button>
      {expanded.has(id) && <div className="px-6 pb-6 pt-0 border-t border-zinc-100 dark:border-zinc-800">{children}</div>}
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-semibold">RPKI Reference</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/rpki-reference" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          <Section id="what" title={t.sections.what}>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pt-4">{t.whatContent}</p>
            {/* Flow diagram */}
            <div className="mt-6 rounded-xl bg-zinc-50 dark:bg-zinc-800 p-6">
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
                {['RIR (RIPE/ARIN/APNIC...)', '→', 'RPKI Certificate', '→', 'ROA Object', '→', 'RPKI Validator', '→', 'RTR Protocol', '→', 'BGP Router', '→', 'Origin Validation'].map((s, i) => (
                  s === '→' ? <span key={i} className="text-zinc-400">{s}</span> : (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">{s}</span>
                  )
                ))}
              </div>
            </div>
          </Section>

          <Section id="roa" title={t.sections.roa}>
            <div className="pt-4 space-y-3">
              {t.roaFields.map(f => (
                <div key={f.label} className="rounded-lg border border-zinc-100 dark:border-zinc-800 px-4 py-3">
                  <p className="text-sm font-semibold mb-1">{f.label}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="vrp" title={t.sections.vrp}>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pt-4">{t.vrpContent}</p>
            <div className="mt-4 rounded-lg bg-zinc-950 dark:bg-black p-4">
              <p className="text-xs text-zinc-500 mb-2">Example VRP table (Routinator)</p>
              <pre className="text-xs font-mono text-green-400">{`ASN       Prefix              Max Len  Trust Anchor
AS15169   8.8.8.0/24          24       ARIN
AS13335   1.1.1.0/24          24       APNIC
AS174     38.0.0.0/8          24       ARIN
AS16509   54.0.0.0/8          28       ARIN`}</pre>
            </div>
          </Section>

          <Section id="states" title={t.sections.states}>
            <div className="pt-4 space-y-4">
              {t.states.map(s => {
                const Icon = s.icon === 'check' ? CheckCircle2 : s.icon === 'x' ? XCircle : HelpCircle
                return (
                  <div key={s.name} className="rounded-xl border-2 p-5 space-y-2" style={{ borderColor: `${s.color}40`, backgroundColor: `${s.color}08` }}>
                    <div className="flex items-center gap-2">
                      <Icon size={20} style={{ color: s.color }} />
                      <span className="font-bold" style={{ color: s.color }}>{s.name}</span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{s.desc}</p>
                    <div className="rounded-lg px-3 py-2 text-xs font-medium" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                      Action: {s.action}
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          <Section id="deploy" title={t.sections.deploy}>
            <div className="pt-4 space-y-4">
              {t.deploySteps.map(s => (
                <div key={s.n} className="flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-bold flex items-center justify-center shrink-0">{s.n}</span>
                  <div>
                    <p className="font-semibold text-sm">{s.title}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="best" title={t.sections.bestPractices}>
            <ul className="pt-4 space-y-2">
              {t.bestPractices.map((bp, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{bp}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-green-500 transition-colors">Gabriel Mowses</a></span>
            <span>MIT License</span>
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <p className="text-xs font-medium text-zinc-500 mb-1">{t.references}</p>
            <ul className="space-y-0.5">
              {t.refList.map(ref => <li key={ref} className="text-xs text-zinc-400">{ref}</li>)}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
