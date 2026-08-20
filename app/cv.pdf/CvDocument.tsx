/**
 * Server-seitig gerendertes PDF des Lebenslaufs, single-source aus lib/cv.ts,
 * dieselben Daten wie die /cv-Seite. Bewusst hell/druckfreundlich (dunkler Text
 * auf Weiß), die Marken-Amber nur als Akzent für Name, Section-Linien und Marker.
 * Standard-Helvetica (kein Custom-Font) für robustes Bundling + korrekte Umlaute.
 *
 * Zweisprachig: die Route reicht `locale` durch (?lang=de|en), Daten kommen aus
 * getCv(locale)/getAbout(locale), sichtbare Fix-Überschriften sind inline übersetzt.
 *
 * Zwei Varianten (?format=voll|kompakt):
 *  - 'voll'    → vollständiger Lebenslauf (Profil, Erfahrung, Projekte, Skills, Sprachen)
 *  - 'kompakt' → scanbarer Ein-Seiter für den Bewerbungsstapel: Ziel + Skills-Matrix
 *                + Top-3-Projekte + zwei Höhepunkte + Sprachen, ohne Erfahrungs-Prosa.
 */
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

import { getCv } from '@/lib/cv';
import { getAbout } from '@/lib/projects';
import type { Locale } from '@/lib/i18n/config';
import { SITE_HOST } from '@/lib/site';

export type CvVariant = 'voll' | 'kompakt';

const ACCENT = '#b8742f';
const INK = '#1a1a1a';
const MUTED = '#555555';
const RULE = '#dddddd';

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 44,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: INK,
    lineHeight: 1.45,
  },
  name: { fontFamily: 'Helvetica-Bold', fontSize: 24, color: ACCENT, letterSpacing: 0.5 },
  role: { fontSize: 10, color: INK, marginTop: 3, fontFamily: 'Helvetica-Bold' },
  goal: { fontSize: 9, color: ACCENT, marginTop: 4 },
  meta: { fontSize: 8.5, color: MUTED, marginTop: 4 },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  section: { marginTop: 16 },
  bulletRow: { flexDirection: 'row', marginBottom: 3 },
  bulletMark: { color: ACCENT, marginRight: 6 },
  bulletText: { flex: 1 },
  expItem: { marginBottom: 9 },
  expHead: { flexDirection: 'row', justifyContent: 'space-between' },
  expRole: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  expPeriod: { fontSize: 8.5, color: MUTED },
  expContext: { fontSize: 8.5, color: MUTED, marginBottom: 3 },
  projItem: { marginBottom: 7 },
  projHead: { flexDirection: 'row', justifyContent: 'space-between' },
  projName: { fontFamily: 'Helvetica-Bold', fontSize: 9.5 },
  projYear: { fontSize: 8.5, color: MUTED },
  projStack: { fontSize: 8, color: MUTED, marginTop: 1 },
  skillRow: { flexDirection: 'row', marginBottom: 3 },
  skillGroup: { fontFamily: 'Helvetica-Bold', width: 118 },
  skillItems: { flex: 1, color: INK },
  langRow: { flexDirection: 'row', marginBottom: 2 },
  langName: { fontFamily: 'Helvetica-Bold', width: 78 },
});

function Bullet({ children }: { children: string }) {
  return (
    <View style={s.bulletRow}>
      <Text style={s.bulletMark}>›</Text>
      <Text style={s.bulletText}>{children}</Text>
    </View>
  );
}

