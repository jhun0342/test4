import { useCallback, useEffect, useState } from 'react';
import type { Profile } from '../core/types';
import { api } from './api';
import { Onboarding } from './Onboarding';
import { Recommendations } from './Recommendations';
import { Matches } from './Matches';

type Tab = 'home' | 'chat' | 'me';

export function App() {
  const [me, setMe] = useState<Profile | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>('home');
  const [editing, setEditing] = useState(false);

  const refresh = useCallback(async () => setMe(await api.getMe()), []);
  useEffect(() => { void refresh(); }, [refresh]);

  if (me === undefined) return <div className="screen" />;
  if (!me || editing) {
    return (
      <Onboarding
        initial={me ?? undefined}
        onDone={async (p) => { await api.saveMe(p); setEditing(false); await refresh(); }}
      />
    );
  }

  return (
    <div className="screen">
      <main className="content">
        {tab === 'home' && <Recommendations />}
        {tab === 'chat' && <Matches />}
        {tab === 'me' && (
          <section>
            <h1>내 프로필</h1>
            <div className="card">
              <b>{me.nickname}, {me.age}</b>
              <p className="muted">자산 구간은 숫자 없이 구간으로만 상대에게 보여요.</p>
              <p>{me.intro}</p>
              <div className="tags">{me.interests.map((i) => <span key={i} className="tag">{i}</span>)}</div>
              <p className="muted">선호: {me.mode === 'similar' ? '비슷한 분야' : '다른 분야'}</p>
            </div>
            <button className="btn secondary" onClick={() => setEditing(true)}>프로필 수정</button>
            <button
              className="btn ghost"
              onClick={async () => { await api.reset(); setTab('home'); await refresh(); }}
            >
              데이터 초기화 (테스트용)
            </button>
          </section>
        )}
      </main>
      <nav className="tabbar">
        {([['home', '추천'], ['chat', '대화'], ['me', '내 정보']] as const).map(([k, label]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </nav>
    </div>
  );
}
