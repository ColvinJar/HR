import { Link } from 'react-router-dom';
import { topics } from '../../data/topics';

export function QuickTopicGrid() {
  return (
    <div className="topic-grid">
      {topics.map((topic) => (
        <Link key={topic.id} to={`/chat?topic=${topic.id}`} className="topic-card">
          <strong>{topic.label}</strong>
          <span>{topic.description}</span>
        </Link>
      ))}
    </div>
  );
}
