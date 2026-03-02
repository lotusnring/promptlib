import styles from './TagBar.module.css';

interface TagBarProps {
  tags: string[];
  activeTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export default function TagBar({ tags, activeTag, onTagSelect }: TagBarProps) {
  return (
    <div className={styles.tagsBar}>
      <span
        className={`${styles.tagPill} ${activeTag === null ? styles.tagPillActive : ''}`}
        onClick={() => onTagSelect(null)}
      >
        全部
      </span>
      {tags.map(tag => (
        <span
          key={tag}
          className={`${styles.tagPill} ${activeTag === tag ? styles.tagPillActive : ''}`}
          onClick={() => onTagSelect(tag)}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
