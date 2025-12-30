import React, { useState } from 'react';
import api from './api';
import QRCode from 'react-qr-code';

const RegisterBook = () => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [qrDataString, setQrDataString] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setQrDataString('');

        try {
            const response = await api.post('/books', { title, author });
            console.log("Registration success:", response.data);

            if (response.data && response.data.book && response.data.book.qrData) {
                setQrDataString(response.data.book.qrData);
                // Optional: alert('도서가 성공적으로 등록되었습니다!'); 
            } else {
                setError('서버 응답 형식이 올바르지 않습니다.');
            }
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.detail || error.message || '알 수 없는 오류';
            setError(`등록 실패: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card glass-panel">
            <h2>📚 새 도서 등록</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="도서 제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="저자"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                />
                <button type="submit" className="btn" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                    {loading ? '등록 처리 중...' : 'QR 생성 및 등록'}
                </button>
            </form>

            {error && (
                <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '8px', color: '#fca5a5' }}>
                    🚨 {error}
                </div>
            )}

            {qrDataString && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <h3>QR 코드 (제목: "{title}")</h3>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '8px', display: 'inline-block' }}>
                        <QRCode
                            value={qrDataString}
                            size={200}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '10px' }}>이 코드를 인쇄하여 책에 부착하세요.</p>

                    {/* Display QR Data for testing */}
                    <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>QR 문자열 (테스트용):</p>
                        <code style={{ display: 'block', wordBreak: 'break-all', color: '#ec4899' }}>
                            {qrDataString}
                        </code>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterBook;