export function CvDocument(
  { locale = 'de', variant = 'voll' }: { locale?: Locale; variant?: CvVariant } = {},
) {
  const lang = locale === 'en' ? 'en' : 'de';
  const about = getAbout(lang);
  const cv = getCv(lang);
  const kompakt = variant === 'kompakt';

  const H = {
    title: lang === 'en' ? 'Résumé' : 'Lebenslauf',
    profile: lang === 'en' ? 'Profile' : 'Profil',
    experience: lang === 'en' ? 'Hands-on practice · self-run' : 'Praxis · Eigenbetrieb',
    education: lang === 'en' ? 'Education' : 'Ausbildung',
    projects: lang === 'en' ? 'Selected projects' : 'Ausgewählte Projekte',
    skills: lang === 'en' ? 'Skills' : 'Fähigkeiten',
    languages: lang === 'en' ? 'Languages' : 'Sprachen',
  };
  const goal =
    lang === 'en'
      ? 'Open to a permanent junior IT administrator role'
      : 'Offen für eine Festanstellung als Junior IT-Administrator';

  const Header = (
    <View>
      <Text style={s.name}>{about.name}</Text>
      <Text style={s.role}>{about.role}</Text>
      <Text style={s.goal}>{goal}</Text>
      <Text style={s.meta}>
        {about.location} · {about.contact.email} · {SITE_HOST}
      </Text>
    </View>
  );

  const SkillsSection = (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{H.skills}</Text>
      {cv.skills.map((g, i) => (
        <View key={i} style={s.skillRow}>
          <Text style={s.skillGroup}>{g.group}</Text>
          <Text style={s.skillItems}>{g.items.join(' · ')}</Text>
        </View>
      ))}
    </View>
  );

  const EducationSection = (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{H.education}</Text>
      {cv.education.map((e, i) => (
        <View key={i} style={s.expItem}>
          <View style={s.expHead}>
            <Text style={s.expRole}>{e.title}</Text>
            <Text style={s.expPeriod}>{e.period}</Text>
          </View>
          <Text style={s.expContext}>{e.context}</Text>
        </View>
      ))}
    </View>
  );

  const LanguagesSection = (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{H.languages}</Text>
      {cv.languages.map((l, i) => (
        <View key={i} style={s.langRow}>
          <Text style={s.langName}>{l.name}</Text>
          <Text>{l.level}</Text>
        </View>
      ))}
    </View>
  );

  function ProjectsSection(limit?: number) {
    const items = typeof limit === 'number' ? cv.projectsFeatured.slice(0, limit) : cv.projectsFeatured;
    return (
      <View style={s.section}>
        <Text style={s.sectionTitle}>{H.projects}</Text>
        {items.map((p, i) => (
          <View key={i} style={s.projItem}>
            <View style={s.projHead}>
              <Text style={s.projName}>{p.name}</Text>
              <Text style={s.projYear}>{p.year}</Text>
            </View>
            <Text>{p.oneLiner}</Text>
            <Text style={s.projStack}>{p.stack.join(' · ')}</Text>
          </View>
        ))}
      </View>
    );
  }

  function ProfileSection(limit?: number) {
    const items = typeof limit === 'number' ? cv.highlights.slice(0, limit) : cv.highlights;
    return (
      <View style={s.section}>
        <Text style={s.sectionTitle}>{H.profile}</Text>
        {items.map((h, i) => (
          <Bullet key={i}>{h}</Bullet>
        ))}
      </View>
    );
  }

  // Kompakter Ein-Seiter: Ziel + Skills-Matrix + Top-3 + zwei Höhepunkte + Sprachen.
  if (kompakt) {
    return (
      <Document title={`${H.title} ${about.name}`} author={about.name} subject={H.title} creator={SITE_HOST}>
        <Page size="A4" style={s.page}>
          {Header}
          {SkillsSection}
          {ProjectsSection(3)}
          {ProfileSection(2)}
          {LanguagesSection}
        </Page>
      </Document>
    );
  }

  return (
    <Document title={`${H.title} ${about.name}`} author={about.name} subject={H.title} creator={SITE_HOST}>
      <Page size="A4" style={s.page}>
        {Header}
        {ProfileSection()}

        {/* Erfahrung */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{H.experience}</Text>
          {cv.experience.map((e, i) => (
            <View key={i} style={s.expItem}>
              <View style={s.expHead}>
                <Text style={s.expRole}>{e.role}</Text>
                <Text style={s.expPeriod}>{e.period}</Text>
              </View>
              <Text style={s.expContext}>{e.context}</Text>
              {e.bullets.map((b, j) => (
                <Bullet key={j}>{b}</Bullet>
              ))}
            </View>
          ))}
        </View>

        {EducationSection}
        {ProjectsSection()}
        {SkillsSection}
        {LanguagesSection}
      </Page>
    </Document>
  );
}
