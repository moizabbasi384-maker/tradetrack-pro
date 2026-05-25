"use client";

import { useState, useEffect } from "react";
import {
  HardHat, Plus, X, ChevronRight, Phone, MapPin, Calendar,
  CheckCircle2, Wrench, TrendingUp, PoundSterling, ArrowRight,
  Trash2, Flag, Loader2, AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Job {
  id: number;
  customer: string;
  phone: string;
  address: string;
  jobType: string;
  area: number | string;
  materialCost: number;
  labourCost: number;
  stage: string;
  notes: string;
  followUp: boolean;
  date: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const JOB_TYPES = ["Driveway", "Paving", "Roofing", "Block Paving", "Tarmac", "Flat Roof", "Tiles"];
const STAGES = ["New Lead", "Quoted", "Accepted", "In Progress", "Completed"];

const STAGE_STYLE: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  "New Lead":    { bg: "bg-blue-50",    text: "text-blue-700",    ring: "ring-blue-200",    dot: "bg-blue-400"    },
  "Quoted":      { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-200",   dot: "bg-amber-400"   },
  "Accepted":    { bg: "bg-violet-50",  text: "text-violet-700",  ring: "ring-violet-200",  dot: "bg-violet-400"  },
  "In Progress": { bg: "bg-orange-50",  text: "text-orange-700",  ring: "ring-orange-200",  dot: "bg-orange-400"  },
  "Completed":   { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-400" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcTotal(job: Job): number {
  return (Number(job.materialCost) || 0) + (Number(job.labourCost) || 0);
}
function fmt(n: number): string {
  return `£${Number(n).toLocaleString("en-GB")}`;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: string }) {
  const s = STAGE_STYLE[stage];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ring-1 ${s.bg} ${s.text} ${s.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {stage}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-xl font-extrabold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

// ─── Job Modal ────────────────────────────────────────────────────────────────

function JobModal({ job, onSave, onClose }: { job: Job | null; onSave: (form: Partial<Job>) => Promise<void>; onClose: () => void }) {
  const empty: Partial<Job> = {
    customer: "", phone: "", address: "", jobType: "Driveway",
    area: "", materialCost: 0, labourCost: 0, stage: "New Lead",
    notes: "", followUp: false, date: new Date().toISOString().slice(0, 10),
  };
  const [form, setForm] = useState<Partial<Job>>(job ?? empty);
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const total = (Number(form.materialCost) || 0) + (Number(form.labourCost) || 0);
  const valid = (form.customer ?? "").trim() && (form.address ?? "").trim();

  const handleSubmit = async () => {
    if (!valid) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-slate-800 text-lg">{job ? "Edit Job" : "New Job / Lead"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Customer Name *</label>
              <input className="inp" placeholder="e.g. James Whitfield" value={form.customer ?? ""} onChange={e => set("customer", e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="inp" placeholder="07911 234567" value={form.phone ?? ""} onChange={e => set("phone", e.target.value)} />
            </div>
            <div>
              <label className="label">Date</label>
              <input className="inp" type="date" value={form.date ?? ""} onChange={e => set("date", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">Address *</label>
              <input className="inp" placeholder="14 Oak Lane, Manchester" value={form.address ?? ""} onChange={e => set("address", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Job Type</label>
              <select className="inp" value={form.jobType ?? "Driveway"} onChange={e => set("jobType", e.target.value)}>
                {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Area (m²)</label>
              <input className="inp" type="number" placeholder="45" value={form.area ?? ""} onChange={e => set("area", e.target.value)} />
            </div>
            <div>
              <label className="label">Materials (£)</label>
              <input className="inp" type="number" placeholder="800" value={form.materialCost ?? ""} onChange={e => set("materialCost", e.target.value)} />
            </div>
            <div>
              <label className="label">Labour (£)</label>
              <input className="inp" type="number" placeholder="1200" value={form.labourCost ?? ""} onChange={e => set("labourCost", e.target.value)} />
            </div>
          </div>

          {total > 0 && (
            <div className="bg-emerald-50 ring-1 ring-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-emerald-700">Quote Total</span>
              <span className="text-2xl font-extrabold text-emerald-700">{fmt(total)}</span>
            </div>
          )}

          <div>
            <label className="label">Stage</label>
            <div className="flex flex-wrap gap-2">
              {STAGES.map(s => {
                const st = STAGE_STYLE[s];
                const active = form.stage === s;
                return (
                  <button key={s} onClick={() => set("stage", s)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full ring-1 transition ${active ? `${st.bg} ${st.text} ${st.ring} scale-105 shadow-sm` : "bg-slate-50 text-slate-400 ring-slate-200 hover:bg-slate-100"}`}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="inp resize-none" rows={3} placeholder="Customer preferences, site conditions…" value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div onClick={() => set("followUp", !form.followUp)}
              className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${form.followUp ? "bg-amber-400" : "bg-slate-200"}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${form.followUp ? "left-6" : "left-1"}`} />
            </div>
            <span className="text-sm font-semibold text-slate-700">Flag for Follow-up</span>
            {form.followUp && <Flag className="w-4 h-4 text-amber-500" />}
          </label>

          <button onClick={handleSubmit} disabled={!valid || saving}
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-40 shadow-md">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><CheckCircle2 className="w-4 h-4" /> {job ? "Save Changes" : "Add Job"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Job Drawer ───────────────────────────────────────────────────────────────

function JobDrawer({ job, onEdit, onDelete, onStageChange, onClose }: {
  job: Job; onEdit: (j: Job) => void; onDelete: (id: number) => Promise<void>;
  onStageChange: (id: number, stage: string) => Promise<void>; onClose: () => void;
}) {
  const total = calcTotal(job);
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
          <StageBadge stage={job.stage} />
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(job)} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200">Edit</button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">{job.customer}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500"><Phone className="w-3.5 h-3.5" />{job.phone || "No phone"}</div>
            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-slate-500"><MapPin className="w-3.5 h-3.5" />{job.address}</div>
            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-slate-500"><Calendar className="w-3.5 h-3.5" />{new Date(job.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 ring-1 ring-slate-200 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500">Job Type</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{job.jobType}</p>
            </div>
            <div className="bg-slate-50 ring-1 ring-slate-200 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500">Area</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{job.area || "—"} m²</p>
            </div>
            <div className="bg-emerald-50 ring-1 ring-emerald-200 rounded-xl p-3 text-center">
              <p className="text-xs text-emerald-600">Total</p>
              <p className="font-extrabold text-emerald-700 text-sm mt-0.5">{fmt(total)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 ring-1 ring-slate-200 rounded-xl p-3">
              <p className="text-xs text-slate-500">Materials</p>
              <p className="font-bold text-slate-800">{fmt(job.materialCost)}</p>
            </div>
            <div className="bg-slate-50 ring-1 ring-slate-200 rounded-xl p-3">
              <p className="text-xs text-slate-500">Labour</p>
              <p className="font-bold text-slate-800">{fmt(job.labourCost)}</p>
            </div>
          </div>

          {job.notes && (
            <div className="bg-amber-50 ring-1 ring-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-600 mb-1">Notes</p>
              <p className="text-sm text-slate-700 leading-relaxed">{job.notes}</p>
            </div>
          )}
          {job.followUp && (
            <div className="flex items-center gap-2 bg-red-50 ring-1 ring-red-200 rounded-xl px-4 py-3">
              <Flag className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-red-600">Follow-up Required</span>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Move to Stage</p>
            <div className="flex flex-wrap gap-2">
              {STAGES.filter(s => s !== job.stage).map(s => {
                const st = STAGE_STYLE[s];
                return (
                  <button key={s} onClick={() => onStageChange(job.id, s)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full ring-1 ${st.bg} ${st.text} ${st.ring} hover:opacity-80 transition flex items-center gap-1`}>
                    <ArrowRight className="w-3 h-3" />{s}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={async () => { setDeleting(true); await onDelete(job.id); }}
            disabled={deleting}
            className="w-full py-3 rounded-2xl bg-red-50 ring-1 ring-red-200 text-red-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition disabled:opacity-50">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete Job
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [filterStage, setFilterStage] = useState("All");

  // ── Fetch all jobs from API ──
  const fetchJobs = async () => {
    try {
      const data = await apiFetch("/api/jobs");
      // Neon returns snake_case — normalise to camelCase
      const normalised: Job[] = data.map((j: Record<string, unknown>) => ({
        id: j.id,
        customer: j.customer,
        phone: j.phone ?? "",
        address: j.address,
        jobType: j.job_type ?? j.jobType,
        area: j.area ?? "",
        materialCost: Number(j.material_cost ?? j.materialCost ?? 0),
        labourCost: Number(j.labour_cost ?? j.labourCost ?? 0),
        stage: j.stage ?? "New Lead",
        notes: j.notes ?? "",
        followUp: Boolean(j.follow_up ?? j.followUp),
        date: (j.date as string)?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      }));
      setJobs(normalised);
    } catch {
      setError("Could not load jobs. Check your DATABASE_URL env variable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  // ── Save (create or update) ──
  const handleSave = async (form: Partial<Job>) => {
    try {
      if (editJob) {
        const updated = await apiFetch(`/api/jobs/${editJob.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setJobs(p => p.map(j => j.id === editJob.id ? { ...j, ...updated, jobType: updated.job_type ?? updated.jobType, materialCost: Number(updated.material_cost ?? updated.materialCost), labourCost: Number(updated.labour_cost ?? updated.labourCost), followUp: Boolean(updated.follow_up ?? updated.followUp) } : j));
      } else {
        const created = await apiFetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const n: Job = {
          id: created.id, customer: created.customer, phone: created.phone ?? "",
          address: created.address, jobType: created.job_type ?? created.jobType,
          area: created.area ?? "", materialCost: Number(created.material_cost ?? 0),
          labourCost: Number(created.labour_cost ?? 0), stage: created.stage ?? "New Lead",
          notes: created.notes ?? "", followUp: Boolean(created.follow_up),
          date: (created.date as string)?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
        };
        setJobs(p => [n, ...p]);
      }
    } catch {
      setError("Failed to save. Please try again.");
    }
    setShowAdd(false);
    setEditJob(null);
  };

  // ── Delete ──
  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/api/jobs/${id}`, { method: "DELETE" });
      setJobs(p => p.filter(j => j.id !== id));
      setDetailJob(null);
    } catch {
      setError("Failed to delete.");
    }
  };

  // ── Stage change ──
  const handleStageChange = async (id: number, stage: string) => {
    try {
      const job = jobs.find(j => j.id === id)!;
      await apiFetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...job, stage }),
      });
      setJobs(p => p.map(j => j.id === id ? { ...j, stage } : j));
      setDetailJob(p => p ? { ...p, stage } : p);
    } catch {
      setError("Stage update failed.");
    }
  };

  const filtered = filterStage === "All" ? jobs : jobs.filter(j => j.stage === filterStage);
  const totalRevenue = jobs.filter(j => j.stage === "Completed").reduce((a, j) => a + calcTotal(j), 0);
  const pipelineValue = jobs.filter(j => j.stage !== "Completed").reduce((a, j) => a + calcTotal(j), 0);
  const followUps = jobs.filter(j => j.followUp).length;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
        <p className="text-sm font-medium">Loading jobs…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <style>{`
        .label{display:block;font-size:.75rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.375rem}
        .inp{width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:.75rem;padding:.65rem 1rem;font-size:.875rem;color:#1e293b;outline:none}
        .inp:focus{border-color:#93c5fd;box-shadow:0 0 0 3px rgba(147,197,253,.3)}
        .inp::placeholder{color:#94a3b8}
      `}</style>

      {(showAdd || editJob) && <JobModal job={editJob} onSave={handleSave} onClose={() => { setShowAdd(false); setEditJob(null); }} />}
      {detailJob && <JobDrawer job={detailJob} onEdit={j => { setDetailJob(null); setEditJob(j); }} onDelete={handleDelete} onStageChange={handleStageChange} onClose={() => setDetailJob(null)} />}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow">
              <HardHat className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">TradeTrack Pro</h1>
              <p className="text-xs text-slate-500">Driveway · Paving · Roofing</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow transition">
            <Plus className="w-4 h-4" /> New Job
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="flex items-center gap-3 bg-red-50 ring-1 ring-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Wrench} label="Total Jobs" value={jobs.length} color="bg-slate-700" />
          <StatCard icon={TrendingUp} label="Pipeline Value" value={fmt(pipelineValue)} color="bg-violet-500" />
          <StatCard icon={PoundSterling} label="Revenue Won" value={fmt(totalRevenue)} color="bg-emerald-500" />
          <StatCard icon={Flag} label="Follow-ups" value={followUps} color="bg-amber-500" />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["All", ...STAGES].map(s => {
            const active = filterStage === s;
            const st = s !== "All" ? STAGE_STYLE[s] : null;
            return (
              <button key={s} onClick={() => setFilterStage(s)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full ring-1 transition ${active ? st ? `${st.bg} ${st.text} ${st.ring}` : "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50"}`}>
                {s}{s !== "All" && <span className="ml-1 opacity-70">{jobs.filter(j => j.stage === s).length}</span>}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 && (
            <div className="col-span-3 bg-white rounded-2xl ring-1 ring-slate-200 p-10 text-center">
              <HardHat className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-500">{jobs.length === 0 ? "No jobs yet" : "No jobs in this stage"}</p>
              <p className="text-sm text-slate-400 mt-1">{jobs.length === 0 ? "Hit \"New Job\" to add your first lead." : "Try a different filter above."}</p>
            </div>
          )}
          {filtered.map(job => {
            const total = calcTotal(job);
            return (
              <div key={job.id} onClick={() => setDetailJob(job)}
                className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm hover:shadow-md hover:ring-slate-300 transition cursor-pointer p-4 space-y-3 active:scale-[0.99]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900 text-sm leading-tight">{job.customer}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{job.address.split(",")[0]}</p>
                  </div>
                  {job.followUp && <Flag className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">{job.jobType}</span>
                  {job.area && <span className="text-xs text-slate-400">{job.area}m²</span>}
                </div>
                <div className="flex items-center justify-between">
                  <StageBadge stage={job.stage} />
                  <span className="text-base font-extrabold text-slate-800">{fmt(total)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
                  <span>{new Date(job.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                  <span className="flex items-center gap-1">View details <ChevronRight className="w-3.5 h-3.5" /></span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-8 text-center text-xs text-slate-400">
        TradeTrack Pro · Driveway · Paving · Roofing Management · Built for UK Tradespeople
      </footer>
    </div>
  );
}