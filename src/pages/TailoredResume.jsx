import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'

const API = import.meta.env.VITE_API_URL

/* ── Live Edit Helper ── */
const EditableText = ({ value, onSave, style }) => {
    return (
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
    );
};

/* ─────────────────────────────────────────────────────────
   MINI SVG PREVIEWS (Template Selection Cards)
───────────────────────────────────────────────────────── */
function PreviewModern() { return ( <svg viewBox="0 0 120 160" fill="#0f0f1a"><rect width="120" height="160" rx="4"/><rect x="10" y="12" width="60" height="7" fill="#a78bfa"/><rect x="10" y="22" width="40" height="4" fill="#7c3aed" opacity="0.7"/></svg> ) }
function PreviewClassic() { return ( <svg viewBox="0 0 120 160" fill="#fff"><rect width="120" height="160" rx="4" stroke="#eee"/><rect x="30" y="12" width="60" height="7" fill="#1a1a1a"/><rect x="10" y="40" width="100" height="1" fill="#1a1a1a"/></svg> ) }
function PreviewExecutive() { return ( <svg viewBox="0 0 120 160" fill="#fff"><rect width="120" height="160" rx="4"/><rect width="120" height="40" fill="#1e3a5f"/><rect x="10" y="15" width="50" height="5" fill="#fff"/></svg> ) }
function PreviewCreative() { return ( <svg viewBox="0 0 120 160" fill="#fff"><rect width="120" height="160" rx="4"/><rect width="40" height="160" fill="#2d1b69"/><circle cx="20" cy="25" r="10" fill="#7c3aed"/></svg> ) }
function PreviewMinimal() { return ( <svg viewBox="0 0 120 160" fill="#fafafa"><rect width="120" height="160" rx="4"/><rect x="10" y="15" width="80" height="8" fill="#000"/><rect x="10" y="35" width="100" height="0.5" fill="#ccc"/></svg> ) }

const TEMPLATES = [
    { id: 'modern', name: 'Modern Dark', preview: PreviewModern },
    { id: 'classic', name: 'Classic Pro', preview: PreviewClassic },
    { id: 'executive', name: 'Executive', preview: PreviewExecutive },
    { id: 'creative', name: 'Creative', preview: PreviewCreative },
    { id: 'minimal', name: 'Minimal', preview: PreviewMinimal },
]

/* ── Template Components (Styled & Editable) ── */

function ModernTemplate({ data, updateData }) {
    return (
        <div style={{ fontFamily: "sans-serif", background: '#0f0f1a', color: '#e2e8f0', padding: '40px', minHeight: '100%' }}>
            <h1 style={{ color: '#a78bfa' }}><EditableText value={data.name} onSave={(v) => updateData('name', v)} /></h1>
            <p style={{ color: '#7c3aed' }}><EditableText value={data.jobTitle} onSave={(v) => updateData('jobTitle', v)} /></p>
            <div style={{ marginBottom: '20px', fontSize: '13px' }}>{data.email} | {data.phone}</div>
            <h4 style={{ borderBottom: '1px solid #7c3aed', color: '#7c3aed' }}>SUMMARY</h4>
            <p><EditableText value={data.summary} onSave={(v) => updateData('summary', v)} /></p>
        </div>
    )
}

