import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, RefreshCw, MessageSquare, Loader2, Send, X } from 'lucide-react';
import { jsPDF } from 'jspdf';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Proof {
  id: string;
  token: string;
  client_name: string;
  title: string;
  image_url: string;
  status: 'pending' | 'approved' | 'revision';
  notes: string;
}

interface Comment {
  id: string;
  x: number;
  y: number;
  comment: string;
}

interface PendingPin {
  x: number;
  y: number;
}

const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/YOUR_GHL_HOOK_ID/webhook-trigger/proof-client';

async function fireWebhook(payload: object) {
  try {
    await fetch(GHL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (_) { /* silent */ }
}

export default function ProofClient() {
  const { token } = useParams<{ token: string }>();

  const [proof, setProof]         = useState<Proof | null>(null);
  const [comments, setComments]   = useState<Comment[]>([]);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);

  // Comment pin flow
  const [pendingPin, setPendingPin]   = useState<PendingPin | null>(null);
  const [pendingText, setPendingText] = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Action state
  const [actionDone, setActionDone]     = useState<'approved' | 'revision' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Load Proof ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }

    async function load() {
      const { data, error } = await supabase
        .from('proofs')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProof(data as Proof);

      const { data: commentsData } = await supabase
        .from('proof_comments')
        .select('*')
        .eq('proof_id', data.id)
        .order('created_at');

      if (commentsData) setComments(commentsData as Comment[]);
      setLoading(false);
    }

    load();
  }, [token]);

  // ── Click image to add pin ─────────────────────────────────────────────────
  function handleImageClick(e: React.MouseEvent<HTMLImageElement>) {
    if (actionDone) return;
    const rect = imgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    setPendingPin({ x, y });
    setPendingText('');
  }

  // ── Submit comment ─────────────────────────────────────────────────────────
  async function submitComment() {
    if (!pendingPin || !pendingText.trim() || !proof) return;
    setSubmitting(true);

    const { data } = await supabase.from('proof_comments').insert({
      proof_id: proof.id,
      x:        pendingPin.x,
      y:        pendingPin.y,
      comment:  pendingText.trim(),
    }).select().single();

    if (data) setComments(prev => [...prev, data as Comment]);
    setPendingPin(null);
    setPendingText('');
    setSubmitting(false);
  }

  // ── Approve / Revision ─────────────────────────────────────────────────────
  async function handleAction(action: 'approved' | 'revision') {
    if (!proof) return;
    setActionLoading(true);

    await supabase.from('proofs').update({ status: action }).eq('id', proof.id);

    await fireWebhook({
      event:       `proof_${action}`,
      proof_id:    proof.id,
      client_name: proof.client_name,
      title:       proof.title,
      token:       proof.token,
      comments_count: comments.length,
    });

    setActionDone(action);
    setActionLoading(false);
  }

  // ── Download PDF ───────────────────────────────────────────────────────────
  function downloadPDF() {
    if (!proof || !actionDone) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Proof Review Record', 20, 20);
    doc.setFontSize(12);
    doc.text(`Title: ${proof.title}`, 20, 35);
    doc.text(`Client: ${proof.client_name}`, 20, 45);
    doc.text(`Decision: ${actionDone === 'approved' ? 'APPROVED' : 'REVISION REQUESTED'}`, 20, 55);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 65);
    if (comments.length > 0) {
      doc.text('Comments left:', 20, 80);
      let y = 90;
      comments.forEach((c, i) => {
        doc.text(`${i + 1}. ${c.comment}`, 25, y);
        y += 10;
      });
    }
    doc.save(`proof-review-${proof.title.replace(/\s+/g, '-')}.pdf`);
  }

  // ── Renders ────────────────────────────────────────────────────────────────
  if (loading) {
    return createPortal(
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0b0d10', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#a0a0b0' }}>
        <Loader2 className="w-5 h-5 animate-spin text-mint" /> Loading your proof…
      </div>,
      document.body
    );
  }

  if (notFound || !proof) {
    return createPortal(
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0b0d10', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div>
          <p className="text-4xl mb-4">🔍</p>
          <h1 className="font-display text-2xl font-bold text-offwhite mb-3">Proof Not Found</h1>
          <p className="text-offwhite-dark">This link may have expired or is invalid.</p>
        </div>
      </div>,
      document.body
    );
  }

  // Already actioned — show done screen
  if (actionDone) {
    const isApproved = actionDone === 'approved';
    return createPortal(
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0b0d10', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="text-center max-w-md">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isApproved ? 'bg-mint/20' : 'bg-red-500/20'}`}>
            {isApproved
              ? <CheckCircle className="w-10 h-10 text-mint" />
              : <RefreshCw className="w-10 h-10 text-red-400" />}
          </div>
          <h1 className="font-display text-3xl font-bold text-offwhite mb-3">
            {isApproved ? 'Proof Approved!' : 'Revision Requested'}
          </h1>
          <p className="text-offwhite-dark mb-2">
            {isApproved
              ? 'Your approval has been recorded. Our team will begin production.'
              : `Your ${comments.length} comment${comments.length !== 1 ? 's' : ''} have been sent to the design team.`}
          </p>
          <p className="text-offwhite-dark/60 text-sm mb-8">Thank you, {proof.client_name}!</p>
          <button
            onClick={downloadPDF}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-offwhite px-6 py-3 rounded-xl text-sm font-medium transition-all"
          >
            Download PDF Record
          </button>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0b0d10', overflow: 'auto' }}>
      {/* Header */}
      <header className="bg-charcoal-light border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <img src="/logo-ikonic.webp" alt="Ikonic" className="h-10" />
          <div className="text-right">
            <p className="text-offwhite font-semibold">{proof.title}</p>
            <p className="text-offwhite-dark text-xs">Review for {proof.client_name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Instructions */}
        <div className="bg-mint/10 border border-mint/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-mint shrink-0 mt-0.5" />
          <div>
            <p className="text-offwhite font-semibold text-sm">How to review your proof</p>
            <p className="text-offwhite-dark text-xs mt-1">
              Click anywhere on the design to leave a comment. Once you're done, click <strong className="text-offwhite">Approve</strong> or <strong className="text-offwhite">Request Revision</strong> below.
            </p>
          </div>
        </div>

        {/* Design notes from team */}
        {proof.notes && (
          <div className="bg-charcoal-light border border-white/10 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-1">Notes from the design team</p>
            <p className="text-offwhite-dark text-sm">{proof.notes}</p>
          </div>
        )}

        {/* Image area */}
        <div className="relative mb-6 rounded-2xl overflow-hidden border border-white/10 cursor-crosshair select-none">
          <img
            ref={imgRef}
            src={proof.image_url}
            alt={proof.title}
            className="w-full object-contain"
            onClick={handleImageClick}
            draggable={false}
          />

          {/* Existing comment pins */}
          {comments.map((c, i) => (
            <div
              key={c.id}
              className="absolute w-7 h-7 bg-mint rounded-full flex items-center justify-center text-charcoal text-xs font-bold border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
            >
              {i + 1}
            </div>
          ))}

          {/* Pending pin */}
          {pendingPin && (
            <div
              className="absolute w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-charcoal text-xs font-bold border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
            >
              ?
            </div>
          )}
        </div>

        {/* Pending comment input */}
        {pendingPin && (
          <div className="bg-charcoal-light border border-mint/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-offwhite font-semibold text-sm">Add your comment</p>
              <button onClick={() => setPendingPin(null)}>
                <X className="w-4 h-4 text-offwhite-dark hover:text-offwhite" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={pendingText}
                onChange={e => setPendingText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitComment()}
                placeholder="Describe what you'd like changed here…"
                className="flex-1 bg-charcoal border border-white/10 rounded-xl px-4 py-2.5 text-offwhite placeholder-offwhite-dark/40 focus:outline-none focus:border-mint transition-colors text-sm"
                autoFocus
              />
              <button
                onClick={submitComment}
                disabled={submitting || !pendingText.trim()}
                className="bg-mint hover:bg-mint-dark text-charcoal font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm disabled:opacity-40"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Comment list */}
        {comments.length > 0 && (
          <div className="bg-charcoal-light border border-white/10 rounded-xl p-5 mb-6">
            <p className="text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-4">
              Your Comments ({comments.length})
            </p>
            <div className="flex flex-col gap-3">
              {comments.map((c, i) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-6 h-6 bg-mint rounded-full flex items-center justify-center text-charcoal text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-offwhite-dark text-sm">{c.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => handleAction('approved')}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-3 bg-mint hover:bg-mint-dark text-charcoal font-bold py-4 rounded-xl transition-all text-lg hover:-translate-y-0.5 hover:shadow-lg hover:shadow-mint/30 disabled:opacity-40"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            Approve This Proof
          </button>
          <button
            onClick={() => handleAction('revision')}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-3 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-offwhite hover:text-red-400 font-bold py-4 rounded-xl transition-all text-lg disabled:opacity-40"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Request Revision
          </button>
        </div>

        {comments.length > 0 && !pendingPin && (
          <p className="text-center text-offwhite-dark/60 text-xs mt-4">
            {comments.length} comment{comments.length !== 1 ? 's' : ''} will be sent with your decision.
          </p>
        )}
      </main>
    </div>,
    document.body
  );
}
