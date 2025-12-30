import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RegisterBook from './RegisterBook';
import Scanner from './Scanner';
import MemberRegister from './MemberRegister';
import api from './api';
import './index.css';

const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [booksRes, membersRes] = await Promise.all([
        api.get('/books'),
        api.get('/members')
      ]);
      setBooks(Array.isArray(booksRes.data) ? booksRes.data : []);
      setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  return (
    <div className="dashboard">
      <h1>도서관 대시보드</h1>
      <button onClick={fetchData} className="btn" style={{ marginBottom: '20px' }}>데이터 새로고침</button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h3>도서 현황 ({books.length})</h3>
          <ul style={{ maxHeight: '300px', overflowY: 'auto', paddingLeft: '20px' }}>
            {books.map(book => (
              <li key={book.id}>
                <strong>{book.title}</strong> - {book.author}
                <span style={{
                  color: book.status === 'AVAILABLE' ? '#4ade80' : '#f87171',
                  marginLeft: '5px'
                }}>
                  [{book.status === 'AVAILABLE' ? '대출 가능' : '대출 중'}]
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>회원 현황 ({members.length})</h3>
          <ul style={{ maxHeight: '300px', overflowY: 'auto', paddingLeft: '20px' }}>
            {members.map(member => (
              <li key={member.id}>{member.name} (ID: {member.id})</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div className="app-container" style={{ padding: '20px', paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Top Nav (Desktop) */}
        <nav className="glass-panel desktop-nav" style={{ padding: '15px', marginBottom: '30px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link to="/" className="nav-link">대시보드</Link>
          <Link to="/register-book" className="nav-link">도서 등록</Link>
          <Link to="/register-member" className="nav-link">회원 등록</Link>
          <Link to="/scanner" className="nav-link">스캐너</Link>
        </nav>

        {/* Bottom Nav (Mobile) */}
        <nav className="glass-panel mobile-nav">
          <Link to="/" className="nav-item">🏠<br />홈</Link>
          <Link to="/scanner" className="nav-item">📷<br />스캔</Link>
          <Link to="/register-book" className="nav-item">📚<br />도서</Link>
          <Link to="/register-member" className="nav-item">👤<br />회원</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register-book" element={<RegisterBook />} />
          <Route path="/register-member" element={<MemberRegister />} />
          <Route path="/scanner" element={<Scanner />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
