import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from './api';

const Scanner = () => {
    const [scannedQr, setScannedQr] = useState(null);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await api.get('/members');
                setMembers(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to fetch members", err);
            }
        };
        fetchMembers();
    }, []);

    useEffect(() => {
        if (scannedQr) return; // Don't start scanner if we have a captured code

        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                videoConstraints: {
                    facingMode: "environment"
                },
                supportedScanTypes: [0],
                showTorchButtonIfSupported: true,
                showZoomSliderIfSupported: true,
                defaultZoomValueIfSupported: 2
            },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText) {
            setScannedQr(decodedText);
            scanner.clear().catch(console.error);
        }

        function onScanFailure(error) {
            // handle scan failure
        }

        return () => {
            scanner.clear().catch(err => console.error("Scanner clear error", err));
        };
    }, [mode, scannedQr]);

    const handleAction = async () => {
        if (!scannedQr) return;

        setMessage('처리 중...');
        try {
            if (mode === 'checkout') {
                if (!memberId) {
                    setMessage('먼저 회원을 선택해주세요!');
                    return;
                }
                await api.post('/checkout', { qrData: scannedQr, memberId: parseInt(memberId) });
                setMessage(`대여 성공!`);
            } else {
                await api.post('/return', { qrData: scannedQr });
                setMessage(`반납 성공!`);
            }
            // Reset for next scan
            setTimeout(() => {
                setScannedQr(null);
                setMessage('');
            }, 1500);
        } catch (error) {
            setMessage(`Error: ${error.response?.data?.detail || error.message}`);
        }
    };

    const handleCancel = () => {
        setScannedQr(null);
        setMessage('');
    };

    return (
        <div className="card glass-panel">
            <h2>📷 QR 스캐너 및 대여 시스템</h2>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button
                    className="btn"
                    style={{ opacity: mode === 'checkout' ? 1 : 0.5, flex: 1 }}
                    onClick={() => { setMode('checkout'); setScannedQr(null); setMessage(''); }}
                >
                    대여하기
                </button>
                <button
                    className="btn"
                    style={{ opacity: mode === 'return' ? 1 : 0.5, flex: 1 }}
                    onClick={() => { setMode('return'); setScannedQr(null); setMessage(''); }}
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
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '10px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!scannedQr ? (
                        <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
                    ) : (
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <h3 style={{ color: '#4ade80', marginBottom: '10px' }}>📖 책 스캔 완료!</h3>
                            <p style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '5px', fontFamily: 'monospace' }}>
                                Code: {scannedQr.substring(0, 15)}...
                            </p>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
                                <button
                                    onClick={handleAction}
                                    className="btn"
                                    style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', padding: '12px 30px', fontSize: '1.1rem' }}
                                >
                                    {mode === 'checkout' ? '✅ 대여 실행' : '↩️ 반납 실행'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="btn"
                                    style={{ background: '#64748b' }}
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {message && (
                <div className="glass-panel" style={{
                    padding: '15px',
                    marginTop: '20px',
                    backgroundColor: message.startsWith('Error') || message.includes('실패') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    border: message.startsWith('Error') || message.includes('실패') ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(34, 197, 94, 0.5)',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <strong>{message.startsWith('Error') ? '❌ ' : '✅ '}</strong> {message}
                </div>
            )}
        </div>
    );
};

export default Scanner;
