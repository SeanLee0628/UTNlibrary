import React, { useState } from 'react';
import api from './api';

const RegisterBook = () => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [qrImage, setQrImage] = useState(null);
    const [qrDataString, setQrDataString] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/books', { title, author });
            setQrImage(response.data.qrImage);
            setQrDataString(response.data.book.qrData);
            alert('도서가 성공적으로 등록되었습니다!');
        } catch (error) {
            console.error(error);
            alert('도서 등록에 실패했습니다.');
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
                <button type="submit" className="btn">QR 생성 및 등록</button>
            </form>
            {qrImage && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <h3>QR 코드 (제목: "{title}")</h3>
                    <img src={qrImage} alt="QR Code" style={{ borderRadius: '8px', border: '5px solid white' }} />
                    <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>이 코드를 인쇄하여 책에 부착하세요.</p>
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
