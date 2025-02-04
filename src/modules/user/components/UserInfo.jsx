export const UserInfo = ({ name, email, photo }) => {
  return (
    <div className="card p-3 shadow-sm text-center">
      <img src={photo || "https://via.placeholder.com/150"} alt="User" className="rounded-circle mx-auto mb-2" width="80" />
      <h5>{name}</h5>
      <p className="text-muted">{email}</p>
    </div>
  );
};