'use client';

import { FormEvent, useState } from 'react';

type Result = { id?: string; status?: string; output?: string | string[]; error?: string; detail?: string };

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Cinematic');
  const [ratio, setRatio] = useState('16:9');
  const [optimizer, setOptimizer] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');

  async function generate(e: FormEvent) {
    e.preventDefault();
    setError(''); setVideoUrl('');
    if (prompt.trim().length < 8) { setError('Please describe your video in at least 8 characters.'); return; }
    setBusy(true); setStatus('Starting your generation…');
    try {
      const start = await fetch('/api/video', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${style} style. ${prompt.trim()}`, aspect_ratio: ratio, prompt_optimizer: optimizer })
      });
      const data: Result = await start.json();
      if (!start.ok) throw new Error(data.error || data.detail || 'Could not start generation.');
      if (!data.id) {
        const output = Array.isArray(data.output) ? data.output[0] : data.output;
        if (output) { setVideoUrl(output); setStatus('Your video is ready'); setBusy(false); return; }
        throw new Error('The provider did not return a prediction ID.');
      }
      let predictionId = data.id;
      for (let i = 0; i < 90; i++) {
        await new Promise(r => setTimeout(r, 4000));
        setStatus(`Generating video… checking progress (${i + 1}/90)`);
        const poll = await fetch(`/api/video?id=${encodeURIComponent(predictionId)}`, { cache: 'no-store' });
        const p: Result = await poll.json();
        if (!poll.ok) throw new Error(p.error || 'Could not check generation status.');
        if (p.status === 'succeeded') {
          const output = Array.isArray(p.output) ? p.output[0] : p.output;
          if (!output) throw new Error('Generation finished, but no video URL was returned.');
          setVideoUrl(output); setStatus('Your video is ready'); return;
        }
        if (p.status === 'failed' || p.status === 'canceled') throw new Error(p.error || `Generation ${p.status}. Please try a different prompt.`);
      }
      setStatus('This generation is taking longer than expected. You can try again later.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('');
    } finally { setBusy(false); }
  }

  return (
    <main className="shell">
      <nav className="nav"><a className="brand" href="#"><span className="brand-mark">✳</span> FrameForge<span className="brand-ai">AI</span></a><span className="nav-pill"><span className="dot" /> Text to video</span></nav>
      <section className="hero">
        <div className="eyebrow"><span>✦</span> YOUR IDEAS, IN MOTION</div>
        <h1>Make imagination<br/><em>move.</em></h1>
        <p className="subhead">Describe the scene. Set the mood. Let AI bring your next big idea to life.</p>
      </section>
      <section className="workspace">
        <form className="control-panel" onSubmit={generate}>
          <div className="section-head"><div><span className="step">01</span><h2>Describe your video</h2></div><span className="muted">TEXT TO VIDEO</span></div>
          <label htmlFor="prompt">Your prompt</label>
          <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} maxLength={1200} placeholder="A lone astronaut walks across a glowing desert at blue hour, cinematic camera movement, drifting dust, breathtaking scale…" disabled={busy}/>
          <div className="field-foot"><span>Be vivid. Describe the subject, action, setting and camera.</span><span>{prompt.length}/1200</span></div>
          <div className="section-head settings-head"><div><span className="step">02</span><h2>Choose your look</h2></div></div>
          <label htmlFor="style">Visual style</label>
          <div className="style-grid">
            {['Cinematic','Dreamlike','Anime','Commercial'].map(s => <button type="button" key={s} className={`style-option ${style === s ? 'selected' : ''}`} onClick={() => setStyle(s)} disabled={busy}><span className={`style-art art-${s.toLowerCase()}`}>{s === 'Cinematic' ? '◒' : s === 'Dreamlike' ? '✧' : s === 'Anime' ? '✿' : '◈'}</span><span>{s}</span>{style === s && <b>✓</b>}</button>)}
          </div>
          <div className="select-row">
            <div><label htmlFor="ratio">Aspect ratio</label><select id="ratio" value={ratio} onChange={e => setRatio(e.target.value)} disabled={busy}><option value="16:9">16:9 · Landscape</option><option value="9:16">9:16 · Portrait</option><option value="1:1">1:1 · Square</option></select></div>
            <div className="toggle-wrap"><label htmlFor="optimizer">Prompt enhancement</label><button id="optimizer" type="button" role="switch" aria-checked={optimizer} className={`toggle ${optimizer ? 'on' : ''}`} onClick={() => setOptimizer(!optimizer)} disabled={busy}><span/></button></div>
          </div>
          <button className="generate" type="submit" disabled={busy}><span>{busy ? '◌' : '✦'}</span>{busy ? 'Creating your video…' : 'Generate video'} <span className="arrow">↗</span></button>
          <p className="fineprint">AI video generation uses a third-party provider and may incur charges.</p>
          {status && <div className="status" role="status"><span className={busy ? 'spinner' : 'status-check'}>{busy ? '' : '✓'}</span>{status}</div>}
          {error && <div className="error" role="alert">{error}</div>}
        </form>
        <aside className="preview-panel">
          <div className="preview-top"><span>YOUR CANVAS</span><span className="live-label"><i/> LIVE PREVIEW</span></div>
          <div className={`preview ${videoUrl ? 'has-video' : ''}`}>
            {videoUrl ? <video src={videoUrl} controls autoPlay loop playsInline /> : <><div className="orb orb-one"/><div className="orb orb-two"/><div className="landscape"><div className="mountain m1"/><div className="mountain m2"/><div className="mountain m3"/></div><div className="preview-copy"><span>YOUR NEXT SCENE</span><h3>Nothing is<br/><em>impossible.</em></h3><p>Your creation will appear here.</p></div><div className="frame-corner tl"/><div className="frame-corner tr"/><div className="frame-corner bl"/><div className="frame-corner br"/></>}
          </div>
          {videoUrl ? <a className="download" href={videoUrl} target="_blank" rel="noreferrer" download>↗ Open / download video</a> : <div className="preview-bottom"><div className="preview-icon">✳</div><div><strong>Ready when you are</strong><p>Enter a prompt and generate your first clip.</p></div><span className="sparkle">✦</span></div>}
        </aside>
      </section>
      <footer><span>© 2026 FRAMEFORGE AI</span><span>BUILT FOR THE IMAGINATION <b>✳</b></span></footer>
    </main>
  );
}
