import { useToast } from '../components/Toast.jsx'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

const API = import.meta.env.VITE_API_URL

/* ── Live Edit Helper ── */
const EditableText = ({ value, onSave, style }) => (
    <span
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onSave(e.target.innerText)}
        style={{ ...style, outline: 'none', borderBottom: '1px dashed transparent', cursor: 'text' }}
        onMouseEnter={(e) => e.target.style.borderBottom = '1px dashed #7c3aed'}
        onMouseLeave={(e) => e.target.style.borderBottom = '1px dashed transparent'}
    >
        {value}
    </span>
)

/* ── Mini SVG Previews ── */
function PreviewModern()    { return <svg viewBox="0 0 120 160" fill="#0f0f1a"><rect width="120" height="160" rx="4"/><rect x="10" y="12" width="60" height="7" fill="#a78bfa"/><rect x="10" y="22" width="40" height="4" fill="#7c3aed" opacity="0.7"/><rect x="10" y="35" width="100" height="2" fill="#7c3aed" opacity="0.3"/><rect x="10" y="45" width="80" height="3" fill="#444"/><rect x="10" y="52" width="90" height="3" fill="#444"/></svg> }
function PreviewClassic()   { return <svg viewBox="0 0 120 160" fill="#fff"><rect width="120" height="160" rx="4" stroke="#eee"/><rect x="30" y="12" width="60" height="7" fill="#1a1a1a"/><rect x="10" y="40" width="100" height="1" fill="#1a1a1a"/><rect x="10" y="50" width="80" height="3" fill="#555"/><rect x="10" y="58" width="60" height="3" fill="#555"/></svg> }
function PreviewExecutive() { return <svg viewBox="0 0 120 160" fill="#fff"><rect width="120" height="160" rx="4"/><rect width="120" height="40" fill="#1e3a5f"/><rect x="10" y="15" width="50" height="5" fill="#fff"/><rect x="10" y="50" width="100" height="2" fill="#1e3a5f"/></svg> }
function PreviewCreative()  { return <svg viewBox="0 0 120 160" fill="#fff"><rect width="120" height="160" rx="4"/><rect width="40" height="160" fill="#2d1b69"/><circle cx="20" cy="25" r="10" fill="#7c3aed"/><rect x="50" y="15" width="60" height="5" fill="#1a1a1a"/></svg> }
function PreviewMinimal()   { return <svg viewBox="0 0 120 160" fill="#fafafa"><rect width="120" height="160" rx="4"/><rect x="10" y="15" width="80" height="8" fill="#000"/><rect x="10" y="35" width="100" height="0.5" fill="#ccc"/><rect x="10" y="45" width="70" height="3" fill="#666"/></svg> }

const TEMPLATES = [
    { id: 'modern',    name: 'Modern Dark',  preview: PreviewModern    },
    { id: 'classic',   name: 'Classic Pro',  preview: PreviewClassic   },
    { id: 'executive', name: 'Executive',    preview: PreviewExecutive },
    { id: 'creative',  name: 'Creative',     preview: PreviewCreative  },
    { id: 'minimal',   name: 'Minimal',      preview: PreviewMinimal   },
]

