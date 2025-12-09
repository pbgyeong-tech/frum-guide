// src/components/AdminRestoreButton.tsx (Culture 추가 전용)
import React, { useState } from 'react';
import { saveContent } from '../utils/db';
import { HANDBOOK_CONTENT } from '../constants';
import { ContentType } from '../types';
import { UploadCloud, Loader2 } from 'lucide-react';
import firebase from 'firebase/compat/app';

interface Props { user: firebase.User | null; }

export const AdminRestoreButton: React.FC<Props> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  
  // 관리자 이메일 체크
  if (!user || user.email !== 'bg.park@frum.co.kr') return null;

  const handleAddCulture = async () => {
    setLoading(true);
    try {
        // 1. 코드에서 'culture' 데이터만 찾음
        const cultureData = HANDBOOK_CONTENT.find(s => s.id === ContentType.CULTURE);
        
        if (!cultureData) {
            alert("코드에 '일하는 문화' 데이터가 없습니다. constants.ts를 확인하세요.");
            return;
        }

        // 2. DB에 'culture' 문서 하나만 저장 (다른건 안 건드림)
        await saveContent(cultureData);
        alert("✅ 성공! '일하는 문화' 메뉴가 DB에 들어갔습니다.");
        window.location.reload();
    } catch (e) {
        console.error(e);
        alert("실패했습니다. 콘솔을 확인하세요.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
        <button onClick={handleAddCulture} disabled={loading} style={{ background: '#2563eb', color: 'white', padding: '12px 20px', borderRadius: '30px', border: 'none', display: 'flex', gap: '8px', cursor: 'pointer' }}>
            {loading ? <Loader2 size={18} className="animate-spin"/> : <UploadCloud size={18}/>}
            + 일하는 문화 DB 추가
        </button>
    </div>
  );
};