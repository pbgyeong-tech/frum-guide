// [LOG] 편집 로그 저장 (날짜 포맷 포함)
export const addEditLog = async (log: Omit<EditLog, 'id'>) => {
  try {
    // 1️⃣ 이 함수가 실제로 호출되는지 확인
    console.log('[EditLog] addEditLog CALLED with:', log);

    // 필수 값 체크 (방어 코드)
    if (!log || !log.timestamp || !log.userEmail) {
      console.warn('[EditLog] MISSING REQUIRED FIELDS:', log);
      return;
    }

    const readableDate = new Date(log.timestamp).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const logWithDate = {
      ...log,
      formatted_date: readableDate
    };

    // 2️⃣ Firestore에 쓰기 직전에 실제로 어떤 데이터가 들어가는지 확인
    const cleanLog = removeUndefined(logWithDate);
    console.log('[EditLog] writing to Firestore:', LOG_COLLECTION_NAME, cleanLog);

    const docRef = await db.collection(LOG_COLLECTION_NAME).add(cleanLog);

    // 3️⃣ 저장 성공 여부 확인
    console.log('✅ Edit log saved successfully. docId =', docRef.id);
  } catch (e) {
    console.error('❌ Failed to add edit log', e);
  }
};
