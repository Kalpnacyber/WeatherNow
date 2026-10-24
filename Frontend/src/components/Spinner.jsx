export default function Spinner({ text = "Loading..." }) {
  return (
    <div className="spinner-box">
      <div className="spinner"></div>
      <p>{text}</p>
    </div>
  );
}
