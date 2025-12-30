import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from './api';

const Scanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [mode, setMode] = useState('checkout'); // 'checkout' or 'return'
    const [memberId, setMemberId] = useState('');
    const [message, setMessage] = useState('');
    const [members, setMembers] = useState([]);
    const [manualCode, setManualCode] = useState('');

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await api.get('/members');
                setMembers(res.data);
            } catch (err) {
                console.error("Failed to fetch members", err);
            }
        };
        fetchMembers();
    }, []);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                videoConstraints: {
                    facingMode: "environment"
                },
                supportedScanTypes: [0], // 0 == SCAN_TYPE_CAMERA (Disable file scan)
                showTorchButtonIfSupported: true,
                showZoomSliderIfSupported: true,
                defaultZoomValueIfSupported: 2
            },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText) {
            handleScan(decodedText);
            scanner.clear().catch(console.error);
        }

        function onScanFailure(error) {
            // handle scan failure
        }

        return () => {
            scanner.clear().catch(err => console.error("Scanner clear error", err));
        };
    }, [mode]); // Re-init scanner if needed, though usually stable

    const handleScan = async (qrData) => {
        setMessage('처리 중...');
        try {
            if (mode === 'checkout') {
                if (!memberId) {
                    setMessage('먼저 회원을 선택해주세요!');
                    return;
                }
                await api.post('/checkout', { qrData, memberId: parseInt(memberId) });
                setMessage(`대여 성공! 도서 ID: ${qrData.substring(0, 8)}...`);
            } else {
                await api.post('/return', { qrData });
                setMessage(`반납 성공! 도서 ID: ${qrData.substring(0, 8)}...`);
            }
        } catch (error) {
            setMessage(`Error: ${error.response?.data?.detail || error.message}`);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualCode) handleScan(manualCode);
    };

    return (
        <div className="card glass-panel">
            <h2>📷 QR 스캐너 및 대여 시스템</h2>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button
                    className="btn"
                    style={{ opacity: mode === 'checkout' ? 1 : 0.5, flex: 1 }}
                    onClick={() => setMode('checkout')}
                >
                    대여하기
                </button>
                <button
                    className="btn"
                    style={{ opacity: mode === 'return' ? 1 : 0.5, flex: 1 }}
                    onClick={() => setMode('return')}
                >
                    반납하기
                </button>
            </div>

            {mode === 'checkout' && (
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#cbd5e1' }}>회원 선택:</label>
                    <select
                        value={memberId}
                        onChange={(e) => setMemberId(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                        <option value="">-- 회원 선택 --</option>
                        {members.map(m => (
                            <option key={m.id} value={m.id} style={{ color: 'black' }}>
                                {m.name} (ID: {m.id})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Scanner Section */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '10px' }}>
                    <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
                </div>

                {/* Manual Entry Section */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginTop: 0 }}>또는 코드를 직접 입력하세요</h3>
                    <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="QR 코드를 붙여넣으세요..."
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            style={{ margin: 0, flex: 1 }}
                        />
                        <button type="submit" className="btn" style={{ background: 'var(--accent)' }}>확인</button>
                    </form>
                </div>
            </div>

            {message && (
                <div className="glass-panel" style={{
                    padding: '15px',
                    marginTop: '20px',
                    backgroundColor: message.startsWith('Error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    border: message.startsWith('Error') ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(34, 197, 94, 0.5)',
                    color: 'white'
                }}>
                    <strong>{message.startsWith('Error') ? '❌ 오류!' : '✅ 성공!'}</strong> {message}
                </div>
            )}
        </div>
    );
};

export default Scanner;
