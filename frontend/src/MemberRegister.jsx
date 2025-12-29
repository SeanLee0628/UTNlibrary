import React, { useState } from 'react';
import api from './api';

const MemberRegister = () => {
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/members', { name });
            alert('회원이 성공적으로 등록되었습니다!');
            setName('');
        } catch (error) {
            console.error(error);
            alert('회원 등록에 실패했습니다.');
        }
    };

    return (
        <div className="card glass-panel">
            <h2>👤 새 회원 등록</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="회원 이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <button type="submit" className="btn">회원 등록</button>
            </form>
        </div>
    );
};

export default MemberRegister;