/* ════════════════════════════════════════════════
   MODERN DARK TEMPLATE
════════════════════════════════════════════════ */
function ModernTemplate({ data, updateData }) {
    const s = {
        wrap:      { fontFamily: 'sans-serif', background: '#0f0f1a', color: '#e2e8f0', padding: '40px' },
        name:      { color: '#a78bfa', fontSize: '28px', fontWeight: 800, marginBottom: '4px' },
        title:     { color: '#7c3aed', fontSize: '14px', marginBottom: '6px' },
        contact:   { fontSize: '12px', color: '#94a3b8', marginBottom: '6px' },
        links:     { fontSize: '12px', color: '#64748b', marginBottom: '20px' },
        link:      { color: '#7c3aed', textDecoration: 'none', marginRight: '14px' },
        sectionH:  { borderBottom: '1px solid #7c3aed', color: '#a78bfa', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', paddingBottom: '4px', marginTop: '20px', marginBottom: '10px' },
        text:      { fontSize: '13px', lineHeight: 1.7, color: '#cbd5e1' },
        skillWrap: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' },
        skillTag:  { background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa', padding: '3px 10px', borderRadius: '99px', fontSize: '12px' },
        expTitle:  { fontWeight: 700, fontSize: '14px', color: '#e2e8f0' },
        expMeta:   { fontSize: '12px', color: '#7c3aed', marginBottom: '4px' },
        bullet:    { fontSize: '13px', color: '#cbd5e1', marginLeft: '12px', lineHeight: 1.6 },
        projName:  { fontWeight: 700, fontSize: '13px', color: '#a78bfa', marginBottom: '3px' },
        projDesc:  { fontSize: '12px', color: '#94a3b8', marginBottom: '4px', lineHeight: 1.5 },
        techTag:   { background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', color: '#22d3ee', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', marginRight: '4px', marginBottom: '4px', display: 'inline-block' },
        certItem:  { fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' },
        achItem:   { fontSize: '13px', color: '#fbbf24', marginBottom: '4px', marginLeft: '12px' },
    }
    return (
        <div style={s.wrap}>
            <div style={s.name}><EditableText value={data.name} onSave={v => updateData('name', v)} /></div>
            <div style={s.title}><EditableText value={data.jobTitle} onSave={v => updateData('jobTitle', v)} /></div>
            <div style={s.contact}>{data.email}{data.phone && `  |  ${data.phone}`}</div>
            {(data.linkedin || data.github) && (
                <div style={s.links}>
                    {data.linkedin && <a href={data.linkedin} style={s.link}>🔗 LinkedIn</a>}
                    {data.github   && <a href={data.github}   style={s.link}>🐙 GitHub</a>}
                </div>
            )}
            {data.summary && <>
                <div style={s.sectionH}>Summary</div>
                <p style={s.text}><EditableText value={data.summary} onSave={v => updateData('summary', v)} /></p>
            </>}
            {data.skills?.length > 0 && <>
                <div style={s.sectionH}>Skills</div>
                <div style={s.skillWrap}>{data.skills.map((sk, i) => <span key={i} style={s.skillTag}>{sk}</span>)}</div>
            </>}
            {data.experience?.length > 0 && <>
                <div style={s.sectionH}>Experience</div>
                {data.experience.map((exp, i) => (
                    <div key={i} style={{ marginBottom: '14px' }}>
                        <div style={s.expTitle}>{exp.title} — {exp.company}</div>
                        <div style={s.expMeta}>{exp.duration}</div>
                        {exp.points?.map((pt, j) => <div key={j} style={s.bullet}>• {pt}</div>)}
                    </div>
                ))}
            </>}
            {data.projects?.length > 0 && <>
                <div style={s.sectionH}>Projects</div>
                {data.projects.map((proj, i) => (
                    <div key={i} style={{ marginBottom: '14px' }}>
                        <div style={s.projName}>{proj.name}</div>
                        <div style={s.projDesc}>{proj.description}</div>
                        <div>{proj.techStack?.map((t, j) => <span key={j} style={s.techTag}>{t}</span>)}</div>
                    </div>
                ))}
            </>}
            {data.certifications?.length > 0 && <>
                <div style={s.sectionH}>Certifications</div>
                {data.certifications.map((c, i) => (
                    <div key={i} style={s.certItem}>
                        🏅 <strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ''}
                    </div>
                ))}
            </>}
            {data.achievements?.length > 0 && <>
                <div style={s.sectionH}>Achievements</div>
                {data.achievements.map((a, i) => <div key={i} style={s.achItem}>★ {a}</div>)}
            </>}
            {data.education?.length > 0 && <>
                <div style={s.sectionH}>Education</div>
                {data.education.map((edu, i) => (
                    <div key={i} style={{ marginBottom: '10px' }}>
                        <div style={s.expTitle}>{edu.degree}</div>
                        <div style={s.expMeta}>
                            {edu.college && edu.college.toLowerCase() !== 'not specified' ? edu.college : ''}
                            {edu.year ? ` • ${edu.year}` : ''}
                        </div>
                    </div>
                ))}
            </>}
        </div>
    )
}

/* ════════════════════════════════════════════════
   CLASSIC PRO TEMPLATE
════════════════════════════════════════════════ */
function ClassicTemplate({ data, updateData }) {
    const s = {
        wrap:     { fontFamily: 'Georgia, serif', background: '#fff', color: '#1a1a1a', padding: '48px' },
        header:   { textAlign: 'center', borderBottom: '2px solid #1a1a1a', paddingBottom: '16px', marginBottom: '20px' },
        name:     { fontSize: '26px', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px' },
        title:    { fontSize: '13px', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' },
        contact:  { fontSize: '12px', color: '#777', marginTop: '6px' },
        sectionH: { fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: '1px solid #1a1a1a', paddingBottom: '3px', marginTop: '18px', marginBottom: '10px' },
        text:     { fontSize: '13px', lineHeight: 1.7 },
        skills:   { fontSize: '13px', lineHeight: 1.8 },
        expTitle: { fontWeight: 700, fontSize: '14px' },
        expMeta:  { fontSize: '12px', color: '#666', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' },
        bullet:   { fontSize: '13px', marginLeft: '14px', lineHeight: 1.6 },
        projName: { fontWeight: 700, fontSize: '13px', marginBottom: '2px' },
        projDesc: { fontSize: '13px', color: '#444', marginBottom: '4px', lineHeight: 1.5 },
        techRow:  { fontSize: '12px', color: '#666' },
        certItem: { fontSize: '13px', marginBottom: '3px' },
        achItem:  { fontSize: '13px', marginBottom: '3px', marginLeft: '14px' },
    }
    return (
        <div style={s.wrap}>
            <div style={s.header}>
                <div style={s.name}><EditableText value={data.name} onSave={v => updateData('name', v)} /></div>
                <div style={s.title}><EditableText value={data.jobTitle} onSave={v => updateData('jobTitle', v)} /></div>
                <div style={s.contact}>
                    {data.email}{data.phone && ` | ${data.phone}`}
                    {data.linkedin && ` | ${data.linkedin}`}
                    {data.github   && ` | ${data.github}`}
                </div>
            </div>
            {data.summary && <>
                <div style={s.sectionH}>Professional Summary</div>
                <p style={s.text}><EditableText value={data.summary} onSave={v => updateData('summary', v)} /></p>
            </>}
            {data.skills?.length > 0 && <>
                <div style={s.sectionH}>Core Skills</div>
                <div style={s.skills}>{data.skills.join(' • ')}</div>
            </>}
            {data.experience?.length > 0 && <>
                <div style={s.sectionH}>Work Experience</div>
                {data.experience.map((exp, i) => (
                    <div key={i} style={{ marginBottom: '14px' }}>
                        <div style={s.expMeta}>
                            <span style={s.expTitle}>{exp.title}, {exp.company}</span>
                            <span>{exp.duration}</span>
                        </div>
                        {exp.points?.map((pt, j) => <div key={j} style={s.bullet}>• {pt}</div>)}
                    </div>
                ))}
            </>}
            {data.projects?.length > 0 && <>
                <div style={s.sectionH}>Projects</div>
                {data.projects.map((proj, i) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                        <div style={s.projName}>{proj.name}</div>
                        <div style={s.projDesc}>{proj.description}</div>
                        {proj.techStack?.length > 0 &&
                            <div style={s.techRow}>Tech: {proj.techStack.join(', ')}</div>}
                    </div>
                ))}
            </>}
            {data.certifications?.length > 0 && <>
                <div style={s.sectionH}>Certifications</div>
                {data.certifications.map((c, i) => (
                    <div key={i} style={s.certItem}>• {c.name}{c.issuer ? ` — ${c.issuer}` : ''}</div>
                ))}
            </>}
            {data.achievements?.length > 0 && <>
                <div style={s.sectionH}>Achievements</div>
                {data.achievements.map((a, i) => <div key={i} style={s.achItem}>• {a}</div>)}
            </>}
            {data.education?.length > 0 && <>
                <div style={s.sectionH}>Education</div>
                {data.education.map((edu, i) => (
                    <div key={i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <span style={{ fontWeight: 700, fontSize: '13px' }}>{edu.degree}</span>
                            {edu.college && edu.college.toLowerCase() !== 'not specified' &&
                                <span style={{ fontSize: '13px' }}> — {edu.college}</span>}
                        </div>
                        <span style={{ fontSize: '12px', color: '#666' }}>{edu.year}</span>
                    </div>
                ))}
            </>}
        </div>
    )
}

/* ════════════════════════════════════════════════
   EXECUTIVE TEMPLATE
════════════════════════════════════════════════ */
function ExecutiveTemplate({ data, updateData }) {
    const s = {
        wrap:     { fontFamily: 'Helvetica, Arial, sans-serif', background: '#fff', color: '#1a1a1a' },
        header:   { background: '#1e3a5f', color: '#fff', padding: '36px 48px' },
        name:     { fontSize: '28px', fontWeight: 700, letterSpacing: '0.02em', marginBottom: '4px' },
        title:    { fontSize: '13px', color: '#93c5fd', letterSpacing: '0.08em' },
        contact:  { fontSize: '12px', color: '#bfdbfe', marginTop: '6px' },
        body:     { padding: '32px 48px' },
        sectionH: { fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1e3a5f', borderLeft: '4px solid #1e3a5f', paddingLeft: '10px', marginTop: '20px', marginBottom: '10px' },
        text:     { fontSize: '13px', lineHeight: 1.7, color: '#374151' },
        skills:   { display: 'flex', flexWrap: 'wrap', gap: '6px' },
        skillTag: { background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '3px 12px', borderRadius: '4px', fontSize: '12px' },
        expTitle: { fontWeight: 700, fontSize: '14px', color: '#1a1a1a' },
        expMeta:  { fontSize: '12px', color: '#1e3a5f', fontWeight: 600, marginBottom: '4px' },
        bullet:   { fontSize: '13px', color: '#374151', marginLeft: '14px', lineHeight: 1.6 },
        projName: { fontWeight: 700, fontSize: '13px', color: '#1e3a5f', marginBottom: '3px' },
        projDesc: { fontSize: '13px', color: '#374151', marginBottom: '4px', lineHeight: 1.5 },
        techTag:  { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', marginRight: '4px', marginBottom: '4px', display: 'inline-block' },
        certItem: { fontSize: '13px', color: '#374151', marginBottom: '4px' },
        achItem:  { fontSize: '13px', color: '#374151', marginBottom: '4px', marginLeft: '14px' },
    }
    return (
        <div style={s.wrap}>
            <div style={s.header}>
                <div style={s.name}><EditableText value={data.name} onSave={v => updateData('name', v)} /></div>
                <div style={s.title}><EditableText value={data.jobTitle} onSave={v => updateData('jobTitle', v)} /></div>
                <div style={s.contact}>
                    {data.email}{data.phone && ` | ${data.phone}`}
                    {data.linkedin && ` | ${data.linkedin}`}
                    {data.github   && ` | ${data.github}`}
                </div>
            </div>
            <div style={s.body}>
                {data.summary && <>
                    <div style={s.sectionH}>Executive Summary</div>
                    <p style={s.text}><EditableText value={data.summary} onSave={v => updateData('summary', v)} /></p>
                </>}
                {data.skills?.length > 0 && <>
                    <div style={s.sectionH}>Key Competencies</div>
                    <div style={s.skills}>{data.skills.map((sk, i) => <span key={i} style={s.skillTag}>{sk}</span>)}</div>
                </>}
                {data.experience?.length > 0 && <>
                    <div style={s.sectionH}>Professional Experience</div>
                    {data.experience.map((exp, i) => (
                        <div key={i} style={{ marginBottom: '16px' }}>
                            <div style={s.expTitle}>{exp.title}</div>
                            <div style={s.expMeta}>{exp.company} | {exp.duration}</div>
                            {exp.points?.map((pt, j) => <div key={j} style={s.bullet}>▸ {pt}</div>)}
                        </div>
                    ))}
                </>}
                {data.projects?.length > 0 && <>
                    <div style={s.sectionH}>Key Projects</div>
                    {data.projects.map((proj, i) => (
                        <div key={i} style={{ marginBottom: '14px' }}>
                            <div style={s.projName}>{proj.name}</div>
                            <div style={s.projDesc}>{proj.description}</div>
                            <div>{proj.techStack?.map((t, j) => <span key={j} style={s.techTag}>{t}</span>)}</div>
                        </div>
                    ))}
                </>}
                {data.certifications?.length > 0 && <>
                    <div style={s.sectionH}>Certifications</div>
                    {data.certifications.map((c, i) => (
                        <div key={i} style={s.certItem}>✓ {c.name}{c.issuer ? ` — ${c.issuer}` : ''}</div>
                    ))}
                </>}
                {data.achievements?.length > 0 && <>
                    <div style={s.sectionH}>Achievements</div>
                    {data.achievements.map((a, i) => <div key={i} style={s.achItem}>▸ {a}</div>)}
                </>}
                {data.education?.length > 0 && <>
                    <div style={s.sectionH}>Education</div>
                    {data.education.map((edu, i) => (
                        <div key={i} style={{ marginBottom: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '13px' }}>{edu.degree}</span>
                            {edu.college && edu.college.toLowerCase() !== 'not specified' &&
                                <span style={{ fontSize: '13px', color: '#374151' }}> — {edu.college}</span>}
                            {edu.year && <span style={{ fontSize: '13px', color: '#374151' }}>, {edu.year}</span>}
                        </div>
                    ))}
                </>}
            </div>
        </div>
    )
}

/* ════════════════════════════════════════════════
   CREATIVE TEMPLATE (2-column)
════════════════════════════════════════════════ */
function CreativeTemplate({ data, updateData }) {
    const sidebar = { background: '#2d1b69', color: '#e9d5ff', padding: '32px 20px', width: '200px', flexShrink: 0 }
    const main    = { padding: '32px', flex: 1 }
    const sideH   = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a78bfa', borderBottom: '1px solid rgba(167,139,250,0.3)', paddingBottom: '4px', marginTop: '20px', marginBottom: '8px' }
    const mainH   = { fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c3aed', borderBottom: '2px solid #7c3aed', paddingBottom: '3px', marginTop: '20px', marginBottom: '10px' }
    return (
        <div style={{ fontFamily: 'sans-serif', background: '#fff', display: 'flex' }}>
            <div style={sidebar}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
                    {data.name?.charAt(0) || 'R'}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}><EditableText value={data.name} onSave={v => updateData('name', v)} /></div>
                <div style={{ fontSize: '11px', color: '#c4b5fd', marginBottom: '12px' }}><EditableText value={data.jobTitle} onSave={v => updateData('jobTitle', v)} /></div>
                <div style={sideH}>Contact</div>
                <div style={{ fontSize: '11px', lineHeight: 1.8, wordBreak: 'break-all' }}>
                    {data.email}<br />{data.phone}
                    {data.linkedin && <><br /><span style={{ color: '#c4b5fd' }}>{data.linkedin}</span></>}
                    {data.github   && <><br /><span style={{ color: '#c4b5fd' }}>{data.github}</span></>}
                </div>
                {data.skills?.length > 0 && <>
                    <div style={sideH}>Skills</div>
                    {data.skills.map((sk, i) => (
                        <div key={i} style={{ fontSize: '11px', padding: '3px 0', borderBottom: '1px solid rgba(167,139,250,0.15)' }}>{sk}</div>
                    ))}
                </>}
                {data.certifications?.length > 0 && <>
                    <div style={sideH}>Certifications</div>
                    {data.certifications.map((c, i) => (
                        <div key={i} style={{ fontSize: '11px', marginBottom: '6px', color: '#ddd6fe' }}>🏅 {c.name}</div>
                    ))}
                </>}
                {data.education?.length > 0 && <>
                    <div style={sideH}>Education</div>
                    {data.education.map((edu, i) => (
                        <div key={i} style={{ marginBottom: '10px', fontSize: '11px' }}>
                            <div style={{ fontWeight: 700, color: '#ddd6fe' }}>{edu.degree}</div>
                            {edu.college && edu.college.toLowerCase() !== 'not specified' &&
                                <div style={{ color: '#c4b5fd' }}>{edu.college}</div>}
                            <div style={{ color: '#a78bfa' }}>{edu.year}</div>
                        </div>
                    ))}
                </>}
            </div>
            <div style={main}>
                {data.summary && <>
                    <div style={mainH}>About Me</div>
                    <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#374151' }}>
                        <EditableText value={data.summary} onSave={v => updateData('summary', v)} />
                    </p>
                </>}
                {data.experience?.length > 0 && <>
                    <div style={mainH}>Experience</div>
                    {data.experience.map((exp, i) => (
                        <div key={i} style={{ marginBottom: '16px' }}>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a1a' }}>{exp.title}</div>
                            <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 600, marginBottom: '4px' }}>{exp.company} · {exp.duration}</div>
                            {exp.points?.map((pt, j) => <div key={j} style={{ fontSize: '13px', color: '#374151', marginLeft: '12px', lineHeight: 1.6 }}>• {pt}</div>)}
                        </div>
                    ))}
                </>}
                {data.projects?.length > 0 && <>
                    <div style={mainH}>Projects</div>
                    {data.projects.map((proj, i) => (
                        <div key={i} style={{ marginBottom: '14px' }}>
                            <div style={{ fontWeight: 700, fontSize: '13px', color: '#1a1a1a' }}>{proj.name}</div>
                            <div style={{ fontSize: '12px', color: '#374151', marginBottom: '4px', lineHeight: 1.5 }}>{proj.description}</div>
                            <div>{proj.techStack?.map((t, j) => (
                                <span key={j} style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)', padding: '2px 7px', borderRadius: '4px', fontSize: '11px', marginRight: '4px', marginBottom: '4px', display: 'inline-block' }}>{t}</span>
                            ))}</div>
                        </div>
                    ))}
                </>}
                {data.achievements?.length > 0 && <>
                    <div style={mainH}>Achievements</div>
                    {data.achievements.map((a, i) => (
                        <div key={i} style={{ fontSize: '13px', color: '#374151', marginLeft: '12px', marginBottom: '4px' }}>★ {a}</div>
                    ))}
                </>}
            </div>
        </div>
    )
}

/* ════════════════════════════════════════════════
   MINIMAL TEMPLATE
════════════════════════════════════════════════ */
function MinimalTemplate({ data, updateData }) {
    const s = {
        wrap:     { fontFamily: "'Helvetica Neue', Arial, sans-serif", background: '#fafafa', color: '#111', padding: '48px' },
        name:     { fontSize: '30px', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '2px' },
        title:    { fontSize: '13px', color: '#888', marginBottom: '6px' },
        contact:  { fontSize: '12px', color: '#aaa', marginBottom: '4px' },
        links:    { fontSize: '12px', color: '#aaa', marginBottom: '28px' },
        sectionH: { fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginTop: '24px', marginBottom: '10px' },
        divider:  { height: '1px', background: '#e5e5e5', marginBottom: '12px' },
        text:     { fontSize: '13px', lineHeight: 1.8, color: '#333' },
        skills:   { fontSize: '13px', color: '#333', lineHeight: 2 },
        expTitle: { fontWeight: 600, fontSize: '14px' },
        expMeta:  { fontSize: '12px', color: '#999', marginBottom: '4px' },
        bullet:   { fontSize: '13px', color: '#444', marginLeft: '12px', lineHeight: 1.7 },
        projName: { fontWeight: 600, fontSize: '13px', marginBottom: '2px' },
        projDesc: { fontSize: '13px', color: '#555', marginBottom: '4px', lineHeight: 1.5 },
        techRow:  { fontSize: '12px', color: '#888' },
        certItem: { fontSize: '13px', color: '#444', marginBottom: '3px' },
        achItem:  { fontSize: '13px', color: '#444', marginBottom: '3px', marginLeft: '12px' },
    }
    return (
        <div style={s.wrap}>
            <div style={s.name}><EditableText value={data.name} onSave={v => updateData('name', v)} /></div>
            <div style={s.title}><EditableText value={data.jobTitle} onSave={v => updateData('jobTitle', v)} /></div>
            <div style={s.contact}>{data.email}{data.phone && ` · ${data.phone}`}</div>
            {(data.linkedin || data.github) && (
                <div style={s.links}>
                    {data.linkedin && <span>{data.linkedin}</span>}
                    {data.linkedin && data.github && <span> · </span>}
                    {data.github && <span>{data.github}</span>}
                </div>
            )}
            {data.summary && <>
                <div style={s.sectionH}>Summary</div>
                <div style={s.divider} />
                <p style={s.text}><EditableText value={data.summary} onSave={v => updateData('summary', v)} /></p>
            </>}
            {data.skills?.length > 0 && <>
                <div style={s.sectionH}>Skills</div>
                <div style={s.divider} />
                <div style={s.skills}>{data.skills.join('  ·  ')}</div>
            </>}
            {data.experience?.length > 0 && <>
                <div style={s.sectionH}>Experience</div>
                <div style={s.divider} />
                {data.experience.map((exp, i) => (
                    <div key={i} style={{ marginBottom: '16px' }}>
                        <div style={s.expTitle}>{exp.title} <span style={{ fontWeight: 400, color: '#888' }}>@ {exp.company}</span></div>
                        <div style={s.expMeta}>{exp.duration}</div>
                        {exp.points?.map((pt, j) => <div key={j} style={s.bullet}>— {pt}</div>)}
                    </div>
                ))}
            </>}
            {data.projects?.length > 0 && <>
                <div style={s.sectionH}>Projects</div>
                <div style={s.divider} />
                {data.projects.map((proj, i) => (
                    <div key={i} style={{ marginBottom: '14px' }}>
                        <div style={s.projName}>{proj.name}</div>
                        <div style={s.projDesc}>{proj.description}</div>
                        {proj.techStack?.length > 0 &&
                            <div style={s.techRow}>Stack: {proj.techStack.join(', ')}</div>}
                    </div>
                ))}
            </>}
            {data.certifications?.length > 0 && <>
                <div style={s.sectionH}>Certifications</div>
                <div style={s.divider} />
                {data.certifications.map((c, i) => (
                    <div key={i} style={s.certItem}>— {c.name}{c.issuer ? ` · ${c.issuer}` : ''}</div>
                ))}
            </>}
            {data.achievements?.length > 0 && <>
                <div style={s.sectionH}>Achievements</div>
                <div style={s.divider} />
                {data.achievements.map((a, i) => <div key={i} style={s.achItem}>— {a}</div>)}
            </>}
            {data.education?.length > 0 && <>
                <div style={s.sectionH}>Education</div>
                <div style={s.divider} />
                {data.education.map((edu, i) => (
                    <div key={i} style={{ marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{edu.degree}</span>
                        {edu.college && edu.college.toLowerCase() !== 'not specified' &&
                            <span style={{ fontSize: '13px', color: '#888' }}> · {edu.college}</span>}
                        {edu.year && <span style={{ fontSize: '13px', color: '#888' }}> · {edu.year}</span>}
                    </div>
                ))}
            </>}
        </div>
    )
}

/* ════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════ */
export default function TailoredResume() {
    const toast = useToast()  // ← ADDED
    const [resumes, setResumes]       = useState([])
    const [resumeId, setResumeId]     = useState('')
    const [jobDesc, setJobDesc]       = useState('')
    const [loading, setLoading]       = useState(false)
    const [resumeData, setResumeData] = useState(null)
    const [template, setTemplate]     = useState('modern')
    const [stage, setStage]           = useState(0)
    const navigate  = useNavigate()
    const token     = localStorage.getItem('token')
    const printRef  = useRef(null)
    const stages    = ['Reading resume...', 'Matching JD...', 'Tailoring content...', 'Optimizing ATS...']

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        axios.get(`${API}/api/resume/list`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setResumes(r.data))
    }, [])

    useEffect(() => {
        if (!loading) { setStage(0); return }
        const t = setInterval(() => setStage(s => (s + 1) % stages.length), 1100)
        return () => clearInterval(t)
    }, [loading])

    const updateResumeData = (key, value) => setResumeData(prev => ({ ...prev, [key]: value }))

    const generate = async () => {
        if (!resumeId || !jobDesc) { toast.warning('Select resume and paste JD'); return }  // ← CHANGED
        setLoading(true); setResumeData(null)
        try {
            const res = await axios.post(
                `${API}/api/resume/tailor`,
                { resumeId, jobDescription: jobDesc },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const parsed = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
            if (!Array.isArray(parsed.skills))          parsed.skills = []
            if (!Array.isArray(parsed.experience))      parsed.experience = []
            if (!Array.isArray(parsed.education))       parsed.education = []
            if (!Array.isArray(parsed.projects))        parsed.projects = []
            if (!Array.isArray(parsed.certifications))  parsed.certifications = []
            if (!Array.isArray(parsed.achievements))    parsed.achievements = []
            setResumeData(parsed)
        } catch (e) { toast.error('Generation failed. Please try again.') }  // ← CHANGED
        setLoading(false)
    }

    const saveToDatabase = async () => {
        if (!resumeData) return
        setLoading(true)
        try {
            await axios.post(`${API}/api/resume/save-tailored`, {
                resumeId, jobTitle: resumeData.jobTitle, tailoredData: resumeData
            }, { headers: { Authorization: `Bearer ${token}` } })
            toast.success('Resume saved successfully!')  // ← CHANGED
            navigate('/resumes')
        } catch { toast.error('Failed to save resume') }  // ← CHANGED
        setLoading(false)
    }

    const downloadPDF = () => {
        const el = printRef.current
        const w  = window.open('', '_blank')
        w.document.write(`<html><head><title>Resume</title><style>body{margin:0}*{box-sizing:border-box}a{color:inherit}</style></head><body>${el.innerHTML}</body></html>`)
        w.document.close(); w.focus()
        setTimeout(() => { w.print(); w.close() }, 500)
    }

    const downloadDOCX = async () => {
        if (!resumeData) return
        const children = [
            new Paragraph({ text: resumeData.name,     heading: HeadingLevel.TITLE }),
            new Paragraph({ text: resumeData.jobTitle, heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: `${resumeData.email || ''}  |  ${resumeData.phone || ''}` }),
            ...(resumeData.linkedin ? [new Paragraph({ text: resumeData.linkedin })] : []),
            ...(resumeData.github   ? [new Paragraph({ text: resumeData.github   })] : []),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'SUMMARY', heading: HeadingLevel.HEADING_3 }),
            new Paragraph({ text: resumeData.summary || '' }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'SKILLS', heading: HeadingLevel.HEADING_3 }),
            new Paragraph({ text: (resumeData.skills || []).join(', ') }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'EXPERIENCE', heading: HeadingLevel.HEADING_3 }),
            ...(resumeData.experience || []).flatMap(exp => [
                new Paragraph({ text: `${exp.title} — ${exp.company} (${exp.duration})`, heading: HeadingLevel.HEADING_4 }),
                ...(exp.points || []).map(pt => new Paragraph({ text: `• ${pt}` })),
                new Paragraph({ text: '' }),
            ]),
            new Paragraph({ text: 'PROJECTS', heading: HeadingLevel.HEADING_3 }),
            ...(resumeData.projects || []).flatMap(proj => [
                new Paragraph({ text: proj.name, heading: HeadingLevel.HEADING_4 }),
                new Paragraph({ text: proj.description || '' }),
                new Paragraph({ text: `Tech: ${(proj.techStack || []).join(', ')}` }),
                new Paragraph({ text: '' }),
            ]),
            ...(resumeData.certifications?.length ? [
                new Paragraph({ text: 'CERTIFICATIONS', heading: HeadingLevel.HEADING_3 }),
                ...(resumeData.certifications || []).map(c =>
                    new Paragraph({ text: `• ${c.name}${c.issuer ? ` — ${c.issuer}` : ''}` })
                ),
                new Paragraph({ text: '' }),
            ] : []),
            ...(resumeData.achievements?.length ? [
                new Paragraph({ text: 'ACHIEVEMENTS', heading: HeadingLevel.HEADING_3 }),
                ...(resumeData.achievements || []).map(a => new Paragraph({ text: `• ${a}` })),
                new Paragraph({ text: '' }),
            ] : []),
            new Paragraph({ text: 'EDUCATION', heading: HeadingLevel.HEADING_3 }),
            ...(resumeData.education || []).map(edu => {
                const collegePart = edu.college && edu.college.toLowerCase() !== 'not specified'
                    ? ` — ${edu.college}` : ''
                return new Paragraph({ text: `${edu.degree}${collegePart} (${edu.year})` })
            }),
        ]
        const doc  = new Document({ sections: [{ children }] })
        const blob = await Packer.toBlob(doc)
        saveAs(blob, `${resumeData.name}_Tailored.docx`)
    }

    const TemplateComponent = {
        modern:    ModernTemplate,
        classic:   ClassicTemplate,
        executive: ExecutiveTemplate,
        creative:  CreativeTemplate,
        minimal:   MinimalTemplate,
    }[template]

    return (
        <div style={{ padding: '40px', background: '#080812', minHeight: '100vh', color: '#fff' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ marginBottom: '30px' }}>
                    <h1 className="logo-text">Resume Tailor</h1>
                    <p style={{ color: 'var(--text-3)' }}>AI-powered customization for every job</p>
                </header>

                {/* Step 1: Template Picker */}
                <div style={{ marginBottom: '30px' }}>
                    <div className="section-label">1. Select Template</div>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {TEMPLATES.map(t => (
                            <div key={t.id} onClick={() => setTemplate(t.id)} style={{
                                cursor: 'pointer', width: '100px',
                                border: template === t.id ? '2px solid #7c3aed' : '1px solid #333',
                                borderRadius: '8px', overflow: 'hidden', textAlign: 'center',
                                transition: 'all 0.2s',
                                boxShadow: template === t.id ? '0 0 16px rgba(124,58,237,0.4)' : 'none',
                            }}>
                                <t.preview />
                                <div style={{ fontSize: '10px', padding: '5px', color: template === t.id ? '#a78bfa' : '#888' }}>{t.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 2: Form */}
                <div className="glass" style={{ padding: '30px', marginBottom: '40px' }}>
                    <div className="section-label" style={{ marginBottom: '16px' }}>2. Job Details</div>
                    <select value={resumeId} onChange={e => setResumeId(e.target.value)} className="input-field" style={{ marginBottom: '15px' }}>
                        <option value="">— Select Base Resume —</option>
                        {resumes.map(r => <option key={r.id} value={r.id}>{r.fileName} (v{r.versionNumber})</option>)}
                    </select>
                    <textarea
                        value={jobDesc}
                        onChange={e => setJobDesc(e.target.value)}
                        className="input-field"
                        placeholder="Paste Job Description here..."
                        rows={5}
                        style={{ resize: 'vertical' }}
                    />
                    <button className="btn-primary" onClick={generate} disabled={loading} style={{ width: '100%', marginTop: '20px', justifyContent: 'center', padding: '14px' }}>
                        {loading
                            ? <><span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> {stages[stage]}</>
                            : <><span>✦</span> Generate Tailored Resume</>
                        }
                    </button>
                </div>

                {/* Step 3: Preview + Download */}
                {resumeData && (
                    <div className="page-enter">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ color: 'var(--green)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                                ✓ Click any text to edit inline
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={downloadPDF}    className="btn-ghost"   style={{ fontSize: '13px' }}>↓ PDF</button>
                                <button onClick={downloadDOCX}   className="btn-ghost"   style={{ fontSize: '13px' }}>↓ DOCX</button>
                                <button onClick={saveToDatabase} className="btn-primary" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', fontSize: '13px' }}>💾 Save to Database</button>
                            </div>
                        </div>
                        <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                            <div ref={printRef}>
                                <TemplateComponent data={resumeData} updateData={updateResumeData} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}