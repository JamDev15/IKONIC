import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import {
  Plus, LogOut, X, Upload, CheckCircle, RefreshCw,
  Clock, Download, Eye, MessageSquare, Loader2, Copy, Check
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Proof {
  id: string;
  token: string;
  client_name: string;
  client_email: string;
  title: string;
  image_url: string;
  status: 'pending' | 'approved' | 'revision';
  notes: string;
  created_at: string;
}

interface Comment {
  id: string;
  proof_id: string;
  x: number;
  y: number;
  comment: string;
  created_at: string;
}

// ── GHL Webhook ───────────────────────────────────────────────────────────────
const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/YOUR_GHL_HOOK_ID/webhook-trigger/proof-created';

async function fireWebhook(payload: object) {
  try {
    await fetch(GHL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (_) { /* silent */ }
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Proof['status'] }) {
  const map = {
    pending:  { label: 'Pending Review', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    approved: { label: 'Approved',       color: 'bg-mint/20 text-mint border-mint/30' },
    revision: { label: 'Needs Revision', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };
  const { label, color } = map[status];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${color}`}>
      {label}
    </span>
  );
}

// ── Copy Button ───────────────────────────────────────────────────────────────
function CopyLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/proof/${token}`;
  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="flex items-center gap-1 text-xs text-offwhite-dark hover:text-mint transition-colors">
      {copied ? <Check className="w-3 h-3 text-mint" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ProofManager() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [proofs, setProofs]   = useState<Proof[]>([]);
  const [loading, setLoading] = useState(false);

  // New Proof modal
  const [showNew, setShowNew]         = useState(false);
  const [newTitle, setNewTitle]       = useState('');
  const [newClient, setNewClient]     = useState('');
  const [newEmail, setNewEmail]       = useState('');
  const [newNotes, setNewNotes]       = useState('');
  const [newFile, setNewFile]         = useState<File | null>(null);
  const [newPreview, setNewPreview]   = useState('');
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Annotations modal
  const [activeProof, setActiveProof]     = useState<Proof | null>(null);
  const [comments, setComments]           = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus]   = useState(false);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  // ── Load Proofs ────────────────────────────────────────────────────────────
  async function loadProofs() {
    setLoading(true);
    const { data } = await supabase
      .from('proofs')
      .select('*')
      .order('created_at', { ascending: false });
    setProofs(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (session) loadProofs();
  }, [session]);

  // ── Create Proof ───────────────────────────────────────────────────────────
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setNewFile(f);
    setNewPreview(URL.createObjectURL(f));
  }

  async function createProof(e: React.FormEvent) {
    e.preventDefault();
    if (!newFile || !newTitle || !newClient) {
      setCreateError('Title, client name, and image are required.');
      return;
    }
    setCreating(true);
    setCreateError('');

    // Upload image
    const ext  = newFile.name.split('.').pop();
    const path = `proofs/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('proofs').upload(path, newFile);
    if (uploadErr) { setCreateError(uploadErr.message); setCreating(false); return; }

    const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(path);

    // Generate token
    const token = crypto.randomUUID();

    // Insert DB row
    const { data: proof, error: dbErr } = await supabase.from('proofs').insert({
      token,
      client_name:  newClient,
      client_email: newEmail,
      title:        newTitle,
      image_url:    publicUrl,
      status:       'pending',
      notes:        newNotes,
    }).select().single();

    if (dbErr) { setCreateError(dbErr.message); setCreating(false); return; }

    // Fire GHL webhook
    await fireWebhook({
      event:        'proof_created',
      proof_id:     proof.id,
      client_name:  newClient,
      client_email: newEmail,
      title:        newTitle,
      proof_url:    `${window.location.origin}/proof/${token}`,
    });

    setCreating(false);
    setShowNew(false);
    resetNewForm();
    loadProofs();
  }

  function resetNewForm() {
    setNewTitle(''); setNewClient(''); setNewEmail('');
    setNewNotes(''); setNewFile(null); setNewPreview('');
    setCreateError('');
  }

  // ── Load Comments ──────────────────────────────────────────────────────────
  async function openProof(proof: Proof) {
    setActiveProof(proof);
    setCommentsLoading(true);
    const { data } = await supabase
      .from('proof_comments')
      .select('*')
      .eq('proof_id', proof.id)
      .order('created_at');
    setComments(data ?? []);
    setCommentsLoading(false);
  }

  // ── Update Status ──────────────────────────────────────────────────────────
  async function updateStatus(status: Proof['status']) {
    if (!activeProof) return;
    setUpdatingStatus(true);
    await supabase.from('proofs').update({ status }).eq('id', activeProof.id);
    setActiveProof(p => p ? { ...p, status } : p);
    setProofs(ps => ps.map(p => p.id === activeProof.id ? { ...p, status } : p));
    setUpdatingStatus(false);
  }

  // ── Download Approval PDF ──────────────────────────────────────────────────
  function downloadPDF() {
    if (!activeProof) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Proof Approval Record', 20, 20);
    doc.setFontSize(12);
    doc.text(`Title: ${activeProof.title}`, 20, 35);
    doc.text(`Client: ${activeProof.client_name}`, 20, 45);
    doc.text(`Status: ${activeProof.status.toUpperCase()}`, 20, 55);
    doc.text(`Date: ${new Date(activeProof.created_at).toLocaleString()}`, 20, 65);
    doc.text(`Proof URL: ${window.location.origin}/proof/${activeProof.token}`, 20, 75);
    if (comments.length > 0) {
      doc.text('Client Comments:', 20, 90);
      let y = 100;
      comments.forEach((c, i) => {
        doc.text(`${i + 1}. ${c.comment}`, 25, y);
        y += 10;
      });
    }
    doc.save(`proof-${activeProof.title.replace(/\s+/g, '-')}.pdf`);
  }

  // ── Login Screen ───────────────────────────────────────────────────────────
  if (!session) {
    return createPortal(
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0b0d10', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem' }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src="/logo-ikonic.webp" alt="Ikonic" className="h-14 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-offwhite">Proof Manager</h1>
            <p className="text-offwhite-dark text-sm mt-1">Staff access only</p>
          </div>

          <form onSubmit={login} className="bg-charcoal-light border border-white/10 rounded-2xl p-8 flex flex-col gap-4">
            {authError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {authError}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-2">Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-offwhite placeholder-offwhite-dark/40 focus:outline-none focus:border-mint transition-colors"
                placeholder="you@ikonic.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-2">Password</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-offwhite placeholder-offwhite-dark/40 focus:outline-none focus:border-mint transition-colors"
              />
            </div>
            <button
              type="submit" disabled={authLoading}
              className="w-full bg-mint hover:bg-mint-dark text-charcoal font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {authLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>,
      document.body
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0b0d10', overflow: 'auto' }}>
      {/* Header */}
      <header className="bg-charcoal-light border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo-ikonic.webp" alt="Ikonic" className="h-10" />
          <div>
            <h1 className="font-display font-bold text-offwhite">Proof Manager</h1>
            <p className="text-offwhite-dark text-xs">Internal Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-mint hover:bg-mint-dark text-charcoal font-bold px-4 py-2 rounded-xl transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> New Proof
          </button>
          <button onClick={logout} className="flex items-center gap-2 text-offwhite-dark hover:text-offwhite text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      {/* Proof Grid */}
      <main className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-32 gap-3 text-offwhite-dark">
            <Loader2 className="w-5 h-5 animate-spin text-mint" /> Loading proofs…
          </div>
        ) : proofs.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-offwhite-dark mb-4">No proofs yet.</p>
            <button onClick={() => setShowNew(true)} className="btn-primary">
              Create First Proof
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {proofs.map(proof => (
              <div key={proof.id} className="bg-charcoal-light border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                {/* Thumbnail */}
                <div
                  className="relative h-44 bg-charcoal cursor-pointer group"
                  onClick={() => openProof(proof)}
                >
                  <img
                    src={proof.image_url}
                    alt={proof.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <StatusBadge status={proof.status} />
                  <p className="font-semibold text-offwhite text-sm leading-tight">{proof.title}</p>
                  <p className="text-offwhite-dark text-xs">{proof.client_name}</p>
                  {proof.client_email && <p className="text-offwhite-dark/60 text-xs truncate">{proof.client_email}</p>}
                  <p className="text-offwhite-dark/50 text-xs mt-auto">
                    {new Date(proof.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <CopyLink token={proof.token} />
                    <button
                      onClick={() => openProof(proof)}
                      className="flex items-center gap-1 text-xs text-offwhite-dark hover:text-mint transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" /> Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── New Proof Modal ─────────────────────────────────────────────────── */}
      {showNew && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-charcoal-light border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-display font-bold text-offwhite text-lg">New Proof</h2>
              <button onClick={() => { setShowNew(false); resetNewForm(); }}>
                <X className="w-5 h-5 text-offwhite-dark hover:text-offwhite" />
              </button>
            </div>

            <form onSubmit={createProof} className="p-6 flex flex-col gap-5">
              {createError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-2">Proof Title *</label>
                <input
                  type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Ram 1500 Full Wrap v1"
                  className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-offwhite placeholder-offwhite-dark/40 focus:outline-none focus:border-mint transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-2">Client Name *</label>
                <input
                  type="text" required value={newClient} onChange={e => setNewClient(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-offwhite placeholder-offwhite-dark/40 focus:outline-none focus:border-mint transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-2">Client Email</label>
                <input
                  type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-offwhite placeholder-offwhite-dark/40 focus:outline-none focus:border-mint transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-2">Designer Notes</label>
                <textarea
                  value={newNotes} onChange={e => setNewNotes(e.target.value)}
                  placeholder="Any notes about this proof…"
                  rows={3}
                  className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-offwhite placeholder-offwhite-dark/40 focus:outline-none focus:border-mint transition-colors resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-2">Design Image *</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                {newPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <img src={newPreview} alt="Preview" className="w-full h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setNewFile(null); setNewPreview(''); }}
                      className="absolute top-2 right-2 bg-black/60 rounded-full p-1"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/20 hover:border-mint/50 rounded-xl h-36 flex flex-col items-center justify-center gap-2 text-offwhite-dark hover:text-mint transition-all"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Click to upload design image</span>
                  </button>
                )}
              </div>

              <button
                type="submit" disabled={creating}
                className="w-full bg-mint hover:bg-mint-dark text-charcoal font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {creating ? 'Creating…' : 'Create Proof & Send Link'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Annotations Modal ───────────────────────────────────────────────── */}
      {activeProof && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-charcoal-light border border-white/10 rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h2 className="font-display font-bold text-offwhite">{activeProof.title}</h2>
                <p className="text-offwhite-dark text-xs mt-0.5">{activeProof.client_name}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={activeProof.status} />
                <button onClick={() => setActiveProof(null)}>
                  <X className="w-5 h-5 text-offwhite-dark hover:text-offwhite" />
                </button>
              </div>
            </div>

            <div className="p-5 flex flex-col lg:flex-row gap-5">
              {/* Image with comment pins */}
              <div className="flex-1 relative">
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                  <img src={activeProof.image_url} alt={activeProof.title} className="w-full object-contain" />
                  {/* Comment pins */}
                  {comments.map((c, i) => (
                    <div
                      key={c.id}
                      className="absolute w-6 h-6 bg-mint rounded-full flex items-center justify-center text-charcoal text-xs font-bold cursor-pointer border-2 border-charcoal shadow-lg -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${c.x}%`, top: `${c.y}%` }}
                      title={c.comment}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-full lg:w-72 flex flex-col gap-4">
                {/* Client link */}
                <div className="bg-charcoal rounded-xl border border-white/10 p-4">
                  <p className="text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-2">Client Review Link</p>
                  <CopyLink token={activeProof.token} />
                </div>

                {/* Status controls */}
                <div className="bg-charcoal rounded-xl border border-white/10 p-4">
                  <p className="text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-3">Update Status</p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => updateStatus('approved')}
                      disabled={updatingStatus || activeProof.status === 'approved'}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-mint/10 hover:bg-mint/20 text-mint text-sm font-medium transition-all disabled:opacity-40"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Approved
                    </button>
                    <button
                      onClick={() => updateStatus('revision')}
                      disabled={updatingStatus || activeProof.status === 'revision'}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-all disabled:opacity-40"
                    >
                      <RefreshCw className="w-4 h-4" /> Needs Revision
                    </button>
                    <button
                      onClick={() => updateStatus('pending')}
                      disabled={updatingStatus || activeProof.status === 'pending'}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-sm font-medium transition-all disabled:opacity-40"
                    >
                      <Clock className="w-4 h-4" /> Set Pending
                    </button>
                  </div>
                </div>

                {/* Comments */}
                <div className="bg-charcoal rounded-xl border border-white/10 p-4 flex-1">
                  <p className="text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-3">
                    Client Comments ({comments.length})
                  </p>
                  {commentsLoading ? (
                    <div className="flex items-center gap-2 text-offwhite-dark text-xs">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading…
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-offwhite-dark/50 text-xs">No comments yet.</p>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                      {comments.map((c, i) => (
                        <div key={c.id} className="flex gap-2">
                          <div className="w-5 h-5 bg-mint rounded-full flex items-center justify-center text-charcoal text-xs font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-offwhite text-xs">{c.comment}</p>
                            <p className="text-offwhite-dark/50 text-xs mt-0.5">
                              {new Date(c.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* PDF download */}
                <button
                  onClick={downloadPDF}
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-offwhite text-sm font-medium py-2 rounded-xl transition-all"
                >
                  <Download className="w-4 h-4" /> Download Approval PDF
                </button>

                {/* Notes */}
                {activeProof.notes && (
                  <div className="bg-charcoal rounded-xl border border-white/10 p-4">
                    <p className="text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-2">Designer Notes</p>
                    <p className="text-offwhite-dark text-xs">{activeProof.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