function ClassicTemplate({ data, updateData }) {
    return (
        <div style={{ fontFamily: "serif", background: '#fff', color: '#1a1a1a', padding: '48px', minHeight: '100%' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #1a1a1a', paddingBottom: '20px' }}>
                <h1><EditableText value={data.name} onSave={(v) => updateData('name', v)} /></h1>
                <p><EditableText value={data.jobTitle} onSave={(v) => updateData('jobTitle', v)} /></p>
            </div>
            <h3>SUMMARY</h3>
            <p><EditableText value={data.summary} onSave={(v) => updateData('summary', v)} /></p>
        </div>
    )
}

// Fallbacks for other templates (Same structure as above)
const ExecutiveTemplate = ClassicTemplate;
const CreativeTemplate = ModernTemplate;
const MinimalTemplate = ClassicTemplate;

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
export default function TailoredResume() {
    const [resumes, setResumes] = useState([])
    const [resumeId, setResumeId] = useState('')
    const [jobDesc, setJobDesc] = useState('')
    const [loading, setLoading] = useState(false)
    const [resumeData, setResumeData] = useState(null)
    const [template, setTemplate] = useState('modern')
    const [stage, setStage] = useState(0)

    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const printRef = useRef(null)
    const stages = ['Reading resume...', 'Matching JD...', 'Tailoring content...', 'Optimizing ATS...']

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

    const updateResumeData = (key, value) => {
        setResumeData(prev => ({ ...prev, [key]: value }));
    }

    const generate = async () => {
        if (!resumeId || !jobDesc) { alert('Select resume and paste JD'); return }
        setLoading(true); setResumeData(null)
        try {
            const res = await axios.post(
                `${API}/api/resume/tailor?resumeId=${resumeId}&jobDescription=${encodeURIComponent(jobDesc)}`,
                {}, { headers: { Authorization: `Bearer ${token}` } }
            )
            setResumeData(typeof res.data === 'string' ? JSON.parse(res.data) : res.data)
        } catch { alert('Generation failed') }
        setLoading(false)
    }

    const saveToDatabase = async () => {
        if (!resumeData) return;
        setLoading(true);
        try {
            await axios.post(`${API}/api/resume/save-tailored`, {
                resumeId: resumeId,
                jobTitle: resumeData.jobTitle,
                tailoredData: resumeData
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert("✓ Resume saved successfully!");
            navigate('/resumes');
        } catch { alert("Failed to save resume") }
        setLoading(false);
    };

    const downloadPDF = () => {
        const el = printRef.current
        const w = window.open('', '_blank')
        w.document.write(`<html><head><title>Resume</title><style>body{margin:0}</style></head><body>${el.innerHTML}</body></html>`)
        w.document.close(); w.focus();
        setTimeout(() => { w.print(); w.close() }, 500)
    }

    const downloadDOCX = async () => {
        if (!resumeData) return
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: resumeData.name, heading: HeadingLevel.TITLE }),
                    new Paragraph({ text: resumeData.summary })
                ]
            }]
        })
        const blob = await Packer.toBlob(doc)
        saveAs(blob, `${resumeData.name}_Tailored.docx`)
    }

    const TemplateComponent = { modern: ModernTemplate, classic: ClassicTemplate, executive: ExecutiveTemplate, creative: CreativeTemplate, minimal: MinimalTemplate }[template]

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
                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                        {TEMPLATES.map(t => (
                            <div key={t.id} onClick={() => setTemplate(t.id)} style={{
                                cursor: 'pointer', width: '100px', border: template === t.id ? '2px solid #7c3aed' : '1px solid #333',
                                borderRadius: '8px', overflow: 'hidden', textAlign: 'center'
                            }}>
                                <t.preview />
                                <div style={{ fontSize: '10px', padding: '5px' }}>{t.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 2: Form */}
                <div className="glass" style={{ padding: '30px', marginBottom: '40px' }}>
                    <div className="section-label">2. Job Details</div>
                    <select value={resumeId} onChange={e => setResumeId(e.target.value)} className="input-field" style={{ marginBottom: '15px' }}>
                        <option value="">Select Base Resume</option>
                        {resumes.map(r => <option key={r.id} value={r.id}>{r.fileName}</option>)}
                    </select>
                    <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} className="input-field" placeholder="Paste Job Description here..." rows={5} />
                    <button className="btn-primary" onClick={generate} disabled={loading} style={{ width: '100%', marginTop: '20px' }}>
                        {loading ? stages[stage] : '✦ Generate Tailored Resume'}
                    </button>
                </div>

                {/* Step 3: Result Preview */}
                {resumeData && (
                    <div className="page-enter">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div style={{ color: 'var(--green)', fontSize: '13px' }}>✓ Click any text to edit</div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={downloadPDF} className="btn-ghost">PDF</button>
                                <button onClick={downloadDOCX} className="btn-ghost">DOCX</button>
                                <button onClick={saveToDatabase} className="btn-primary" style={{ background: '#f59e0b' }}>💾 Save to Database</button>
                            </div>
                        </div>
                        <div ref={printRef} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', color: '#000' }}>
                            <TemplateComponent data={resumeData} updateData={updateResumeData} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}