import { useState } from 'react';
import { ASSET_BANDS, INTERESTS, LIFESTYLES, RISK_LEVELS, type AssetBand, type Interest, type Lifestyle, type MatchMode, type Profile, type RiskLevel } from '../core/types';

type Draft = Omit<Profile, 'id'>;

export function Onboarding({ initial, onDone }: { initial?: Profile; onDone: (p: Draft) => void }) {
  const [nickname, setNickname] = useState(initial?.nickname ?? '');
  const [age, setAge] = useState(String(initial?.age ?? ''));
  const [band, setBand] = useState<AssetBand | null>(initial?.assetBand ?? null);
  const [interests, setInterests] = useState<Interest[]>(initial?.interests ?? []);
  const [risk, setRisk] = useState<RiskLevel | null>(initial?.risk ?? null);
  const [lifestyle, setLifestyle] = useState<Lifestyle | null>(initial?.lifestyle ?? null);
  const [mode, setMode] = useState<MatchMode>(initial?.mode ?? 'similar');
  const [intro, setIntro] = useState(initial?.intro ?? '');
  const [adult, setAdult] = useState(!!initial);

  const ageNum = Number(age);
  const valid = nickname.trim() && ageNum >= 19 && ageNum < 100 && risk !== null && lifestyle !== null && interests.length > 0 && adult;

  const toggle = (i: Interest) =>
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));

  return (
    <div className="screen">
      <main className="content">
        <h1>{initial ? '프로필 수정' : '결이 맞는 사람을 만나보세요'}</h1>
        <p className="muted">돈에 대한 생각이 잘 통하는 사람과 대화를 시작해요. 정확한 금액은 받지 않아요.</p>

        <label>닉네임<input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={10} /></label>
        <label>나이<input inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))} /></label>

        <fieldset>
          <legend>관심 분야 (복수 선택)</legend>
          {INTERESTS.map((i) => (
            <button key={i} type="button" className={`chip ${interests.includes(i) ? 'on' : ''}`} onClick={() => toggle(i)}>{i}</button>
          ))}
        </fieldset>

        <fieldset>
          <legend>투자할 때 나는</legend>
          {RISK_LEVELS.map((label, i) => (
            <button key={label} type="button" className={`chip ${risk === i ? 'on' : ''}`} onClick={() => setRisk(i as RiskLevel)}>{label}</button>
          ))}
        </fieldset>

        <fieldset>
          <legend>돈을 쓸 때 나는</legend>
          {LIFESTYLES.map((label, i) => (
            <button key={label} type="button" className={`chip ${lifestyle === i ? 'on' : ''}`} onClick={() => setLifestyle(i as Lifestyle)}>{label}</button>
          ))}
        </fieldset>

        <fieldset>
          <legend>어떤 분을 만나고 싶나요?</legend>
          <button type="button" className={`chip ${mode === 'similar' ? 'on' : ''}`} onClick={() => setMode('similar')}>비슷한 분야</button>
          <button type="button" className={`chip ${mode === 'different' ? 'on' : ''}`} onClick={() => setMode('different')}>다른 분야</button>
        </fieldset>

        <fieldset>
          <legend>내 자산 구간 (선택, 자기 신고)</legend>
          {ASSET_BANDS.map((b) => (
            <button key={b.id} type="button" className={`chip ${band === b.id ? 'on' : ''}`} onClick={() => setBand(band === b.id ? null : b.id)}>
              {b.label}
            </button>
          ))}
          <p className="muted full">입력하지 않아도 괜찮아요. 매칭에는 아주 조금만 반영돼요.</p>
        </fieldset>

        <label>한 줄 소개<textarea value={intro} onChange={(e) => setIntro(e.target.value)} maxLength={80} rows={2} /></label>

        <label className="check">
          <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
          만 19세 이상이며, 입력한 정보는 본인이 직접 신고한 값이며 인증되지 않음을 확인합니다.
        </label>

        <button
          className="btn"
          disabled={!valid}
          onClick={() => onDone({ nickname: nickname.trim(), age: ageNum, assetBand: band, risk: risk as RiskLevel, lifestyle: lifestyle as Lifestyle, interests, mode, intro: intro.trim() })}
        >
          {initial ? '저장' : '시작하기'}
        </button>
      </main>
    </div>
  );
}
