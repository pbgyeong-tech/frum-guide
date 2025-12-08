
import React, { useState } from 'react';
import { db } from '../utils/firebase';
import { saveContent } from '../utils/db';
import { EditLog, SectionData, SubSection } from '../types';
import { HANDBOOK_CONTENT } from '../constants';
import { RotateCcw, Loader2, AlertTriangle } from 'lucide-react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

interface Props {
  user: firebase.User | null;
}

export const AdminRestoreButton: React.FC<Props> = ({ user }) => {
  const [loading, setLoading] = useState(false);

  // Debug log to verify user and email match
  console.log('AdminRestoreButton Render Check. Current User Email:', user?.email);

  // 보안 체크: 특정 관리자(bg.park@frum.co.kr)에게만 복구 버튼 노출
  if (!user || user.email !== 'bg.park@frum.co.kr') return null;

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleRestore = async () => {
    if (!confirm('🚨 긴급 복구 모드\n\nDB의 현재 데이터를 무시하고, [편집 로그]를 기반으로 데이터를 재구성하여 덮어씁니다.\n정말 진행하시겠습니까?')) return;
    
    setLoading(true);
    try {
        console.log("Starting restoration process...");

        // 1. 모든 로그 가져오기
        const logsSnap = await db.collection('edit_logs').get();
        const logs: EditLog[] = [];
        logsSnap.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => logs.push(doc.data() as EditLog));
        logs.sort((a,b) => a.timestamp - b.timestamp);
        
        console.log(`Found ${logs.length} edit logs. Replaying...`);

        // 2. 기본 데이터(상수) 복제 (아이콘 등 함수는 JSON 변환 시 제거됨 -> DB 저장용으로 적합)
        const restoredSections: SectionData[] = JSON.parse(JSON.stringify(HANDBOOK_CONTENT));
        
        // 3. 로그 리플레이 (순차적 적용)
        logs.forEach(log => {
            const section = restoredSections.find(s => s.id === log.sectionId);
            if (!section) return;
            
            // subSections 배열 초기화
            if (!section.subSections) section.subSections = [];

            if (log.action === 'create' && log.details.after) {
                // 생성
                const snap = log.details.after;
                const newContent = snap.body_content ? snap.body_content.split('\n') : [];
                
                section.subSections.push({
                    uuid: generateUUID(),
                    title: snap.title,
                    content: newContent,
                    imagePlaceholder: snap.media || undefined,
                    link: snap.external_link || undefined,
                    disclaimer: snap.disclaimer_note || undefined,
                    keywords: snap.title.split(' ')
                });
            } else if (log.action === 'update' && log.details.before && log.details.after) {
                // 수정: 이전 제목(before.title)으로 찾아서 업데이트
                const targetTitle = log.details.before.title;
                const idx = section.subSections.findIndex(s => s.title === targetTitle);
                
                if (idx !== -1) {
                    const snap = log.details.after;
                    const newContent = snap.body_content ? snap.body_content.split('\n') : [];
                    
                    section.subSections[idx] = {
                        ...section.subSections[idx],
                        title: snap.title,
                        content: newContent,
                        imagePlaceholder: snap.media || undefined,
                        link: snap.external_link || undefined,
                        disclaimer: snap.disclaimer_note || undefined
                        // uuid는 유지하거나 새로 생성해도 무방 (복구 시점 기준)
                    };
                }
            } else if (log.action === 'delete') {
                // 삭제: 제목으로 찾아서 제거
                const targetTitle = log.subSectionTitle;
                const idx = section.subSections.findIndex(s => s.title === targetTitle);
                if (idx !== -1) {
                    section.subSections.splice(idx, 1);
                }
            }
        });

        // 4. DB에 저장
        for (const section of restoredSections) {
             console.log(`Restoring section: ${section.id}`);
             await saveContent(section);
        }
        
        alert("✅ 복구가 완료되었습니다. 페이지를 새로고침하여 확인하세요.");
        window.location.reload();

    } catch (e) {
        console.error("Restoration failed", e);
        alert("❌ 복구 중 오류가 발생했습니다. 콘솔을 확인하세요.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 99999 }}>
        <button 
            onClick={handleRestore}
            disabled={loading}
            style={{
                background: 'red',
                border: '2px solid white',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: loading ? 'wait' : 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
                transition: 'all 0.2s',
                fontFamily: 'monospace'
            }}
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
            {loading ? 'RESTORING...' : 'EMERGENCY FIX'}
        </button>
    </div>
  );
};