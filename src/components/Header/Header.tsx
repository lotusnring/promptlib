import { useState, useEffect, useRef } from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewClick: () => void;
  onImport: () => void;
  onExport: () => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  onNewClick,
  onImport,
  onExport,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.headerTitle}>
          <span className={styles.tPrompt}>Prompt</span>
          <span className={styles.tLib}>Lib</span>
        </div>
        <button className={styles.btnIconAccent} title="新建" onClick={onNewClick}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="10" y1="4" x2="10" y2="16" />
            <line x1="4" y1="10" x2="16" y2="10" />
          </svg>
        </button>
        <div ref={menuRef}>
          <button
            className={styles.btnIcon}
            title="更多"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="20" height="20" fill="currentColor">
              <circle cx="5" cy="10" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="15" cy="10" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <div className={styles.dropdown}>
              <div
                className={styles.dropdownItem}
                onClick={() => { onImport(); setMenuOpen(false); }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 12 L2 14 L14 14 L14 12" />
                  <polyline points="5,6 8,3 11,6" />
                  <line x1="8" y1="3" x2="8" y2="11" />
                </svg>
                导入数据
              </div>
              <div className={styles.dropdownDivider} />
              <div
                className={styles.dropdownItem}
                onClick={() => { onExport(); setMenuOpen(false); }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 12 L2 14 L14 14 L14 12" />
                  <polyline points="5,6 8,9 11,6" />
                  <line x1="8" y1="9" x2="8" y2="1" />
                </svg>
                导出数据
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.searchBar}>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="7" cy="7" r="4.5" />
          <line x1="10.5" y1="10.5" x2="14" y2="14" />
        </svg>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="搜索 Prompt…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
