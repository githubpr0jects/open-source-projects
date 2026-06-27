export default function ImpressionStamp({ n, rot = 0 }) {
  const angle = (rot * 37) % 9 - 4;
  return (
    <div
      className="impression-stamp"
      style={{ transform: `rotate(${angle}deg)` }}
    >
      <div className="stamp-label">IMPRESSIONS</div>
      <div className="stamp-value">{typeof n === 'number' ? n.toLocaleString() : n}</div>
    </div>
  );
}